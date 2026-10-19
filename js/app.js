// js/app.js - Lógica dos botões do cardápio e carrinho

document.addEventListener('DOMContentLoaded', () => {
    // Seleciona todos os botões de adicionar "+"
    const botoesAdicionar = document.querySelectorAll('.btn-adicionar');

    botoesAdicionar.forEach((botao) => {
        botao.addEventListener('click', (e) => {
            // Pega nas informações do card do produto correspondente
            const card = e.target.closest('.produto-card');
            const titulo = card.querySelector('.produto-titulo').innerText;
            const preco = card.querySelector('.produto-preco').innerText;

            // Cria o objeto do produto
            const produto = {
                titulo: titulo,
                preco: preco
            };

            // Recupera o carrinho atual do localStorage ou cria um array vazio
            let carrinho = JSON.parse(localStorage.getItem('carrinho_frutos')) || [];
            
            // Adiciona o novo produto
            carrinho.push(produto);

            // Guarda de volta no localStorage
            localStorage.setItem('carrinho_frutos', JSON.stringify(carrinho));

            // Feedback visual rápido no botão (fica verde escuro por um instante)
            botao.style.backgroundColor = '#00cc44';
            setTimeout(() => {
                botao.style.backgroundColor = 'var(--cor-verde)';
            }, 200);

            // Notifica o utilizador discretamente
            alert(`Adicionado ao carrinho: ${titulo} (${preco})`);
        });
    });
});