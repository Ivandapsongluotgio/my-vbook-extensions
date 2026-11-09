load('config.js');
// detail.js — video detail page for hanime1.me
// URL format: https://hanime1.me/watch?v=VIDEO_ID
function execute(url) {
    url = normalizeUrl(url);
    var doc = browserFetch(url, 20000);

    var name = doc.select("h3.video-title, .video-details h3, h1, .single-video-title, title").first().text();
    // Clean up title if it contains site name
    if (name.indexOf(" - ") !== -1) {
        name = name.substring(0, name.lastIndexOf(" - ")).trim();
    }

    var cover = doc.select("meta[property='og:image']").attr("content");
    if (!cover) {
        cover = doc.select("video#player").attr("poster");
    }
    if (!cover) {
        cover = doc.select(".video-thumbnail img, img.video-img").attr("src");
    }

    var description = doc.select(".video-details-text, .video-description, .video-details .panel-body").html() || "";

    var author = doc.select(".video-details a[href*='brand'], .video-details a[href*='artist'], .video-details-row a").first().text() || "";

    // Tags/genres
    var tags = doc.select(".video-details a[href*='genre'], .video-tag a, a.tag, .single-video-tag a").map(function (el) {
        var tagText = el.text().trim();
        var tagLink = el.attr("href");
        if (!tagText) return null;
        return {
            title: tagText,
            input: tagLink,
            script: "search.js"
        };
    });
    // Filter null tags
    var validTags = [];
    for (var i = 0; i < tags.length; i++) {
        if (tags[i] !== null) {
            validTags.push(tags[i]);
        }
    }

    return Response.success({
        name: name,
        author: author,
        cover: cover,
        description: description,
        url: url,
        type: "video",
        format: "series",
        ongoing: false,
        nsfw: true,
        locale: "ja",
        tags: validTags
    });
}
