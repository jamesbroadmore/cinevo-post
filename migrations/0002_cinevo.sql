create table if not exists cinevo_profiles (
  user_id    text primary key,
  username   text not null unique,
  display    text not null default '',
  xp         integer not null default 0,
  streak     integer not null default 0,
  last_watch date,
  created_at timestamptz not null default now()
);
create unique index if not exists cinevo_profiles_username_lower on cinevo_profiles (lower(username));

create table if not exists cinevo_shares (
  id           text primary key,
  owner_id     text not null,
  token        text not null unique,
  guest_name   text not null,
  libraries    text not null default '[]',
  titles       text not null default '[]',
  days         integer not null default 7,
  status       text not null default 'active',
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null
);
create index if not exists cinevo_shares_owner on cinevo_shares (owner_id);
create index if not exists cinevo_shares_guest on cinevo_shares (lower(guest_name));
create index if not exists cinevo_shares_token on cinevo_shares (token);
