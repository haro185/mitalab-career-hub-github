create extension if not exists pgcrypto;

create type public.user_role as enum ('admin', 'editor', 'viewer');
create type public.content_status as enum ('draft', 'published', 'paused', 'expired', 'archived');
create type public.story_type as enum ('mitalab_story', 'external_benchmark');
create type public.talent_status as enum ('new', 'reviewed', 'potential', 'contacted', 'converted', 'archived');

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = timezone('utc', now()); return new; end; $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  role public.user_role not null default 'viewer',
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.job_categories (
  id uuid primary key default gen_random_uuid(), name text not null, english_name text, slug text not null unique,
  short_description text, description text, icon text, display_order integer not null default 0,
  status public.content_status not null default 'published', created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()), created_by uuid references auth.users(id), updated_by uuid references auth.users(id)
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(), code text not null unique, slug text not null unique, title text not null,
  category_id uuid references public.job_categories(id), department text, location text, employment_type text, level text, headcount integer default 1,
  short_description text, description jsonb not null default '[]'::jsonb, requirements jsonb not null default '[]'::jsonb, benefits jsonb not null default '[]'::jsonb,
  application_process text, posted_at date, application_deadline date, hiring_manager text, recruiter text, application_email text,
  meta_title text, meta_description text, featured boolean not null default false, priority integer not null default 0, display_order integer not null default 0,
  status public.content_status not null default 'draft', created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id), updated_by uuid references auth.users(id)
);

create table public.career_stories (
  id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null, subtitle text, eyebrow text, category text, job_family text,
  short_description text, article_content text, cover_image text, gallery jsonb not null default '[]'::jsonb, video_url text, cta_label text, cta_url text,
  published_date date, featured boolean not null default false, story_type public.story_type not null default 'mitalab_story', company text, original_source text, original_url text, takeaway_for_mitalab text,
  status public.content_status not null default 'draft', created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()), created_by uuid references auth.users(id), updated_by uuid references auth.users(id)
);

create table public.work_environment (
  id uuid primary key default gen_random_uuid(), number text not null, title text not null, description text, evidence text, reference_article text, image text, display_order integer not null default 0,
  status public.content_status not null default 'published', created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()), created_by uuid references auth.users(id), updated_by uuid references auth.users(id)
);
create table public.work_environment_articles (work_environment_id uuid not null references public.work_environment(id) on delete cascade, career_story_id uuid not null references public.career_stories(id) on delete cascade, display_order integer not null default 0, primary key (work_environment_id, career_story_id));
create table public.company_values (id uuid primary key default gen_random_uuid(), name text not null unique, display_order integer not null default 0, status public.content_status not null default 'published', created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()), created_by uuid references auth.users(id), updated_by uuid references auth.users(id));
create table public.recruitment_steps (id uuid primary key default gen_random_uuid(), number text not null, title text not null, short_description text, full_description text, icon text, cta_label text, cta_url text, display_order integer not null default 0, status public.content_status not null default 'published', created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()), created_by uuid references auth.users(id), updated_by uuid references auth.users(id));
create table public.faq_categories (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, display_order integer not null default 0, status public.content_status not null default 'published', created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()), created_by uuid references auth.users(id), updated_by uuid references auth.users(id));
create table public.faqs (id uuid primary key default gen_random_uuid(), question text not null, answer text not null, category_id uuid references public.faq_categories(id), display_order integer not null default 0, published boolean not null default false, status public.content_status not null default 'draft', created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()), created_by uuid references auth.users(id), updated_by uuid references auth.users(id));
create table public.talent_community (id uuid primary key default gen_random_uuid(), name text not null, email text not null, phone text, locations jsonb not null default '[]'::jsonb, job_families jsonb not null default '[]'::jsonb, experience text, cv_url text, consent boolean not null default false, consent_at timestamptz, source text, utm_source text, utm_medium text, utm_campaign text, recruiter_id uuid references public.profiles(id), status public.talent_status not null default 'new', created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()));
create table public.talent_notes (id uuid primary key default gen_random_uuid(), talent_id uuid not null references public.talent_community(id) on delete cascade, note text not null, created_by uuid references auth.users(id), created_at timestamptz not null default timezone('utc', now()));
create table public.homepage_content (id boolean primary key default true check (id), eyebrow text, headline_line_1 text, headline_line_2 text, description text, cta_1_label text, cta_1_url text, cta_2_label text, cta_2_url text, metrics jsonb not null default '[]'::jsonb, status public.content_status not null default 'published', created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()), created_by uuid references auth.users(id), updated_by uuid references auth.users(id));
create table public.contacts (id uuid primary key default gen_random_uuid(), region text not null, email text, phone text, extension text, display_order integer not null default 0, status public.content_status not null default 'published', created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()), created_by uuid references auth.users(id), updated_by uuid references auth.users(id));
create table public.media (id uuid primary key default gen_random_uuid(), storage_path text not null unique, folder text not null default 'Other', filename text not null, alt_text text, mime_type text, file_size bigint, width integer, height integer, public_url text, status public.content_status not null default 'published', created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()), created_by uuid references auth.users(id), updated_by uuid references auth.users(id));
create table public.audit_logs (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id), content_type text not null, record_id uuid, action text not null, old_value jsonb, new_value jsonb, created_at timestamptz not null default timezone('utc', now()));
create table public.site_settings (key text primary key, value jsonb not null default '{}'::jsonb, status public.content_status not null default 'published', created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()), created_by uuid references auth.users(id), updated_by uuid references auth.users(id));

