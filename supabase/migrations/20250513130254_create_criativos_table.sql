-- ========================================
-- TABELA CRIATIVOS
-- ========================================

create table if not exists public.criativos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  nome text,
  texto text,
  voz text,
  video_url text,
  status text default 'processando',
  final_url text,
  created_at timestamptz default now()
);

-- Habilita RLS
alter table public.criativos enable row level security;

-- Políticas
create policy "Allow select for authenticated users"
  on public.criativos
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow insert for authenticated users"
  on public.criativos
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Allow update for authenticated users"
  on public.criativos
  for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow delete for authenticated users"
  on public.criativos
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- ========================================
-- BUCKET DE STORAGE: videos
-- ========================================

insert into storage.buckets (id, name, public)
select 'videos', 'videos', true
where not exists (
  select 1 from storage.buckets where id = 'videos'
);

-- Habilita RLS no storage
alter table storage.objects enable row level security;

-- Leitura pública de arquivos do bucket videos
create policy "Public read access for videos"
  on storage.objects
  for select
  using (bucket_id = 'videos');

-- Upload apenas por usuários autenticados
create policy "Authenticated upload to videos"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'videos');
