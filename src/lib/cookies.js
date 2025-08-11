export function setCookie(name, value, days = 7) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(String(value))};${expires};path=/`;
}
export function getCookie(name) {
    const cname = name + "=";
    const decoded = decodeURIComponent(document.cookie || "");
    const parts = decoded.split(";");
    for (let c of parts) {
        c = c.trim();
        if (c.indexOf(cname) === 0) return c.substring(cname.length);
    }
    return "";
}
export function deleteCookie(name) {
    document.cookie = `${name}=; Max-Age=-1; path=/`;
}