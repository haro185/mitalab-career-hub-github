const client = window.mitalabSupabase;
const localAuth = window.MITALAB_AUTH?.mode === 'local';
const app = document.querySelector('#adminApp');
const content = document.querySelector('#adminContent');
const pageTitle = document.querySelector('#pageTitle');
const connectionStatus = document.querySelector('#connectionStatus');
const userEmail = document.querySelector('#userEmail');
const toastElement = document.querySelector('#toast');
const state = { session: null, profile: null, view: 'dashboard', jobs: [], jobQuery: '', jobStatus: 'all' };
const viewTitles = { dashboard: 'Dashboard', jobs: 'Việc làm', categories: 'Nhóm nghề', stories: 'Câu chuyện nghề nghiệp', environment: 'Môi trường & phát triển', journey: 'Quy trình tuyển dụng', faq: 'FAQ', talent: 'Talent Community', homepage: 'Trang chủ', contacts: 'Thông tin liên hệ', media: 'Media Library', users: 'Người dùng', settings: 'Cài đặt' };
const localCollections = {
  categories: { label: 'nhóm nghề', columns: ['Tên', 'English name', 'Thứ tự', 'Trạng thái'], rows: [['Thiết bị & Ứng dụng', 'Technical & Application', '01', 'Đã publish'], ['LIS / IT / Data', 'LIS / IT / Data', '02', 'Đã publish'], ['Kinh doanh & Vận hành', 'Commercial & Operations', '03', 'Đã publish']] },
  stories: { label: 'câu chuyện', columns: ['Tiêu đề', 'Loại', 'Job Family', 'Trạng thái'], rows: [['Lắp đặt MiSeq i100 Plus đầu tiên tại Việt Nam', 'Mitalab Story', 'Technical', 'Đã publish'], ['Kick-off Meeting 2026: Đồng hành phát triển', 'Mitalab Story', 'Culture', 'Đã publish'], ['Team Building 2023: Trekking Together as One', 'Mitalab Story', 'Culture', 'Đã publish']] },
  environment: { label: 'pillar', columns: ['Số', 'Tiêu đề', 'Evidence', 'Thứ tự'], rows: [['01', 'Phát triển chuyên môn qua công việc', 'Đào tạo chuyên môn và học từ công việc thực tế.', '01'], ['02', 'Phát huy năng lực trong từng vai trò', 'Mục tiêu BSC và hoạt động nội bộ.', '02'], ['03', 'Hợp tác và chia sẻ trong công việc', 'Tâm thế, Hợp tác, Kỷ luật và Đồng nhất.', '03']] },
  journey: { label: 'bước tuyển dụng', columns: ['Số', 'Tên bước', 'Mô tả ngắn', 'Thứ tự'], rows: [['BẮT ĐẦU', 'Khám phá cơ hội phù hợp', 'Tìm một công việc phù hợp với điều bạn muốn phát triển.', '00'], ['01', 'Gửi hồ sơ', 'Cho chúng tôi biết bạn là ai và điều bạn đang tìm kiếm.', '01'], ['02', 'Trao đổi cùng HR', 'Một cuộc trò chuyện để hai bên hiểu nhau hơn.', '02'], ['03', 'Gặp gỡ đội ngũ chuyên môn', 'Cùng nói sâu hơn về công việc bạn sẽ thực sự đảm nhận.', '03'], ['04', 'Nhận kết quả', 'Bạn sẽ được cập nhật về kết quả và bước tiếp theo.', '04'], ['05', 'Đề nghị nhận việc', 'Khi hai bên cùng nhìn thấy một sự phù hợp.', '05'], ['06', 'Chào mừng bạn gia nhập Mitalab', 'Hành trình ứng tuyển kết thúc. Một hành trình mới bắt đầu.', '06']] },
  faq: { label: 'FAQ', columns: ['Câu hỏi', 'Câu trả lời', 'Danh mục', 'Trạng thái', 'Thứ tự'], rows: [['Mình muốn ứng tuyển thì bắt đầu từ đâu?', 'Bạn hãy chọn vị trí phù hợp và gửi CV theo đúng hướng dẫn trên JD Mitalab.', 'Ứng tuyển', 'Đã publish', '01'], ['Mình có thể ứng tuyển nhiều vị trí cùng lúc không?', 'Có. Hãy ghi rõ vị trí ưu tiên để HR hiểu định hướng của bạn.', 'Ứng tuyển', 'Đã publish', '02'], ['Mitalab có cơ hội cho intern hoặc sinh viên mới ra trường không?', 'Điều này tùy từng JD. Bạn có thể đăng ký Talent Community.', 'Ứng tuyển', 'Đã publish', '03'], ['Các vị trí hiện làm việc ở đâu?', 'Mitalab có văn phòng tại Hà Nội, TP.HCM, Đà Nẵng và Cần Thơ.', 'Thông tin tuyển dụng chính thức', 'Đã publish', '04'], ['Mình chưa học y khoa thì có ứng tuyển được không?', 'Bạn vẫn có thể ứng tuyển nếu phù hợp với yêu cầu JD.', 'Ứng tuyển', 'Đã publish', '05'], ['Sau khi gửi hồ sơ, bao lâu mình sẽ nhận được phản hồi?', 'Mitalab thường cập nhật sau các bước sàng lọc và trao đổi.', 'Kết quả', 'Đã publish', '06'], ['Nếu chưa thấy vị trí phù hợp thì mình nên làm gì?', 'Bạn có thể đăng ký Talent Community để nhận cơ hội phù hợp.', 'Ứng tuyển', 'Đã publish', '07']] },
  talent: { label: 'hồ sơ Talent Community', columns: ['Họ tên', 'Email', 'Nhóm nghề', 'Trạng thái'], rows: [] },
  homepage: { label: 'nội dung trang chủ', columns: ['Trường dữ liệu', 'Giá trị'], rows: [['Eyebrow', 'CAREER HUB 2027 · BẢN MẪU TƯƠNG TÁC'], ['Headline', 'Khám phá cơ hội nghề nghiệp / Phát triển cùng Mitalab'], ['Metrics', '25+ · 800+ · 500+ · 4']] },
  contacts: { label: 'liên hệ', columns: ['Khu vực', 'Email', 'Điện thoại', 'Extension'], rows: [['Tuyển dụng miền Bắc', 'tuyendung@mitalab.com', '(024) 3628 8882', '710'], ['Tuyển dụng miền Nam', 'tuyendunghcm@mitalab.com', '(028) 39 97 24 56', '6533']] },
  media: { label: 'media', columns: ['Tên file', 'Folder', 'Alt text', 'Trạng thái'], rows: [['logo-mark.png', 'Logo', 'Mitalab', 'Đã publish']] },
  users: { label: 'người dùng', columns: ['Tên', 'Email', 'Role', 'Trạng thái'], rows: [['Local Admin', 'admin@mitalab.com', 'ADMIN', 'Đang hoạt động']] },
  settings: { label: 'cài đặt', columns: ['Key', 'Giá trị'], rows: [['recruitment_disclaimer', 'Mitalab không thu phí ứng viên trong bất kỳ vòng tuyển dụng nào.'], ['mode', 'Local only']] }
};
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
const formatDate = value => value ? new Intl.DateTimeFormat('vi-VN').format(new Date(value)) : 'Chưa cập nhật';
const statusLabel = status => ({ published: 'Đang tuyển', draft: 'Draft', paused: 'Tạm dừng', expired: 'Hết hạn', archived: 'Đã đóng' }[status] || status || 'Draft');

