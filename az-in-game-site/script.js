document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal Animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // Parallax effect for floating shapes
    document.addEventListener('mousemove', (e) => {
        const shapes = document.querySelectorAll('.shape');
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 20;
            const xOffset = (window.innerWidth / 2 - e.clientX) / speed;
            const yOffset = (window.innerHeight / 2 - e.clientY) / speed;
            
            shape.style.transform = `translate(${xOffset}px, ${yOffset}px) rotate(${x * 20}deg)`;
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Game Demo Modal Logic
    const modal = document.getElementById("gameModal");
    const btn = document.getElementById("openDemoBtn");
    const span = document.getElementsByClassName("close-modal")[0];
    const gameFrame = document.getElementById("gameFrame");

    if (btn) {
        btn.onclick = function() {
            modal.style.display = "flex";
            // Load the game only when modal is opened to save resources
            if (!gameFrame.src) {
                gameFrame.src = "https://knightchase.onrender.com/";
            }
            document.body.style.overflow = "hidden"; // Prevent background scrolling
        }
    }

    if (span) {
        span.onclick = function() {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
            // Optional: Reset iframe source to stop game sounds/logic when closed
            // gameFrame.src = ""; 
        }
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        }
    }
});
