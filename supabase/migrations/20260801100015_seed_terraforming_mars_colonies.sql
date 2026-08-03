-- terraforming_mars_colonies 시드 데이터.
-- 20260801100011_terraforming_mars_colonies.sql에서는 정확한 개척기지
-- 목록을 확인하기 전이라 테이블 구조만 만들고 데이터를 비워 두었다.
-- 사용자에게 확인한 결과, 개척기지(Colonies) 확장의 실물 확장 타일
-- 12종으로 시드하기로 확정되었다.
insert into public.terraforming_mars_colonies (slug, name_ko, name_en) values
  ('callisto', '칼리스토', 'Callisto'),
  ('ceres', '세레스', 'Ceres'),
  ('enceladus', '엔켈라두스', 'Enceladus'),
  ('europa', '유로파', 'Europa'),
  ('ganymede', '가니메데', 'Ganymede'),
  ('io', '이오', 'Io'),
  ('luna', '루나', 'Luna'),
  ('miranda', '미란다', 'Miranda'),
  ('pluto', '플루토', 'Pluto'),
  ('titan', '타이탄', 'Titan'),
  ('titania', '티타니아', 'Titania'),
  ('triton', '트리톤', 'Triton');
