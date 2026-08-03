-- profiles.display_name을 "1인 1개, 서비스 전체 unique"인 이름 필드로 바꾼다.
--
-- 순서가 중요하다:
--   1) 먼저 unique 제약을 건다. 지금까지 handle_new_user 트리거가
--      display_name에 가입 이메일을 자동으로 채워왔고, 이메일은
--      auth.users에서 이미 유일하므로 이 시점에는 항상 성공한다.
--   2) 신규 가입 트리거가 더 이상 이메일을 기본값으로 채우지 않도록 바꾼다.
--      display_name은 이제 사용자가 직접 정하는 유일한 이름이므로, 아직
--      정하지 않은 상태를 NULL로 표현한다(Postgres unique 제약은 NULL을
--      여러 개 허용하므로 자연스럽게 동작한다).
--   3) player_names(사용자가 매치 입력 화면에서 쓰던 다중 이름 등록 목록)를
--      사용자별 가장 오래된 이름 기준으로 profiles.display_name에 백필한다.
--      이미 (1)에서 unique 제약이 걸려 있으므로, 서로 다른 사용자가 같은
--      이름을 등록해 두었던 경우 나중에 처리되는 쪽은 unique_violation으로
--      건너뛰고 NOTICE로 남긴다(자동으로 이름을 바꾸지 않는다).
--   4) 더 이상 필요 없는 player_names 테이블을 제거한다.

alter table public.profiles
  add constraint profiles_display_name_key unique (display_name);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, null);
  return new;
end;
$$;

do $$
declare
  r record;
begin
  for r in
    select oldest.user_id, oldest.name
    from (
      select distinct on (pn.user_id)
        pn.user_id, pn.name, pn.created_at
      from public.player_names pn
      order by pn.user_id, pn.created_at asc
    ) oldest
    order by oldest.created_at asc
  loop
    begin
      update public.profiles
      set display_name = r.name
      where id = r.user_id;
    exception when unique_violation then
      raise notice
        'display_name backfill 충돌: user_id=%, name=%는 다른 사용자가 이미 사용 중이라 건너뜁니다 (수동 확인 필요)',
        r.user_id, r.name;
    end;
  end loop;
end $$;

drop table public.player_names;
