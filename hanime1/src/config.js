// config.js — domain normalization for hanime1.me
// Hanime1 has Cloudflare protection, so we use the Browser API for pages
// that need JS rendering, and direct fetch for pages that work without it.
let BASE_URL = "https://hanime1.me";
try {
    if (DOMAIN) {
        BASE_URL = DOMAIN;
    }
} catch (error) {
}

function normalizeUrl(url) {
    return url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
}

// Helper: fetch a page using headless browser to bypass Cloudflare
function browserFetch(url, waitMs) {
    waitMs = waitMs || 15000;
    var browser = Engine.newBrowser();
    browser.setUserAgent(UserAgent.chrome());
    browser.block([".*google.*analytics.*", ".*doubleclick.*", ".*facebook.*"]);
    var doc = browser.launch(url, waitMs);
    browser.close();
    return doc;
}

