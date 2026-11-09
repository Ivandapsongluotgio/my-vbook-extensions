# My vBook Extensions

Kho extension cá nhân cho ứng dụng vBook.

## Extensions

| Tên | Loại | Nguồn | Mô tả |
|-----|------|-------|-------|
| Hanime1 | Video (NSFW) | [hanime1.me](https://hanime1.me) | Xem anime trên Hanime1 |

## Cài đặt

### Cách 1: Cài từ catalog
Thêm URL catalog vào vBook:
```
https://raw.githubusercontent.com/YOUR_USERNAME/my-vbook-extensions/main/video_plugin.json
```

### Cách 2: Cài thủ công qua Dev Server
1. Bật Chế độ nhà phát triển trong vBook (Settings > chạm 7 lần vào phiên bản)
2. Kết nối:
```bash
node .agents/skills/vbook-extensions/scripts/vbook.js connect --server http://IP:PORT
```
3. Cài extension:
```bash
node .agents/skills/vbook-extensions/scripts/vbook.js install hanime1
```

## Phát triển

### Yêu cầu
- Node.js 16+
- vBook app với Chế độ nhà phát triển bật

### Test extension
```bash
# Test search
node .agents/skills/vbook-extensions/scripts/vbook.js test hanime1 search.js "keyword" "1"

# Test detail
node .agents/skills/vbook-extensions/scripts/vbook.js test hanime1 detail.js "https://hanime1.me/watch?v=VIDEO_ID"
```

### Build ZIP
```bash
node .agents/skills/vbook-extensions/scripts/vbook.js build hanime1
```

## Lưu ý

- Extension Hanime1 sử dụng **headless browser** (Engine.newBrowser) để bypass Cloudflare protection
- Cần kết nối internet ổn định
- Delay giữa các request được set 1000ms để tránh bị block
- Extension được đánh dấu NSFW

## AI Skills

Skill phát triển extension nằm tại .agents/skills/vbook-extensions/SKILL.md.
Các AI Agent (Gemini, Claude, Cursor, Copilot) có thể tự nhận diện skill này.

## License

Personal use only.
