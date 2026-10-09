create table if not exists cinevo_webauthn_challenge (
  id text primary key,
  challenge text not null,
  expires_at timestamptz not null
);

create table if not exists cinevo_passkey (
  credential_id text primary key,
  user_id text not null,
  public_key text not null,
  algorithm integer not null,
  counter integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists cinevo_passkey_user on cinevo_passkey (user_id);

create table if not exists cinevo_desk (
  secret text primary key,
  status text not null default 'pending',
  token text,
  expires_at timestamptz not null
);