function toast(message) { toastElement.textContent = message; toastElement.classList.add('show'); window.setTimeout(() => toastElement.classList.remove('show'), 2400); }
function setView(view) { state.view = view; document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === view)); pageTitle.textContent = viewTitles[view] || 'Dashboard'; renderView(); if (window.innerWidth <= 820) document.querySelector('#adminSidebar').classList.remove('open'); }
function renderView() { ({ dashboard: renderDashboard, jobs: renderJobs, categories: renderPlaceholder, stories: renderPlaceholder, environment: renderPlaceholder, journey: renderPlaceholder, faq: renderPlaceholder, talent: renderPlaceholder, homepage: renderHomepage, contacts: renderPlaceholder, media: renderPlaceholder, users: renderPlaceholder, settings: renderPlaceholder }[state.view] || renderDashboard)(); }

async function loadJobs() {
  if (localAuth) {
    const savedJobs = localStorage.getItem('mitalab-local-jobs');
    state.jobs = savedJobs ? JSON.parse(savedJobs) : [
      { id: 'local-hn-sales', code: 'HN-SALES', slug: 'hn-sales', title: '[HN] Nhân viên Kinh doanh Thiết bị Y tế & Hóa chất tiêu hao', location: 'Hà Nội', level: 'Experienced', status: 'published', posted_at: '2026-09-04' },
      { id: 'local-hn-dev', code: 'HN-DEV', slug: 'hn-developer', title: '[HN] Nhân viên Lập trình Phần mềm', location: 'Hà Nội', level: 'Experienced', status: 'published', posted_at: '2026-09-04' },
      { id: 'local-hn-accountant', code: 'HN-ACCOUNTANT', slug: 'hn-accountant', title: '[HN] Kế toán trưởng (Không quản lý nhân viên)', location: 'Hà Nội', level: 'Senior', status: 'published', posted_at: '2026-09-04' },
      { id: 'local-hn-rd', code: 'HN-RD', slug: 'hn-rd', title: '[HN] Nhân viên R&D (Phát triển sản phẩm thương mại)', location: 'Hà Nội', level: 'Experienced', status: 'published', posted_at: '2026-09-04' },
      { id: 'local-hn-technician', code: 'HN-TECHNICIAN', slug: 'hn-technician', title: '[HN] Kỹ thuật viên Bảo trì Bảo dưỡng Thiết bị Y tế', location: 'Hà Nội', level: 'Entry', status: 'published', posted_at: '2026-09-04' },
      { id: 'local-hn-automation', code: 'HN-AUTOMATION', slug: 'hn-automation', title: '[HN] Nhân viên Phụ trách Sản phẩm (Ngành hàng Automation)', location: 'Hà Nội', level: 'Experienced', status: 'published', posted_at: '2026-09-04' },
      { id: 'local-hn-engineer', code: 'HN-ENGINEER', slug: 'hn-engineer', title: '[HN] Kỹ sư Bảo trì Bảo dưỡng Thiết bị Y tế', location: 'Hà Nội', level: 'Experienced', status: 'published', posted_at: '2026-09-04' }
    ];
    localStorage.setItem('mitalab-local-jobs', JSON.stringify(state.jobs));
    return;
  }
  if (!client) return;
  const { data, error } = await client.from('jobs').select('id,code,title,job_categories(name),location,level,posted_at,application_deadline,status').order('display_order', { ascending: true });
  if (error) { toast(`Không thể tải việc làm: ${error.message}`); return; }
  state.jobs = data || [];
}

