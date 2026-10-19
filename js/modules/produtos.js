export function processarImagemUpload(input, previewId, campoOcultoId) {
    if (!input || !input.files || !input.files[0]) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione um ficheiro de imagem válido.');
        return;
    }

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
                    height = Math.round(height * (MAX_WIDTH / width));
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width = Math.round(width * (MAX_HEIGHT / height));
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const fotoComprimida = canvas.toDataURL('image/jpeg', 0.82);

            const preview = document.getElementById(previewId);
            if (preview) {
                preview.src = fotoComprimida;
                preview.style.display = 'block';
            }

            const campoOculto = document.getElementById(campoOcultoId);
            if (campoOculto) {
                campoOculto.value = fotoComprimida;
            }
        };

        img.onerror = function() {
            alert('Erro ao carregar a imagem selecionada.');
        };

        img.src = e.target.result;
    };

    reader.onerror = function() {
        alert('Erro ao ler o ficheiro.');
    };

    reader.readAsDataURL(file);
}

export function renderizarListaProdutos(produtos, onExcluir) {
    const container = document.getElementById('lista-produtos-geral');
    if (!container) return;

    if (!produtos || produtos.length === 0) {
        container.innerHTML = '<div style="color:var(--texto-suave); font-size:0.85rem; padding:12px 0; text-align:center;">Nenhum produto cadastrado no catálogo.</div>';
        return;
    }

    container.innerHTML = produtos.map(p => {
        const precoFormatado = parseFloat(p.preco || 0).toFixed(2).replace('.', ',');
        const cod = p.codigo || `#${String(p.id).padStart(2, '0')}`;
        const cat = (p.categoria || 'Geral').toUpperCase();
        const foto = p.imagem_url || 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=100';

        return `
            <div class="item-card">
                <img src="${foto}" class="item-detalhe-foto" alt="${p.nome}">
                <div class="item-info">
                    <span class="item-titulo">
                        <strong style="color:var(--verde-oficial); font-family:monospace; margin-right:4px;">${cod}</strong>
                        ${p.nome}
                    </span>
                    <span class="item-sub">${cat} • R$ ${precoFormatado}</span>
                </div>
                <button type="button" class="btn-remover btn-remover-produto" data-id="${p.id}" style="cursor:pointer;">Excluir</button>
            </div>
        `;
    }).join('');

    container.querySelectorAll('.btn-remover-produto').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id, 10);
            if (!isNaN(id) && typeof onExcluir === 'function') {
                onExcluir(id);
            }
        });
    });
}