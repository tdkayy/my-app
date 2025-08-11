// Minimal client for your PHP proxy (same origin via Vite proxy)
const API_URL = "/api.php?debug=1"; // ← use relative path again

export async function postToAPI(body) {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API HTTP ${res.status}`);
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json;
}


// ---- named exports expected by transaction.api.js ----
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

export function createTransaction(authToken, { date, merchant, amountCents, currency = "GBP" }) {
    return postToAPI({
        command: "CreateTransaction",
        authToken,
        transaction: {
            created: date,
            merchant,
            amount: (amountCents || 0) / 100,
            currency,
        },
    });
}