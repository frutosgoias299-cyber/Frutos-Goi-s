export function renderizarEstoque(produtos) {
    const container = document.getElementById('lista-estoque-geral');
    if (!container) return;

    if (!produtos || produtos.length === 0) {
        container.innerHTML = '<div style="color:var(--texto-suave); font-size:0.85rem; padding:12px 0; text-align:center;">Nenhum produto cadastrado no estoque.</div>';
        return;
    }

    container.innerHTML = produtos.map(p => {
        const qtd = Number(p.estoque) || 0;
        const min = Number(p.estoque_minimo) || 5;
        const cod = p.codigo || '';

        // Classificação do status de estoque
        let statusTexto = 'Normal';
        let statusClasse = 'badge-ok';

        if (qtd === 0) {
            statusTexto = 'Esgotado';
            statusClasse = 'badge-alerta';
        } else if (qtd <= min) {
            statusTexto = 'Baixo';
            statusClasse = 'badge-alerta';
        }

        return `
            <div class="item-card">
                <div class="item-info">
                    <span class="item-titulo">
                        ${cod ? `<strong style="color:var(--verde-oficial); font-family:monospace; margin-right:4px;">${cod}</strong>` : ''}
                        ${p.nome}
                    </span>
                    <span class="item-sub">Posição Atual: <strong>${qtd} unidades</strong> (Mín: ${min})</span>
                </div>
                <span class="badge-estoque ${statusClasse}">${statusTexto}</span>
            </div>
        `;
    }).join('');
}