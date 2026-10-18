// js/carrinho.js

// Carrega o carrinho da memória do telemóvel ou cria um novo se estiver vazio
let carrinho = JSON.parse(localStorage.getItem('frutos_carrinho')) || [];

const badgeCarrinho = document.getElementById('badge-carrinho');
const toastAviso = document.getElementById('toast-aviso');

// Função para atualizar o número no ícone da barra inferior
function atualizarBadge() {
    if (!badgeCarrinho) return; // Proteção caso a página não tenha o ícone
    
    const totalItens = carrinho.length;
    if (totalItens > 0) {
        badgeCarrinho.textContent = totalItens;
        badgeCarrinho.classList.remove('badge-oculto');
    } else {
        badgeCarrinho.classList.add('badge-oculto');
    }
}

// Função para mostrar o aviso verde de sucesso
function mostrarToast(nomeProduto) {
    if (!toastAviso) return;
    
    toastAviso.textContent = `${nomeProduto} adicionado!`;
    toastAviso.classList.remove('toast-oculto');
    
    setTimeout(() => {
        toastAviso.classList.add('toast-oculto');
    }, 2000);
}

// Guarda os produtos na memória para o ficheiro carrinho.html os poder ler depois
function salvarCarrinho() {
    localStorage.setItem('frutos_carrinho', JSON.stringify(carrinho));
    atualizarBadge();
}

// Adicionar evento de clique em todos os botões "+"
const botoesAdicionar = document.querySelectorAll('.btn-adicionar');

botoesAdicionar.forEach(botao => {
    botao.addEventListener('click', (evento) => {
        const cardProduto = evento.target.closest('.produto-card');
        const nome = cardProduto.querySelector('.produto-titulo').innerText;
        const precoTexto = cardProduto.querySelector('.produto-preco').innerText;
        
        // Converte "R$ 14,00" num número matemático (14.00)
        const preco = parseFloat(precoTexto.replace('R$', '').replace(',', '.').trim());
        
        carrinho.push({
            id: Date.now(),
            nome: nome,
            preco: preco
        });
        
        salvarCarrinho();
        mostrarToast(nome);
    });
});

// Atualiza a bolinha com o número mal a página carrega
window.addEventListener('DOMContentLoaded', atualizarBadge);