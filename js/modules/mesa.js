export function gerarPlacaMesa() {
    const num = document.getElementById('num-mesa-qr').value.padStart(2, '0');
    const baseUrl = document.getElementById('url-base-input').value.trim();
    const link = `${baseUrl}?mesa=${num}`;

    document.getElementById('bloco-resultado-qr').style.display = 'block';
    const qrBox = document.getElementById('qrcode-container');
    qrBox.innerHTML = '';
    new QRCode(qrBox, { text: link, width: 180, height: 180 });
}

export function imprimirAdesivoMesa() {
    const num = document.getElementById('num-mesa-qr').value.padStart(2, '0');
    const qrImg = document.querySelector('#qrcode-container img').src;
    const w = window.open('', '_blank');
    w.document.write(`
        <html>
        <body style="font-family:sans-serif; text-align:center; padding:40px;">
            <div style="border:2px dashed #000; padding:25px; display:inline-block; border-radius:14px;">
                <h2 style="margin:0;">FRUTOS DE GOIÁS</h2>
                <h1 style="color:#00AA44; margin:10px 0;">MESA ${num}</h1>
                <img src="${qrImg}" width="200"/>
                <p style="margin-top:10px; font-size:13px; color:#555;">Abra a câmera para pedir</p>
            </div>
            <script>window.onload = function() { window.print(); window.close(); }<\/script>
        </body>
        </html>
    `);
}

export function imprimirCardapioFisicoA4(produtos) {
    const categorias = { 'picoles': 'Picolés', 'gelados': 'Taças & Gelados', 'acai': 'Açaí Natural', 'especiais': 'Especiais' };
    let html = '';
    for (const [slug, nomeCat] of Object.entries(categorias)) {
        const itens = produtos.filter(p => p.categoria === slug);
        if (itens.length === 0) continue;
        html += `<div style="break-inside:avoid; margin-bottom:20px;"><h3 style="font-family:'Playfair Display',serif; color:#008833; border-bottom:1px solid #ddd; padding-bottom:4px; font-size:18px;">${nomeCat}</h3>`;
        itens.forEach(it => {
            html += `
                <div style="display:flex; justify-content:space-between; margin:8px 0; font-size:13px;">
                    <span><strong style="color:#008833; font-family:monospace;">${it.codigo || ''}</strong> ${it.nome}</span>
                    <span>R$ ${parseFloat(it.preco).toFixed(2).replace('.', ',')}</span>
                </div>
            `;
        });
        html += `</div>`;
    }

    const w = window.open('', '_blank');
    w.document.write(`
        <html>
        <head>
            <title>Cardápio Impresso - Frutos de Goiás</title>
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
        </head>
        <body style="font-family:'Plus Jakarta Sans',sans-serif; padding:30px; color:#111;">
            <div style="text-align:center; border-bottom:2px solid #111; padding-bottom:12px; margin-bottom:20px;">
                <h1 style="font-family:'Playfair Display',serif; margin:0; font-size:32px;">FRUTOS DE GOIÁS</h1>
                <p style="margin:4px 0 0; font-size:12px; color:#666;">CARDÁPIO ARTESANAL</p>
            </div>
            <div style="column-count:2; column-gap:30px;">${html}</div>
            <script>window.onload = function() { window.print(); }<\/script>
        </body>
        </html>
    `);
}