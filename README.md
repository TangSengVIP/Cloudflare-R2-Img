# 图片中心（Cloudflare Pages + R2）

一个基于 Cloudflare Pages Functions 与 R2 的轻量图片中心：前端仅输入文件名，自动验证并展示预览与链接；后端从 R2 流式读取图片并支持防盗链。

## 功能特性
- 仅输入 R2 对象键（文件名）即可预览与复制完整链接
- 通过 `HEAD` 预检自动判断文件是否存在
- 从 R2 流式读取图片并设置 `content-type` 与长效缓存
- 防盗链：支持同源、白名单域名与无 Referer 的直接访问（可按需收紧）

## 目录结构
- `index.html`：前端页面与交互逻辑
- `functions/api/image/[key].ts`：图片读取端点（`GET` 与 `HEAD`）

## 前端使用
- 打开站点首页（你的 Pages 自定义域或系统域，例如 `<your-pages-domain>`）
- 在输入框填写对象键（例如 `logo.png`）
- 若存在则显示预览与完整链接（`https://<your-domain>/api/image/<key>`）；不存在则提示“文件名错误”

## API
- `GET /api/image/:key`
  - 从 R2 获取并返回图片流
  - 响应头：`content-type` 来自对象元数据；`cache-control: public, max-age=31536000, immutable`
- `HEAD /api/image/:key`
  - 仅校验存在性并返回 `200/404`
- 防盗链逻辑位置：`functions/api/image/[key].ts:5-18, 16-48`

## 部署与配置
1) 绑定 R2 存储桶
- Cloudflare Pages → Settings → Functions → R2 bucket bindings
- 绑定名：`IMAGES`（必须与代码一致）
- Bucket：选择你的桶（例如 `img`）

2) 环境变量（防盗链白名单）
- Pages → Settings → Environment variables
- `ALLOWED_REFERRERS`
  - 示例值：`<your-domain>, *.example.com, <your-pages-domain>`
  - 说明：允许同源与无 Referer 的直接访问；其余来源必须在白名单内

3) 自定义域名（可选）
- Pages 项目 → Custom domains → 绑定你的自定义域名（例如 `<your-domain>`）
- 配置完成后，前端复制的链接将使用完整 `https://<your-domain>/api/image/<key>`

## 本地开发（可选）
- 安装 Wrangler：`npm i -g wrangler`
- 创建 `wrangler.toml`（示例）：
  ```toml
  name = "cloudflare-img"
  compatibility_date = "2024-08-01"

  [[r2_buckets]]
  binding = "IMAGES"
  bucket_name = "img"
  ```
- 运行：`wrangler pages dev .`

## 安全与限制
- 建议为 R2 对象设置正确的 `content-type` 元数据（如 `image/png`）
- 如需更严格防盗链（禁止无 Referer 的访问），可进一步增加开关变量并收紧逻辑
- 也可升级为“签名链接 + 过期时间”的方案，实现临时授权访问

## 常见问题
- 直接访问返回 403：检查 `ALLOWED_REFERRERS` 是否包含你的域名，或是否需要允许无 Referer 访问
- 预览失败或“文件名错误”：确认对象键存在、R2 绑定为 `IMAGES=img`、白名单设置正确
- 内容类型不对：上传到 R2 时设置对象的 `content-type` 元数据
