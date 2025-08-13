// src/lib/apiClient.js

const API_URL =
    import.meta.env.PROD ?
    (
        import.meta.env.VITE_API_URL || "/api/proxy") // Vercel Serverless Function
    :
    (
        import.meta.env.VITE_API_URL || "/api.php"); // local PHP dev

export async function postToAPI(body) {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`API HTTP ${res.status}: ${t || res.statusText}`);
    }

    const json = await res.json().catch(() => null);
    if (!json) throw new Error("Invalid JSON from API");

    // Normalize error shape
    if (json.error) throw new Error(json.error);
    if (typeof json.jsonCode !== "undefined" && json.jsonCode !== 200 && !json.authToken) {
        throw new Error(json.message || json.title || "Expensify error");
    }
    return json;
}

// named exports expected by transaction.api.js
export function authenticate({ email, password }) {
    return postToAPI({
        command: "Authenticate",
        partnerUserID: email,
        partnerUserSecret: password,
    });
}

export function getTransactions(authToken) {
    return postToAPI({ command: "Get", authToken });
}

export function createTransaction(authToken, payload) {
    // we can keep sending the *flat* shape; the serverless function normalizes it
    const created = (() => {
        if (typeof payload.created === "number") return payload.created;
        const iso = String(payload.date || "");
        const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (m) {
            const [_, y, mo, d] = m.map(Number);
            return Math.floor(Date.UTC(y, mo - 1, d) / 1000);
        }
        return Math.floor(Date.now() / 1000);
    })();

    const amount = (typeof payload.amount === "number") ?
        payload.amount :
        (Number(payload.amountCents || 0) / 100);

    return postToAPI({
        command: "CreateTransaction",
        authToken,
        created,
        merchant: payload.merchant,
        amount,
        currency: payload.currency || "GBP",
    });
}