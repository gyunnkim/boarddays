-- 회원가입/게스트 입장 시 이름을 가입 시점에 한 번만 확정하기 위해,
-- auth.users insert 시 클라이언트가 signUp/signInAnonymously 호출에
-- 실어 보낸 raw_user_meta_data.display_name을 profiles.display_name에
-- 그대로 반영한다.
--
-- 이 방식은 "계정 생성 후 별도로 profiles를 update"하는 방식과 달리
-- 원자적이다: profiles.display_name insert가 unique 제약(profiles_display_name_key)
-- 위반으로 실패하면 트리거 예외로 인해 같은 트랜잭션에 묶인 auth.users
-- insert 자체가 롤백되어, 이름이 중복된 상태로 계정만 먼저 만들어지는
-- 상황(설정 화면에서 더 이상 이름을 수정할 수 없으므로 복구 불가능한 상태가
-- 됨)을 방지한다. 애플리케이션 쪽에서는 가입 전에
-- public.is_display_name_available()로 사전 확인도 함께 수행한다.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_display_name text;
begin
  v_display_name := nullif(trim(new.raw_user_meta_data ->> 'display_name'), '');

  insert into public.profiles (id, display_name)
  values (new.id, v_display_name);

  return new;
end;
$$;
