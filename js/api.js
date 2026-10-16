// Shared helpers for talking to the BuildConnect API.

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function initials(name) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('');
}

// "Civil Engineer" -> "civil": picks the trade's hard-hat colour in CSS.
function roleKey(specialization) {
    return String(specialization).split(' ')[0].toLowerCase();
}

function passNumber(id) {
    return `#${String(id).padStart(4, '0')}`;
}

// "Site pass" card shared by the landing page and the professionals listing.
function renderProCard(prof) {
    const profileUrl = `profile.html?id=${prof.id}`;
    return `
        <article class="pass" data-role="${escapeHtml(roleKey(prof.specialization))}">
            <header class="pass-head">
                <span>Site pass</span>
                <span class="pass-hole" aria-hidden="true"></span>
                <span>${passNumber(prof.id)}</span>
            </header>
            <div class="pass-body">
                <div class="pass-photo" aria-hidden="true">${escapeHtml(initials(prof.name))}</div>
                <div>
                    <h3 class="pass-name"><a href="${profileUrl}">${escapeHtml(prof.name)}</a></h3>
                    <p class="pass-role">${escapeHtml(prof.specialization)}</p>
                    <p class="pass-loc">📍 ${escapeHtml(prof.location)}</p>
                </div>
            </div>
            <dl class="pass-stats">
                <div><dt>Exp.</dt><dd>${prof.experienceYears} yrs</dd></div>
                <div><dt>Rating</dt><dd>${prof.rating.toFixed(1)}★</dd></div>
                <div><dt>Rate</dt><dd>$${prof.hourlyRate}/h</dd></div>
            </dl>
            <div class="skill-list">
                ${prof.skills.slice(0, 3).map(s => `<span class="skill-chip">${escapeHtml(s)}</span>`).join('')}
            </div>
            <div class="pass-foot">
                <a class="btn btn-sm btn-dark" href="${profileUrl}">Profile</a>
                <a class="btn btn-sm" href="${profileUrl}#contact">Hire →</a>
            </div>
            <div class="pass-strip" aria-hidden="true">
                <span class="pass-barcode"></span>
                <span>${prof.verified ? 'Verified ✓' : 'Pending'}</span>
            </div>
        </article>`;
}

async function apiGet(path) {
    const res = await fetch(path);
    if (!res.ok) {
        const err = new Error(`Request failed (${res.status})`);
        err.status = res.status;
        throw err;
    }
    return res.json();
}

// Wires up every <form data-enquiry-form> on the page to POST /api/enquiries.
function setupEnquiryForms() {
    document.querySelectorAll('form[data-enquiry-form]').forEach(form => {
        const status = form.querySelector('.form-status');
        const submit = form.querySelector('button[type="submit"]');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            form.querySelectorAll('.field-error').forEach(el => { el.textContent = ''; });
            status.textContent = '';
            status.className = 'form-status';
            submit.disabled = true;

            const body = Object.fromEntries(new FormData(form));
            try {
                const res = await fetch('/api/enquiries', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                const data = await res.json().catch(() => ({}));

                if (res.ok) {
                    form.reset();
                    status.textContent = form.dataset.successMessage || 'Thanks! Your message has been sent.';
                    status.classList.add('success');
                    form.dispatchEvent(new CustomEvent('enquiry:sent', { bubbles: true }));
                } else if (data.errors) {
                    for (const [field, message] of Object.entries(data.errors)) {
                        const el = form.querySelector(`[data-error-for="${field}"]`);
                        if (el) el.textContent = message;
                        else status.textContent = message;
                    }
                    status.classList.add('error');
                    if (!status.textContent) status.textContent = 'Please fix the highlighted fields.';
                } else {
                    throw new Error(data.error || 'Request failed');
                }
            } catch {
                status.textContent = 'Could not send your message. Please try again.';
                status.classList.add('error');
            } finally {
                submit.disabled = false;
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', setupEnquiryForms);
