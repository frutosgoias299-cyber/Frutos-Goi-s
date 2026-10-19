export function renderizarEstoque(produtos) {
    const container = document.getElementById('lista-estoque-geral');
    container.innerHTML = produtos.map(p => {
        const qtd = p.estoque || 0;
        const alerta = qtd <= (p.estoque_minimo || 5);
        return `
            <div class="item-card">
                <div class="item-info">
                    <span class="item-titulo">${p.codigo || ''} ${p.nome}</span>
                    <span class="item-sub">Posição Atual: <strong>${qtd} unidades</strong></span>
                </div>
                <span class="badge-estoque ${alerta ? 'badge-alerta' : 'badge-ok'}">${alerta ? 'Baixo' : 'Normal'}</span>
            </div>
        `;
    }).join('');
}