function renderDashboard() {
  const counts = { active: state.jobs.filter(job => job.status === 'published').length, draft: state.jobs.filter(job => job.status === 'draft').length, expiring: state.jobs.filter(job => job.application_deadline && new Date(job.application_deadline) < new Date(Date.now() + 14 * 86400000) && job.status === 'published').length };
  content.innerHTML = `<div class="page-heading"><div><h1>Xin chào, ${escapeHtml(state.profile?.full_name || 'Admin')}</h1><p>Tổng quan nội dung và hoạt động Career Hub.</p></div><button class="primary-button" data-view-action="jobs">+ Thêm vị trí</button></div><div class="metrics-grid"><div class="metric-card accent"><span>Vị trí đang tuyển</span><strong>${counts.active}</strong></div><div class="metric-card"><span>Vị trí Draft</span><strong>${counts.draft}</strong></div><div class="metric-card"><span>Sắp hết hạn</span><strong>${counts.expiring}</strong></div><div class="metric-card"><span>Career Stories</span><strong>0</strong></div><div class="metric-card"><span>FAQ</span><strong>0</strong></div><div class="metric-card"><span>Talent Community</span><strong>0</strong></div></div><div class="dashboard-grid"><section class="panel"><div class="panel-heading"><h2>VIỆC CẦN CHÚ Ý</h2><a href="#" data-view-action="jobs">Xem việc làm</a></div><ul class="attention-list"><li><span class="alert-dot"></span><span>${counts.expiring || 0} vị trí sắp hết hạn</span></li><li><span class="alert-dot"></span><span>${counts.draft || 0} vị trí đang chờ publish</span></li><li><span class="alert-dot"></span><span>Dữ liệu Talent Community sẽ hiển thị sau khi migrate schema</span></li></ul></section><section class="panel"><div class="panel-heading"><h2>ACTIVITY LOG</h2><a href="#" data-view-action="settings">Xem tất cả</a></div><ul class="activity-list"><li><span><strong>Hệ thống CMS đã sẵn sàng</strong><small>Đang chờ dữ liệu Supabase</small></span></li><li><span><strong>Chưa có hoạt động mới</strong><small>Audit log sẽ được ghi sau khi publish</small></span></li></ul></section></div>`;
  content.querySelectorAll('[data-view-action]').forEach(item => item.addEventListener('click', event => { event.preventDefault(); setView(item.dataset.viewAction); }));
}

