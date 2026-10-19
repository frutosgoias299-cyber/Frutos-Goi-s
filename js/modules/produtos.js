export function processarImagemUpload(input, previewId, campoOcultoId) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const fotoComprimida = canvas.toDataURL('image/jpeg', 0.82);
            const preview = document.getElementById(previewId);
            preview.src = fotoComprimida;
            preview.style.display = 'block';

            document.getElementById(campoOcultoId).value = fotoComprimida;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

export function renderizarListaProdutos(produtos, onExcluir) {
    const container = document.getElementById('lista-produtos-geral');
    container.innerHTML = produtos.map(p => `
        <div class="item-card">
            <img src="${p.imagem_url || 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=100'}" class="item-detalhe-foto">
            <div class="item-info">
                <span class="item-titulo"><strong style="color:var(--verde-oficial);">${p.codigo || ''}</strong> ${p.nome}</span>
                <span class="item-sub">${p.categoria.toUpperCase()} • R$ ${parseFloat(p.preco).toFixed(2).replace('.', ',')}</span>
            </div>
            <button class="btn-remover" data-id="${p.id}">Excluir</button>
        </div>
    `).join('');

    container.querySelectorAll('.btn-remover').forEach(btn => {
        btn.addEventListener('click', () => onExcluir(parseInt(btn.getAttribute('data-id'))));
    });
}