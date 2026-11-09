load('config.js');
// track.js — resolve one server entry's data into a playable stream
// data from chap.js can be: direct m3u8/mp4 URL, embed page URL, or watch page URL
function resolveEmbedToStream(embedUrl) {
    var r = fetch(embedUrl, {
        headers: {
            "User-Agent": UserAgent.chrome(),
            "Referer": BASE_URL + "/"
        }
    });
    if (!r.ok) return "";
    var text = r.text();

    // Look for m3u8 URLs
    var m = text.match(/https?[:\\\/]+[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
    if (m) return m[0].replace(/\\\//g, "/").replace(/\\/g, "");

    // Look for mp4 URLs
    m = text.match(/https?[:\\\/]+[^"'\s\\]+\.mp4[^"'\s\\]*/i);
    if (m) return m[0].replace(/\\\//g, "/").replace(/\\/g, "");

    return "";
}

function execute(data) {
    // Case 1: Already a direct stream URL
    if (data.indexOf(".m3u8") !== -1) {
        return Response.success({
            type: "native",
            data: data,
            mimeType: "application/x-mpegURL",
            headers: {
                "User-Agent": UserAgent.chrome(),
                "Referer": BASE_URL + "/"
            }
        });
    }

    if (data.indexOf(".mp4") !== -1 && data.indexOf("hanime1") === -1) {
        return Response.success({
            type: "native",
            data: data,
            mimeType: "video/mp4",
            headers: {
                "User-Agent": UserAgent.chrome(),
                "Referer": BASE_URL + "/"
            }
        });
    }

    // Case 2: It's an embed URL — try to extract direct stream
    if (data.indexOf("embed") !== -1 || data.indexOf("player") !== -1) {
        var stream = resolveEmbedToStream(data);
        if (stream) {
            return Response.success({
                type: "native",
                data: stream,
                mimeType: stream.indexOf(".mp4") !== -1 ? "video/mp4" : "application/x-mpegURL",
                headers: {
                    "User-Agent": UserAgent.chrome(),
                    "Referer": data
                }
            });
        }
        // Fallback to auto for embed pages
        return Response.success({
            type: "auto",
            data: data,
            headers: {
                "User-Agent": UserAgent.chrome(),
                "Referer": BASE_URL + "/"
            }
        });
    }

    // Case 3: It's a watch page URL — use browser to find stream
    if (data.indexOf("hanime1") !== -1 || data.indexOf("watch") !== -1) {
        var browser = Engine.newBrowser();
        browser.setUserAgent(UserAgent.chrome());
        browser.block([".*google.*analytics.*", ".*doubleclick.*", ".*facebook.*"]);
        browser.launchAsync(data);
        browser.waitUrl([".*\\.m3u8.*", ".*\\.mp4.*"], 20000);

        var urls = browser.urls();
        browser.close();

        // Find m3u8 first (preferred), then mp4
        var foundUrl = "";
        var foundType = "";
        for (var i = 0; i < urls.length; i++) {
            var u = String(urls[i]);
            if (u.indexOf(".m3u8") !== -1 && !foundUrl) {
                foundUrl = u;
                foundType = "application/x-mpegURL";
            } else if (u.indexOf(".mp4") !== -1 && u.indexOf("thumb") === -1 && u.indexOf("preview") === -1) {
                if (!foundUrl || foundUrl.indexOf(".m3u8") === -1) {
                    foundUrl = u;
                    foundType = "video/mp4";
                }
            }
        }

        if (foundUrl) {
            return Response.success({
                type: "native",
                data: foundUrl,
                mimeType: foundType,
                headers: {
                    "User-Agent": UserAgent.chrome(),
                    "Referer": BASE_URL + "/"
                }
            });
        }

        // Fallback: auto resolve
        return Response.success({
            type: "auto",
            data: data,
            headers: {
                "User-Agent": UserAgent.chrome(),
                "Referer": BASE_URL + "/"
            }
        });
    }

    // Case 4: Unknown — try auto
    return Response.success({
        type: "auto",
        data: data,
        headers: {
            "User-Agent": UserAgent.chrome(),
            "Referer": BASE_URL + "/"
        }
    });
}
