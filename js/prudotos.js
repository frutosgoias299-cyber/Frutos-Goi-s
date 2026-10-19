import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // Configuração de cabeçalhos CORS para permitir requisições seguras
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        return res.status(500).json({ erro: 'DATABASE_URL não configurada no servidor.' });
    }

    const sql = neon(databaseUrl);

    try {
        // 1. LISTAR PRODUTOS (Público - para cardápio e admin)
        if (req.method === 'GET') {
            const produtos = await sql`
                SELECT id, nome, categoria, preco, imagem_url, descricao, disponivel 
                FROM produtos 
                ORDER BY id ASC;
            `;
            return res.status(200).json(produtos);
        }

        // 2. CADASTRAR PRODUTO (POST)
        if (req.method === 'POST') {
            const { nome, categoria, preco, imagem_url, descricao } = req.body;
            
            if (!nome || !categoria || !preco) {
                return res.status(400).json({ erro: 'Nome, categoria e preço são obrigatórios.' });
            }

            const [novo] = await sql`
                INSERT INTO produtos (nome, categoria, preco, imagem_url, descricao, disponivel)
                VALUES (${nome}, ${categoria}, ${preco}, ${imagem_url || ''}, ${descricao || ''}, true)
                RETURNING *;
            `;
            return res.status(201).json(novo);
        }

        // 3. ALTERNAR DISPONIBILIDADE (PATCH)
        if (req.method === 'PATCH') {
            const { id, disponivel } = req.body;

            if (id === undefined || disponivel === undefined) {
                return res.status(400).json({ erro: 'ID e status de disponibilidade são obrigatórios.' });
            }

            const [atualizado] = await sql`
                UPDATE produtos 
                SET disponivel = ${disponivel}
                WHERE id = ${id}
                RETURNING *;
            `;
            return res.status(200).json(atualizado);
        }

        // 4. EXCLUIR PRODUTO (DELETE)
        if (req.method === 'DELETE') {
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({ erro: 'ID do produto é obrigatório.' });
            }

            await sql`
                DELETE FROM produtos 
                WHERE id = ${id};
            `;
            return res.status(200).json({ mensagem: 'Produto excluído com sucesso.' });
        }

        return res.status(405).json({ erro: 'Método não permitido.' });

    } catch (error) {
        console.error('Erro na operação do banco:', error);
        return res.status(500).json({ erro: 'Erro interno no banco de dados.' });
    }
}