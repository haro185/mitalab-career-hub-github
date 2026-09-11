-- CMS workflow, revision history, preview tokens and transactional email records.
create table if not exists public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  record_id uuid not null,
  version integer not null,
  action text not null check (action in ('create', 'update', 'publish', 'archive', 'restore', 'delete')),
  snapshot jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  unique (content_type, record_id, version)
);

create table if not exists public.preview_tokens (
  token text primary key,
  content_type text not null,
  record_id uuid not null,
  expires_at timestamptz not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.email_settings (
  id boolean primary key default true check (id),
  provider text not null default 'resend' check (provider in ('resend', 'smtp', 'emailjs', 'mailto')),
  from_name text not null default 'Mitalab Career Hub',
  from_email text not null default 'tuyendung@mitalab.com',
  recruitment_email text not null default 'tuyendung@mitalab.com',
  candidate_confirmation_enabled boolean not null default true,
  recruiter_notification_enabled boolean not null default true,
  candidate_subject text not null default 'Mitalab đã nhận hồ sơ ứng tuyển của bạn',
  candidate_template text not null default 'Xin chào {{candidate_name}},\n\nMitalab đã nhận được hồ sơ của bạn cho vị trí {{job_title}}. Đội ngũ Tuyển dụng sẽ liên hệ khi có cập nhật tiếp theo.\n\nTrân trọng,\nMitalab',
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid references auth.users(id)
);

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  application_id uuid,
  recipient text not null,
  subject text not null,
  provider text not null,
  status text not null check (status in ('queued', 'sent', 'failed')),
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default timezone('utc', now()),
  sent_at timestamptz
);

alter table public.content_revisions enable row level security;
alter table public.preview_tokens enable row level security;
alter table public.email_settings enable row level security;
alter table public.email_logs enable row level security;

create policy "staff manage revisions" on public.content_revisions for all using (public.is_admin_or_editor()) with check (public.is_admin_or_editor());
create policy "staff manage preview tokens" on public.preview_tokens for all using (public.is_admin_or_editor()) with check (public.is_admin_or_editor());
create policy "staff manage email settings" on public.email_settings for all using (public.is_admin_or_editor()) with check (public.is_admin_or_editor());
create policy "staff read email logs" on public.email_logs for select using (public.is_admin_or_editor());

create or replace function public.create_preview_token(
  p_content_type text,
  p_record_id uuid,
  p_ttl_minutes integer default 60
) returns text language plpgsql security definer set search_path = public as $$
declare generated_token text;
begin
  if not public.is_admin_or_editor() then raise exception 'not authorized'; end if;
  generated_token := encode(gen_random_bytes(24), 'hex');
  insert into public.preview_tokens(token, content_type, record_id, expires_at, created_by)
  values (generated_token, p_content_type, p_record_id, timezone('utc', now()) + make_interval(mins => p_ttl_minutes), auth.uid());
  return generated_token;
end;
$$;

insert into public.email_settings (id) values (true) on conflict (id) do nothing;
