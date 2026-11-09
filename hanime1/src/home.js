load('config.js');
// home.js — tabs for hanime1.me home page
function execute() {
    return Response.success([
        { title: "Mới nhất", input: "/browse?sort=upload_date", script: "search.js" },
        { title: "Xu hướng", input: "/browse?sort=views", script: "search.js" },
        { title: "Đánh giá cao", input: "/browse?sort=likes", script: "search.js" },
        { title: "Mới phát hành", input: "/browse?sort=release_date", script: "search.js" }
    ]);
}