function getLocalHomepage() {
  const rows = JSON.parse(localStorage.getItem('mitalab-local-homepage') || '[]');
  const values = Object.fromEntries(rows);
  return {
    eyebrow: values.Eyebrow || 'CAREER HUB 2027 · BẢN MẪU TƯƠNG TÁC',
    headline: values.Headline || 'Khám phá cơ hội nghề nghiệp / Phát triển cùng Mitalab',
    description: values.Description || 'Khám phá những vai trò kết nối thiết bị, dữ liệu và con người để góp phần nâng tầm chất lượng xét nghiệm tại Việt Nam.',
    ctaPrimary: values['CTA chính'] || 'Tìm vị trí phù hợp|#jobs',
    ctaSecondary: values['CTA phụ'] || 'Xem quy trình tuyển dụng|#journey',
    metrics: values.Metrics || '25+|Năm kinh nghiệm trên thị trường\n800+|Bệnh viện đối tác\n500+|Sản phẩm cung cấp\n4|Văn phòng làm việc trên toàn quốc'
  };
}

function renderHomepage() {
  const data = getLocalHomepage();
  const [headlineLine1 = '', headlineLine2 = ''] = data.headline.split('/').map(value => value.trim());
  const [primaryLabel = '', primaryUrl = ''] = data.ctaPrimary.split('|');
  const [secondaryLabel = '', secondaryUrl = ''] = data.ctaSecondary.split('|');
  content.innerHTML = `<div class="page-heading"><div><h1>Trang chủ</h1><p>Chỉnh sửa nội dung Homepage mà không thay đổi layout, class hoặc visual public.</p></div><div class="toolbar-right"><button class="secondary-button" id="homepageReset">Khôi phục snapshot</button><button class="primary-button" id="homepageSave">Lưu thay đổi</button></div></div><section class="panel"><form id="homepageForm" class="form-grid"><div class="form-field full"><label for="homepageEyebrow">Eyebrow</label><input class="form-input" id="homepageEyebrow" name="eyebrow" value="${escapeHtml(data.eyebrow)}" /></div><div class="form-field"><label for="homepageHeadline1">Headline line 1</label><input class="form-input" id="homepageHeadline1" name="headlineLine1" value="${escapeHtml(headlineLine1)}" /></div><div class="form-field"><label for="homepageHeadline2">Headline line 2</label><input class="form-input" id="homepageHeadline2" name="headlineLine2" value="${escapeHtml(headlineLine2)}" /></div><div class="form-field full"><label for="homepageDescription">Description</label><textarea class="form-textarea" id="homepageDescription" name="description">${escapeHtml(data.description)}</textarea></div><div class="form-field"><label for="homepageCta1">CTA chính · label | URL</label><input class="form-input" id="homepageCta1" name="ctaPrimary" value="${escapeHtml(`${primaryLabel}|${primaryUrl}`)}" /></div><div class="form-field"><label for="homepageCta2">CTA phụ · label | URL</label><input class="form-input" id="homepageCta2" name="ctaSecondary" value="${escapeHtml(`${secondaryLabel}|${secondaryUrl}`)}" /></div><div class="form-field full"><label for="homepageMetrics">Metrics · mỗi dòng: số | label</label><textarea class="form-textarea" id="homepageMetrics" name="metrics">${escapeHtml(data.metrics)}</textarea></div></form></section><section class="panel" style="margin-top:18px"><div class="panel-heading"><h2>WORKFLOW</h2></div><p class="form-help">Draft và Preview sẽ dùng cùng public component. Local mode lưu bản nháp trong trình duyệt; Supabase mode sẽ lưu revision và publish status trên database.</p><div class="form-actions"><button class="secondary-button" id="homepagePreview">Preview</button><button class="primary-button" id="homepagePublish">Publish</button></div></section>`;
  content.querySelector('#homepageSave').addEventListener('click', () => saveHomepage('draft'));
  content.querySelector('#homepagePublish').addEventListener('click', () => saveHomepage('published'));
  content.querySelector('#homepageReset').addEventListener('click', () => { localStorage.removeItem('mitalab-local-homepage'); renderHomepage(); toast('Đã khôi phục nội dung snapshot.'); });
  content.querySelector('#homepagePreview').addEventListener('click', () => { saveHomepage('draft'); window.open('../index.html#top', '_blank', 'noopener,noreferrer'); });
}

