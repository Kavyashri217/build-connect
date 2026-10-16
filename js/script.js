// Shared behaviour for every page: navigation, the "% built" scroll meter,
// twinkling stars, drop-in reveals and count-up numbers.

(function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mobile menu
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    function setMenuOpen(open) {
        navLinks.classList.toggle('active', open);
        menuToggle.setAttribute('aria-expanded', String(open));
    }

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => setMenuOpen(false));
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') setMenuOpen(false);
        });
    }

    // Page scroll progress, shown as how much of the dream is built
    const nav = document.querySelector('.site-nav');
    const meterLabel = document.getElementById('buildMeterLabel');
    let meterQueued = false;

    function updateMeter() {
        meterQueued = false;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? Math.min(1, window.scrollY / max) : 1;
        nav.style.setProperty('--scroll', progress.toFixed(4));
        meterLabel.textContent = progress > 0.995 ? 'Dream built ✓' : `${Math.round(progress * 100)}% built`;
    }

    if (nav && meterLabel) {
        window.addEventListener('scroll', () => {
            if (!meterQueued) {
                meterQueued = true;
                requestAnimationFrame(updateMeter);
            }
        }, { passive: true });
        window.addEventListener('resize', updateMeter);
        updateMeter();
    }

    // Twinkling stars in any .stars container
    document.querySelectorAll('.stars').forEach(sky => {
        const count = Number(sky.dataset.count) || 40;
        const frag = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const star = document.createElement('span');
            star.className = 'star';
            star.style.left = `${(Math.random() * 100).toFixed(2)}%`;
            star.style.top = `${(Math.random() * 100).toFixed(2)}%`;
            star.style.setProperty('--d', `${(Math.random() * 4).toFixed(2)}s`);
            star.style.setProperty('--s', `${(1 + Math.random() * 2.5).toFixed(1)}px`);
            frag.appendChild(star);
        }
        sky.appendChild(frag);
    });

    // Reveals: elements drop into place as they scroll into view
    const revealables = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !reduceMotion) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealables.forEach(el => revealObserver.observe(el));
    } else {
        revealables.forEach(el => el.classList.add('is-in'));
    }

    // Count-up numbers such as "500+" or "4.8★"
    function countUp(el) {
        const target = el.textContent;
        const match = target.match(/^([\d.]+)(.*)$/);
        if (!match) return;
        const number = parseFloat(match[1]);
        const decimals = (match[1].split('.')[1] || '').length;
        const start = performance.now();
        const duration = 1400;
        (function step(now) {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = t < 1 ? (number * eased).toFixed(decimals) + match[2] : target;
            if (t < 1) requestAnimationFrame(step);
        })(start);
    }

    const counters = document.querySelectorAll('.count-up');
    if ('IntersectionObserver' in window && !reduceMotion) {
        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    countUp(entry.target);
                    countObserver.unobserve(entry.target);
                }
            });
        });
        counters.forEach(el => countObserver.observe(el));
    }
})();
