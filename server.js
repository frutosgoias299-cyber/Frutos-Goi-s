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