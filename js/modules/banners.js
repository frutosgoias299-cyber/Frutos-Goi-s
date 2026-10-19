export function renderizarBanners(banners, onExcluir) {
    const container = document.getElementById('lista-banners-geral');
    if (banners.length === 0) {
        container.innerHTML = '<div style="color:var(--texto-suave); font-size:0.85rem; padding:10px 0;">Nenhum banner ativo.</div>';
        return;
    }
    container.innerHTML = banners.map(b => `
        <div class="banner-vitrine-card" style="background-image: url('${b.imagem_url}');">
            <div class="banner-conteudo">
                <h4 style="color:var(--verde-oficial); font-size:1rem;">${b.titulo}</h4>
                <p style="color:#fff; font-size:0.78rem;">${b.subtitulo || ''}</p>
            </div>
        </div>
        <button class="btn-remover" data-id="${b.id}" style="margin-bottom:15px;">Remover Banner</button>
    `).join('');

    container.querySelectorAll('.btn-remover').forEach(btn => {
        btn.addEventListener('click', () => onExcluir(parseInt(btn.getAttribute('data-id'))));
    });
}