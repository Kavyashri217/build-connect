// Procedural building drawings for the "dream to reality" scenes.
// The blueprint, the finished building and the under-construction view all
// come from the same geometry, so stacked layers line up exactly.

(function () {
    const VIEW_W = 600;
    const VIEW_H = 520;
    const GROUND = 452;

    const DREAMS = {
        home: { label: 'home', floors: 2, bays: 3, floorH: 88, bayW: 92, roof: 'pitched', trees: true, door: true },
        villa: { label: 'villa', floors: 2, bays: 5, floorH: 78, bayW: 72, roof: 'flat', trees: true, door: true, balcony: true },
        apartments: { label: 'apartment block', floors: 7, bays: 4, floorH: 46, bayW: 58, roof: 'tank', door: true, balcony: true },
        office: { label: 'office tower', floors: 9, bays: 5, floorH: 36, bayW: 46, roof: 'crown', door: true, glass: true },
    };

    // Scroll progress (0-1) where each of the six construction stages begins.
    const STAGES = [0, 0.16, 0.34, 0.5, 0.68, 0.88];

    // When each part of the building is visible in the staged (scroll-driven) view.
    const T = {
        dims: [0.16, 0.5],
        foundation: 0.34,
        crane: [0.36, 0.9],
        scaffold: [0.5, 0.9],
        frame: [0.5, 0.66],
        floors: [0.68, 0.82],
        roof: 0.84,
        trees: 0.88,
        done: 0.92,
    };

    const ROOF_RISE = { pitched: 84, flat: 14, tank: 42, crown: 40 };

    const n = (v) => Math.round(v * 10) / 10;
    const rect = (x, y, w, h) => `M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${n(-w)}Z`;
    const circle = (cx, cy, r) =>
        `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0Z`;
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    // Deterministic random numbers, so a drawing looks the same every time.
    function seeded(text) {
        let seed = [...String(text)].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 2147483647, 7) || 1;
        return () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    }

    // Options: crane (scaffold + tower crane), dims (blueprint dimensions),
    // shift (move the building sideways), fit (crop the viewBox to the building).
    function svg(spec, options = {}) {
        const { crane = false, dims = true, shift = 0, fit = false } = options;
        const { floors, bays, floorH, bayW } = spec;
        const width = bays * bayW;
        const x0 = Math.round((VIEW_W - width) / 2 + shift);
        const x1 = x0 + width;
        const midX = (x0 + x1) / 2;
        const top = GROUND - floors * floorH;
        const roofTop = top - (ROOF_RISE[spec.roof] || 0);
        const left = fit ? x0 - (spec.trees ? 100 : 24) : 10;
        const right = fit ? x1 + 24 : VIEW_W - 10;
        const rand = seeded(spec.label);
        const parts = [];
        let order = 0;

        // Every path is drawable (pathLength=1) and numbered for staggered drawing.
        const path = (cls, d) => `<path${cls ? ` class="${cls}"` : ''} d="${d}" pathLength="1" style="--o:${order++}"/>`;
        // A group that is visible in the staged build between `at` and `until`.
        const part = (cls, at, until, inner) =>
            `<g class="${cls}" data-at="${at}"${until === undefined ? '' : ` data-until="${until}"`}>${inner}</g>`;
        const floorAt = (range, i) => (range[0] + (i / floors) * (range[1] - range[0])).toFixed(3);

        parts.push(path('b-ground', `M${n(left)} ${GROUND}H${n(right)}`));

        let footings = '';
        for (let c = 0; c <= bays; c++) footings += rect(x0 + c * bayW - 7, GROUND + 16, 14, 10);
        parts.push(part('b-foundation', T.foundation, undefined, path('', rect(x0 - 14, GROUND, width + 28, 16) + footings)));

        if (crane) {
            const scaffoldSide = (a, b) => {
                let d = `M${a} ${GROUND}V${top - 10}M${b} ${GROUND}V${top - 10}`;
                for (let i = 0; i <= floors; i++) {
                    const y = GROUND - i * floorH;
                    d += `M${a} ${y}H${b}`;
                    if (i < floors) d += `M${a} ${y}L${b} ${y - floorH}`;
                }
                return d;
            };
            parts.push(part('b-scaffold', T.scaffold[0], T.scaffold[1],
                path('', scaffoldSide(x0 - 26, x0 - 8) + scaffoldSide(x1 + 8, x1 + 26))));
        }

        // Structural frame, one floor at a time.
        for (let i = 0; i < floors; i++) {
            const yb = GROUND - i * floorH;
            const yt = yb - floorH;
            let d = `M${x0} ${yt}H${x1}`;
            for (let c = 0; c <= bays; c++) d += `M${x0 + c * bayW} ${yb}V${yt}`;
            parts.push(part('b-frame', floorAt(T.frame, i), undefined, path('', d)));
        }

        // Walls, windows, door and balconies, one floor at a time.
        for (let i = 0; i < floors; i++) {
            const yb = GROUND - i * floorH;
            const yt = yb - floorH;
            let inner = path('b-wall', rect(x0, yt, width, floorH));
            for (let b = 0; b < bays; b++) {
                const bx = x0 + b * bayW;
                if (spec.door && i === 0 && b === Math.floor(bays / 2)) {
                    const dw = Math.min(bayW * 0.5, 40);
                    const dh = Math.min(floorH * 0.75, 64);
                    inner += path('b-door', rect(bx + (bayW - dw) / 2, yb - dh, dw, dh));
                    continue;
                }
                const inset = spec.glass ? 3 : bayW * 0.2;
                const insetY = spec.glass ? 3 : floorH * 0.22;
                inner += path(`b-win${rand() < 0.55 ? ' lit' : ''}`, rect(bx + inset, yt + insetY, bayW - inset * 2, floorH - insetY * 2));
                if (spec.balcony && i > 0 && b % 2 === 0) {
                    inner += path('b-rail', `M${n(bx + 5)} ${yb}v-12h${n(bayW - 10)}v12M${n(bx + bayW / 2)} ${yb}v-12`);
                }
            }
            parts.push(part('b-floor', floorAt(T.floors, i), undefined, inner));
        }

        let roof = '';
        if (spec.roof === 'pitched') {
            roof = path('b-chimney', rect(x1 - bayW * 0.75, top - 64, 18, 44))
                + path('b-roof', `M${x0 - 18} ${top}L${n(midX)} ${roofTop}L${x1 + 18} ${top}Z`);
        } else if (spec.roof === 'flat') {
            roof = path('b-roof', rect(x0 - 10, roofTop, width + 20, 14));
        } else if (spec.roof === 'tank') {
            const tx = x0 + bayW * 0.6;
            const tw = bayW * 1.1;
            roof = path('b-roof', rect(x0 - 8, top - 12, width + 16, 12))
                + path('b-tank-legs', `M${n(tx + 8)} ${top - 12}v-8M${n(tx + tw - 8)} ${top - 12}v-8`)
                + path('b-tank', rect(tx, roofTop, tw, 22));
        } else if (spec.roof === 'crown') {
            roof = path('b-roof', rect(x0 + bayW * 0.5, top - 22, width - bayW, 22))
                + path('b-roof', rect(x0 + bayW * 1.5, roofTop, width - bayW * 3, 18))
                + path('b-antenna', `M${n(midX)} ${roofTop}V${roofTop - 30}`)
                + `<circle class="b-beacon" cx="${n(midX)}" cy="${roofTop - 32}" r="4.5"/>`;
        }
        parts.push(part('b-roofs', T.roof, undefined, roof));

        if (spec.trees) {
            const tree = (x, s) => path('b-trunk', `M${n(x)} ${GROUND}v${n(-24 * s)}`) + path('b-leaves', circle(x, GROUND - 42 * s, 22 * s));
            let trees = tree(x0 - 42, 1.1);
            if (fit || x0 - 94 >= 0) trees += tree(x0 - 76, 0.8);
            parts.push(part('b-trees', T.trees, undefined, trees));
        }

        if (crane) {
            const cx = Math.min(x1 + 66, VIEW_W - 64);
            const cTop = Math.max(36, Math.min(150, roofTop - 40));
            const jibStart = x0 + width * 0.18;
            const hookX = x0 + width * 0.46;
            let steel = `M${cx - 9} ${GROUND}V${cTop}M${cx + 9} ${GROUND}V${cTop}`;
            for (let y = GROUND; y - 24 >= cTop; y -= 24) steel += `M${cx - 9} ${y}L${cx + 9} ${y - 24}M${cx - 9} ${y - 24}H${cx + 9}`;
            steel += `M${n(jibStart)} ${cTop}H${cx + 58}`;
            for (let x = jibStart; x + 20 <= cx - 9; x += 20) steel += `M${n(x)} ${cTop}l10 -9l10 9`;
            steel += `M${cx} ${cTop - 34}L${n(jibStart + 10)} ${cTop - 9}M${cx} ${cTop - 34}L${cx + 58} ${cTop}`
                + `M${cx - 9} ${cTop}L${cx} ${cTop - 34}L${cx + 9} ${cTop}`;
            const hook = path('b-cable', `M${n(hookX)} ${cTop}V${roofTop - 30}`) + path('b-load', rect(hookX - 32, roofTop - 30, 64, 9));
            parts.push(part('b-crane', T.crane[0], T.crane[1],
                path('b-crane-steel', steel)
                + path('b-crane-weight', rect(cx + 36, cTop + 2, 22, 16))
                + path('b-crane-cab', rect(cx - 24, cTop + 2, 15, 15))
                + `<g class="b-hook">${hook}</g>`));
        }

        if (dims) {
            const dy = GROUND + 50;
            const hx = crane ? x0 - 36 : x1 + 36;
            const midY = n((GROUND + top) / 2);
            const d = `M${x0} ${dy}H${x1}M${x0} ${dy - 7}v14M${x1} ${dy - 7}v14`
                + `M${hx} ${GROUND}V${top}M${hx - 7} ${GROUND}h14M${hx - 7} ${top}h14`;
            const labels = `<text class="b-dim-text" x="${n(midX)}" y="${dy - 8}" text-anchor="middle">${(width / 24).toFixed(1)} m</text>`
                + `<text class="b-dim-text" x="${hx}" y="${midY}" dy="-9" text-anchor="middle" transform="rotate(-90 ${hx} ${midY})">${(floors * 3.2).toFixed(1)} m</text>`;
            parts.push(part('b-dims', T.dims[0], T.dims[1], path('', d) + labels));
        }

        const minY = roofTop - (spec.roof === 'crown' ? 46 : 14);
        const viewBox = fit ? `${n(left)} ${n(minY)} ${n(right - left)} ${n(GROUND + 30 - minY)}` : `0 0 ${VIEW_W} ${VIEW_H}`;
        const label = esc(options.label || `Drawing of a ${spec.label}`);
        return `<svg class="bld" viewBox="${viewBox}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${parts.join('')}</svg>`;
    }

    // Show the parts of a staged drawing that are built at `progress` (0-1).
    function applyProgress(svgEl, progress) {
        svgEl.querySelectorAll('[data-at]').forEach((el) => {
            const until = el.dataset.until === undefined ? Infinity : Number(el.dataset.until);
            el.classList.toggle('on', progress >= Number(el.dataset.at) && progress < until);
        });
        svgEl.classList.toggle('is-done', progress >= T.done);
    }

    function stageAt(progress) {
        let stage = 0;
        STAGES.forEach((start, i) => {
            if (progress >= start) stage = i;
        });
        return stage;
    }

    // A small, deterministic building to illustrate a project. Titles like
    // "14-storey tower", "G+2 house" or "warehouse" shape the drawing.
    function specFor(text) {
        const title = String(text);
        const rand = seeded(title);
        const storeys = title.match(/(\d+)\s*-?\s*(?:storey|story|floor)/i);
        const groundPlus = title.match(/G\s*\+\s*(\d+)/i);
        const wide = /warehouse|shed|industrial|factory/i.test(title);
        let floors = 1 + Math.floor(rand() * 7);
        if (storeys) floors = Number(storeys[1]);
        else if (groundPlus) floors = Number(groundPlus[1]) + 1;
        else if (/tower|high-rise/i.test(title)) floors = 8;
        else if (wide) floors = 1;
        floors = Math.max(1, Math.min(9, floors));
        const tall = floors > 4;
        return {
            label: title,
            floors,
            bays: wide ? 7 : 3 + Math.floor(rand() * 3),
            floorH: tall ? 42 : 64,
            bayW: 50 + Math.floor(rand() * 22),
            roof: tall ? (rand() < 0.5 ? 'crown' : 'tank') : (rand() < 0.5 ? 'pitched' : 'flat'),
            door: true,
            glass: tall && rand() < 0.5,
            balcony: floors > 2 && rand() < 0.5,
            trees: !tall,
        };
    }

    window.Building = { DREAMS, STAGES, DONE: T.done, svg, applyProgress, stageAt, specFor };
})();
