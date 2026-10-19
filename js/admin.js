import { processarImagemUpload, renderizarListaProdutos } from './modules/produtos.js';
import { renderizarEstoque } from './modules/estoque.js';
import { renderizarBanners } from './modules/banners.js';
import { adicionarItemCaixa, renderizarCaixa, limparCaixa, obterItensCaixa } from './modules/vendas.js';
import { renderizarEquipe } from './modules/equipe.js';
import { gerarPlacaMesa, imprimirAdesivoMesa, imprimirCardapioFisicoA4 } from './modules/mesas.js';

const dadosPadrao = [
    { id: 1, codigo: '#01', nome: "Picolé Ninho Trufado", categoria: "picoles", preco: 8.50, estoque: 25, estoque_minimo: 5, imagem_url: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&q=80", descricao: "Cremoso com avelã", disponivel: true },
    { id: 2, codigo: '#02', nome: "Picolé de Maracujá", categoria: "picoles", preco: 6.00, estoque: 30, estoque_minimo: 5, imagem_url: "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400&q=80", descricao: "100% polpa de fruta natural", disponivel: true },
    { id: 3, codigo: '#03', nome: "Taça Suprema de Morango", categoria: "gelados", preco: 24.00, estoque: 15, estoque_minimo: 3, imagem_url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80", descricao: "Gelado e raspas de chocolate", disponivel: true },
    { id: 4, codigo: '#04', nome: "Tigela Açaí Puro 500ml", categoria: "acai", preco: 22.00, estoque: 18, estoque_minimo: 4, imagem_url: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&q=80", descricao: "Açaí puro batido com granola", disponivel: true }
];

let produtos = [];
let equipe = [];
let banners = [];

function avisar(texto) {
    const toast = document.getElementById('feedback-toast');
    toast.innerText = texto;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

// Navegação por Abas
document.querySelectorAll('.btn-classe').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-classe').forEach(b => b.classList.remove('ativa'));
        document.querySelectorAll('.painel-secao').forEach(p => p.classList.remove('ativa'));
        e.currentTarget.classList.add('ativa');
        const idClasse = e.currentTarget.getAttribute('data-classe');
        document.getElementById(`classe-${idClasse}`).classList.add('ativa');
    });
});

async function carregarTudo() {
    try {
        const res = await fetch('/api/produtos');
        if (res.ok) produtos = await res.json();
        else throw new Error();
    } catch {
        const local = localStorage.getItem('produtos_banco_mock');
        produtos = local ? JSON.parse(local) : dadosPadrao;
    }

    try {
        const resE = await fetch('/api/funcionarios');
        if (resE.ok) equipe = await resE.json();
        else throw new Error();
    } catch {
        equipe = JSON.parse(localStorage.getItem('equipe_mock')) || [{ id: 1, nome: "Dono", cargo: "Gerente" }];
    }

    try {
        const resB = await fetch('/api/banners');
        if (resB.ok) banners = await resB.json();
        else throw new Error();
    } catch {
        banners = JSON.parse(localStorage.getItem('banners_mock')) || [];
    }

    atualizarInterface();
}

function atualizarInterface() {
    // Selects
    document.getElementById('mov-produto').innerHTML = produtos.map(p => `<option value="${p.id}">${p.codigo || ''} ${p.nome} (${p.estoque || 0} un)</option>`).join('');
    document.getElementById('venda-item-select').innerHTML = produtos.map(p => `<option value="${p.id}">${p.nome} - R$ ${parseFloat(p.preco).toFixed(2).replace('.', ',')}</option>`).join('');
    document.getElementById('venda-funcionario').innerHTML = equipe.map(f => `<option value="${f.id}">${f.nome} (${f.cargo})</option>`).join('');

    renderizarListaProdutos(produtos, excluirProduto);
    renderizarEstoque(produtos);
    renderizarBanners(banners, excluirBanner);
    renderizarEquipe(equipe);
}

// Eventos de Upload de Imagem
document.getElementById('prod-arquivo-foto').addEventListener('change', function() {
    processarImagemUpload(this, 'preview-prod-img', 'prod-foto-base64');
});
document.getElementById('banner-arquivo-foto').addEventListener('change', function() {
    processarImagemUpload(this, 'preview-banner-img', 'banner-foto-base64');
});