function saveHomepage(status) {
  const form = content.querySelector('#homepageForm');
  const values = Object.fromEntries(new FormData(form));
  const rows = [['Eyebrow', values.eyebrow], ['Headline', `${values.headlineLine1} / ${values.headlineLine2}`], ['Description', values.description], ['CTA chính', values.ctaPrimary], ['CTA phụ', values.ctaSecondary], ['Metrics', values.metrics], ['Status', status]];
  localStorage.setItem('mitalab-local-homepage', JSON.stringify(rows));
  toast(status === 'published' ? 'Homepage đã publish local.' : 'Homepage đã lưu Draft local.');
}

function renderJobs() {
  const filtered = state.jobs.filter(job => (!state.jobQuery || `${job.code} ${job.title} ${job.location}`.toLowerCase().includes(state.jobQuery.toLowerCase())) && (state.jobStatus === 'all' || job.status === state.jobStatus));
  content.innerHTML = `<div class="page-heading"><div><h1>Việc làm</h1><p>Quản lý vị trí, trạng thái publish và hạn tuyển.</p></div><button id="addJob" class="primary-button">+ Thêm vị trí</button></div><div class="toolbar"><div class="toolbar-left"><input id="jobSearch" class="search-input" type="search" placeholder="Tìm theo mã, vị trí, địa điểm..." value="${escapeHtml(state.jobQuery)}" /><select id="jobStatus" class="filter-select"><option value="all">Tất cả trạng thái</option><option value="draft">Draft</option><option value="published">Đang tuyển</option><option value="paused">Tạm dừng</option><option value="expired">Hết hạn</option><option value="archived">Đã đóng</option></select></div><div class="toolbar-right"><button id="refreshJobs" class="secondary-button">Làm mới</button></div></div><div class="admin-table-wrap"><table><thead><tr><th>Mã việc</th><th>Vị trí</th><th>Nhóm nghề</th><th>Địa điểm</th><th>Cấp độ</th><th>Ngày đăng</th><th>Hạn tuyển</th><th>Trạng thái</th><th>Actions</th></tr></thead><tbody>${filtered.length ? filtered.map(job => `<tr><td>${escapeHtml(job.code || '—')}</td><td><div class="record-title">${escapeHtml(job.title)}</div></td><td>${escapeHtml(job.job_categories?.name || '—')}</td><td>${escapeHtml(job.location || '—')}</td><td>${escapeHtml(job.level || '—')}</td><td>${formatDate(job.posted_at)}</td><td>${formatDate(job.application_deadline)}</td><td><span class="status-badge status-${escapeHtml(job.status || 'draft')}">${statusLabel(job.status)}</span></td><td><div class="table-actions"><button class="table-action" data-edit-job="${job.id}">Sửa</button><button class="table-action" data-preview-job="${job.id}">Preview</button></div></td></tr>`).join('') : '<tr><td colspan="9"><div class="empty-state">Chưa có dữ liệu việc làm. Hãy chạy migration và seed trước.</div></td></tr>'}</tbody></table></div>`;
  document.querySelector('#jobStatus').value = state.jobStatus;
  document.querySelector('#jobSearch').addEventListener('input', event => { state.jobQuery = event.target.value; renderJobs(); });
  document.querySelector('#jobStatus').addEventListener('change', event => { state.jobStatus = event.target.value; renderJobs(); });
  document.querySelector('#refreshJobs').addEventListener('click', async () => { await loadJobs(); renderJobs(); });
  document.querySelector('#addJob').addEventListener('click', () => openJobForm());
  content.querySelectorAll('[data-edit-job]').forEach(button => button.addEventListener('click', () => openJobForm(state.jobs.find(job => job.id === button.dataset.editJob))));
  content.querySelectorAll('[data-preview-job]').forEach(button => button.addEventListener('click', () => toast('Preview sẽ dùng chính component public sau khi public data layer được nối.')));
}

