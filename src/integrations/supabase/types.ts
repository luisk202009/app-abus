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
      case_management: {
        Row: {
          appointment_date: string | null
          appointment_lot: string | null
          appointment_notes: string | null
          created_at: string | null
          id: string
          inquiry_id: string | null
          lawyer_notes: string | null
          stage: string | null
          tie_appointment_date: string | null
          tie_status: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          appointment_date?: string | null
          appointment_lot?: string | null
          appointment_notes?: string | null
          created_at?: string | null
          id?: string
          inquiry_id?: string | null
          lawyer_notes?: string | null
          stage?: string | null
          tie_appointment_date?: string | null
          tie_status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          appointment_date?: string | null
          appointment_lot?: string | null
          appointment_notes?: string | null
          created_at?: string | null
          id?: string
          inquiry_id?: string | null
          lawyer_notes?: string | null
          stage?: string | null
          tie_appointment_date?: string | null
          tie_status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_management_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "lawyer_inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
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
      lawyer_inquiries: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          id: string
          lawyer_id: string | null
          message: string | null
          status: string | null
          submission_id: string | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          lawyer_id?: string | null
          message?: string | null
          status?: string | null
          submission_id?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          lawyer_id?: string | null
          message?: string | null
          status?: string | null
          submission_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lawyer_inquiries_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawyer_inquiries_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "onboarding_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      lawyer_services: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          is_active: boolean | null
          lawyer_id: string | null
          price: number | null
          service_type_id: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          lawyer_id?: string | null
          price?: number | null
          service_type_id?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          lawyer_id?: string | null
          price?: number | null
          service_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lawyer_services_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawyer_services_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      lawyers: {
        Row: {
          bar_number: string | null
          bio: string | null
          city: string | null
          college: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          phone: string | null
          photo_url: string | null
          specialties: string[] | null
          user_id: string | null
        }
        Insert: {
          bar_number?: string | null
          bio?: string | null
          city?: string | null
          college?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          phone?: string | null
          photo_url?: string | null
          specialties?: string[] | null
          user_id?: string | null
        }
        Update: {
          bar_number?: string | null
          bio?: string | null
          city?: string | null
          college?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          phone?: string | null
          photo_url?: string | null
          specialties?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      onboarding_submissions: {
        Row: {
          ai_recommendation: Json | null
          avatar_url: string | null
          created_at: string
          crm_tag: string | null
          current_location: string | null
          email: string | null
          full_name: string | null
          id: string
          monthly_income: number | null
          nationality: string | null
          next_billing_date: string | null
          professional_profile: string | null
          savings_range: string | null
          stripe_customer_id: string | null
          subscription_status: string | null
          total_routes_created: number
          user_id: string | null
        }
        Insert: {
          ai_recommendation?: Json | null
          avatar_url?: string | null
          created_at?: string
          crm_tag?: string | null
          current_location?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          monthly_income?: number | null
          nationality?: string | null
          next_billing_date?: string | null
          professional_profile?: string | null
          savings_range?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          total_routes_created?: number
          user_id?: string | null
        }
        Update: {
          ai_recommendation?: Json | null
          avatar_url?: string | null
          created_at?: string
          crm_tag?: string | null
          current_location?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          monthly_income?: number | null
          nationality?: string | null
          next_billing_date?: string | null
          professional_profile?: string | null
          savings_range?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          total_routes_created?: number
          user_id?: string | null
        }
        Relationships: []
      }
      partner_assignments: {
        Row: {
          assigned_at: string
          case_status: string
          id: string
          notes: string | null
          partner_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          case_status?: string
          id?: string
          notes?: string | null
          partner_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          case_status?: string
          id?: string
          notes?: string | null
          partner_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_assignments_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          created_at: string
          id: string
          team_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          team_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          team_name?: string
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          currency: string
          features: Json
          has_appointments: boolean
          has_business: boolean
          has_documents: boolean
          has_fiscal_simulator: boolean
          has_life_in_spain: boolean
          has_referrals: boolean
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
          has_appointments?: boolean
          has_business?: boolean
          has_documents?: boolean
          has_fiscal_simulator?: boolean
          has_life_in_spain?: boolean
          has_referrals?: boolean
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
          has_appointments?: boolean
          has_business?: boolean
          has_documents?: boolean
          has_fiscal_simulator?: boolean
          has_life_in_spain?: boolean
          has_referrals?: boolean
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
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referred_name: string | null
          referred_user_id: string | null
          referrer_id: string
          reward_amount: number
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          referred_name?: string | null
          referred_user_id?: string | null
          referrer_id: string
          reward_amount?: number
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          referred_name?: string | null
          referred_user_id?: string | null
          referrer_id?: string
          reward_amount?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
        ]
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
      service_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
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
      tie_checklist_items: {
        Row: {
          case_id: string | null
          id: string
          is_completed: boolean | null
          item: string
          order_index: number | null
          updated_at: string | null
        }
        Insert: {
          case_id?: string | null
          id?: string
          is_completed?: boolean | null
          item: string
          order_index?: number | null
          updated_at?: string | null
        }
        Update: {
          case_id?: string | null
          id?: string
          is_completed?: boolean | null
          item?: string
          order_index?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tie_checklist_items_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "case_management"
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
      user_appointments: {
        Row: {
          application_status: string | null
          appointment_date: string | null
          appointment_time: string | null
          created_at: string | null
          id: string
          lot_number: string | null
          police_station_address: string | null
          tie_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          application_status?: string | null
          appointment_date?: string | null
          appointment_time?: string | null
          created_at?: string | null
          id?: string
          lot_number?: string | null
          police_station_address?: string | null
          tie_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          application_status?: string | null
          appointment_date?: string | null
          appointment_time?: string | null
          created_at?: string | null
          id?: string
          lot_number?: string | null
          police_station_address?: string | null
          tie_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_assigned_to_partner: { Args: { _user_id: string }; Returns: boolean }
      is_partner: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
