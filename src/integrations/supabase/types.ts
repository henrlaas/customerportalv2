export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ad_comments: {
        Row: {
          ad_id: string
          comment: string
          created_at: string
          id: string
          is_resolved: boolean | null
          updated_at: string
          user_id: string
          x: number | null
          y: number | null
        }
        Insert: {
          ad_id: string
          comment: string
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          updated_at?: string
          user_id: string
          x?: number | null
          y?: number | null
        }
        Update: {
          ad_id?: string
          comment?: string
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          updated_at?: string
          user_id?: string
          x?: number | null
          y?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_comments_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_history: {
        Row: {
          action_type: string
          ad_id: string
          created_at: string
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action_type: string
          ad_id: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action_type?: string
          ad_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_history_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          ad_type: string
          adset_id: string
          brand_name: string | null
          created_at: string
          cta_button: string | null
          description: string | null
          description_variations: Json | null
          file_type: string | null
          file_url: string | null
          headline: string | null
          headline_variations: Json | null
          id: string
          keywords: string | null
          keywords_variations: Json | null
          main_text: string | null
          main_text_variations: Json | null
          name: string
          updated_at: string
          url: string | null
        }
        Insert: {
          ad_type: string
          adset_id: string
          brand_name?: string | null
          created_at?: string
          cta_button?: string | null
          description?: string | null
          description_variations?: Json | null
          file_type?: string | null
          file_url?: string | null
          headline?: string | null
          headline_variations?: Json | null
          id?: string
          keywords?: string | null
          keywords_variations?: Json | null
          main_text?: string | null
          main_text_variations?: Json | null
          name: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          ad_type?: string
          adset_id?: string
          brand_name?: string | null
          created_at?: string
          cta_button?: string | null
          description?: string | null
          description_variations?: Json | null
          file_type?: string | null
          file_url?: string | null
          headline?: string | null
          headline_variations?: Json | null
          id?: string
          keywords?: string | null
          keywords_variations?: Json | null
          main_text?: string | null
          main_text_variations?: Json | null
          name?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_adset_id_fkey"
            columns: ["adset_id"]
            isOneToOne: false
            referencedRelation: "adsets"
            referencedColumns: ["id"]
          },
        ]
      }
      adsets: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          name: string
          targeting: string | null
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          name: string
          targeting?: string | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          name?: string
          targeting?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "adsets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_media: {
        Row: {
          campaign_id: string | null
          created_at: string
          created_by: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          created_by?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          created_by?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_media_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          associated_user_id: string | null
          budget: number | null
          company_id: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_ongoing: boolean | null
          name: string
          platform: string | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          associated_user_id?: string | null
          budget?: number | null
          company_id: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_ongoing?: boolean | null
          name: string
          platform?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          associated_user_id?: string | null
          budget?: number | null
          company_id?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_ongoing?: boolean | null
          name?: string
          platform?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          advisor_id: string | null
          city: string | null
          client_type: string | null
          country: string | null
          created_at: string
          id: string
          invoice_email: string | null
          is_marketing_client: boolean | null
          is_partner: boolean | null
          is_web_client: boolean | null
          logo_url: string | null
          mrr: number | null
          name: string
          organization_number: string | null
          parent_id: string | null
          phone: string | null
          postal_code: string | null
          street_address: string | null
          trial_period: boolean | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          advisor_id?: string | null
          city?: string | null
          client_type?: string | null
          country?: string | null
          created_at?: string
          id?: string
          invoice_email?: string | null
          is_marketing_client?: boolean | null
          is_partner?: boolean | null
          is_web_client?: boolean | null
          logo_url?: string | null
          mrr?: number | null
          name: string
          organization_number?: string | null
          parent_id?: string | null
          phone?: string | null
          postal_code?: string | null
          street_address?: string | null
          trial_period?: boolean | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          advisor_id?: string | null
          city?: string | null
          client_type?: string | null
          country?: string | null
          created_at?: string
          id?: string
          invoice_email?: string | null
          is_marketing_client?: boolean | null
          is_partner?: boolean | null
          is_web_client?: boolean | null
          logo_url?: string | null
          mrr?: number | null
          name?: string
          organization_number?: string | null
          parent_id?: string | null
          phone?: string | null
          postal_code?: string | null
          street_address?: string | null
          trial_period?: boolean | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_contacts: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_admin: boolean | null
          is_primary: boolean | null
          position: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_admin?: boolean | null
          is_primary?: boolean | null
          position?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_admin?: boolean | null
          is_primary?: boolean | null
          position?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_admin: boolean
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_admin?: boolean
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_admin?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          end_date: string | null
          file_url: string | null
          id: string
          start_date: string | null
          status: string
          title: string
          updated_at: string
          value: number | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          file_url?: string | null
          id?: string
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          file_url?: string | null
          id?: string
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_stages: {
        Row: {
          created_at: string
          id: string
          name: string
          position: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          position: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: number
        }
        Relationships: []
      }
      deals: {
        Row: {
          assigned_to: string | null
          client_deal_type: string | null
          company_id: string | null
          created_at: string
          created_by: string | null
          deal_type: string | null
          description: string | null
          expected_close_date: string | null
          id: string
          is_recurring: boolean | null
          probability: number | null
          stage_id: string | null
          title: string
          updated_at: string
          value: number | null
        }
        Insert: {
          assigned_to?: string | null
          client_deal_type?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          deal_type?: string | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          is_recurring?: boolean | null
          probability?: number | null
          stage_id?: string | null
          title: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          assigned_to?: string | null
          client_deal_type?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          deal_type?: string | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          is_recurring?: boolean | null
          probability?: number | null
          stage_id?: string | null
          title?: string
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "deal_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          account_number: string
          address: string
          city: string
          country: string
          created_at: string
          employed_percentage: number
          employee_type: string
          hourly_salary: number
          id: string
          paycheck_solution: string
          social_security_number: string
          updated_at: string
          zipcode: string
        }
        Insert: {
          account_number: string
          address: string
          city: string
          country: string
          created_at?: string
          employed_percentage: number
          employee_type: string
          hourly_salary: number
          id: string
          paycheck_solution: string
          social_security_number: string
          updated_at?: string
          zipcode: string
        }
        Update: {
          account_number?: string
          address?: string
          city?: string
          country?: string
          created_at?: string
          employed_percentage?: number
          employee_type?: string
          hourly_salary?: number
          id?: string
          paycheck_solution?: string
          social_security_number?: string
          updated_at?: string
          zipcode?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          created_by: string | null
          date: string
          description: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          date: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          company_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          amount: number
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      media_favorites: {
        Row: {
          bucket_id: string
          created_at: string
          file_path: string
          id: string
          user_id: string
        }
        Insert: {
          bucket_id?: string
          created_at?: string
          file_path: string
          id?: string
          user_id: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          file_path?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      media_metadata: {
        Row: {
          bucket_id: string | null
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          original_name: string | null
          tags: string[] | null
          upload_date: string
          uploaded_by: string | null
        }
        Insert: {
          bucket_id?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          original_name?: string | null
          tags?: string[] | null
          upload_date?: string
          uploaded_by?: string | null
        }
        Update: {
          bucket_id?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          original_name?: string | null
          tags?: string[] | null
          upload_date?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          is_client: boolean | null
          language: string
          last_name: string | null
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"]
          team: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          is_client?: boolean | null
          language?: string
          last_name?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          team?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          is_client?: boolean | null
          language?: string
          last_name?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          team?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      task_assignees: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignees_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_attachments: {
        Row: {
          created_at: string | null
          created_by: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          task_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          task_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          campaign_id: string | null
          client_visible: boolean | null
          created_at: string
          created_by: string | null
          creator_id: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string
          related_type: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          campaign_id?: string | null
          client_visible?: boolean | null
          created_at?: string
          created_by?: string | null
          creator_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          related_type?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          campaign_id?: string | null
          client_visible?: boolean | null
          created_at?: string
          created_by?: string | null
          creator_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          related_type?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      temp_deal_companies: {
        Row: {
          company_name: string
          created_at: string
          created_by: string | null
          deal_id: string | null
          id: string
          organization_number: string | null
          website: string | null
        }
        Insert: {
          company_name: string
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          id?: string
          organization_number?: string | null
          website?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          id?: string
          organization_number?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "temp_deal_companies_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      temp_deal_contacts: {
        Row: {
          created_at: string
          created_by: string | null
          deal_id: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          position: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          position?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          position?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "temp_deal_contacts_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          created_at: string
          description: string | null
          end_time: string | null
          id: string
          is_running: boolean | null
          start_time: string
          task_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          is_running?: boolean | null
          start_time: string
          task_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          is_running?: boolean | null
          start_time?: string
          task_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      convert_temp_deal_company: {
        Args: {
          deal_id_param: string
          name_param: string
          organization_number_param: string
          is_marketing_param: boolean
          is_web_param: boolean
          website_param: string
          phone_param: string
          invoice_email_param: string
          street_address_param: string
          city_param: string
          postal_code_param: string
          country_param: string
          advisor_id_param: string
          mrr_param: number
          trial_period_param: boolean
          is_partner_param: boolean
          created_by_param: string
        }
        Returns: string
      }
      create_admin_user: {
        Args: { admin_email: string }
        Returns: string
      }
      duplicate_campaign: {
        Args: { campaign_id_param: string }
        Returns: string
      }
      get_accessible_companies: {
        Args: { user_uuid: string }
        Returns: string[]
      }
      get_employees_with_profiles: {
        Args: Record<PropertyKey, never>
        Returns: Json[]
      }
      get_user_display_name: {
        Args: { user_id: string }
        Returns: string
      }
      get_users_email: {
        Args: { user_ids: string[] }
        Returns: {
          id: string
          email: string
        }[]
      }
      has_role: {
        Args: { requested_role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
      is_company_admin: {
        Args: { company_uuid: string }
        Returns: boolean
      }
      is_company_member: {
        Args: { company_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "employee" | "client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "employee", "client"],
    },
  },
} as const
