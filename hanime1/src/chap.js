load('config.js');
// chap.js — get playable tracks (servers) for one episode on hanime1.me
// Hanime1 typically has the video source embedded in the page as <video> tag
// or via JS-loaded player. We use browser to render it and extract sources.
function execute(url) {
    url = normalizeUrl(url);

    var browser = Engine.newBrowser();
    browser.setUserAgent(UserAgent.chrome());
    browser.block([".*google.*analytics.*", ".*doubleclick.*", ".*facebook.*"]);
    browser.launchAsync(url);

    // Wait for video/media requests to appear
    browser.waitUrl([".*\\.m3u8.*", ".*\\.mp4.*", ".*player.*", ".*video.*source.*"], 20000);
    var doc = browser.html(5000);
    var allUrls = browser.urls();
    browser.close();

    var servers = [];

    // Strategy 1: Look for m3u8/mp4 URLs in network requests
    for (var i = 0; i < allUrls.length; i++) {
        var reqUrl = String(allUrls[i]);
        if (reqUrl.indexOf(".m3u8") !== -1) {
            servers.push({ title: "HLS " + (servers.length + 1), data: reqUrl });
        } else if (reqUrl.indexOf(".mp4") !== -1 && reqUrl.indexOf("thumb") === -1 && reqUrl.indexOf("preview") === -1) {
            servers.push({ title: "MP4 " + (servers.length + 1), data: reqUrl });
        }
    }

    // Strategy 2: Look for <video> source tags in DOM
    if (servers.length === 0) {
        doc.select("video source, video#player source, #player source").forEach(function (el) {
            var src = el.attr("src");
            if (src) {
                var quality = el.attr("res") || el.attr("label") || el.attr("size") || el.attr("title") || "";
                servers.push({
                    title: quality ? quality + "p" : "Source " + (servers.length + 1),
                    data: src
                });
            }
        });
    }

    // Strategy 3: Look for video src attribute
    if (servers.length === 0) {
        var videoSrc = doc.select("video#player, video").attr("src");
        if (videoSrc) {
            servers.push({ title: "Default", data: videoSrc });
        }
    }

    // Strategy 4: Look for embedded URLs in script tags (inline JS config)
    if (servers.length === 0) {
        var scripts = doc.select("script").html();
        // Match m3u8 or mp4 URLs in script content
        var m3u8Match = scripts.match(/https?:[\\\/]+[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
        if (m3u8Match) {
            servers.push({ title: "HLS Stream", data: m3u8Match[0].replace(/\\\//g, "/") });
        }
        var mp4Match = scripts.match(/https?:[\\\/]+[^"'\s\\]+\.mp4[^"'\s\\]*/i);
        if (mp4Match) {
            servers.push({ title: "MP4 Stream", data: mp4Match[0].replace(/\\\//g, "/") });
        }
    }

    // Strategy 5: Look for iframe embeds
    if (servers.length === 0) {
        var iframeSrc = doc.select("iframe[src*='player'], iframe[src*='embed'], iframe[src*='video']").attr("src");
        if (iframeSrc) {
            // Make sure it's absolute
            if (iframeSrc.indexOf("//") === 0) {
                iframeSrc = "https:" + iframeSrc;
            }
            servers.push({ title: "Embed Player", data: iframeSrc });
        }
    }

    // Fallback: pass the page URL itself for auto resolution
    if (servers.length === 0) {
        servers.push({ title: "Auto", data: url });
    }

    return Response.success(servers);
}
