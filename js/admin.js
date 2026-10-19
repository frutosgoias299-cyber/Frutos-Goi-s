// Dados iniciais padrão (contingência)
var dadosPadrao = [
    { id: 1, codigo: '#01', nome: "Picolé Ninho Trufado", categoria: "picoles", preco: 8.50, estoque: 25, estoque_minimo: 5, imagem_url: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&q=80", descricao: "Cremoso com recheio de avelã", disponivel: true },
    { id: 2, codigo: '#02', nome: "Picolé de Maracujá", categoria: "picoles", preco: 6.00, estoque: 30, estoque_minimo: 5, imagem_url: "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400&q=80", descricao: "100% polpa de fruta natural", disponivel: true },
    { id: 3, codigo: '#03', nome: "Taça Suprema de Morango", categoria: "gelados", preco: 24.00, estoque: 15, estoque_minimo: 3, imagem_url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80", descricao: "Gelado artesanal com raspas de chocolate", disponivel: true },
    { id: 4, codigo: '#04', nome: "Tigela Açaí Puro 500ml", categoria: "acai", preco: 22.00, estoque: 18, estoque_minimo: 4, imagem_url: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&q=80", descricao: "Açaí batido na hora com granola", disponivel: true }
];

var produtos = [];
var equipe = [];
var banners = [];
var itensCaixa = [];

function avisar(texto) {
    var toast = document.getElementById('feedback-toast');
    if (!toast) return;
    toast.innerText = texto;
    toast.style.display = 'block';
    setTimeout(function() { toast.style.display = 'none'; }, 3000);
}

// Navegação global entre abas
window.trocarAba = function(idClasse, btnElemento) {
    var botoes = document.querySelectorAll('.btn-classe');
    botoes.forEach(function(b) { b.classList.remove('ativa'); });
    if (btnElemento) btnElemento.classList.add('ativa');

    var secoes = document.querySelectorAll('.painel-secao');
    secoes.forEach(function(s) {
        s.classList.remove('ativa');
        s.style.setProperty('display', 'none', 'important');
    });

    var alvo = document.getElementById('classe-' + idClasse);
    if (alvo) {
        alvo.classList.add('ativa');
        alvo.style.setProperty('display', 'block', 'important');
    }
};

// Processamento de Upload e Compressão de Imagens
function processarImagem(input, previewId, campoOcultoId) {
    if (!input || !input.files || !input.files[0]) return;
    var file = input.files[0];

    var reader = new FileReader();
    reader.onload = function(e) {
        var img = new Image();
        img.onload = function() {
            var canvas = document.createElement('canvas');
            var maxDim = 800;
            var w = img.width;
            var h = img.height;

            if (w > h && w > maxDim) {
                h = Math.round(h * (maxDim / w));
                w = maxDim;
            } else if (h > maxDim) {
                w = Math.round(w * (maxDim / h));
                h = maxDim;
            }

            canvas.width = w;
            canvas.height = h;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);

            var fotoBase64 = canvas.toDataURL('image/jpeg', 0.82);
            var prev = document.getElementById(previewId);
            if (prev) {
                prev.src = fotoBase64;
                prev.style.display = 'block';
            }
            var hidden = document.getElementById(campoOcultoId);
            if (hidden) hidden.value = fotoBase64;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Carregamento de dados (API com fallback para LocalStorage)
async function carregarTudo() {
    try {
        var resP = await fetch('/api/produtos');
        if (resP.ok) {
            produtos = await resP.json();
        } else {
            throw new Error();
        }
    } catch (e) {
        var local = localStorage.getItem('produtos_banco_mock');
        produtos = local ? JSON.parse(local) : dadosPadrao;
        localStorage.setItem('produtos_banco_mock', JSON.stringify(produtos));
    }

    try {
        var resE = await fetch('/api/funcionarios');
        if (resE.ok) equipe = await resE.json();
        else throw new Error();
    } catch (e) {
        equipe = JSON.parse(localStorage.getItem('equipe_mock')) || [{ id: 1, nome: "Dono", cargo: "Gerente" }];
    }

    try {
        var resB = await fetch('/api/banners');
        if (resB.ok) banners = await resB.json();
        else throw new Error();
    } catch (e) {
        banners = JSON.parse(localStorage.getItem('banners_mock')) || [];
    }

    atualizarInterface();
}

function atualizarInterface() {
    // 1. Preenchimento de Selects
    var selMov = document.getElementById('mov-produto');
    var selVenda = document.getElementById('venda-item-select');
    var selFunc = document.getElementById('venda-funcionario');

    if (selMov) {
        selMov.innerHTML = produtos.map(function(p) {
            return '<option value="' + p.id + '">' + (p.codigo || '') + ' ' + p.nome + ' (' + (p.estoque || 0) + ' un)</option>';
        }).join('');
    }

    if (selVenda) {
        selVenda.innerHTML = produtos.map(function(p) {
            var precoFmt = parseFloat(p.preco || 0).toFixed(2).replace('.', ',');
            return '<option value="' + p.id + '">' + p.nome + ' - R$ ' + precoFmt + '</option>';
        }).join('');
    }

    if (selFunc) {
        selFunc.innerHTML = equipe.map(function(f) {
            return '<option value="' + f.id + '">' + f.nome + ' (' + f.cargo + ')</option>';
        }).join('');
    }

    // 2. Renderizar Lista de Produtos com Contador
    var contProdutos = document.getElementById('lista-produtos-geral');
    if (contProdutos) {
        if (produtos.length === 0) {
            contProdutos.innerHTML = '<div style="color:var(--texto-suave); font-size:0.85rem; padding:12px 0;">Nenhum produto cadastrado.</div>';
        } else {
            var html = '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding-bottom:6px; border-bottom:1px solid var(--card-borda);">' +
                       '<span style="font-size:0.8rem; color:var(--texto-suave); text-transform:uppercase; font-weight:700;">Total no Catálogo</span>' +
                       '<span style="background:rgba(0,255,102,0.12); color:var(--verde-oficial); font-weight:700; font-size:0.8rem; padding:2px 8px; border-radius:12px;">' + produtos.length + ' produtos</span>' +
                       '</div>';

            html += produtos.map(function(p) {
                var precoFmt = parseFloat(p.preco || 0).toFixed(2).replace('.', ',');
                var cod = p.codigo || ('#' + String(p.id).padStart(2, '0'));
                var ativo = p.disponivel !== false;
                var foto = p.imagem_url || 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=100';

                return '<div class="item-card" style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; margin-bottom:8px; background:#161b18; border-radius:10px; border:1px solid var(--card-borda);">' +
                    '<div style="display:flex; align-items:center; gap:10px; flex:1; min-width:0;">' +
                        '<img src="' + foto + '" style="width:42px; height:42px; border-radius:8px; object-fit:cover; background:#222; flex-shrink:0;">' +
                        '<div style="display:flex; flex-direction:column; gap:2px; overflow:hidden;">' +
                            '<span style="font-size:0.86rem; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' +
                                '<strong style="color:var(--verde-oficial); font-family:monospace; margin-right:4px;">' + cod + '</strong>' + p.nome +
                            '</span>' +
                            '<span style="font-size:0.72rem; color:var(--texto-suave);">' + (p.categoria || '').toUpperCase() + ' • R$ ' + precoFmt + ' • Estoque: ' + (p.estoque || 0) + ' un</span>' +
                        '</div>' +
                    '</div>' +
                    '<div style="display:flex; align-items:center; gap:6px; flex-shrink:0; margin-left:8px;">' +
                        '<button type="button" onclick="alternarStatus(' + p.id + ')" style="background:' + (ativo ? 'rgba(0,255,102,0.1)' : 'rgba(255,255,255,0.05)') + '; color:' + (ativo ? 'var(--verde-oficial)' : '#888') + '; border:1px solid ' + (ativo ? 'rgba(0,255,102,0.3)' : 'rgba(255,255,255,0.1)') + '; font-size:0.72rem; font-weight:700; padding:4px 8px; border-radius:6px; cursor:pointer;">' + (ativo ? 'Visível' : 'Pausado') + '</button>' +
                        '<button type="button" onclick="excluirProduto(' + p.id + ')" style="background:none; border:none; color:var(--vermelho); font-size:0.8rem; cursor:pointer; padding:4px 6px;">Excluir</button>' +
                    '</div>' +
                '</div>';
            }).join('');
            contProdutos.innerHTML = html;
        }
    }

    // 3. Renderizar Estoque
    var contEstoque = document.getElementById('lista-estoque-geral');
    if (contEstoque) {
        contEstoque.innerHTML = produtos.map(function(p) {
            var qtd = p.estoque || 0;
            var alerta = qtd <= (p.estoque_minimo || 5);
            return '<div class="item-card">' +
                '<div class="item-info">' +
                    '<span class="item-titulo"><strong style="color:var(--verde-oficial); font-family:monospace;">' + (p.codigo || '') + '</strong> ' + p.nome + '</span>' +
                    '<span class="item-sub">Disponível: <strong>' + qtd + ' un</strong> (Mínimo: ' + (p.estoque_minimo || 5) + ')</span>' +
                '</div>' +
                '<span class="badge-estoque ' + (alerta ? 'badge-alerta' : 'badge-ok') + '">' + (alerta ? 'Baixo' : 'Normal') + '</span>' +
            '</div>';
        }).join('');
    }

    // 4. Renderizar Banners
    var contBanners = document.getElementById('lista-banners-geral');
    if (contBanners) {
        if (banners.length === 0) {
            contBanners.innerHTML = '<div style="color:var(--texto-suave); font-size:0.85rem; padding:10px 0;">Nenhum banner ativo.</div>';
        } else {
            contBanners.innerHTML = banners.map(function(b) {
                return '<div class="banner-vitrine-card" style="background-image:url(\'' + b.imagem_url + '\');">' +
                    '<div class="banner-conteudo">' +
                        '<h4 style="color:var(--verde-oficial); font-size:1rem;">' + b.titulo + '</h4>' +
                        '<p style="color:#fff; font-size:0.78rem;">' + (b.subtitulo || '') + '</p>' +
                    '</div>' +
                '</div>' +
                '<button type="button" onclick="excluirBanner(' + b.id + ')" style="background:none; border:none; color:var(--vermelho); font-size:0.8rem; cursor:pointer; margin-bottom:14px;">Remover Banner</button>';
            }).join('');
        }
    }

    // 5. Renderizar Equipa
    var contEquipe = document.getElementById('lista-equipe-geral');
    if (contEquipe) {
        contEquipe.innerHTML = equipe.map(function(f) {
            return '<div class="item-card"><div class="item-info"><span class="item-titulo">' + f.nome + '</span><span class="item-sub">' + f.cargo + '</span></div></div>';
        }).join('');
    }
}

// Ações Globais
window.alternarStatus = function(id) {
    var p = produtos.find(function(item) { return item.id === id; });
    if (!p) return;
    p.disponivel = p.disponivel === false ? true : false;
    localStorage.setItem('produtos_banco_mock', JSON.stringify(produtos));
    avisar(p.disponivel ? 'Produto visível no cardápio!' : 'Produto pausado do cardápio!');
    atualizarInterface();
};

window.excluirProduto = function(id) {
    if (!confirm('Deseja excluir este produto?')) return;
    produtos = produtos.filter(function(item) { return item.id !== id; });
    localStorage.setItem('produtos_banco_mock', JSON.stringify(produtos));
    avisar('Produto removido.');
    atualizarInterface();
};

window.excluirBanner = function(id) {
    if (!confirm('Deseja remover este banner?')) return;
    banners = banners.filter(function(item) { return item.id !== id; });
    localStorage.setItem('banners_mock', JSON.stringify(banners));
    avisar('Banner removido.');
    atualizarInterface();
};

// Caixa & Vendas
window.adicionarItemCaixa = function() {
    var sel = document.getElementById('venda-item-select');
    var inputQtd = document.getElementById('venda-item-qtd');
    if (!sel || !inputQtd) return;

    var id = parseInt(sel.value, 10);
    var qtd = parseInt(inputQtd.value, 10);
    var p = produtos.find(function(it) { return it.id === id; });
    if (!p || qtd <= 0) return;

    var existente = itensCaixa.find(function(it) { return it.id === id; });
    if (existente) {
        existente.qtd += qtd;
    } else {
        itensCaixa.push({ id: p.id, nome: p.nome, preco: parseFloat(p.preco || 0), qtd: qtd });
    }
    inputQtd.value = 1;
    renderizarCaixa();
};

function renderizarCaixa() {
    var lista = document.getElementById('caixa-itens-lista');
    var totalEl = document.getElementById('caixa-total-exibicao');
    if (!lista || !totalEl) return;

    if (itensCaixa.length === 0) {
        lista.innerHTML = 'Nenhum item adicionado.';
        totalEl.innerText = '0,00';
        return;
    }

    var total = 0;
    lista.innerHTML = itensCaixa.map(function(it, idx) {
        var sub = it.preco * it.qtd;
        total += sub;
        return '<div style="display:flex; justify-content:space-between; padding:4px 0;">' +
            '<span>' + it.qtd + 'x ' + it.nome + ' - R$ ' + sub.toFixed(2).replace('.', ',') + '</span>' +
            '<span onclick="removerItemCaixa(' + idx + ')" style="color:var(--vermelho); cursor:pointer;">✕</span>' +
        '</div>';
    }).join('');
    totalEl.innerText = total.toFixed(2).replace('.', ',');
}

window.removerItemCaixa = function(idx) {
    itensCaixa.splice(idx, 1);
    renderizarCaixa();
};

window.concluirVendaCaixa = function() {
    if (itensCaixa.length === 0) return alert('Adicione produtos ao pedido.');

    itensCaixa.forEach(function(it) {
        var p = produtos.find(function(item) { return item.id === it.id; });
        if (p) p.estoque = Math.max(0, (p.estoque || 0) - it.qtd);
    });

    localStorage.setItem('produtos_banco_mock', JSON.stringify(produtos));
    itensCaixa = [];
    renderizarCaixa();
    avisar('Venda realizada e estoque baixado!');
    atualizarInterface();
};

// Impressão e QR Code
window.gerarPlacaMesa = function() {
    var inputNum = document.getElementById('num-mesa-qr');
    var inputUrl = document.getElementById('url-base-input');
    var num = (inputNum ? inputNum.value : '1').padStart(2, '0');
    var base = inputUrl ? inputUrl.value.trim() : window.location.href.replace('admin.html', 'cardapio.html');

    document.getElementById('bloco-resultado-qr').style.display = 'block';
    var box = document.getElementById('qrcode-container');
    box.innerHTML = '';
    new QRCode(box, { text: base + '?mesa=' + num, width: 180, height: 180 });
};

window.imprimirAdesivoMesa = function() {
    var num = (document.getElementById('num-mesa-qr').value || '1').padStart(2, '0');
    var box = document.getElementById('qrcode-container');
    var imgEl = box ? box.querySelector('img') : null;
    var canvasEl = box ? box.querySelector('canvas') : null;
    var src = imgEl ? imgEl.src : (canvasEl ? canvasEl.toDataURL() : '');

    if (!src) return alert('Gere a placa primeiro.');

    var w = window.open('', '_blank');
    w.document.write('<html><body style="font-family:sans-serif; text-align:center; padding:40px;">' +
        '<div style="border:2px dashed #000; padding:25px; display:inline-block; border-radius:14px;">' +
            '<h2 style="margin:0;">FRUTOS DE GOIÁS</h2>' +
            '<h1 style="color:#00AA44; margin:10px 0;">MESA ' + num + '</h1>' +
            '<img src="' + src + '" width="200"/>' +
            '<p style="margin-top:10px; font-size:13px; color:#555;">Abra a câmara para pedir</p>' +
        '</div>' +
        '<script>window.onload=function(){window.print();window.close();};<\/script>' +
    '</body></html>');
    w.document.close();
};

window.imprimirCardapioFisicoA4 = function() {
    if (!produtos || produtos.length === 0) return alert('Nenhum produto cadastrado.');

    var categorias = { 'picoles': 'Picolés Artesanais', 'gelados': 'Taças & Gelados', 'acai': 'Açaí Natural', 'especiais': 'Especiais da Casa' };
    var html = '';

    for (var slug in categorias) {
        var itens = produtos.filter(function(p) { return p.categoria === slug && p.disponivel !== false; });
        if (itens.length === 0) continue;

        html += '<div style="break-inside:avoid; margin-bottom:20px;">' +
            '<h3 style="font-family:serif; color:#008833; border-bottom:1px solid #ddd; padding-bottom:4px; font-size:17px; margin-bottom:8px;">' + categorias[slug] + '</h3>';

        itens.forEach(function(it) {
            var precoFmt = parseFloat(it.preco || 0).toFixed(2).replace('.', ',');
            var cod = it.codigo || ('#' + String(it.id).padStart(2, '0'));
            html += '<div style="display:flex; justify-content:space-between; margin:6px 0; font-size:12px;">' +
                '<span><strong style="color:#008833; font-family:monospace; margin-right:4px;">' + cod + '</strong> ' + it.nome + '</span>' +
                '<span style="font-weight:700;">R$ ' + precoFmt + '</span>' +
            '</div>';
        });
        html += '</div>';
    }

    var w = window.open('', '_blank');
    w.document.write('<html><head><title>Cardápio Impresso</title></head><body style="font-family:sans-serif; padding:30px; color:#111;">' +
        '<div style="text-align:center; border-bottom:2px solid #111; padding-bottom:12px; margin-bottom:20px;">' +
            '<h1 style="margin:0; font-size:28px;">FRUTOS DE GOIÁS</h1>' +
            '<p style="margin:4px 0 0; font-size:12px; color:#666;">CARDÁPIO ARTESANAL</p>' +
        '</div>' +
        '<div style="column-count:2; column-gap:30px;">' + html + '</div>' +
        '<script>window.onload=function(){window.print();};<\/script>' +
    '</body></html>');
    w.document.close();
};

// Eventos dos Formulários
document.addEventListener('DOMContentLoaded', function() {
    var urlBaseInput = document.getElementById('url-base-input');
    if (urlBaseInput) {
        urlBaseInput.value = window.location.href.replace('admin.html', 'cardapio.html');
    }

    // Uploads
    var inputFotoP = document.getElementById('prod-arquivo-foto');
    if (inputFotoP) {
        inputFotoP.addEventListener('change', function() {
            processarImagem(this, 'preview-prod-img', 'prod-foto-base64');
        });
    }

    var inputFotoB = document.getElementById('banner-arquivo-foto');
    if (inputFotoB) {
        inputFotoB.addEventListener('change', function() {
            processarImagem(this, 'preview-banner-img', 'banner-foto-base64');
        });
    }

    // Cadastro de Produto
    var formProd = document.getElementById('form-cad-produto');
    if (formProd) {
        formProd.addEventListener('submit', function(e) {
            e.preventDefault();
            var foto = document.getElementById('prod-foto-base64').value || 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&q=80';
            var novo = {
                id: Date.now(),
                codigo: document.getElementById('prod-codigo').value.trim() || ('#' + String(produtos.length + 1).padStart(2, '0')),
                nome: document.getElementById('prod-nome').value.trim(),
                categoria: document.getElementById('prod-categoria').value,
                preco: parseFloat(document.getElementById('prod-preco').value),
                imagem_url: foto,
                descricao: document.getElementById('prod-descricao').value.trim(),
                estoque: 20,
                disponivel: true
            };

            produtos.push(novo);
            localStorage.setItem('produtos_banco_mock', JSON.stringify(produtos));
            avisar('Produto cadastrado com sucesso!');
            e.target.reset();
            var prev = document.getElementById('preview-prod-img');
            if (prev) prev.style.display = 'none';
            document.getElementById('prod-foto-base64').value = '';
            atualizarInterface();
        });
    }

    // Movimentação de Estoque
    var formMov = document.getElementById('form-movimentacao');
    if (formMov) {
        formMov.addEventListener('submit', function(e) {
            e.preventDefault();
            var id = parseInt(document.getElementById('mov-produto').value, 10);
            var tipo = document.getElementById('mov-tipo').value;
            var qtd = parseInt(document.getElementById('mov-qtd').value, 10);

            var p = produtos.find(function(it) { return it.id === id; });
            if (p) {
                p.estoque = tipo === 'ENTRADA' ? (p.estoque || 0) + qtd : Math.max(0, (p.estoque || 0) - qtd);
                localStorage.setItem('produtos_banco_mock', JSON.stringify(produtos));
                avisar('Estoque atualizado!');
                e.target.reset();
                atualizarInterface();
            }
        });
    }

    // Banner
    var formB = document.getElementById('form-cad-banner');
    if (formB) {
        formB.addEventListener('submit', function(e) {
            e.preventDefault();
            var foto = document.getElementById('banner-foto-base64').value;
            if (!foto) return alert('Selecione uma imagem para o banner.');

            var novoB = {
                id: Date.now(),
                titulo: document.getElementById('banner-titulo').value.trim(),
                subtitulo: document.getElementById('banner-subtitulo').value.trim(),
                imagem_url: foto,
                ativo: true
            };

            banners.push(novoB);
            localStorage.setItem('banners_mock', JSON.stringify(banners));
            avisar('Banner publicado!');
            e.target.reset();
            var prevB = document.getElementById('preview-banner-img');
            if (prevB) prevB.style.display = 'none';
            document.getElementById('banner-foto-base64').value = '';
            atualizarInterface();
        });
    }

    // Equipa
    var formEq = document.getElementById('form-cad-equipe');
    if (formEq) {
        formEq.addEventListener('submit', function(e) {
            e.preventDefault();
            var novoF = {
                id: Date.now(),
                nome: document.getElementById('eq-nome').value.trim(),
                cargo: document.getElementById('eq-cargo').value,
                pin: document.getElementById('eq-pin').value.trim()
            };
            equipe.push(novoF);
            localStorage.setItem('equipe_mock', JSON.stringify(equipe));
            avisar('Colaborador adicionado!');
            e.target.reset();
            atualizarInterface();
        });
    }

    carregarTudo();
});