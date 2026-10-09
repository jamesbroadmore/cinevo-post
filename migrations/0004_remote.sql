create table if not exists cinevo_remotes (
  code       text primary key,
  user_id    text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  now_json   jsonb not null default '{}'::jsonb,
  queue_json jsonb not null default '[]'::jsonb
);
create index if not exists cinevo_remotes_user on cinevo_remotes (user_id);
create index if not exists cinevo_remotes_exp on cinevo_remotes (expires_at);
