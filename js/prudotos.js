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
            alert('Erro ao processar a imagem selecionada.');
        };

        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

export function renderizarListaProdutos(produtos, onExcluir, onAlternarStatus) {
    const container = document.getElementById('lista-produtos-geral');
    if (!container) return;

    if (!produtos || produtos.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 24px 10px; color: var(--texto-suave); font-size: 0.88rem;">
                Nenhum produto cadastrado até o momento.
            </div>
        `;
        return;
    }

    // Cabeçalho com o total de itens para controle imediato
    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid var(--card-borda);">
            <span style="font-size: 0.82rem; color: var(--texto-suave); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">
                Total no Catálogo
            </span>
            <span style="background: rgba(0, 255, 102, 0.12); color: var(--verde-oficial); font-weight: 700; font-size: 0.85rem; padding: 3px 10px; border-radius: 20px;">
                ${produtos.length} produtos
            </span>
        </div>
    `;

    html += produtos.map(p => {
        const precoFormatado = parseFloat(p.preco || 0).toFixed(2).replace('.', ',');
        const cod = p.codigo || `#${String(p.id).padStart(2, '0')}`;
        const cat = (p.categoria || 'Geral').toUpperCase();
        const ativo = p.disponivel !== false;
        const foto = p.imagem_url || 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=120';

        return `
            <div class="item-card" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; margin-bottom: 10px; background: #151a17; border: 1px solid var(--card-borda); border-radius: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
                    <img src="${foto}" alt="${p.nome}" style="width: 46px; height: 46px; border-radius: 8px; object-fit: cover; background: #222; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.06);">
                    <div style="display: flex; flex-direction: column; gap: 2px; overflow: hidden;">
                        <span style="font-size: 0.88rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            <strong style="color: var(--verde-oficial); font-family: monospace; margin-right: 4px;">${cod}</strong>${p.nome}
                        </span>
                        <span style="font-size: 0.74rem; color: var(--texto-suave);">
                            ${cat} • <strong>R$ ${precoFormatado}</strong> • Estoque: ${p.estoque || 0} un
                        </span>
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 8px; margin-left: 10px; flex-shrink: 0;">
                    <button type="button" class="btn-toggle-status" data-id="${p.id}" style="background: ${ativo ? 'rgba(0, 255, 102, 0.1)' : 'rgba(255, 255, 255, 0.05)'}; color: ${ativo ? 'var(--verde-oficial)' : '#888'}; border: 1px solid ${ativo ? 'rgba(0, 255, 102, 0.3)' : 'rgba(255, 255, 255, 0.1)'}; font-size: 0.72rem; font-weight: 700; padding: 5px 8px; border-radius: 6px; cursor: pointer;">
                        ${ativo ? 'Visível' : 'Pausado'}
                    </button>
                    <button type="button" class="btn-remover-produto" data-id="${p.id}" style="background: none; border: none; color: var(--vermelho); font-size: 0.8rem; font-weight: 600; cursor: pointer; padding: 6px 8px;">
                        Excluir
                    </button>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;

    // Listeners de exclusão
    container.querySelectorAll('.btn-remover-produto').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id, 10);
            if (!isNaN(id) && typeof onExcluir === 'function') {
                onExcluir(id);
            }
        });
    });

    // Listeners de alternância de status
    container.querySelectorAll('.btn-toggle-status').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id, 10);
            if (!isNaN(id) && typeof onAlternarStatus === 'function') {
                onAlternarStatus(id);
            }
        });
    });
}