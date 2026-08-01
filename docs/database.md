# boarddays 데이터베이스 설계

## 핵심 관계

auth.users ↓ profiles

games ↓ expansions

profiles ↓ matches ├── match_players └── match_expansions ↓ expansions

## games

지원 게임 카탈로그.

예상 필드: - id - slug - name - created_at

slug는 내부 식별자로 안정적으로 유지한다.

## expansions

게임에 속한 확장팩.

예상 필드: - id - game_id - slug - name - created_at

`game_id + slug`는 중복되지 않아야 한다.

## matches

한 번의 플레이.

예상 필드: - id - user_id - game_id - played_at - created_at -
updated_at

`user_id`는 소유권 기준이다.

## match_players

한 매치의 플레이어 결과.

예상 데이터: - match_id - player name - score - rank - win/loss -
game-specific result data

게임별 특수 데이터가 필요할 때 무리하게 모든 게임의 컬럼을 한 테이블에
추가하지 않는다.

## match_expansions

매치에서 사용한 확장팩.

예상 필드: - match_id - expansion_id

`match_id + expansion_id` 중복을 방지한다.

## RLS

사용자는 자신이 소유한 match와 그 하위 데이터를 접근할 수 있어야 한다.

다른 사용자의 match ID를 알아도 접근할 수 없어야 한다.

하위 테이블은 직접 접근할 때도 소유권이 우회되지 않도록 정책을 설계한다.

## Migration

모든 변경은 migration으로 기록한다.