function openJobForm(job = {}) {
  const editing = Boolean(job.id);
  const modal = document.createElement('div'); modal.className = 'modal-backdrop'; modal.innerHTML = `<section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="jobFormTitle"><div class="modal-heading"><h2 id="jobFormTitle">${editing ? 'Sửa vị trí' : 'Thêm vị trí'}</h2><button class="close-button" data-close-modal aria-label="Đóng">×</button></div><form id="jobForm"><div class="form-grid"><div class="form-field"><label for="jobCode">Mã vị trí *</label><input class="form-input" id="jobCode" name="code" required value="${escapeHtml(job.code)}" /></div><div class="form-field"><label for="jobSlug">Slug *</label><input class="form-input" id="jobSlug" name="slug" required value="${escapeHtml(job.slug)}" /></div><div class="form-field full"><label for="jobTitle">Tên vị trí *</label><input class="form-input" id="jobTitle" name="title" required value="${escapeHtml(job.title)}" /></div><div class="form-field"><label for="jobLocation">Địa điểm</label><input class="form-input" id="jobLocation" name="location" value="${escapeHtml(job.location)}" /></div><div class="form-field"><label for="jobLevel">Cấp độ</label><input class="form-input" id="jobLevel" name="level" value="${escapeHtml(job.level)}" /></div><div class="form-field"><label for="jobPostedAt">Ngày đăng</label><input class="form-input" id="jobPostedAt" name="posted_at" type="date" value="${escapeHtml(job.posted_at?.slice(0, 10) || '')}" /></div><div class="form-field"><label for="jobDeadline">Hạn tuyển</label><input class="form-input" id="jobDeadline" name="application_deadline" type="date" value="${escapeHtml(job.application_deadline?.slice(0, 10) || '')}" /></div><div class="form-field"><label for="jobStatusField">Trạng thái</label><select class="form-select" id="jobStatusField" name="status"><option value="draft">Draft</option><option value="published">Đang tuyển</option><option value="paused">Tạm dừng</option><option value="archived">Đã đóng</option></select></div><div class="form-field full"><label for="jobSummary">Mô tả ngắn</label><textarea class="form-textarea" id="jobSummary" name="short_description">${escapeHtml(job.short_description)}</textarea><div class="form-help">Rich text editor sẽ được bổ sung trong module nội dung đầy đủ.</div></div></div><div class="form-actions"><button type="button" class="secondary-button" data-close-modal>Hủy</button><button type="submit" class="primary-button">${editing ? 'Lưu thay đổi' : 'Save Draft'}</button></div></form></section>`;
  document.body.appendChild(modal);
  modal.querySelector('#jobStatusField').value = job.status || 'draft';
  modal.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', () => modal.remove()));
  const publishButton = document.createElement('button');
  publishButton.type = 'button';
  publishButton.className = 'primary-button';
  publishButton.textContent = 'Publish';
  modal.querySelector('.form-actions')?.appendChild(publishButton);
  publishButton.addEventListener('click', () => {
    if (!window.confirm('Publish vị trí này lên Career Hub?')) return;
    modal.querySelector('#jobStatusField').value = 'published';
    modal.querySelector('#jobForm').requestSubmit();
  });
  modal.querySelector('#jobForm').addEventListener('submit', async event => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); if (localAuth) { const localJobs = JSON.parse(localStorage.getItem('mitalab-local-jobs') || '[]'); const savedJob = { ...job, ...values, id: job.id || crypto.randomUUID(), job_categories: null, created_at: job.created_at || new Date().toISOString() }; const nextJobs = editing ? localJobs.map(item => item.id === job.id ? savedJob : item) : [...localJobs, savedJob]; localStorage.setItem('mitalab-local-jobs', JSON.stringify(nextJobs)); modal.remove(); await loadJobs(); renderJobs(); toast(editing ? 'Đã lưu vị trí local.' : 'Đã tạo bản nháp local.'); return; } if (!client) { toast('Supabase chưa được cấu hình.'); return; } values.updated_by = state.session.user.id; if (!editing) values.created_by = state.session.user.id; const request = editing ? client.from('jobs').update(values).eq('id', job.id) : client.from('jobs').insert(values); const { error } = await request; if (error) { toast(error.message); return; } modal.remove(); await loadJobs(); renderJobs(); toast(editing ? 'Đã lưu vị trí.' : 'Đã tạo bản nháp.'); });
}

