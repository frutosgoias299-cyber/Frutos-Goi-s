// api/produtos.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  const { method } = req;

  // Habilitar CORS caso o frontend esteja noutra porta/domínio
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. GET: Retorna os produtos ativos ou todos para o admin
    if (method === 'GET') {
      const result = await pool.query('SELECT * FROM produtos ORDER BY id ASC');
      return res.status(200).json(result.rows);
    }

    // 2. POST: Cadastra novo produto
    if (method === 'POST') {
      const { nome, descricao, preco, categoria, imagem_url } = req.body;
      const query = `
        INSERT INTO produtos (nome, descricao, preco, categoria, imagem_url, disponivel)
        VALUES ($1, $2, $3, $4, $5, true)
        RETURNING *;
      `;
      const values = [nome, descricao, preco, categoria, imagem_url];
      const result = await pool.query(query, values);
      return res.status(201).json(result.rows[0]);
    }

    // 3. PATCH: Alternar status de disponibilidade
    if (method === 'PATCH') {
      const { id, disponivel } = req.body;
      const result = await pool.query(
        'UPDATE produtos SET disponivel = $1 WHERE id = $2 RETURNING *',
        [disponivel, id]
      );
      return res.status(200).json(result.rows[0]);
    }

    // 4. DELETE: Excluir produto
    if (method === 'DELETE') {
      const { id } = req.query;
      await pool.query('DELETE FROM produtos WHERE id = $1', [id]);
      return res.status(200).json({ mensagem: 'Produto excluído com sucesso' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).end(`Método ${method} não permitido`);

  } catch (error) {
    console.error('Erro na base de dados:', error);
    return res.status(500).json({ erro: 'Erro interno ao consultar o banco de dados' });
  }
}