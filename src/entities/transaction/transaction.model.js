// Single source of truth for Transaction shape + helpers.

/**
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {string} date        // ISO "YYYY-MM-DD"
 * @property {string} merchant
 * @property {number} amountCents // integer minor units
 * @property {string} currency
 * @property {string} category
 * @property {string} [comment]
 */

export function createTransactionModel({
    id,
    date,
    merchant,
    amountCents,
    currency,
    category,
    comment,
}) {
    return {
        id,
        date,
        merchant,
        amountCents,
        currency,
        category,
        comment: comment || "",
    };
}

export function formatMoneyCents(amountCents = 0, currency = "GBP") {
    const v = (amountCents || 0) / 100;
    try {
        return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(v);
    } catch {
        return v.toFixed(2) + " " + currency;
    }
}