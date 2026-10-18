gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById("tela-gelado");
const context = canvas.getContext("2d");

// Resolução do canvas (podes ajustar se o teu vídeo original for diferente)
canvas.width = 1920;
canvas.height = 1080;

// O total exato das tuas fotos do ezgif
const frameCount = 160; 

// Diz ao código como encontrar as fotos na pasta frames
const currentFrame = index => (
  `frames/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
);

const images = [];
const gelado = { frame: 0 };

// Carrega as 160 fotos para a memória antes de o utilizador fazer scroll
for (let i = 0; i < frameCount; i++) {
  const img = new Image();
  img.src = currentFrame(i);
  images.push(img);
}

// O motor da fluidez de movimento (Sequência de Imagens)
gsap.to(gelado, {
  frame: frameCount - 1,
  snap: "frame",
  ease: "none",
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: 0.5 // O "amortecedor" que torna tudo suave
  },
  onUpdate: render // Troca a foto sempre que mexes a roda do rato
});

// Garante que a primeira imagem aparece logo ao entrar no site
images[0].onload = render;

function render() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(images[gelado.frame], 0, 0, canvas.width, canvas.height);
}

// --- ANIMAÇÃO DO VIDRO ESTILHAÇADO ---
gsap.to("#vidro-quebrado", {
    scale: 5,
    opacity: 0,
    ease: "power2.in",
    scrollTrigger: {
        trigger: ".seccao-vidro",
        start: "top top",
        end: "bottom top",
        scrub: true
    }
});

// --- ANIMAÇÃO DOS TEXTOS E BOTÃO ---
gsap.utils.toArray('.seccao-sabor').forEach(seccao => {
    const textos = seccao.querySelectorAll('.sabor-texto');
    
    gsap.set(textos, { opacity: 0, y: 50 });

    gsap.to(textos, {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.3,
        ease: "power3.out",
        scrollTrigger: {
            trigger: seccao,
            start: "top 60%",
            toggleActions: "play none none reverse" 
        }
    });
});