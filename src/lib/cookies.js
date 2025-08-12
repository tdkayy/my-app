// src/lib/cookies.js

// setCookie(name, value, daysOrOptions)
// - daysOrOptions: number of days (backward-compatible) OR an options object:
//   { days?: number, path?: string, domain?: string, secure?: boolean, sameSite?: 'Lax'|'Strict'|'None' }
export function setCookie(name, value, daysOrOptions = 7) {
    const isNumber = typeof daysOrOptions === 'number';
    const opts = isNumber ? { days: daysOrOptions } : (daysOrOptions || {});

    const days = typeof opts.days === 'number' ? opts.days : 7;
    const path = opts.path || '/';
    const domain = opts.domain; // e.g. ".yourdomain.com"
    const isHTTPS = typeof location !== 'undefined' && location.protocol === 'https:';

    // By default, add Secure+SameSite=Lax on HTTPS to reduce CSRF risk
    const secure = typeof opts.secure === 'boolean' ? opts.secure : isHTTPS;
    const sameSite = typeof opts.sameSite === 'string' ? opts.sameSite : (isHTTPS ? 'Lax' : undefined);

    const now = new Date();
    now.setTime(now.getTime() + days * 864e5); // days → ms

    const parts = [
        `${encodeURIComponent(name)}=${encodeURIComponent(String(value))}`,
        `Expires=${now.toUTCString()}`,
        `Max-Age=${Math.floor(days * 86400)}`,
        `Path=${path}`,
    ];
    if (domain) parts.push(`Domain=${domain}`);
    if (secure) parts.push('Secure');
    if (sameSite) parts.push(`SameSite=${sameSite}`);

    document.cookie = parts.join('; ');
}

export function getCookie(name) {
    const target = encodeURIComponent(name) + '=';
    const decoded = document.cookie || '';
    const pairs = decoded.split(';');
    for (let c of pairs) {
        c = c.trim();
        if (c.startsWith(target)) {
            return decodeURIComponent(c.slice(target.length));
        }
    }
    return '';
}

// deleteCookie(name, options)
// - options: { path?: string, domain?: string }
export function deleteCookie(name, options = {}) {
    const path = options.path || '/';
    const domain = options.domain;
    const parts = [
        `${encodeURIComponent(name)}=`,
        'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'Max-Age=0',
        `Path=${path}`,
    ];
    if (domain) parts.push(`Domain=${domain}`);
    document.cookie = parts.join('; ');
}