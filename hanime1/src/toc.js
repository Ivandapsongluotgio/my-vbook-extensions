load('config.js');
// toc.js — episode list for hanime1.me
// Hanime1 videos are typically single episodes, so the TOC is just one entry.
// For series with multiple episodes, we look for related episode links.
function execute(url) {
    url = normalizeUrl(url);
    var doc = browserFetch(url, 20000);

    var episodes = [];

    // Check for series/related episodes on the page
    var relatedEps = doc.select(".video-details-episode a, .related-episodes a, a[href*='/watch'][class*='episode'], .playlist-video a");

    if (relatedEps.size() > 0) {
        relatedEps.forEach(function (el) {
            var epUrl = el.attr("href");
            var epName = el.text().trim();
            if (epUrl && epName) {
                episodes.push({
                    name: epName,
                    url: epUrl,
                    description: "",
                    lock: false,
                    pay: false
                });
            }
        });
    }

    // If no episode list found, treat the video itself as a single episode
    if (episodes.length === 0) {
        var title = doc.select("h3.video-title, .video-details h3, h1, .single-video-title").first().text() || "Video";
        if (title.indexOf(" - ") !== -1) {
            title = title.substring(0, title.lastIndexOf(" - ")).trim();
        }
        episodes.push({
            name: title,
            url: url,
            description: "",
            lock: false,
            pay: false
        });
    }

    return Response.success(episodes);
}
