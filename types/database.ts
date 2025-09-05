export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          phone: string;
          email: string | null;
          name: string;
          age: number;
          gender: string;
          occupation: string;
          school_state: string | null;
          location_type: string;
          state: string | null;
          lga: string | null;
          current_location: string | null;
          personality_type: string | null;
          relationship_intention: string | null;
          religion: string | null;
          tribe: string | null;
          education_level: string | null;
          smoking: string | null;
          drinking: string | null;
          children: string | null;
          height: string | null;
          body_type: string | null;
          complexion: string | null;
          bio: string | null;
          interests: string[] | null;
          partner_values: string[] | null;
          personality_archetype: string | null;
          verification_status: string;
          verification_photo_url: string | null;
          profile_photos: string[] | null;
          is_premium: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          email?: string | null;
          name: string;
          age: number;
          gender: string;
          occupation: string;
          school_state?: string | null;
          location_type: string;
          state?: string | null;
          lga?: string | null;
          current_location?: string | null;
          personality_type?: string | null;
          relationship_intention?: string | null;
          religion?: string | null;
          tribe?: string | null;
          education_level?: string | null;
          smoking?: string | null;
          drinking?: string | null;
          children?: string | null;
          height?: string | null;
          body_type?: string | null;
          complexion?: string | null;
          bio?: string | null;
          interests?: string[] | null;
          partner_values?: string[] | null;
          personality_archetype?: string | null;
          verification_status?: string;
          verification_photo_url?: string | null;
          profile_photos?: string[] | null;
          is_premium?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          email?: string | null;
          name?: string;
          age?: number;
          gender?: string;
          occupation?: string;
          school_state?: string | null;
          location_type?: string;
          state?: string | null;
          lga?: string | null;
          current_location?: string | null;
          personality_type?: string | null;
          relationship_intention?: string | null;
          religion?: string | null;
          tribe?: string | null;
          education_level?: string | null;
          smoking?: string | null;
          drinking?: string | null;
          children?: string | null;
          height?: string | null;
          body_type?: string | null;
          complexion?: string | null;
          bio?: string | null;
          interests?: string[] | null;
          partner_values?: string[] | null;
          personality_archetype?: string | null;
          verification_status?: string;
          verification_photo_url?: string | null;
          profile_photos?: string[] | null;
          is_premium?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          user1_id: string;
          user2_id: string;
          compatibility_score: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user1_id: string;
          user2_id: string;
          compatibility_score: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user1_id?: string;
          user2_id?: string;
          compatibility_score?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          min_age: number;
          max_age: number;
          max_distance: number | null;
          preferred_education: string[] | null;
          preferred_religion: string[] | null;
          preferred_tribe: string[] | null;
          preferred_complexion: string[] | null;
          deal_breakers: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          min_age?: number;
          max_age?: number;
          max_distance?: number | null;
          preferred_education?: string[] | null;
          preferred_religion?: string[] | null;
          preferred_tribe?: string[] | null;
          preferred_complexion?: string[] | null;
          deal_breakers?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          min_age?: number;
          max_age?: number;
          max_distance?: number | null;
          preferred_education?: string[] | null;
          preferred_religion?: string[] | null;
          preferred_tribe?: string[] | null;
          preferred_complexion?: string[] | null;
          deal_breakers?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calculate_compatibility: {
        Args: {
          user1_id: string;
          user2_id: string;
        };
        Returns: number;
      };
    };
    Enums: {
      verification_status: 'pending' | 'verified' | 'rejected';
      match_status: 'pending' | 'matched' | 'rejected';
    };
  };
}