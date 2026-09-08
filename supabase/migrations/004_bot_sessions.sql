create table if not exists bot_sessions (
  chat_id bigint primary key,
  state text not null default '',
  data jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);