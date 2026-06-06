-- XIPHIAS platform schema draft.
-- Apply through a migration tool before enabling a production Postgres repository.

create type portal_role as enum ('client', 'staff', 'admin', 'partner', 'b2g');
create type lead_source as enum ('website', 'chat', 'whatsapp', 'eligibility', 'partner', 'b2g');
create type lead_status as enum ('new', 'qualified', 'consultation_booked', 'case_opened', 'closed');
create type risk_level as enum ('low', 'medium', 'high', 'blocked');
create type case_stage as enum ('intake', 'documents', 'due_diligence', 'strategy', 'filing', 'government_review', 'decision', 'post_approval');

create table platform_users (
  id text primary key,
  email text not null unique,
  name text not null,
  role portal_role not null,
  client_id text,
  partner_id text,
  organization_id text,
  created_at timestamptz not null default now()
);

create table platform_leads (
  id text primary key,
  source lead_source not null,
  status lead_status not null default 'new',
  name text not null,
  email text,
  phone text,
  track text,
  country text,
  program text,
  message text,
  page text,
  referrer text,
  consent boolean default false,
  score integer,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table migration_cases (
  id text primary key,
  client_id text not null,
  lead_id text references platform_leads(id),
  track text not null,
  country text not null,
  program text not null,
  stage case_stage not null default 'intake',
  title text not null,
  advisor_name text not null,
  next_action text not null,
  next_action_due date,
  risk_level risk_level not null default 'low',
  progress integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table case_documents (
  id text primary key,
  case_id text not null references migration_cases(id) on delete cascade,
  label text not null,
  category text not null,
  status text not null,
  due_at date,
  uploaded_at timestamptz,
  notes text
);

create table case_milestones (
  id text primary key,
  case_id text not null references migration_cases(id) on delete cascade,
  title text not null,
  description text not null,
  status text not null,
  due_at date,
  completed_at date
);

create table conversation_messages (
  id text primary key,
  lead_id text references platform_leads(id),
  case_id text references migration_cases(id),
  channel text not null,
  direction text not null,
  from_label text not null,
  to_label text,
  body text not null,
  provider_message_id text,
  created_at timestamptz not null default now()
);

create table risk_profiles (
  id text primary key,
  case_id text references migration_cases(id),
  lead_id text references platform_leads(id),
  level risk_level not null,
  flags jsonb not null default '[]',
  requires_staff_review boolean not null default true,
  created_at timestamptz not null default now()
);

create table content_review_tasks (
  id text primary key,
  title text not null,
  source_url text not null,
  target_path text,
  status text not null default 'needs_review',
  suggested_summary text not null,
  proposed_changes jsonb not null default '[]',
  reviewer_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table partner_referrals (
  id text primary key,
  partner_id text,
  partner_name text not null,
  company_name text,
  contact_email text not null,
  contact_phone text,
  client_name text not null,
  client_email text,
  client_phone text,
  target_country text,
  target_program text,
  status text not null default 'submitted',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table b2g_inquiries (
  id text primary key,
  organization_name text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  requirement text not null,
  region text,
  volume_estimate text,
  status text not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_logs (
  id text primary key,
  actor_id text,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

