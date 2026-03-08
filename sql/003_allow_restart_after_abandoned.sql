drop index if exists uq_quest_runs_user_profession_once;
drop index if exists uq_quest_runs_user_profession_lock;

create unique index if not exists uq_quest_runs_user_profession_lock
  on quest_runs (user_id, profession_key)
  where status in ('active', 'completed');
