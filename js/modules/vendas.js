let itensCaixa = [];

export function adicionarItemCaixa(produtos) {
    const id = parseInt(document.getElementById('venda-item-select').value, 10);
    const qtd = parseInt(document.getElementById('venda-item-qtd').value, 10);
    const prod = produtos.find(p => p.id === id);
    if (!prod || qtd <= 0) return;

    itensCaixa.push({ id: prod.id, nome: prod.nome, preco: parseFloat(prod.preco), qtd });
    renderizarCaixa();
}

export function renderizarCaixa() {
    const lista = document.getElementById('caixa-itens-lista');
    if (itensCaixa.length === 0) {
        lista.innerText = 'Nenhum item adicionado.';
        document.getElementById('caixa-total-exibicao').innerText = '0,00';
        return;
    }
    let total = 0;
    lista.innerHTML = itensCaixa.map((it, idx) => {
        const sub = it.preco * it.qtd;
        total += sub;
        return `<div>${it.qtd}x ${it.nome} - R$ ${sub.toFixed(2).replace('.', ',')} <span class="remover-item-caixa" data-index="${idx}" style="color:red; cursor:pointer;">✕</span></div>`;
    }).join('');

    lista.querySelectorAll('.remover-item-caixa').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            itensCaixa.splice(index, 1);
            renderizarCaixa();
        });
    });

    document.getElementById('caixa-total-exibicao').innerText = total.toFixed(2).replace('.', ',');
}

export function limparCaixa() {
    itensCaixa = [];
    renderizarCaixa();
}

export function obterItensCaixa() {
    return itensCaixa;
}