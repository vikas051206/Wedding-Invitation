/* ==========================================
   ENVELOPE OPENING GESTURE
   ========================================== */
const openSealBtn = document.getElementById('open-envelope');
const envelope = document.querySelector('.envelope');
const overlay = document.getElementById('envelope-overlay');
const mainContent = document.getElementById('main-content');

openSealBtn.addEventListener('click', () => {
    // Add opened class to start folding & letter slide up
    envelope.classList.add('opened');
    
    // Fade out overlay and reveal main scrollable invite
    setTimeout(() => {
        overlay.classList.add('fade-out');
        mainContent.classList.remove('blurred');
        mainContent.classList.add('revealed');
        
        // Start scroll animations
        triggerScrollAnimations();
    }, 1600);
});

/* ==========================================
   COUNTDOWN TIMER LOGIC
   ========================================== */
const targetDate = new Date('2026-08-20T19:30:00').getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
        document.getElementById('days').innerText = '00';
        document.getElementById('hours').innerText = '00';
        document.getElementById('minutes').innerText = '00';
        document.getElementById('seconds').innerText = '00';
        return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = String(days).padStart(2, '0');
    document.getElementById('hours').innerText = String(hours).padStart(2, '0');
    document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
    document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
}

setInterval(updateCountdown, 1000);
updateCountdown();

/* ==========================================
   FLOATING CANVAS PARTICLES ANIMATION
   ========================================== */
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = window.matchMedia('(max-width: 768px)').matches ? 28 : 45;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.reset();
        // Distribute them vertically on initial load so they don't all fall from the top
        this.y = Math.random() * canvas.height;
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.size = Math.random() * 8 + 4; // size ranges from 4 to 12
        this.speedY = Math.random() * 0.8 + 0.4; // slow falling speed
        this.speedX = Math.random() * 0.5 - 0.25; // slight horizontal drift
        this.type = Math.random() > 0.4 ? 'gold-leaf' : 'rose-petal';
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() * 0.6 + 0.1) * (Math.random() > 0.5 ? 1 : -1);
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.y / 30) * 0.2; // subtle wave motion
        this.rotation += this.rotationSpeed;

        if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);

        if (this.type === 'gold-leaf') {
            // Draw a shiny golden leaf/glitter particle
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size / 2, this.size, 0, 0, 2 * Math.PI);
            const goldGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
            goldGradient.addColorStop(0, '#F3E5AB');
            goldGradient.addColorStop(0.5, '#D4AF37');
            goldGradient.addColorStop(1, '#AA7C11');
            ctx.fillStyle = goldGradient;
            ctx.fill();
        } else {
            // Draw a soft pink/red rose petal shape
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.bezierCurveTo(this.size, -this.size, this.size * 1.5, 0, 0, this.size * 1.2);
            ctx.bezierCurveTo(-this.size * 1.5, 0, -this.size, -this.size, 0, -this.size);
            ctx.closePath();
            
            const petalGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 1.2);
            petalGradient.addColorStop(0, '#FFC0CB'); // pink
            petalGradient.addColorStop(0.7, '#E34A6F'); // rose red
            petalGradient.addColorStop(1, '#7A1C2E'); // deep crimson
            ctx.fillStyle = petalGradient;
            ctx.fill();
        }

        ctx.restore();
    }
}

// Initialize particles
for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

/* ==========================================
   SCROLL INTERSECTION OBSERVER (FADE-INS)
   ========================================== */
function triggerScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

/* ==========================================
   PWA SERVICE WORKER REGISTRATION
   ========================================== */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('Service Worker registered successfully!', reg.scope))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}

