# Mitalab Career Hub 2027 — GitHub Pages

Bản static website độc lập được tái dựng từ prototype **Mitalab Career Hub 2027** để có thể quản lý bằng Git/GitHub và publish bằng GitHub Pages.

## Cấu trúc

```text
mitalab-career-hub-github/
├─ index.html
├─ styles.css
├─ script.js
├─ .nojekyll
├─ admin/
│  ├─ index.html
│  ├─ login/index.html
│  ├─ admin.css
│  ├─ admin.js
│  └─ config.js
└─ supabase/
   ├─ migrations/001_career_hub.sql
   └─ seed/001_current_site.sql
└─ assets/
   └─ logo-mark.svg
```

## Chạy local

Có thể mở trực tiếp `index.html`, hoặc chạy web server đơn giản:

```bash
python -m http.server 8000
```

Sau đó mở `http://localhost:8000`.

## Đưa lên GitHub

### Cách 1 — GitHub Pages từ branch `main`

1. Tạo repository mới trên GitHub, ví dụ `mitalab-career-hub-2027`.
2. Upload toàn bộ file trong thư mục này vào **root** của repository.
3. Vào **Settings → Pages**.
4. Tại **Build and deployment**, chọn **Deploy from a branch**.
5. Branch: `main`, folder: `/ (root)`.
6. Save.

GitHub sẽ cấp URL dạng:

```text
https://<username>.github.io/mitalab-career-hub-2027/
```

### Cách 2 — Git CLI

```bash
git init
git add .
git commit -m "Initial Mitalab Career Hub clone"
git branch -M main
git remote add origin https://github.com/<username>/mitalab-career-hub-2027.git
git push -u origin main
```

Sau đó bật GitHub Pages như Cách 1.

## Những gì đã có

- Responsive navigation
- Hero + CTA
- 3 nhóm nghề
- Tìm/lọc 6 JD mẫu bằng JavaScript
- Job-detail dialog
- Candidate Journey tương tác 6 bước + điểm bắt đầu “Khám phá cơ hội phù hợp”
- SLA strip
- People & Role Proof
- Why Mitalab
- FAQ accordion
- Talent Community form mô phỏng
- Privacy/scope dialog
- BOD pitch placeholder
- Mobile responsive
- Keyboard/focus friendly ở các thành phần native button/dialog

## Lưu ý dữ liệu

Đây là prototype front-end. Form **không gửi dữ liệu**, không upload CV và không có backend.

Khi đưa thành website tuyển dụng production cần nối:

- ATS hoặc form ứng tuyển thật
- API danh sách vị trí tuyển dụng
- Tracking/analytics
- Consent & privacy notice chính thức
- Domain/custom domain nếu cần

## Admin CMS

Admin hiện chạy local-only tại `/admin/`, đăng nhập tại `/admin/login/` bằng account cấu hình trong `admin/config.js` (hiện tại là `admin@mitalab.com`, password `Mitalab@2026!`). Đổi password trước khi dùng nội bộ. Job local được lưu trong trình duyệt bằng `localStorage`.

Supabase vẫn được giữ làm backend tùy chọn cho phase production. Khi chuyển sang backend thật, đổi `window.MITALAB_AUTH.mode` thành `supabase`, điền `url` và `anonKey`; không đặt service role key trong repository hoặc browser.

### Local development

1. Chạy `python -m http.server 8000` từ thư mục root.
2. Mở `http://localhost:8000/admin/login/`.
3. Đăng nhập bằng account local trong `admin/config.js`.

Khi cần dùng Supabase, chạy thêm migration và seed, tạo user trong Supabase Authentication, sau đó thêm profile tương ứng với role `admin` trong bảng `profiles`.

Public Hub có thể dùng `public-config.js` với `mode: 'supabase'`, `url` và `anonKey` để đọc nội dung đã publish. Khi giữ `mode: 'local'`, public tiếp tục dùng snapshot/localStorage để phát triển local.

### Email thật khi deploy

EmailJS chỉ phù hợp để test frontend. Production nên dùng function `supabase/functions/send-application-email/index.ts` với Resend. Đặt `RESEND_API_KEY`, `MAIL_FROM` và `RECRUITMENT_EMAIL` bằng Supabase Function Secrets; không đưa các giá trị này vào `admin/config.js`, GitHub Pages hoặc browser.

Workflow CMS được lưu trong migration `002_cms_workflow.sql`: revision history, preview tokens, email settings và email logs. Draft không được public policy đọc; chỉ record `published` mới xuất hiện trên Career Hub.

GitHub Pages chỉ chứa anon key và frontend. Service role key chỉ dùng trong môi trường server/SQL migration bảo mật. Khi deploy admin trên Vercel hoặc Netlify, giữ cùng cấu trúc `/admin/` và cấu hình public Supabase values qua build/deployment environment.

## Chỉnh nội dung

- Nội dung và markup: `index.html`
- Màu sắc/layout/responsive: `styles.css`
- Danh sách job, bộ lọc, quy trình tuyển dụng, FAQ: `script.js`

Các màu thương hiệu chính nằm ở đầu `styles.css` trong `:root`.

## V4 — Original Site UI lock

Các khu vực Hero, Câu chuyện nghề nghiệp, Vì sao chọn Mitalab và Hỏi đáp & Liên hệ được khóa theo giao diện Site gốc/reference đã duyệt. Bản static giữ sticky navigation, smooth scroll, scroll reveal, hover states, accordion FAQ, job filters, modal JD và interactive recruitment journey.


## V5 — Nguồn dữ liệu thật (07/09/2026)
- Danh sách việc làm được đối chiếu thủ công từ https://www.mitalab.com/tuyen-dung tại thời điểm 07/09/2026. Đây là snapshot tĩnh, không tự đồng bộ sau khi deploy GitHub Pages.
- Câu chuyện Mitalab dùng bài viết công khai trên mitalab.com; benchmark dùng Roche, Abbott và B. Braun.
- Logo mark dùng SVG local theo nhận diện kim cương nhiều tam giác được Mitalab công bố chính thức; lưu local để tránh phụ thuộc hotlink.
- UI/animation từ V4 được giữ nguyên; CSS V5 chỉ bổ sung block benchmark và source-link.
