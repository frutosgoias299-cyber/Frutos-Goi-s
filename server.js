import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de conexão com o PostgreSQL Neon
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

app.use(cors());
app.use(express.json());

// Servir os ficheiros estáticos (HTML, CSS, imagens)
app.use(express.static('.'));

// 1. LISTAR PRODUTOS (GET /api/produtos)
app.get('/api/produtos', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM produtos ORDER BY id ASC');
        res.json(rows);
    } catch (err) {
        console.error('Erro ao consultar produtos:', err);
        res.status(500).json({ erro: 'Erro interno no banco de dados' });
    }
});

// 2. CRIAR PRODUTO COM CÓDIGO (POST /api/produtos)
app.post('/api/produtos', async (req, res) => {
    const { nome, categoria, preco, imagem_url, descricao, codigo } = req.body;

    if (!nome || !categoria || !preco) {
        return res.status(400).json({ erro: 'Nome, categoria e preço são obrigatórios.' });
    }

    try {
        // Se o código não for informado manualmente, gera automático com base no ID
        const query = `
            INSERT INTO produtos (nome, categoria, preco, imagem_url, descricao, codigo, disponivel)
            VALUES (
                $1, 
                $2, 
                $3, 
                $4, 
                $5, 
                COALESCE(NULLIF($6, ''), '#' || LPAD(nextval('produtos_id_seq')::text, 2, '0')), 
                true
            )
            RETURNING *;
        `;
        const values = [nome, categoria, preco, imagem_url || '', descricao || '', codigo || null];
        const { rows } = await pool.query(query, values);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Erro ao inserir produto:', err);
        res.status(500).json({ erro: 'Falha ao guardar no banco de dados' });
    }
});

// 3. ATUALIZAR DISPONIBILIDADE (PATCH /api/produtos)
app.patch('/api/produtos', async (req, res) => {
    const { id, disponivel } = req.body;

    if (id === undefined || disponivel === undefined) {
        return res.status(400).json({ erro: 'ID e status de disponibilidade são obrigatórios.' });
    }

    try {
        const query = `
            UPDATE produtos 
            SET disponivel = $1 
            WHERE id = $2 
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [disponivel, id]);
        res.json(rows[0]);
    } catch (err) {
        console.error('Erro ao atualizar status:', err);
        res.status(500).json({ erro: 'Falha ao atualizar produto' });
    }
});

// 4. ELIMINAR PRODUTO (DELETE /api/produtos)
app.delete('/api/produtos', async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ erro: 'ID do produto é obrigatório.' });
    }

    try {
        await pool.query('DELETE FROM produtos WHERE id = $1', [id]);
        res.json({ mensagem: 'Produto removido com sucesso' });
    } catch (err) {
        console.error('Erro ao remover produto:', err);
        res.status(500).json({ erro: 'Falha ao remover produto' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});
// ================= CONTROLO DE EQUIPA =================
app.get('/api/funcionarios', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT id, nome, cargo, ativo FROM funcionarios ORDER BY nome ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ erro: 'Falha ao buscar equipa' });
    }
});

app.post('/api/funcionarios', async (req, res) => {
    const { nome, cargo, chave_acesso } = req.body;
    try {
        const { rows } = await pool.query(
            'INSERT INTO funcionarios (nome, cargo, chave_acesso) VALUES ($1, $2, $3) RETURNING id, nome, cargo',
            [nome, cargo || 'Atendente', chave_acesso]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ erro: 'Falha ao registar funcionário' });
    }
});

// ================= CONTROLO DE VENDAS =================
app.get('/api/vendas/resumo-hoje', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT 
                COUNT(*) as total_pedidos,
                COALESCE(SUM(valor_total), 0) as faturamento_total
            FROM vendas
            WHERE criado_em::date = CURRENT_DATE
        `);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ erro: 'Falha ao calcular métricas' });
    }
});

