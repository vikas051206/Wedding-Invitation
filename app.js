/* ==========================================
   MUSIC & PROCEDURAL AUDIO SYNTHESIZER
   ========================================== */
const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
let audioCtx = null;
let droneOsc = null;
let droneGain = null;
let synthInterval = null;
let isProceduralPlaying = false;

// Procedural ambient Indian-inspired flute/bell sound generator
// (Guarantees elegant ambient audio even if the external MP3 URL has CORS blocks)
function startProceduralMusic() {
    if (isProceduralPlaying) return;
    isProceduralPlaying = true;
    
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create low meditative tanpura/drone sound (D3 and A3 notes)
    droneOsc = audioCtx.createOscillator();
    droneGain = audioCtx.createGain();
    droneOsc.type = 'sine';
    droneOsc.frequency.value = 146.83; // D3 note
    droneGain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    droneOsc.connect(droneGain);
    droneGain.connect(audioCtx.destination);
    droneOsc.start();
    
    // Bell/chime melody sequence (D Major Pentatonic Scale: D4, E4, F#4, A4, B4, D5)
    const pentatonicNotes = [293.66, 329.63, 369.99, 440.00, 493.88, 587.33];
    
    synthInterval = setInterval(() => {
        if (audioCtx.state === 'suspended') return;
        
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'triangle';
        // Randomly pick a note from the pentatonic scale
        const freq = pentatonicNotes[Math.floor(Math.random() * pentatonicNotes.length)];
        osc.frequency.value = freq;
        
        // Custom envelope for soft metallic wind chimes
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 3.0);
        
        // Add a simple low-pass filter to make it sound warmer/softer
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
        
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 3.2);
    }, 2000);
}

function stopProceduralMusic() {
    if (!isProceduralPlaying) return;
    isProceduralPlaying = false;
    
    if (synthInterval) {
        clearInterval(synthInterval);
    }
    if (droneOsc) {
        try {
            droneOsc.stop();
        } catch (e) {}
    }
    if (audioCtx) {
        audioCtx.close();
    }
    audioCtx = null;
    droneOsc = null;
    droneGain = null;
}

function handleMusicPlay() {
    // Try playing the standard MP3 first
    bgMusic.play()
        .then(() => {
            musicToggle.classList.add('playing');
        })
        .catch(err => {
            console.warn("External MP3 play blocked. Starting custom Web Audio synthesizer instead.");
            startProceduralMusic();
            musicToggle.classList.add('playing');
        });
}

function handleMusicPause() {
    bgMusic.pause();
    stopProceduralMusic();
    musicToggle.classList.remove('playing');
}

musicToggle.addEventListener('click', () => {
    if (bgMusic.paused && !isProceduralPlaying) {
        handleMusicPlay();
    } else {
        handleMusicPause();
    }
});

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
    
    // Start playing background score immediately on user gesture
    setTimeout(() => {
        handleMusicPlay();
        musicToggle.classList.remove('hidden');
    }, 600);
    
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
   RSVP FORM LOGIC
   ========================================== */
const rsvpForm = document.getElementById('rsvp-form');
const attendanceRadios = document.querySelectorAll('input[name="attendance"]');
const guestsRow = document.querySelector('.guests-count-row');
const rsvpSuccess = document.getElementById('rsvp-success');
const rsvpSuccessText = document.getElementById('rsvp-success-text');
const btnCloseRsvp = document.getElementById('btn-close-rsvp');
const submitBtn = document.getElementById('btn-submit');

// Toggle Guests Count input depending on attendance
attendanceRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'yes') {
            guestsRow.classList.remove('hidden');
            document.getElementById('guests-count').setAttribute('required', 'required');
        } else {
            guestsRow.classList.add('hidden');
            document.getElementById('guests-count').removeAttribute('required');
        }
    });
});

// Check for existing RSVP in local storage
const cachedRsvp = localStorage.getItem('wedding_rsvp');
if (cachedRsvp) {
    const rsvpData = JSON.parse(cachedRsvp);
    showRsvpSuccessState(rsvpData.name, rsvpData.attendance);
}

rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Show spinner & disable button
    submitBtn.setAttribute('disabled', 'disabled');
    submitBtn.querySelector('.btn-text').style.opacity = '0.3';
    submitBtn.querySelector('.spinner').classList.remove('hidden');
    
    const name = document.getElementById('guest-name').value.trim();
    const attendance = document.querySelector('input[name="attendance"]:checked').value;
    const guests = document.getElementById('guests-count').value;
    const message = document.getElementById('guest-message').value.trim();

    // Store RSVP data object
    const rsvpData = { name, attendance, guests, message };

    // Simulate sending data to server (1.5 seconds)
    setTimeout(() => {
        localStorage.setItem('wedding_rsvp', JSON.stringify(rsvpData));
        
        // Reset submit button state
        submitBtn.removeAttribute('disabled');
        submitBtn.querySelector('.btn-text').style.opacity = '1';
        submitBtn.querySelector('.spinner').classList.add('hidden');

        // Show success screen
        showRsvpSuccessState(name, attendance);
        
        // Auto-add wish if they left a message
        if (message) {
            addNewWishToList(name, message);
        }
    }, 1500);
});

function showRsvpSuccessState(name, attendance) {
    rsvpSuccess.classList.remove('hidden');
    if (attendance === 'yes') {
        rsvpSuccessText.innerHTML = `Dear <strong>${name}</strong>, your attendance has been confirmed! We cannot wait to celebrate with you.`;
    } else {
        rsvpSuccessText.innerHTML = `Dear <strong>${name}</strong>, thank you for letting us know. You will be missed, and we appreciate your warm wishes!`;
    }
}

// Edit response button returns user to form
btnCloseRsvp.addEventListener('click', () => {
    rsvpSuccess.classList.add('hidden');
    // Prepopulate form fields with saved values
    const cached = localStorage.getItem('wedding_rsvp');
    if (cached) {
        const data = JSON.parse(cached);
        document.getElementById('guest-name').value = data.name;
        document.querySelector(`input[name="attendance"][value="${data.attendance}"]`).checked = true;
        document.getElementById('guests-count').value = data.guests;
        document.getElementById('guest-message').value = data.message;
        
        // Trigger change event to ensure guest row visibility is correct
        document.querySelector(`input[name="attendance"]:checked`).dispatchEvent(new Event('change'));
    }
});

/* ==========================================
   WISHES WALL / GUEST BOOK LOGIC
   ========================================== */
const wishForm = document.getElementById('wish-form');
const wishesGrid = document.getElementById('wishes-grid');

const defaultWishes = [
    {
        name: "Uncle Ramesh & Family",
        message: "Wishing you both a lifetime of happiness, love, and laughter! Congratulations to the beautiful couple!",
        date: "July 9, 2026"
    },
    {
        name: "Preeti & Sagar",
        message: "So incredibly happy for you two! Can't wait to dance and celebrate the big day with you in Shimoga!",
        date: "July 9, 2026"
    },
    {
        name: "Savitha & Shekar",
        message: "May your love grow stronger with each passing year. Happy married life, Rachana and Nitin!",
        date: "July 8, 2026"
    }
];

function loadWishes() {
    let wishes = localStorage.getItem('wedding_wishes');
    if (!wishes) {
        wishes = defaultWishes;
        localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
    } else {
        wishes = JSON.parse(wishes);
    }
    
    wishesGrid.innerHTML = '';
    wishes.forEach(wish => {
        createWishCard(wish.name, wish.message, wish.date);
    });
}

function createWishCard(name, message, date) {
    const card = document.createElement('div');
    card.className = 'wish-card';
    card.innerHTML = `
        <p class="wish-message">"${message}"</p>
        <div class="wish-author">
            — ${name}
            <span class="wish-date">${date}</span>
        </div>
    `;
    wishesGrid.prepend(card); // Prepend to show newest first
}

function addNewWishToList(name, message) {
    const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', dateOptions);
    const newWish = { name, message, date: dateStr };
    
    let wishes = JSON.parse(localStorage.getItem('wedding_wishes')) || [];
    wishes.push(newWish);
    localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
    
    createWishCard(name, message, dateStr);
}

wishForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('wish-name');
    const textInput = document.getElementById('wish-text');
    
    const name = nameInput.value.trim();
    const message = textInput.value.trim();
    
    if (name && message) {
        addNewWishToList(name, message);
        
        // Reset and animate inputs
        nameInput.value = '';
        textInput.value = '';
    }
});

// Load the wishes wall on initialization
loadWishes();

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

