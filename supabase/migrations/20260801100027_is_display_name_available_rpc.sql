-- 가입/게스트 입장 화면은 아직 로그인하지 않은 상태(anon role)에서
-- 이름 중복 여부를 미리 확인해야 한다. profiles의 RLS(profiles_select_own)는
-- 본인 행만 조회를 허용하므로 anon은 다른 사용자의 display_name을 직접
-- 조회할 수 없다.
--
-- 이 함수는 SECURITY DEFINER로 RLS를 우회해 조회하지만, 이름이 이미
-- 사용 중인지 여부(boolean)만 반환하고 어떤 profile 데이터도 노출하지
-- 않는다. 최종 무결성은 여전히 profiles_display_name_key unique 제약과
-- handle_new_user 트리거가 보장하므로, 이 함수는 사용자에게 더 친절한
-- 에러 메시지를 미리 보여주기 위한 사전 확인 용도일 뿐이다(경합 상태에서
-- 마지막 방어선은 아니다).
create or replace function public.is_display_name_available(p_display_name text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select not exists (
    select 1 from public.profiles where display_name = p_display_name
  );
$$;

grant execute on function public.is_display_name_available(text) to anon, authenticated;
