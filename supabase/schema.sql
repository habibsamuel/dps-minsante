-- Mboa Care — schéma Supabase (PostgreSQL)
-- À exécuter dans Supabase > SQL Editor avant de brancher l'application.
-- Les écrans fonctionnent aujourd'hui avec des données locales (src/lib/doctors.ts),
-- ce schéma prépare la mise en production.

create extension if not exists "pgcrypto";

-- 1. Profils ---------------------------------------------------------------
create type public.user_role as enum ('patient', 'doctor', 'admin');
create type public.triage_level as enum ('urgence', 'consultation', 'surveillance');
create type public.consultation_status as enum (
  'requested', 'accepted', 'in_progress', 'completed', 'cancelled'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'patient',
  full_name text not null,
  phone text,
  city text,
  birth_date date,
  created_at timestamptz not null default now()
);

-- 2. Médecins --------------------------------------------------------------
create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  specialty text not null,
  facility text,
  city text,
  license_number text,                 -- numéro à l'ordre des médecins
  license_verified boolean not null default false,
  years_experience int default 0,
  languages text[] not null default '{}',
  bio text,
  is_available boolean not null default false,
  rating numeric(2,1) default 0,
  created_at timestamptz not null default now(),
  constraint verified_before_practice check (not is_available or license_verified)
);

-- 3. Évaluations (triage) --------------------------------------------------
create table public.triage_sessions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  answers jsonb not null,
  level public.triage_level not null,
  score int not null default 0,
  red_flags text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- 4. Consultations ---------------------------------------------------------
create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  doctor_id uuid not null references public.doctors (id) on delete cascade,
  triage_id uuid references public.triage_sessions (id) on delete set null,
  status public.consultation_status not null default 'requested',
  room_url text,                       -- salle visio (Jitsi/Daily), remplie plus tard
  scheduled_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now()
);

create index consultations_patient_idx on public.consultations (patient_id, created_at desc);
create index consultations_doctor_idx on public.consultations (doctor_id, status);

-- 5. Messages --------------------------------------------------------------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index messages_consultation_idx on public.messages (consultation_id, created_at);

-- 6. Ordonnances -----------------------------------------------------------
create table public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations (id) on delete cascade,
  doctor_id uuid not null references public.doctors (id),
  content jsonb not null,
  issued_at timestamptz not null default now()
);

-- 7. Sécurité (Row Level Security) ----------------------------------------
alter table public.profiles enable row level security;
alter table public.doctors enable row level security;
alter table public.triage_sessions enable row level security;
alter table public.consultations enable row level security;
alter table public.messages enable row level security;
alter table public.prescriptions enable row level security;

-- Chacun lit et modifie son propre profil.
create policy "profil: lecture de soi"
  on public.profiles for select using (auth.uid() = id);
create policy "profil: mise à jour de soi"
  on public.profiles for update using (auth.uid() = id);

-- Les médecins vérifiés sont visibles par tous les utilisateurs connectés.
create policy "docteurs: lecture publique"
  on public.doctors for select
  using (license_verified = true or auth.uid() = profile_id);

-- Un patient ne voit que ses évaluations ; il peut en créer.
create policy "triage: lecture de soi"
  on public.triage_sessions for select using (auth.uid() = patient_id);
create policy "triage: création par le patient"
  on public.triage_sessions for insert with check (auth.uid() = patient_id);

-- Consultations : visibles par le patient concerné et par le médecin concerné.
create policy "consultations: patient"
  on public.consultations for select using (auth.uid() = patient_id);
create policy "consultations: médecin"
  on public.consultations for select using (
    exists (
      select 1 from public.doctors d
      where d.id = consultations.doctor_id and d.profile_id = auth.uid()
    )
  );
create policy "consultations: création par le patient"
  on public.consultations for insert with check (auth.uid() = patient_id);
create policy "consultations: mise à jour par le médecin"
  on public.consultations for update using (
    exists (
      select 1 from public.doctors d
      where d.id = consultations.doctor_id and d.profile_id = auth.uid()
    )
  );

-- Messages : uniquement les deux participants de la consultation.
create policy "messages: participants"
  on public.messages for select using (
    exists (
      select 1 from public.consultations c
      left join public.doctors d on d.id = c.doctor_id
      where c.id = messages.consultation_id
        and (c.patient_id = auth.uid() or d.profile_id = auth.uid())
    )
  );
create policy "messages: envoi par un participant"
  on public.messages for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.consultations c
      left join public.doctors d on d.id = c.doctor_id
      where c.id = messages.consultation_id
        and (c.patient_id = auth.uid() or d.profile_id = auth.uid())
    )
  );

-- Ordonnances : lisibles par le patient et le médecin qui les a émises.
create policy "ordonnances: lecture"
  on public.prescriptions for select using (
    exists (
      select 1 from public.consultations c
      left join public.doctors d on d.id = c.doctor_id
      where c.id = prescriptions.consultation_id
        and (c.patient_id = auth.uid() or d.profile_id = auth.uid())
    )
  );
