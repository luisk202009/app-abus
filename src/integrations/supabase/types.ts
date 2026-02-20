export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      document_comments: {
        Row: {
          author_email: string
          content: string
          created_at: string
          document_id: string
          id: string
        }
        Insert: {
          author_email: string
          content: string
          created_at?: string
          document_id: string
          id?: string
        }
        Update: {
          author_email?: string
          content?: string
          created_at?: string
          document_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_comments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "user_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_submissions: {
        Row: {
          ai_recommendation: Json | null
          created_at: string
          crm_tag: string | null
          current_location: string | null
          email: string | null
          full_name: string | null
          id: string
          monthly_income: number | null
          nationality: string | null
          professional_profile: string | null
          savings_range: string | null
          stripe_customer_id: string | null
          subscription_status: string | null
          total_routes_created: number
          user_id: string | null
        }
        Insert: {
          ai_recommendation?: Json | null
          created_at?: string
          crm_tag?: string | null
          current_location?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          monthly_income?: number | null
          nationality?: string | null
          professional_profile?: string | null
          savings_range?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          total_routes_created?: number
          user_id?: string | null
        }
        Update: {
          ai_recommendation?: Json | null
          created_at?: string
          crm_tag?: string | null
          current_location?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          monthly_income?: number | null
          nationality?: string | null
          professional_profile?: string | null
          savings_range?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          total_routes_created?: number
          user_id?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          currency: string
          features: Json
          id: string
          interval: string
          is_active: boolean
          max_routes: number
          name: string
          price_cents: number
          slug: string
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          features?: Json
          id?: string
          interval?: string
          is_active?: boolean
          max_routes?: number
          name: string
          price_cents?: number
          slug: string
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          features?: Json
          id?: string
          interval?: string
          is_active?: boolean
          max_routes?: number
          name?: string
          price_cents?: number
          slug?: string
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          file_name: string | null
          file_url: string | null
          id: string
          is_active: boolean
          plan_requirement: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_active?: boolean
          plan_requirement?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_active?: boolean
          plan_requirement?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      route_template_steps: {
        Row: {
          description: string | null
          id: string
          step_order: number | null
          template_id: string | null
          title: string
        }
        Insert: {
          description?: string | null
          id?: string
          step_order?: number | null
          template_id?: string | null
          title: string
        }
        Update: {
          description?: string | null
          id?: string
          step_order?: number | null
          template_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_template_steps_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "route_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      route_templates: {
        Row: {
          country: string | null
          description: string | null
          difficulty: string | null
          estimated_cost: string | null
          id: string
          name: string
          required_savings: string | null
        }
        Insert: {
          country?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_cost?: string | null
          id?: string
          name: string
          required_savings?: string | null
        }
        Update: {
          country?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_cost?: string | null
          id?: string
          name?: string
          required_savings?: string | null
        }
        Relationships: []
      }
      step_attachments: {
        Row: {
          created_at: string
          document_type: string
          file_url: string | null
          id: string
          step_id: string
        }
        Insert: {
          created_at?: string
          document_type: string
          file_url?: string | null
          id?: string
          step_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_url?: string | null
          id?: string
          step_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "step_attachments_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "user_route_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      step_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          step_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          step_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          step_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "step_notes_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "user_route_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      user_active_routes: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          template_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          template_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          template_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_active_routes_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "route_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_documents: {
        Row: {
          category: string
          created_at: string | null
          document_type: string
          file_name: string | null
          file_url: string | null
          id: string
          route_type: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          validation_message: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          document_type: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          route_type?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          validation_message?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          document_type?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          route_type?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          validation_message?: string | null
        }
        Relationships: []
      }
      user_route_progress: {
        Row: {
          id: string
          is_completed: boolean | null
          step_description: string | null
          step_title: string | null
          user_route_id: string | null
        }
        Insert: {
          id?: string
          is_completed?: boolean | null
          step_description?: string | null
          step_title?: string | null
          user_route_id?: string | null
        }
        Update: {
          id?: string
          is_completed?: boolean | null
          step_description?: string | null
          step_title?: string | null
          user_route_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_route_progress_user_route_id_fkey"
            columns: ["user_route_id"]
            isOneToOne: false
            referencedRelation: "user_active_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tasks: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          lead_id: string | null
          status: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string | null
          status?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string | null
          status?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "onboarding_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          accepts_updates: boolean
          country: string
          created_at: string
          email: string
          id: string
        }
        Insert: {
          accepts_updates?: boolean
          country: string
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          accepts_updates?: boolean
          country?: string
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
