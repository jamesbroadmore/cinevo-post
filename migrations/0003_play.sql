create table if not exists cinevo_play_tickets (
  id         text primary key,
  user_id    text not null,
  provider   text not null,
  url        text not null,
  headers    text not null default '{}',
  expires_at timestamptz not null
);
create index if not exists cinevo_play_tickets_user on cinevo_play_tickets (user_id);
create index if not exists cinevo_play_tickets_exp on cinevo_play_tickets (expires_at);
