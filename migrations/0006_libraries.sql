create table if not exists cinevo_libraries (
  user_id text primary key,
  payload text not null,
  updated_at timestamptz not null default now()
);
