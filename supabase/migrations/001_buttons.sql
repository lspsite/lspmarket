create table buttons (
  id uuid default gen_random_uuid() primary key,
  label text not null,
  url text not null,
  category text not null default 'magazine',
  position int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter publication supabase_realtime add table buttons;

create policy "Public read access"
  on buttons for select
  using (true);