// Cadastro de Produto
document.getElementById('form-cad-produto').addEventListener('submit', async (e) => {
    e.preventDefault();
    const foto = document.getElementById('prod-foto-base64').value || 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&q=80';
    const novo = {
        codigo: document.getElementById('prod-codigo').value.trim() || `#${String(produtos.length + 1).padStart(2, '0')}`,
        nome: document.getElementById('prod-nome').value.trim(),
        categoria: document.getElementById('prod-categoria').value,
        preco: parseFloat(document.getElementById('prod-preco').value),
        imagem_url: foto,
        descricao: document.getElementById('prod-descricao').value.trim(),
        estoque: 20,
        disponivel: true
    };

    try {
        const res = await fetch('/api/produtos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novo)
        });
        if (res.ok) {
            const salvo = await res.json();
            produtos.push(salvo);
        } else throw new Error();
    } catch {
        novo.id = Date.now();
        produtos.push(novo);
        localStorage.setItem('produtos_banco_mock', JSON.stringify(produtos));
    }

    avisar('Produto cadastrado com sucesso!');
    e.target.reset();
    document.getElementById('preview-prod-img').style.display = 'none';
    document.getElementById('prod-foto-base64').value = '';
    atualizarInterface();
});

// Movimentação de Estoque
document.getElementById('form-movimentacao').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById('mov-produto').value, 10);
    const tipo = document.getElementById('mov-tipo').value;
    const qtd = parseInt(document.getElementById('mov-qtd').value, 10);

    const prod = produtos.find(p => p.id === id);
    if (prod) {
        prod.estoque = tipo === 'ENTRADA' ? (prod.estoque || 0) + qtd : Math.max(0, (prod.estoque || 0) - qtd);
        localStorage.setItem('produtos_banco_mock', JSON.stringify(produtos));
        avisar('Estoque atualizado!');
        e.target.reset();
        atualizarInterface();
    }
});

// Caixa & Vendas
document.getElementById('btn-add-caixa').addEventListener('click', () => adicionarItemCaixa(produtos));
document.getElementById('btn-fechar-venda').addEventListener('click', () => {
    const itens = obterItensCaixa();
    if (itens.length === 0) return alert('Adicione produtos ao pedido.');

    itens.forEach(it => {
        const prod = produtos.find(p => p.id === it.id);
        if (prod) prod.estoque = Math.max(0, (prod.estoque || 0) - it.qtd);
    });

    localStorage.setItem('produtos_banco_mock', JSON.stringify(produtos));
    limparCaixa();
    avisar('Venda realizada e estoque baixado!');
    atualizarInterface();
});

// Banner Promocional
document.getElementById('form-cad-banner').addEventListener('submit', async (e) => {
    e.preventDefault();
    const foto = document.getElementById('banner-foto-base64').value;
    if (!foto) return alert('Selecione uma imagem para o banner.');

    const novo = {
        titulo: document.getElementById('banner-titulo').value.trim(),
        subtitulo: document.getElementById('banner-subtitulo').value.trim(),
        imagem_url: foto,
        ativo: true
    };

    try {
        const res = await fetch('/api/banners', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novo)
        });
        if (res.ok) {
            const salvo = await res.json();
            banners.push(salvo);
        } else throw new Error();
    } catch {
        novo.id = Date.now();
        banners.push(novo);
        localStorage.setItem('banners_mock', JSON.stringify(banners));
    }

    avisar('Banner publicado!');
    e.target.reset();
    document.getElementById('preview-banner-img').style.display = 'none';
    document.getElementById('banner-foto-base64').value = '';
    atualizarInterface();
});

// Equipe
document.getElementById('form-cad-equipe').addEventListener('submit', (e) => {
    e.preventDefault();
    const novo = {
        id: Date.now(),
        nome: document.getElementById('eq-nome').value.trim(),
        cargo: document.getElementById('eq-cargo').value,
        pin: document.getElementById('eq-pin').value.trim()
    };
    equipe.push(novo);
    localStorage.setItem('equipe_mock', JSON.stringify(equipe));
    avisar('Colaborador adicionado!');
    e.target.reset();
    atualizarInterface();
});

// Mesas e Impressão
document.getElementById('url-base-input').value = window.location.href.replace('admin.html', 'cardapio.html');
document.getElementById('btn-gerar-placa').addEventListener('click', gerarPlacaMesa);
document.getElementById('btn-imprimir-adesivo').addEventListener('click', imprimirAdesivoMesa);
document.getElementById('btn-imprimir-a4').addEventListener('click', () => imprimirCardapioFisicoA4(produtos));

function excluirProduto(id) {
    if (!confirm('Deseja excluir este item?')) return;
    produtos = produtos.filter(p => p.id !== id);
    localStorage.setItem('produtos_banco_mock', JSON.stringify(produtos));
    atualizarInterface();
    avisar('Item removido.');
}

function excluirBanner(id) {
    if (!confirm('Deseja remover este banner?')) return;
    banners = banners.filter(b => b.id !== id);
    localStorage.setItem('banners_mock', JSON.stringify(banners));
    atualizarInterface();
    avisar('Banner removido.');
}

document.addEventListener('DOMContentLoaded', carregarTudo);