create index jobs_status_deadline_idx on public.jobs(status, application_deadline);
create index jobs_category_idx on public.jobs(category_id);
create index talent_status_idx on public.talent_community(status);
create index audit_logs_record_idx on public.audit_logs(content_type, record_id, created_at desc);

DO $$ declare table_name text; begin
  foreach table_name in array array['profiles','job_categories','jobs','career_stories','work_environment','company_values','recruitment_steps','faq_categories','faqs','talent_community','homepage_content','contacts','media','site_settings'] loop
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

create or replace function public.is_admin_or_editor() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and status = 'active' and role in ('admin', 'editor'));
$$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and status = 'active' and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.job_categories enable row level security;
alter table public.jobs enable row level security;
alter table public.career_stories enable row level security;
alter table public.work_environment enable row level security;
alter table public.work_environment_articles enable row level security;
alter table public.company_values enable row level security;
alter table public.recruitment_steps enable row level security;
alter table public.faq_categories enable row level security;
alter table public.faqs enable row level security;
alter table public.talent_community enable row level security;
alter table public.talent_notes enable row level security;
alter table public.homepage_content enable row level security;
alter table public.contacts enable row level security;
alter table public.media enable row level security;
alter table public.audit_logs enable row level security;
alter table public.site_settings enable row level security;

create policy "public reads published categories" on public.job_categories for select using (status = 'published');
create policy "public reads published jobs" on public.jobs for select using (status = 'published');
create policy "public reads published stories" on public.career_stories for select using (status = 'published');
create policy "public reads published environment" on public.work_environment for select using (status = 'published');
create policy "public reads published values" on public.company_values for select using (status = 'published');
create policy "public reads published journey" on public.recruitment_steps for select using (status = 'published');
create policy "public reads published faq categories" on public.faq_categories for select using (status = 'published');
create policy "public reads published faqs" on public.faqs for select using (status = 'published' and published = true);
create policy "public reads homepage" on public.homepage_content for select using (status = 'published');
create policy "public reads contacts" on public.contacts for select using (status = 'published');
create policy "public reads settings" on public.site_settings for select using (status = 'published');
create policy "public submits talent" on public.talent_community for insert with check (consent = true);

create policy "staff reads profiles" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

DO $$ declare table_name text; begin
  foreach table_name in array array['job_categories','jobs','career_stories','work_environment','work_environment_articles','company_values','recruitment_steps','faq_categories','faqs','talent_notes','homepage_content','contacts','media','audit_logs','site_settings'] loop
    execute format('create policy %I_staff_manage on public.%I for all using (public.is_admin_or_editor()) with check (public.is_admin_or_editor())', table_name, table_name);
  end loop;
  execute 'create policy talent_staff_read on public.talent_community for select using (public.is_admin_or_editor())';
  execute 'create policy talent_staff_update on public.talent_community for update using (public.is_admin_or_editor()) with check (public.is_admin_or_editor())';
end $$;

insert into storage.buckets (id, name, public) values ('career-media', 'career-media', true) on conflict (id) do nothing;
create policy "public reads career media" on storage.objects for select using (bucket_id = 'career-media');
create policy "staff uploads career media" on storage.objects for insert with check (bucket_id = 'career-media' and public.is_admin_or_editor());
create policy "staff updates career media" on storage.objects for update using (bucket_id = 'career-media' and public.is_admin_or_editor());
create policy "staff deletes career media" on storage.objects for delete using (bucket_id = 'career-media' and public.is_admin_or_editor());
