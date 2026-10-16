// Landing page: the dream picker, the "reality lens" over the hero blueprint,
// the scroll-built journey, live crew counts and featured site passes.

(function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nav = document.querySelector('.site-nav');

    // ---- Dream picker: redraws the hero and the journey as the chosen building ----
    const journey = document.getElementById('journey');
    let journeySvg = null;

    function showDream(key) {
        const spec = Building.DREAMS[key];
        const mount = (id, options, ...classes) => {
            const host = document.getElementById(id);
            host.innerHTML = Building.svg(spec, options);
            host.firstElementChild.classList.add(...classes);
            return host.firstElementChild;
        };
        mount('heroBlueprint', {}, 'is-blueprint', 'is-drawing');
        mount('heroBuilt', { dims: false }, 'is-lit');
        mount('journeyGhost', { dims: false, shift: -34 }, 'is-blueprint', 'is-ghost');
        journeySvg = mount('journeyBuilt', { crane: true, shift: -34 }, 'is-staged');
        document.querySelectorAll('.dream-name').forEach(el => { el.textContent = spec.label; });
        updateJourney();
    }

    document.querySelectorAll('input[name="dream"]').forEach(input => {
        input.addEventListener('change', () => showDream(input.value));
    });

    // ---- Reality lens: the finished building shows through a circle on the blueprint ----
    const art = document.getElementById('heroArt');
    const toggle = document.getElementById('buildToggle');
    const lens = { x: 0.5, y: 0.5, r: 0, tx: 0.5, ty: 0.5, hover: false, revealed: false, visible: true };
    let artWidth = art.clientWidth;
    new ResizeObserver(() => { artWidth = art.clientWidth; }).observe(art);
    new IntersectionObserver(([entry]) => { lens.visible = entry.isIntersecting; }).observe(art);

    if (window.matchMedia('(hover: none)').matches) {
        document.getElementById('lensHint').textContent = 'Tap “Build it” to see your dream for real →';
    }

    art.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        const rect = art.getBoundingClientRect();
        lens.tx = (e.clientX - rect.left) / rect.width;
        lens.ty = (e.clientY - rect.top) / rect.height;
        lens.hover = true;
    });
    art.addEventListener('pointerleave', () => { lens.hover = false; });
    art.addEventListener('click', () => setRevealed(!lens.revealed));
    toggle.addEventListener('click', () => setRevealed(!lens.revealed));

    function setRevealed(on) {
        lens.revealed = on;
        art.classList.toggle('is-revealed', on);
        toggle.setAttribute('aria-pressed', String(on));
        toggle.textContent = on ? '↺ Back to the dream' : '⚒ Build it';
        if (on && window.celebrate) {
            const rect = art.getBoundingClientRect();
            window.celebrate(rect.left + rect.width / 2, rect.top + rect.height * 0.35);
        }
    }

    function lensFrame(time) {
        if (lens.visible) {
            // With no pointer around, the lens wanders by itself so the effect is discoverable.
            if (!lens.hover && !lens.revealed && !reduceMotion) {
                lens.tx = 0.5 + Math.cos(time / 1700) * 0.24;
                lens.ty = 0.55 + Math.sin(time / 1150) * 0.2;
            }
            const targetR = lens.revealed ? 1.6 : lens.hover ? 0.22 : 0.16;
            lens.x += (lens.tx - lens.x) * 0.14;
            lens.y += (lens.ty - lens.y) * 0.14;
            lens.r += (targetR - lens.r) * 0.1;
            art.style.setProperty('--lx', `${(lens.x * 100).toFixed(2)}%`);
            art.style.setProperty('--ly', `${(lens.y * 100).toFixed(2)}%`);
            art.style.setProperty('--lr', `${(lens.r * artWidth).toFixed(1)}px`);
        }
        requestAnimationFrame(lensFrame);
    }
    requestAnimationFrame(lensFrame);

    // ---- Journey: scroll progress through the section builds the dream ----
    const steps = [...journey.querySelectorAll('.journey-step')];
    const boardStage = document.getElementById('boardStage');
    const boardTitle = document.getElementById('boardTitle');
    const boardPct = document.getElementById('boardPct');
    let lastStage = -1;

    function journeyMetrics() {
        const rect = journey.getBoundingClientRect();
        const navH = nav.offsetHeight;
        return { rect, navH, total: Math.max(1, rect.height - (window.innerHeight - navH)) };
    }

    function updateJourney() {
        if (!journeySvg) return;
        const { rect, navH, total } = journeyMetrics();
        const p = Math.min(1, Math.max(0, (navH - rect.top) / total));
        Building.applyProgress(journeySvg, p);
        journey.style.setProperty('--p', p.toFixed(3));
        journey.style.setProperty('--sky', Math.min(1, Math.max(0, (p - 0.3) / 0.6)).toFixed(3));
        journey.classList.toggle('is-done', p >= Building.DONE);
        boardPct.textContent = `${Math.round(p * 100)}% built`;

        const stage = Building.stageAt(p);
        if (stage !== lastStage) {
            lastStage = stage;
            steps.forEach((step, i) => {
                step.classList.toggle('is-active', i === stage);
                step.querySelector('button').setAttribute('aria-current', i === stage ? 'step' : 'false');
            });
            boardStage.textContent = `Stage ${String(stage + 1).padStart(2, '0')}/06`;
            boardTitle.textContent = steps[stage].dataset.title;
        }
    }

    // Clicking a step jumps to the middle of that stage.
    steps.forEach((step, i) => {
        step.querySelector('button').addEventListener('click', () => {
            const { rect, navH, total } = journeyMetrics();
            const from = Building.STAGES[i];
            const to = Building.STAGES[i + 1] ?? 1;
            window.scrollTo({
                top: window.scrollY + rect.top - navH + total * ((from + to) / 2),
                behavior: reduceMotion ? 'auto' : 'smooth',
            });
        });
    });

    let journeyQueued = false;
    window.addEventListener('scroll', () => {
        if (!journeyQueued) {
            journeyQueued = true;
            requestAnimationFrame(() => {
                journeyQueued = false;
                updateJourney();
            });
        }
    }, { passive: true });
    window.addEventListener('resize', updateJourney);

    showDream(document.querySelector('input[name="dream"]:checked').value);

    // ---- Story thumbnails: the finished dream, lights on ----
    document.querySelectorAll('[data-dream-thumb]').forEach(el => {
        el.innerHTML = Building.svg(Building.DREAMS[el.dataset.dreamThumb], { dims: false, fit: true });
        el.firstElementChild.classList.add('is-lit');
    });

    // ---- Live data: crew counts and the top-rated passes ----
    apiGet('/api/professionals?sort=rating')
        .then(pros => {
            document.getElementById('featuredGrid').innerHTML = pros.slice(0, 3).map(renderProCard).join('');
            document.querySelectorAll('[data-count-for]').forEach(el => {
                const count = pros.filter(p => p.specialization === el.dataset.countFor).length;
                el.textContent = `${count} ready to build`;
            });
        })
        .catch(() => {
            document.getElementById('featured').hidden = true;
        });
})();
