// Footer skyline: a generated night city. Windows twinkle on their own;
// hover a building to switch all of its lights on, or tap to keep them on.

(function () {
    const host = document.getElementById('skyline');
    if (!host) return;

    const W = 1200;
    const H = 230;
    let seed = 11;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

    const buildings = [];
    let tallest = { x: 0, w: 0, top: H };
    for (let x = 0; x < W;) {
        const w = 52 + Math.floor(rand() * 70);
        const h = 60 + Math.floor(rand() * 150);
        const top = H - h;
        let windows = '';
        for (let wy = top + 14; wy < H - 18; wy += 18) {
            for (let wx = x + 10; wx <= x + w - 18; wx += 16) {
                windows += `<rect class="sky-win${rand() < 0.28 ? ' lit' : ''}" x="${wx}" y="${wy}" width="8" height="10"/>`;
            }
        }
        buildings.push(`<g class="sky-bld"><rect class="sky-body" x="${x}" y="${top}" width="${w}" height="${h}"/>${windows}</g>`);
        if (top < tallest.top) tallest = { x, w, top };
        x += w + 6 + Math.floor(rand() * 12);
    }

    // A tower crane on one roof, still building the next dream
    const cx = 760;
    const crane = `<path class="sky-crane" d="M${cx} ${H}V40M${cx + 10} ${H}V40M${cx - 120} 40H${cx + 60}M${cx + 5} 18L${cx - 120} 40M${cx + 5} 18L${cx + 60} 40M${cx - 80} 40V86"/>`;
    const beacon = `<circle class="sky-beacon" cx="${tallest.x + tallest.w / 2}" cy="${tallest.top - 6}" r="4"/>`;

    host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${crane}${buildings.join('')}${beacon}</svg>`;

    host.addEventListener('pointerover', (e) => {
        const bld = e.target.closest('.sky-bld');
        if (bld) bld.classList.add('lit-all');
    });
    host.addEventListener('pointerout', (e) => {
        const bld = e.target.closest('.sky-bld');
        if (bld && !bld.contains(e.relatedTarget) && !bld.dataset.keep) bld.classList.remove('lit-all');
    });
    host.addEventListener('click', (e) => {
        const bld = e.target.closest('.sky-bld');
        if (!bld) return;
        bld.dataset.keep = bld.dataset.keep ? '' : '1';
        bld.classList.toggle('lit-all', Boolean(bld.dataset.keep));
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Twinkle: flip a random window now and then, only while the skyline is visible
    const windows = host.querySelectorAll('.sky-win');
    let timer = null;
    new IntersectionObserver(([entry]) => {
        clearInterval(timer);
        if (entry.isIntersecting) {
            timer = setInterval(() => {
                windows[Math.floor(Math.random() * windows.length)].classList.toggle('lit');
            }, 260);
        }
    }).observe(host);
})();
