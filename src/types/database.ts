export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          name: string | null;
          role: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          name?: string | null;
          role?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          email?: string | null;
          name?: string | null;
          role?: string;
          is_active?: boolean;
        };
      };
      menus: {
        Row: {
          id: string;
          parent_id: string | null;
          title: string;
          order_index: number;
          depth: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_id?: string | null;
          title: string;
          order_index?: number;
          depth: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          parent_id?: string | null;
          title?: string;
          order_index?: number;
          depth?: number;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          status: string;
          menu_id: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content?: string;
          status?: string;
          menu_id?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          content?: string;
          status?: string;
          menu_id?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
      };
      document_history: {
        Row: {
          id: string;
          document_id: string;
          content: string;
          updated_by: string | null;
          updated_at: string;
          summary: string | null;
        };
        Insert: {
          id?: string;
          document_id: string;
          content: string;
          updated_by?: string | null;
          updated_at?: string;
          summary?: string | null;
        };
        Update: never;
      };
    };
  };
}
