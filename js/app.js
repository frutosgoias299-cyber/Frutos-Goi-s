// js/app.js - Versão Otimizada
document.addEventListener('DOMContentLoaded', () => {
    const botoesAdicionar = document.querySelectorAll('.btn-adicionar');
    
    if (botoesAdicionar.length === 0) {
        console.log("Aviso: Nenhum botão de adicionar encontrado.");
        return;
    }

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

            let carrinho = JSON.parse(localStorage.getItem('carrinho_frutos')) || [];
            carrinho.push(produto);
            localStorage.setItem('carrinho_frutos', JSON.stringify(carrinho));

            alert(`Adicionado ao carrinho: ${titulo} (${preco})`);
        });
    });
});