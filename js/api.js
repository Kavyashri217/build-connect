// Shared helpers for talking to the BuildConnect API.

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
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
