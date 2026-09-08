create table if not exists settings (
  key text primary key,
  value text not null default ''
);

insert into settings (key, value) values
  ('owner_url', ''),
  ('channel_url', ''),
  ('chat_url', '')
on conflict (key) do nothing;

alter publication supabase_realtime add table settings;

create policy "Public read access"
  on settings for select
  using (true);