let itensCaixa = [];

export function adicionarItemCaixa(produtos) {
    if (!produtos || produtos.length === 0) {
        alert('Nenhum produto disponível no catálogo.');
        return;
    }

    const selectItem = document.getElementById('venda-item-select');
    const inputQtd = document.getElementById('venda-item-qtd');

    if (!selectItem || !inputQtd) return;

    const id = parseInt(selectItem.value, 10);
    const qtd = parseInt(inputQtd.value, 10);

    if (isNaN(id) || isNaN(qtd) || qtd <= 0) {
        alert('Informe uma quantidade válida superior a zero.');
        return;
    }

    const prod = produtos.find(p => p.id === id);
    if (!prod) return;

    // Validação preventiva de estoque
    const estoqueDisponivel = Number(prod.estoque) || 0;
    const itemExistente = itensCaixa.find(it => it.id === prod.id);
    const qtdAtualNoCarrinho = itemExistente ? itemExistente.qtd : 0;

    if (qtdAtualNoCarrinho + qtd > estoqueDisponivel) {
        alert(`Estoque insuficiente! Disponível em loja: ${estoqueDisponivel} un.`);
        return;
    }

    // Se o item já estiver no pedido, soma a quantidade
    if (itemExistente) {
        itemExistente.qtd += qtd;
    } else {
        itensCaixa.push({
            id: prod.id,
            codigo: prod.codigo || `#${String(prod.id).padStart(2, '0')}`,
            nome: prod.nome,
            preco: parseFloat(prod.preco) || 0,
            qtd: qtd
        });
    }

    inputQtd.value = 1;
    renderizarCaixa();
}

export function renderizarCaixa() {
    const lista = document.getElementById('caixa-itens-lista');
    const totalEl = document.getElementById('caixa-total-exibicao');

    if (!lista || !totalEl) return;

    if (itensCaixa.length === 0) {
        lista.innerHTML = '<span style="color:var(--texto-suave); font-size:0.85rem;">Nenhum item adicionado ao pedido.</span>';
        totalEl.innerText = '0,00';
        return;
    }

    let total = 0;

    lista.innerHTML = itensCaixa.map((it, idx) => {
        const sub = it.preco * it.qtd;
        total += sub;
        const subFormatado = sub.toFixed(2).replace('.', ',');

        return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.06);">
                <div style="font-size:0.85rem;">
                    <strong style="color:var(--verde-oficial);">${it.qtd}x</strong> ${it.nome}
                    <span style="color:var(--texto-suave); font-size:0.75rem; margin-left:4px;">(R$ ${subFormatado})</span>
                </div>
                <button type="button" class="remover-item-caixa" data-index="${idx}" style="background:none; border:none; color:var(--vermelho); font-weight:700; cursor:pointer; padding:2px 6px;">✕</button>
            </div>
        `;
    }).join('');

    lista.querySelectorAll('.remover-item-caixa').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index, 10);
            if (!isNaN(index)) {
                itensCaixa.splice(index, 1);
                renderizarCaixa();
            }
        });
    });

    totalEl.innerText = total.toFixed(2).replace('.', ',');
}

export function limparCaixa() {
    itensCaixa = [];
    renderizarCaixa();
}

export function obterItensCaixa() {
    return itensCaixa;
}