function renderPlaceholder() {
  const collection = localCollections[state.view];
  if (!localAuth || !collection) { content.innerHTML = `<div class="page-heading"><div><h1>${escapeHtml(viewTitles[state.view])}</h1><p>Module đã có trong navigation CMS và đang chờ migration dữ liệu tương ứng.</p></div></div><section class="panel"><div class="empty-state"><strong>Chưa có bản ghi để hiển thị</strong><p>Chạy <code>supabase/migrations/001_career_hub.sql</code> và seed data, sau đó module này sẽ được nối CRUD.</p></div></section>`; return; }
  if (state.view === 'talent') {
    const applications = JSON.parse(localStorage.getItem('mitalab-applications-v1') || '[]');
    collection.rows = applications.map(application => [application.name || application.candidateName || '—', application.email || '—', application.jobTitle || 'Talent Community', 'New']);
  }
  const storedRows = localStorage.getItem(`mitalab-local-${state.view}`);
  if (storedRows) collection.rows = JSON.parse(storedRows);
  const rows = collection.rows.length ? collection.rows.map((row, index) => `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}<td><div class="table-actions"><button class="table-action" data-local-edit="${index}">Sửa</button><button class="table-action delete" data-local-delete="${index}">Xóa</button></div></td></tr>`).join('') : `<tr><td colspan="${collection.columns.length + 1}"><div class="empty-state">Chưa có ${collection.label} mới.</div></td></tr>`;
  content.innerHTML = `<div class="page-heading"><div><h1>${escapeHtml(viewTitles[state.view])}</h1><p>Đang chạy local với dữ liệu snapshot từ Career Hub hiện tại.</p></div><button class="primary-button" data-local-add>+ Thêm ${escapeHtml(collection.label)}</button></div><div class="toolbar"><div class="toolbar-left"><input id="localSearch" class="search-input" type="search" placeholder="Tìm trong ${escapeHtml(collection.label)}..." /></div><div class="toolbar-right"><span class="form-help">${collection.rows.length} bản ghi local</span></div></div><div class="admin-table-wrap"><table><thead><tr>${collection.columns.map(column => `<th>${escapeHtml(column)}</th>`).join('')}<th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>${state.view === 'settings' ? renderEmailConfig() : ''}`;
  content.querySelector('[data-local-add]')?.addEventListener('click', () => openLocalEditor());
  content.querySelectorAll('[data-local-edit]').forEach(button => button.addEventListener('click', () => openLocalEditor(Number(button.dataset.localEdit))));
  content.querySelectorAll('[data-local-delete]').forEach(button => button.addEventListener('click', () => { if (!window.confirm('Bạn có chắc muốn xóa bản ghi local này?')) return; collection.rows.splice(Number(button.dataset.localDelete), 1); localStorage.setItem(`mitalab-local-${state.view}`, JSON.stringify(collection.rows)); renderPlaceholder(); }));
  content.querySelector('#localSearch')?.addEventListener('input', event => { const query = event.target.value.toLowerCase(); content.querySelectorAll('tbody tr').forEach(row => { row.hidden = !row.textContent.toLowerCase().includes(query); }); });
  initEmailConfig();
}

function openLocalEditor(index = -1) {
  const collection = localCollections[state.view];
  const current = index >= 0 ? collection.rows[index] : collection.columns.map(() => '');
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `<section class="modal-card" role="dialog" aria-modal="true"><div class="modal-heading"><h2>${index >= 0 ? 'Sửa' : 'Thêm'} ${escapeHtml(collection.label)}</h2><button class="close-button" data-close-modal aria-label="Đóng">×</button></div><form id="localEditorForm"><div class="form-grid">${collection.columns.map((column, fieldIndex) => `<div class="form-field ${current[fieldIndex]?.length > 90 ? 'full' : ''}"><label for="localField${fieldIndex}">${escapeHtml(column)}</label>${current[fieldIndex]?.length > 90 ? `<textarea class="form-textarea" id="localField${fieldIndex}" name="field${fieldIndex}">${escapeHtml(current[fieldIndex])}</textarea>` : `<input class="form-input" id="localField${fieldIndex}" name="field${fieldIndex}" value="${escapeHtml(current[fieldIndex])}" />`}</div>`).join('')}</div><div class="form-actions"><button type="button" class="secondary-button" data-close-modal>Hủy</button><button type="submit" class="primary-button">Lưu local</button></div></form></section>`;
  document.body.appendChild(modal);
  modal.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', () => modal.remove()));
  modal.querySelector('#localEditorForm').addEventListener('submit', event => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); const nextRow = collection.columns.map((_, fieldIndex) => values[`field${fieldIndex}`] || ''); if (index >= 0) collection.rows[index] = nextRow; else collection.rows.push(nextRow); localStorage.setItem(`mitalab-local-${state.view}`, JSON.stringify(collection.rows)); modal.remove(); renderPlaceholder(); toast('Đã lưu thay đổi local.'); });
}

