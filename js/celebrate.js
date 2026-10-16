// Celebrations: an "Approved" stamp on a sent enquiry form, and a burst of
// construction-coloured confetti (also used when the hero dream gets built).

(function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const COLORS = ['#ffc914', '#ff5b1f', '#4d86ff', '#22a75c', '#ffffff'];
    const DURATION = 2600;

    function burst(x, y) {
        if (reduceMotion) return;
        const canvas = document.createElement('canvas');
        canvas.className = 'confetti-canvas';
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        const pieces = Array.from({ length: 140 }, () => ({
            x,
            y,
            vx: (Math.random() - 0.5) * 16,
            vy: -4 - Math.random() * 15,
            w: 6 + Math.random() * 10,
            h: 4 + Math.random() * 6,
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.4,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
        }));

        const start = performance.now();
        (function frame(now) {
            const elapsed = now - start;
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            ctx.globalAlpha = Math.max(0, 1 - elapsed / DURATION);
            for (const p of pieces) {
                p.vy += 0.45;
                p.vx *= 0.99;
                p.x += p.vx;
                p.y += p.vy;
                p.rot += p.vr;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = '#0f1420';
                ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            }
            if (elapsed < DURATION) requestAnimationFrame(frame);
            else canvas.remove();
        })(start);
    }

    // Fired by setupEnquiryForms() in js/api.js after a successful send
    document.addEventListener('enquiry:sent', (e) => {
        const form = e.target;
        form.classList.remove('is-sent');
        void form.offsetWidth; // restart the stamp animation
        form.classList.add('is-sent');
        setTimeout(() => form.classList.remove('is-sent'), 3300);

        const button = form.querySelector('[type="submit"]').getBoundingClientRect();
        burst(button.left + button.width / 2, button.top + button.height / 2);
    });

    window.celebrate = burst;
})();