app.post('/api/vendas', async (req, res) => {
    const { funcionario_id, mesa, forma_pagamento, itens, valor_total } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Gravar Venda
        const queryVenda = `
            INSERT INTO vendas (funcionario_id, mesa, forma_pagamento, itens_json, valor_total)
            VALUES ($1, $2, $3, $4, $5) RETURNING id;
        `;
        const resVenda = await client.query(queryVenda, [
            funcionario_id || null, 
            mesa || 'Balcão', 
            forma_pagamento, 
            JSON.stringify(itens), 
            valor_total
        ]);

        // 2. Dar baixa automática de stock para cada item vendido
        for (const item of itens) {
            await client.query(`
                UPDATE produtos 
                SET estoque = GREATEST(estoque - $1, 0)
                WHERE id = $2;
            `, [item.qtd, item.id]);

            await client.query(`
                INSERT INTO movimentacoes_estoque (produto_id, funcionario_id, tipo, quantidade, motivo)
                VALUES ($1, $2, 'SAIDA', $3, 'Venda Balcão/Mesa');
            `, [item.id, funcionario_id || null, item.qtd]);
        }

        await client.query('COMMIT');
        res.status(201).json({ sucesso: true, venda_id: resVenda.rows[0].id });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erro na venda:', err);
        res.status(500).json({ erro: 'Erro ao processar venda' });
    } finally {
        client.release();
    }
});

// ================= MOVIMENTAÇÃO DE STOCK (ENTRADA / SAÍDA) =================
app.post('/api/estoque/movimentacao', async (req, res) => {
    const { produto_id, funcionario_id, tipo, quantidade, motivo } = req.body;
    const qtd = parseInt(quantidade, 10);

    if (!produto_id || !tipo || isNaN(qtd) || qtd <= 0) {
        return res.status(400).json({ erro: 'Dados inválidos' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const operacao = tipo === 'ENTRADA' ? `estoque + $1` : `GREATEST(estoque - $1, 0)`;
        await client.query(`
            UPDATE produtos 
            SET estoque = ${operacao} 
            WHERE id = $2;
        `, [qtd, produto_id]);

        await client.query(`
            INSERT INTO movimentacoes_estoque (produto_id, funcionario_id, tipo, quantidade, motivo)
            VALUES ($1, $2, $3, $4, $5);
        `, [produto_id, funcionario_id || null, tipo, qtd, motivo]);

        await client.query('COMMIT');
        res.status(201).json({ sucesso: true });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ erro: 'Falha ao movimentar stock' });
    } finally {
        client.release();
    }
});
// ================= CONTROLO DE BANNERS =================
app.get('/api/banners', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM banners ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        console.error('Erro ao consultar banners:', err);
        res.status(500).json({ erro: 'Falha ao buscar banners' });
    }
});

app.post('/api/banners', async (req, res) => {
    const { titulo, subtitulo, imagem_url, link_destino } = req.body;
    if (!titulo || !imagem_url) {
        return res.status(400).json({ erro: 'Título e URL da imagem são obrigatórios.' });
    }
    try {
        const query = `
            INSERT INTO banners (titulo, subtitulo, imagem_url, link_destino, ativo)
            VALUES ($1, $2, $3, $4, true)
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [titulo, subtitulo || '', imagem_url, link_destino || '']);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Erro ao salvar banner:', err);
        res.status(500).json({ erro: 'Falha ao guardar banner' });
    }
});

app.patch('/api/banners', async (req, res) => {
    const { id, ativo } = req.body;
    try {
        const { rows } = await pool.query('UPDATE banners SET ativo = $1 WHERE id = $2 RETURNING *;', [ativo, id]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ erro: 'Falha ao atualizar banner' });
    }
});

app.delete('/api/banners', async (req, res) => {
    const { id } = req.query;
    try {
        await pool.query('DELETE FROM banners WHERE id = $1', [id]);
        res.json({ mensagem: 'Banner removido com sucesso' });
    } catch (err) {
        res.status(500).json({ erro: 'Falha ao remover banner' });
    }
});