function renderEmailConfig() {
  const config = JSON.parse(localStorage.getItem('mitalab-email-config') || '{}');
  return `<section class="panel" style="margin-top:18px"><div class="panel-heading"><h2>CẤU HÌNH EMAIL PHẢN HỒI ỨNG VIÊN</h2></div><form id="emailConfigForm" class="form-grid"><div class="form-field"><label for="emailRecipient">Email HR nhận hồ sơ</label><input class="form-input" id="emailRecipient" name="recipient" type="email" value="${escapeHtml(config.recipient || 'tuyendung@mitalab.com')}" required /></div><div class="form-field"><label for="emailReplyTo">Reply-to</label><input class="form-input" id="emailReplyTo" name="replyTo" type="email" value="${escapeHtml(config.replyTo || 'tuyendung@mitalab.com')}" /></div><div class="form-field"><label for="emailServiceId">EmailJS Service ID</label><input class="form-input" id="emailServiceId" name="serviceId" value="${escapeHtml(config.serviceId || '')}" placeholder="service_xxxxxxx" /></div><div class="form-field"><label for="emailTemplateId">EmailJS Template ID</label><input class="form-input" id="emailTemplateId" name="templateId" value="${escapeHtml(config.templateId || '')}" placeholder="template_xxxxxxx" /></div><div class="form-field full"><label for="emailPublicKey">EmailJS Public Key</label><input class="form-input" id="emailPublicKey" name="publicKey" value="${escapeHtml(config.publicKey || '')}" placeholder="public_xxxxxxx" /></div><div class="form-field full"><label for="emailSubject">Tiêu đề phản hồi</label><input class="form-input" id="emailSubject" name="subject" value="${escapeHtml(config.subject || 'Mitalab đã nhận hồ sơ ứng tuyển của bạn')}" /></div><div class="form-field full"><label for="emailBody">Nội dung phản hồi</label><textarea class="form-textarea" id="emailBody" name="body">${escapeHtml(config.body || 'Xin chào {{name}},\n\nMitalab đã nhận được hồ sơ ứng tuyển của bạn cho vị trí {{jobTitle}}. Đội ngũ Tuyển dụng sẽ liên hệ khi có cập nhật tiếp theo.\n\nTrân trọng,\nMitalab')}</textarea><div class="form-help">EmailJS dùng các biến: name, email, jobTitle, message. Nếu chưa điền 3 trường EmailJS, hệ thống sẽ dùng mailto.</div></div><div class="form-actions full"><button class="primary-button" type="submit">Lưu cấu hình email</button></div></form></section>`;
}

function initEmailConfig() {
  const form = content.querySelector('#emailConfigForm');
  form?.addEventListener('submit', event => { event.preventDefault(); localStorage.setItem('mitalab-email-config', JSON.stringify(Object.fromEntries(new FormData(form)))); toast('Đã lưu cấu hình email local.'); });
}

async function boot() {
  if (localAuth) {
    if (sessionStorage.getItem('mitalab-local-admin-session') !== 'active') { window.location.replace('login/'); return; }
    state.session = { user: { id: 'local-admin', email: window.MITALAB_AUTH.email } };
    state.profile = { full_name: 'Local Admin', role: 'admin', status: 'active' };
    app.hidden = false; userEmail.textContent = window.MITALAB_AUTH.email; connectionStatus.textContent = 'Local mode'; await loadJobs(); renderView(); return;
  }
  if (!client) { window.location.replace('login/'); return; }
  const { data, error } = await client.auth.getSession();
  if (error || !data.session) { window.location.replace('login/'); return; }
  state.session = data.session;
  const profileResult = await client.from('profiles').select('full_name,role,status').eq('id', data.session.user.id).maybeSingle();
  state.profile = profileResult.data || { full_name: data.session.user.email, role: 'viewer' };
  if (state.profile.status === 'suspended') { await client.auth.signOut(); window.location.replace('login/'); return; }
  app.hidden = false; userEmail.textContent = data.session.user.email; connectionStatus.textContent = `Đã kết nối · ${state.profile.role}`; await loadJobs(); renderView();
}

document.querySelectorAll('.nav-item').forEach(item => item.addEventListener('click', () => setView(item.dataset.view)));
document.querySelector('#logoutButton')?.addEventListener('click', async () => { if (localAuth) sessionStorage.removeItem('mitalab-local-admin-session'); else await client?.auth.signOut(); window.location.replace('login/'); });
document.querySelector('#sidebarToggle')?.addEventListener('click', () => document.querySelector('#adminSidebar').classList.toggle('open'));
boot();
