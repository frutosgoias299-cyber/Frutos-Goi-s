export function gerarPlacaMesa() {
    const inputNum = document.getElementById('num-mesa-qr');
    const inputUrl = document.getElementById('url-base-input');
    const blocoResultado = document.getElementById('bloco-resultado-qr');
    const qrBox = document.getElementById('qrcode-container');

    if (!inputNum || !inputUrl || !blocoResultado || !qrBox) return;

    const numMesa = (inputNum.value || '1').padStart(2, '0');
    const baseUrl = inputUrl.value.trim() || window.location.href.replace('admin.html', 'cardapio.html');
    const linkCompleto = `${baseUrl}?mesa=${numMesa}`;

    blocoResultado.style.display = 'block';
    qrBox.innerHTML = '';

    if (typeof QRCode === 'undefined') {
        alert('Biblioteca QRCode não encontrada. Verifique sua conexão à internet.');
        return;
    }

    new QRCode(qrBox, {
        text: linkCompleto,
        width: 180,
        height: 180,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

export function imprimirAdesivoMesa() {
    const inputNum = document.getElementById('num-mesa-qr');
    const num = (inputNum ? inputNum.value : '1').padStart(2, '0');
    const qrBox = document.getElementById('qrcode-container');

    if (!qrBox) return;

    // Garante extração correta quer a lib tenha gerado <img> ou <canvas>
    let imgSrc = '';
    const imgEl = qrBox.querySelector('img');
    const canvasEl = qrBox.querySelector('canvas');

    if (imgEl && imgEl.src) {
        imgSrc = imgEl.src;
    } else if (canvasEl) {
        imgSrc = canvasEl.toDataURL('image/png');
    }

    if (!imgSrc) {
        alert('Por favor, clique primeiro em "Gerar Placa" antes de imprimir.');
        return;
    }

    const w = window.open('', '_blank');
    if (!w) {
        alert('Por favor, permita pop-ups para abrir a impressão da placa.');
        return;
    }

    w.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Placa Mesa ${num} - Frutos de Goiás</title>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
                body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; color: #111; }
                .placa-container { border: 3px solid #111; padding: 32px 28px; border-radius: 20px; text-align: center; width: 280px; }
                .marca { font-size: 16px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #222; margin-bottom: 4px; }
                .mesa-titulo { font-size: 32px; font-weight: 800; color: #008833; margin-bottom: 16px; }
                .qr-img { width: 200px; height: 200px; display: block; margin: 0 auto 16px; }
                .instrucao { font-size: 12px; color: #444; line-height: 1.4; font-weight: 600; }
                .badge-express { display: inline-block; background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 6px; margin-top: 10px; }
            </style>
        </head>
        <body>
            <div class="placa-container">
                <div class="marca">Frutos de Goiás</div>
                <div class="mesa-titulo">MESA ${num}</div>
                <img src="${imgSrc}" class="qr-img" alt="QR Code Mesa ${num}"/>
                <p class="instrucao">Aponte a câmara do telemóvel para fazer o seu pedido direto da mesa.</p>
                <div class="badge-express">Atendimento Express</div>
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 500);
                };
            <\/script>
        </body>
        </html>
    `);
    w.document.close();
}

export function imprimirCardapioFisicoA4(produtos) {
    if (!produtos || produtos.length === 0) {
        alert('Não há produtos para gerar o cardápio impresso.');
        return;
    }

    const categorias = {
        'picoles': 'Picolés Artesanais',
        'gelados': 'Taças & Gelados',
        'acai': 'Açaí Natural',
        'especiais': 'Especiais da Casa'
    };

    let secoesHtml = '';

    for (const [slug, nomeCat] of Object.entries(categorias)) {
        const itens = produtos.filter(p => p.categoria === slug && p.disponivel !== false);
        if (itens.length === 0) continue;

        secoesHtml += `
            <div class="categoria-bloco">
                <h3 class="categoria-titulo">${nomeCat}</h3>
                <div class="linhas-itens">
        `;

        itens.forEach(it => {
            const precoFormatado = parseFloat(it.preco || 0).toFixed(2).replace('.', ',');
            const cod = it.codigo || `#${String(it.id).padStart(2, '0')}`;
            secoesHtml += `
                <div class="linha-produto">
                    <div class="col-esquerda">
                        <span class="codigo-item">${cod}</span>
                        <div class="meta-item">
                            <span class="nome-item">${it.nome}</span>
                            ${it.descricao ? `<span class="desc-item">${it.descricao}</span>` : ''}
                        </div>
                    </div>
                    <span class="linha-pontilhada"></span>
                    <span class="preco-item">R$ ${precoFormatado}</span>
                </div>
            `;
        });

        secoesHtml += `</div></div>`;
    }

    const w = window.open('', '_blank');
    if (!w) {
        alert('Por favor, permita pop-ups para abrir o cardápio impresso.');
        return;
    }

    w.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Cardápio Impresso - Frutos de Goiás</title>
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
                @page { size: A4; margin: 12mm 15mm; }
                * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
                body { color: #111; background: #fff; }
                .cabecalho { text-align: center; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 14px; }
                .cabecalho h1 { font-family: 'Playfair Display', serif; font-size: 32px; letter-spacing: 0.5px; }
                .cabecalho p { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #555; margin-top: 3px; }
                .aviso-codigo { background: #f4fbf7; border: 1px dashed #008833; border-radius: 8px; padding: 6px 12px; font-size: 11px; text-align: center; color: #166534; margin-bottom: 18px; font-weight: 600; }
                .colunas-menu { column-count: 2; column-gap: 32px; }
                .categoria-bloco { break-inside: avoid; margin-bottom: 22px; }
                .categoria-titulo { font-family: 'Playfair Display', serif; font-size: 17px; color: #008833; border-bottom: 1px solid #ddd; padding-bottom: 3px; margin-bottom: 8px; }
                .linha-produto { display: flex; align-items: baseline; margin-bottom: 7px; break-inside: avoid; }
                .col-esquerda { display: flex; align-items: baseline; gap: 6px; max-width: 72%; }
                .codigo-item { font-family: monospace; font-weight: 700; color: #008833; font-size: 12px; }
                .nome-item { font-weight: 600; font-size: 12px; color: #111; }
                .desc-item { display: block; font-size: 9.5px; color: #666; font-weight: 400; }
                .linha-pontilhada { flex-grow: 1; border-bottom: 1px dotted #999; margin: 0 6px; }
                .preco-item { font-weight: 700; font-size: 12px; white-space: nowrap; }
            </style>
        </head>
        <body>
            <div class="cabecalho">
                <h1>FRUTOS DE GOIÁS</h1>
                <p>Cardápio Artesanal Tradicional</p>
            </div>
            <div class="aviso-codigo">
                💡 <strong>Peça sem fila:</strong> Encontre o código (ex: <strong>#01</strong>) ao lado do produto, aponte a câmara para o QR Code da mesa e digite o código na busca!
            </div>
            <div class="colunas-menu">
                ${secoesHtml}
            </div>
            <script>
                window.onload = function() {
                    window.print();
                };
            <\/script>
        </body>
        </html>
    `);
    w.document.close();
}