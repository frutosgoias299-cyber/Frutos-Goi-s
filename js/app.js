// js/app.js - Versão Final Unificada com Filtros

// Função para atualizar o contador do carrinho no ícone da barra inferior
function atualizarContadorCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho_frutos')) || [];
    const contadorElem = document.getElementById('contador-carrinho');
    
    if (!contadorElem) return;

    if (carrinho.length > 0) {
        contadorElem.style.display = 'inline-block';
        contadorElem.innerText = carrinho.length;
    } else {
        contadorElem.style.display = 'none';
    }
}

// Executa assim que a página termina de carregar
document.addEventListener('DOMContentLoaded', () => {
    // 1. Atualiza o contador mal a página abre
    atualizarContadorCarrinho();

    // 2. Configura os botões de adicionar (+)
    const botoesAdicionar = document.querySelectorAll('.btn-adicionar');
    
    botoesAdicionar.forEach((botao) => {
        botao.addEventListener('click', (e) => {
            e.preventDefault();
            const card = e.target.closest('.produto-card');
            
            if (!card) return;

            const titulo = card.querySelector('.produto-titulo').innerText;
            const preco = card.querySelector('.produto-preco').innerText;

            const produto = {
                titulo: titulo,
                preco: preco
            };

            // Guarda no localStorage
            let carrinho = JSON.parse(localStorage.getItem('carrinho_frutos')) || [];
            carrinho.push(produto);
            localStorage.setItem('carrinho_frutos', JSON.stringify(carrinho));

            // Atualiza imediatamente o contador vermelho no ícone do carrinho
            atualizarContadorCarrinho();

            // Feedback visual rápido
            alert(`Adicionado ao carrinho: ${titulo} (${preco})`);
        });
    });

    // 3. Sistema de Filtros por Categoria em Tempo Real
    const botoesCategoria = document.querySelectorAll('.categoria-btn');
    const cardsProdutos = document.querySelectorAll('.produto-card');

    botoesCategoria.forEach((botao) => {
        botao.addEventListener('click', () => {
            // Remove a classe 'ativo' de todos os botões e aplica ao clicado
            botoesCategoria.forEach(btn => btn.classList.remove('ativo'));
            botao.classList.add('ativo');

            const categoriaSelecionada = botao.innerText.toLowerCase();

            cardsProdutos.forEach((card) => {
                const categoriaCard = card.getAttribute('data-categoria');

                if (categoriaSelecionada === 'todos' || 
                   (categoriaSelecionada === 'picolés' && categoriaCard === 'picoles') ||
                   (categoriaSelecionada === 'gelados' && categoriaCard === 'gelados') ||
                   (categoriaSelecionada === 'açaí' && categoriaCard === 'acai') ||
                   (categoriaSelecionada === 'especiais' && categoriaCard === 'especiais')) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});