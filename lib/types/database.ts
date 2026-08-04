/**
 * 손으로 작성한 임시 스키마 타입.
 * 실제 Supabase 프로젝트에 연결한 뒤에는
 * `supabase gen types typescript --linked > lib/types/database.ts` 로 생성된
 * 파일로 교체한다. 그 전까지는 supabase/migrations/*.sql 과 반드시 동기화한다.
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      games: {
        Row: {
          id: string;
          slug: string;
          name_ko: string;
          name_en: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_ko: string;
          name_en: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name_ko?: string;
          name_en?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      expansions: {
        Row: {
          id: string;
          game_id: string;
          slug: string;
          name_ko: string;
          name_en: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          slug: string;
          name_ko: string;
          name_en: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          slug?: string;
          name_ko?: string;
          name_en?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      player_factions: {
        Row: {
          id: string;
          game_id: string;
          expansion_id: string | null;
          group_slug: string | null;
          group_name_ko: string | null;
          group_name_en: string | null;
          slug: string;
          name_ko: string;
          name_en: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          expansion_id?: string | null;
          group_slug?: string | null;
          group_name_ko?: string | null;
          group_name_en?: string | null;
          slug: string;
          name_ko: string;
          name_en: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          expansion_id?: string | null;
          group_slug?: string | null;
          group_name_ko?: string | null;
          group_name_en?: string | null;
          slug?: string;
          name_ko?: string;
          name_en?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          played_at: string;
          terraforming_mars_map_id: string | null;
          include_promo_factions: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
          played_at?: string;
          terraforming_mars_map_id?: string | null;
          include_promo_factions?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          game_id?: string;
          played_at?: string;
          terraforming_mars_map_id?: string | null;
          include_promo_factions?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      match_players: {
        Row: {
          id: string;
          match_id: string;
          name: string;
          score: number;
          rank: number;
          is_win: boolean;
          is_me: boolean;
          faction_id: string | null;
          color: string | null;
          megacredits: number | null;
          score_breakdown: Record<string, number> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          name: string;
          score: number;
          rank: number;
          is_win?: boolean;
          is_me?: boolean;
          faction_id?: string | null;
          color?: string | null;
          megacredits?: number | null;
          score_breakdown?: Record<string, number> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          name?: string;
          score?: number;
          rank?: number;
          is_win?: boolean;
          is_me?: boolean;
          faction_id?: string | null;
          color?: string | null;
          megacredits?: number | null;
          score_breakdown?: Record<string, number> | null;
          created_at?: string;
        };
        Relationships: [];
      };
      match_expansions: {
        Row: {
          match_id: string;
          expansion_id: string;
        };
        Insert: {
          match_id: string;
          expansion_id: string;
        };
        Update: {
          match_id?: string;
          expansion_id?: string;
        };
        Relationships: [];
      };
      terraforming_mars_maps: {
        Row: {
          id: string;
          map_group_slug: string | null;
          slug: string;
          name_ko: string;
          name_en: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          map_group_slug?: string | null;
          slug: string;
          name_ko: string;
          name_en: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          map_group_slug?: string | null;
          slug?: string;
          name_ko?: string;
          name_en?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      terraforming_mars_colonies: {
        Row: {
          id: string;
          slug: string;
          name_ko: string;
          name_en: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_ko: string;
          name_en: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name_ko?: string;
          name_en?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      match_terraforming_mars_colonies: {
        Row: {
          match_id: string;
          colony_id: string;
        };
        Insert: {
          match_id: string;
          colony_id: string;
        };
        Update: {
          match_id?: string;
          colony_id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_display_name_available: {
        Args: { p_display_name: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
