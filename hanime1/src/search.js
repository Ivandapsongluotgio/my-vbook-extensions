load('config.js');
// search.js — search + category browsing for hanime1.me
// Hanime1 uses Cloudflare so we use the headless browser.
// query can be: a search keyword, or a /browse path from home.js tabs.
function execute(query, page) {
    query = query || "";
    page = page || "1";

    var url;
    if (query.indexOf("/") === 0 || query.indexOf("http") === 0) {
        // browsing a category tab
        var base = query.indexOf("http") === 0 ? query : BASE_URL + query;
        url = base + (base.indexOf("?") === -1 ? "?" : "&") + "page=" + page;
    } else {
        // keyword search
        url = BASE_URL + "/search?query=" + encodeURIComponent(query) + "&page=" + page;
    }

    var doc = browserFetch(url, 20000);

    // Hanime1 video cards: look for common card selectors
    var items = doc.select(".home-rows-videos-div .card-mobile-panel, .content-padding-new .card-mobile-panel, .search-doujin-videos .card-mobile-panel, div[class*='card'] a[href*='/watch']").map(function (el) {
        var link = el.attr("href");
        if (!link) {
            link = el.select("a").attr("href");
        }
        var name = el.select(".card-mobile-title, .home-rows-videos-title, h4, .title").text();
        if (!name) name = el.attr("title") || "";
        var cover = el.select("img").attr("src") || el.select("img").attr("data-src") || "";
        var desc = el.select(".card-mobile-duration, .duration, span").text();

        return {
            name: name,
            cover: cover,
            link: link,
            description: desc
        };
    });

    // Filter out items without name or link
    var filtered = [];
    for (var i = 0; i < items.length; i++) {
        if (items[i].name && items[i].link) {
            filtered.push(items[i]);
        }
    }

    // Check pagination
    var hasNext = !doc.select(".pagination .next, .pagination a[rel='next'], a[aria-label='Next']").isEmpty();
    var nextPage = hasNext ? (parseInt(page) + 1).toString() : "";

    return Response.success(filtered, nextPage);
}
