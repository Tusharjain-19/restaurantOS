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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          category: string
          created_at: string
          id: string
          key: string
          restaurant_id: string
          updated_at: string
          value: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          key: string
          restaurant_id: string
          updated_at?: string
          value?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          key?: string
          restaurant_id?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_payments: {
        Row: {
          amount: number
          bill_id: string
          created_at: string
          id: string
          method: string
          reference: string | null
        }
        Insert: {
          amount?: number
          bill_id: string
          created_at?: string
          id?: string
          method?: string
          reference?: string | null
        }
        Update: {
          amount?: number
          bill_id?: string
          created_at?: string
          id?: string
          method?: string
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bill_payments_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          bill_number: string | null
          bill_type: string | null
          cashier_id: string | null
          cgst: number | null
          created_at: string
          delivery_charge: number | null
          discount_amount: number | null
          discount_pct: number | null
          discount_reason: string | null
          grand_total: number | null
          id: string
          order_id: string
          packaging_charge: number | null
          restaurant_id: string | null
          round_off: number | null
          service_charge: number | null
          settled_at: string | null
          sgst: number | null
          status: Database["public"]["Enums"]["bill_status"] | null
          subtotal: number | null
          taxable_amount: number | null
          updated_at: string
          void_reason: string | null
        }
        Insert: {
          bill_number?: string | null
          bill_type?: string | null
          cashier_id?: string | null
          cgst?: number | null
          created_at?: string
          delivery_charge?: number | null
          discount_amount?: number | null
          discount_pct?: number | null
          discount_reason?: string | null
          grand_total?: number | null
          id?: string
          order_id: string
          packaging_charge?: number | null
          restaurant_id?: string | null
          round_off?: number | null
          service_charge?: number | null
          settled_at?: string | null
          sgst?: number | null
          status?: Database["public"]["Enums"]["bill_status"] | null
          subtotal?: number | null
          taxable_amount?: number | null
          updated_at?: string
          void_reason?: string | null
        }
        Update: {
          bill_number?: string | null
          bill_type?: string | null
          cashier_id?: string | null
          cgst?: number | null
          created_at?: string
          delivery_charge?: number | null
          discount_amount?: number | null
          discount_pct?: number | null
          discount_reason?: string | null
          grand_total?: number | null
          id?: string
          order_id?: string
          packaging_charge?: number | null
          restaurant_id?: string | null
          round_off?: number | null
          service_charge?: number | null
          settled_at?: string | null
          sgst?: number | null
          status?: Database["public"]["Enums"]["bill_status"] | null
          subtotal?: number | null
          taxable_amount?: number | null
          updated_at?: string
          void_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bills_cashier_id_fkey"
            columns: ["cashier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      business_settings: {
        Row: {
          id: number
          key: string
          restaurant_id: string | null
          updated_at: string | null
          value: Json
        }
        Insert: {
          id?: number
          key: string
          restaurant_id?: string | null
          updated_at?: string | null
          value: Json
        }
        Update: {
          id?: number
          key?: string
          restaurant_id?: string | null
          updated_at?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "business_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          birthday: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          preferences: Json | null
          restaurant_id: string
          tier: Database["public"]["Enums"]["customer_tier"]
          total_points: number
          total_spent: number
          total_visits: number
          updated_at: string
        }
        Insert: {
          birthday?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          preferences?: Json | null
          restaurant_id: string
          tier?: Database["public"]["Enums"]["customer_tier"]
          total_points?: number
          total_spent?: number
          total_visits?: number
          updated_at?: string
        }
        Update: {
          birthday?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          preferences?: Json | null
          restaurant_id?: string
          tier?: Database["public"]["Enums"]["customer_tier"]
          total_points?: number
          total_spent?: number
          total_visits?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      floors: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "floors_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      hq_admins: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      ingredients: {
        Row: {
          category: string | null
          cost_per_unit: number | null
          created_at: string
          current_stock: number | null
          id: string
          min_level: number | null
          name: string
          notes: string | null
          restaurant_id: string
          storage_location: string | null
          unit: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string
          current_stock?: number | null
          id?: string
          min_level?: number | null
          name: string
          notes?: string | null
          restaurant_id: string
          storage_location?: string | null
          unit?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string
          current_stock?: number | null
          id?: string
          min_level?: number | null
          name?: string
          notes?: string | null
          restaurant_id?: string
          storage_location?: string | null
          unit?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredients_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      kot_batches: {
        Row: {
          batch_number: number
          id: string
          is_addon: boolean | null
          is_printed: boolean | null
          item_count: number | null
          items_snapshot: Json | null
          kot_number: string
          order_id: string
          printed_at: string | null
          restaurant_id: string
          sent_at: string | null
          sent_by: string | null
          sent_by_name: string | null
          table_id: string | null
          table_number: string | null
        }
        Insert: {
          batch_number: number
          id?: string
          is_addon?: boolean | null
          is_printed?: boolean | null
          item_count?: number | null
          items_snapshot?: Json | null
          kot_number: string
          order_id: string
          printed_at?: string | null
          restaurant_id: string
          sent_at?: string | null
          sent_by?: string | null
          sent_by_name?: string | null
          table_id?: string | null
          table_number?: string | null
        }
        Update: {
          batch_number?: number
          id?: string
          is_addon?: boolean | null
          is_printed?: boolean | null
          item_count?: number | null
          items_snapshot?: Json | null
          kot_number?: string
          order_id?: string
          printed_at?: string | null
          restaurant_id?: string
          sent_at?: string | null
          sent_by?: string | null
          sent_by_name?: string | null
          table_id?: string | null
          table_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kot_batches_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kot_batches_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kot_batches_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kot_batches_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      kots: {
        Row: {
          created_at: string
          id: string
          items: Json
          kot_number: number
          order_id: string | null
          order_type: string
          restaurant_id: string | null
          staff_name: string | null
          status: string
          table_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          items?: Json
          kot_number: number
          order_id?: string | null
          order_type?: string
          restaurant_id?: string | null
          staff_name?: string | null
          status?: string
          table_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          kot_number?: number
          order_id?: string | null
          order_type?: string
          restaurant_id?: string | null
          staff_name?: string | null
          status?: string
          table_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kots_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kots_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          account_details: string | null
          admin_password: string
          admin_username: string
          client_email: string | null
          client_mobile: string | null
          created_at: string | null
          expires_at: string
          id: string
          is_active: boolean | null
          license_key: string
          restaurant_id: string | null
          restaurant_name: string
          subscription_plan: string | null
        }
        Insert: {
          account_details?: string | null
          admin_password: string
          admin_username: string
          client_email?: string | null
          client_mobile?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          license_key: string
          restaurant_id?: string | null
          restaurant_name: string
          subscription_plan?: string | null
        }
        Update: {
          account_details?: string | null
          admin_password?: string
          admin_username?: string
          client_email?: string | null
          client_mobile?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          license_key?: string
          restaurant_id?: string | null
          restaurant_name?: string
          subscription_plan?: string | null
        }
        Relationships: []
      }
      loyalty_settings: {
        Row: {
          birthday_discount_pct: number | null
          bronze_threshold: number
          created_at: string
          earn_per_amount: number
          earn_rate: number
          gold_threshold: number
          id: string
          min_bill_for_points: number | null
          platinum_threshold: number
          points_expiry: string | null
          redeem_rate: number
          restaurant_id: string
          silver_threshold: number
          updated_at: string
        }
        Insert: {
          birthday_discount_pct?: number | null
          bronze_threshold?: number
          created_at?: string
          earn_per_amount?: number
          earn_rate?: number
          gold_threshold?: number
          id?: string
          min_bill_for_points?: number | null
          platinum_threshold?: number
          points_expiry?: string | null
          redeem_rate?: number
          restaurant_id: string
          silver_threshold?: number
          updated_at?: string
        }
        Update: {
          birthday_discount_pct?: number | null
          bronze_threshold?: number
          created_at?: string
          earn_per_amount?: number
          earn_rate?: number
          gold_threshold?: number
          id?: string
          min_bill_for_points?: number | null
          platinum_threshold?: number
          points_expiry?: string | null
          redeem_rate?: number
          restaurant_id?: string
          silver_threshold?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      master_activations: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          master_password: string
          master_username: string
          restaurant_id: string | null
          restaurant_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          master_password: string
          master_username: string
          restaurant_id?: string | null
          restaurant_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          master_password?: string
          master_username?: string
          restaurant_id?: string | null
          restaurant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "master_activations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string
          display_order: number | null
          emoji: string | null
          id: string
          is_active: boolean | null
          item_type: string | null
          name: string
          restaurant_id: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          emoji?: string | null
          id?: string
          is_active?: boolean | null
          item_type?: string | null
          name: string
          restaurant_id?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          emoji?: string | null
          id?: string
          is_active?: boolean | null
          item_type?: string | null
          name?: string
          restaurant_id?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          base_price: number | null
          category_id: string
          created_at: string
          description: string | null
          display_order: number | null
          hsn_code: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          is_featured: boolean | null
          item_type: string | null
          name: string
          price: number
          restaurant_id: string | null
          tax_rate: number | null
          updated_at: string
        }
        Insert: {
          base_price?: number | null
          category_id: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          hsn_code?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_featured?: boolean | null
          item_type?: string | null
          name: string
          price?: number
          restaurant_id?: string | null
          tax_rate?: number | null
          updated_at?: string
        }
        Update: {
          base_price?: number | null
          category_id?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          hsn_code?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_featured?: boolean | null
          item_type?: string | null
          name?: string
          price?: number
          restaurant_id?: string | null
          tax_rate?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_variants: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_available: boolean | null
          is_default: boolean | null
          item_id: string
          modifier_type: string | null
          name: string
          price: number | null
          price_modifier: number | null
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_available?: boolean | null
          is_default?: boolean | null
          item_id: string
          modifier_type?: string | null
          name: string
          price?: number | null
          price_modifier?: number | null
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_available?: boolean | null
          is_default?: boolean | null
          item_id?: string
          modifier_type?: string | null
          name?: string
          price?: number | null
          price_modifier?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_variants_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          added_by: string | null
          created_at: string
          id: string
          is_addon: boolean | null
          item_id: string
          item_name: string | null
          kot_batch: number | null
          kot_number: number | null
          kot_sent_at: string | null
          kot_status: Database["public"]["Enums"]["kot_status"] | null
          order_id: string
          qty: number
          restaurant_id: string | null
          special_instructions: string | null
          unit_price: number
          updated_at: string
          variant_id: string | null
          variant_name: string | null
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          id?: string
          is_addon?: boolean | null
          item_id: string
          item_name?: string | null
          kot_batch?: number | null
          kot_number?: number | null
          kot_sent_at?: string | null
          kot_status?: Database["public"]["Enums"]["kot_status"] | null
          order_id: string
          qty?: number
          restaurant_id?: string | null
          special_instructions?: string | null
          unit_price?: number
          updated_at?: string
          variant_id?: string | null
          variant_name?: string | null
        }
        Update: {
          added_by?: string | null
          created_at?: string
          id?: string
          is_addon?: boolean | null
          item_id?: string
          item_name?: string | null
          kot_batch?: number | null
          kot_number?: number | null
          kot_sent_at?: string | null
          kot_status?: Database["public"]["Enums"]["kot_status"] | null
          order_id?: string
          qty?: number
          restaurant_id?: string | null
          special_instructions?: string | null
          unit_price?: number
          updated_at?: string
          variant_id?: string | null
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "menu_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_address: string | null
          customer_name: string | null
          customer_phone: string | null
          floor_id: string | null
          guest_count: number | null
          id: string
          is_priority: boolean | null
          notes: string | null
          order_type: string | null
          restaurant_id: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          table_id: string | null
          token_number: number | null
          updated_at: string
          waiter_id: string | null
        }
        Insert: {
          created_at?: string
          customer_address?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          floor_id?: string | null
          guest_count?: number | null
          id?: string
          is_priority?: boolean | null
          notes?: string | null
          order_type?: string | null
          restaurant_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          table_id?: string | null
          token_number?: number | null
          updated_at?: string
          waiter_id?: string | null
        }
        Update: {
          created_at?: string
          customer_address?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          floor_id?: string | null
          guest_count?: number | null
          id?: string
          is_priority?: boolean | null
          notes?: string | null
          order_type?: string | null
          restaurant_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          table_id?: string | null
          token_number?: number | null
          updated_at?: string
          waiter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_floor_id_fkey"
            columns: ["floor_id"]
            isOneToOne: false
            referencedRelation: "floors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_waiter_id_fkey"
            columns: ["waiter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      po_items: {
        Row: {
          created_at: string
          id: string
          ingredient_id: string
          po_id: string
          qty_ordered: number | null
          qty_received: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_id: string
          po_id: string
          qty_ordered?: number | null
          qty_received?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_id?: string
          po_id?: string
          qty_ordered?: number | null
          qty_received?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "po_items_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "po_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      points_log: {
        Row: {
          balance_after: number
          bill_id: string | null
          created_at: string
          customer_id: string
          id: string
          points: number
          reason: string | null
          type: Database["public"]["Enums"]["points_type"]
        }
        Insert: {
          balance_after?: number
          bill_id?: string | null
          created_at?: string
          customer_id: string
          id?: string
          points?: number
          reason?: string | null
          type?: Database["public"]["Enums"]["points_type"]
        }
        Update: {
          balance_after?: number
          bill_id?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          points?: number
          reason?: string | null
          type?: Database["public"]["Enums"]["points_type"]
        }
        Relationships: [
          {
            foreignKeyName: "points_log_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_log_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      printers: {
        Row: {
          connection: string | null
          created_at: string
          has_cash_drawer: boolean | null
          id: string
          ip_address: string | null
          is_default: boolean | null
          name: string
          paper_width: string | null
          restaurant_id: string
          type: string | null
          updated_at: string
        }
        Insert: {
          connection?: string | null
          created_at?: string
          has_cash_drawer?: boolean | null
          id?: string
          ip_address?: string | null
          is_default?: boolean | null
          name: string
          paper_width?: string | null
          restaurant_id: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          connection?: string | null
          created_at?: string
          has_cash_drawer?: boolean | null
          id?: string
          ip_address?: string | null
          is_default?: boolean | null
          name?: string
          paper_width?: string | null
          restaurant_id?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "printers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          pin_hash: string | null
          restaurant_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          pin_hash?: string | null
          restaurant_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          pin_hash?: string | null
          restaurant_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          expected_date: string | null
          id: string
          notes: string | null
          restaurant_id: string
          status: Database["public"]["Enums"]["po_status"] | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          expected_date?: string | null
          id?: string
          notes?: string | null
          restaurant_id: string
          status?: Database["public"]["Enums"]["po_status"] | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          expected_date?: string | null
          id?: string
          notes?: string | null
          restaurant_id?: string
          status?: Database["public"]["Enums"]["po_status"] | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      realtime_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          payload: Json | null
          restaurant_id: string
          triggered_by: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          restaurant_id: string
          triggered_by?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          restaurant_id?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "realtime_events_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "realtime_events_triggered_by_fkey"
            columns: ["triggered_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          created_at: string
          id: string
          ingredient_id: string
          menu_item_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_id: string
          menu_item_id: string
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_id?: string
          menu_item_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipes_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          covers: number | null
          created_at: string
          customer_name: string
          customer_phone: string | null
          date: string
          id: string
          notes: string | null
          restaurant_id: string
          special_requests: string | null
          status: Database["public"]["Enums"]["reservation_status"] | null
          table_id: string
          time: string
          updated_at: string
        }
        Insert: {
          covers?: number | null
          created_at?: string
          customer_name: string
          customer_phone?: string | null
          date: string
          id?: string
          notes?: string | null
          restaurant_id: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["reservation_status"] | null
          table_id: string
          time: string
          updated_at?: string
        }
        Update: {
          covers?: number | null
          created_at?: string
          customer_name?: string
          customer_phone?: string | null
          date?: string
          id?: string
          notes?: string | null
          restaurant_id?: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["reservation_status"] | null
          table_id?: string
          time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_activations: {
        Row: {
          activated_at: string | null
          activation_key: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_staff: number | null
          notes: string | null
          plan: string | null
          restaurant_id: string | null
        }
        Insert: {
          activated_at?: string | null
          activation_key: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_staff?: number | null
          notes?: string | null
          plan?: string | null
          restaurant_id?: string | null
        }
        Update: {
          activated_at?: string | null
          activation_key?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_staff?: number | null
          notes?: string | null
          plan?: string | null
          restaurant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_activations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "hq_admins"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          activation_key: string | null
          address_1: string | null
          address_2: string | null
          city: string | null
          country: string | null
          created_at: string
          currency: string | null
          email: string | null
          facebook: string | null
          fssai: string | null
          gstin: string | null
          id: string
          instagram: string | null
          is_active: boolean | null
          logo_url: string | null
          name: string
          onboarding_complete: boolean | null
          pan: string | null
          phone: string | null
          pin: string | null
          settings: Json | null
          state: string | null
          timezone: string | null
          type: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          activation_key?: string | null
          address_1?: string | null
          address_2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          email?: string | null
          facebook?: string | null
          fssai?: string | null
          gstin?: string | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          onboarding_complete?: boolean | null
          pan?: string | null
          phone?: string | null
          pin?: string | null
          settings?: Json | null
          state?: string | null
          timezone?: string | null
          type?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          activation_key?: string | null
          address_1?: string | null
          address_2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          email?: string | null
          facebook?: string | null
          fssai?: string | null
          gstin?: string | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          onboarding_complete?: boolean | null
          pan?: string | null
          phone?: string | null
          pin?: string | null
          settings?: Json | null
          state?: string | null
          timezone?: string | null
          type?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          avatar_color: string | null
          avatar_url: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean | null
          joining_date: string | null
          last_login: string | null
          name: string
          password_hash: string | null
          phone: string | null
          pin: string | null
          restaurant_id: string | null
          role: string
          salary: number | null
          shift: string | null
          staff_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_color?: string | null
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          joining_date?: string | null
          last_login?: string | null
          name: string
          password_hash?: string | null
          phone?: string | null
          pin?: string | null
          restaurant_id?: string | null
          role?: string
          salary?: number | null
          shift?: string | null
          staff_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_color?: string | null
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          joining_date?: string | null
          last_login?: string | null
          name?: string
          password_hash?: string | null
          phone?: string | null
          pin?: string | null
          restaurant_id?: string | null
          role?: string
          salary?: number | null
          shift?: string | null
          staff_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_adjustments: {
        Row: {
          adjusted_by: string | null
          created_at: string
          id: string
          ingredient_id: string
          qty_change: number
          reason: string | null
          restaurant_id: string
        }
        Insert: {
          adjusted_by?: string | null
          created_at?: string
          id?: string
          ingredient_id: string
          qty_change?: number
          reason?: string | null
          restaurant_id: string
        }
        Update: {
          adjusted_by?: string | null
          created_at?: string
          id?: string
          ingredient_id?: string
          qty_change?: number
          reason?: string | null
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_adjustments_adjusted_by_fkey"
            columns: ["adjusted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_adjustments_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_adjustments_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      tables: {
        Row: {
          capacity: number | null
          created_at: string
          current_order_id: string | null
          floor_id: string
          id: string
          number: string
          restaurant_id: string | null
          shape: string | null
          status: Database["public"]["Enums"]["table_status"] | null
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          current_order_id?: string | null
          floor_id: string
          id?: string
          number: string
          restaurant_id?: string | null
          shape?: string | null
          status?: Database["public"]["Enums"]["table_status"] | null
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          current_order_id?: string | null
          floor_id?: string
          id?: string
          number?: string
          restaurant_id?: string | null
          shape?: string | null
          status?: Database["public"]["Enums"]["table_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tables_floor_id_fkey"
            columns: ["floor_id"]
            isOneToOne: false
            referencedRelation: "floors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_config: {
        Row: {
          created_at: string
          id: string
          packaging_charge: number | null
          restaurant_id: string
          round_off: string | null
          service_charge_enabled: boolean | null
          service_charge_pct: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          packaging_charge?: number | null
          restaurant_id: string
          round_off?: string | null
          service_charge_enabled?: boolean | null
          service_charge_pct?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          packaging_charge?: number | null
          restaurant_id?: string
          round_off?: string | null
          service_charge_enabled?: boolean | null
          service_charge_pct?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_config_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      terminal_activations: {
        Row: {
          activated_at: string | null
          device_name: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          restaurant_id: string | null
        }
        Insert: {
          activated_at?: string | null
          device_name?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          restaurant_id?: string | null
        }
        Update: {
          activated_at?: string | null
          device_name?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          restaurant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "terminal_activations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          bank_details: Json | null
          categories_supplied: string[] | null
          contact_person: string | null
          created_at: string
          email: string | null
          gstin: string | null
          id: string
          name: string
          payment_terms: string | null
          phone: string | null
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          bank_details?: Json | null
          categories_supplied?: string[] | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          name: string
          payment_terms?: string | null
          phone?: string | null
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          bank_details?: Json | null
          categories_supplied?: string[] | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          name?: string
          payment_terms?: string | null
          phone?: string | null
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendors_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      wastage_log: {
        Row: {
          cost: number | null
          created_at: string
          date: string | null
          id: string
          item_id: string
          item_type: string
          qty: number
          reason: string | null
          recorded_by: string | null
          restaurant_id: string
          unit: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string
          date?: string | null
          id?: string
          item_id: string
          item_type?: string
          qty?: number
          reason?: string | null
          recorded_by?: string | null
          restaurant_id: string
          unit?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string
          date?: string | null
          id?: string
          item_id?: string
          item_type?: string
          qty?: number
          reason?: string | null
          recorded_by?: string | null
          restaurant_id?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wastage_log_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wastage_log_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_staff_restaurant_ids: { Args: never; Returns: string[] }
      current_staff_role: { Args: { _restaurant_id: string }; Returns: string }
      get_user_profile_id: { Args: never; Returns: string }
      get_user_restaurant: { Args: never; Returns: string }
      get_user_restaurant_id: { Args: never; Returns: string }
      is_hq_admin: { Args: never; Returns: boolean }
      send_kot: {
        Args: {
          p_order_id: string
          p_restaurant_id: string
          p_waiter_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "manager"
        | "captain"
        | "cashier"
        | "kitchen"
        | "delivery"
      bill_status: "draft" | "settled" | "void"
      customer_tier: "bronze" | "silver" | "gold" | "platinum"
      kot_status: "pending" | "sent" | "in_prep" | "ready" | "served"
      order_status:
        | "pending"
        | "active"
        | "kot_sent"
        | "billed"
        | "paid"
        | "cancelled"
      po_status: "draft" | "sent" | "received" | "invoiced"
      points_type: "earn" | "redeem" | "adjust"
      reservation_status: "confirmed" | "seated" | "no_show" | "cancelled"
      table_status: "available" | "occupied" | "reserved" | "dirty" | "blocked"
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
      app_role: [
        "admin",
        "manager",
        "captain",
        "cashier",
        "kitchen",
        "delivery",
      ],
      bill_status: ["draft", "settled", "void"],
      customer_tier: ["bronze", "silver", "gold", "platinum"],
      kot_status: ["pending", "sent", "in_prep", "ready", "served"],
      order_status: [
        "pending",
        "active",
        "kot_sent",
        "billed",
        "paid",
        "cancelled",
      ],
      po_status: ["draft", "sent", "received", "invoiced"],
      points_type: ["earn", "redeem", "adjust"],
      reservation_status: ["confirmed", "seated", "no_show", "cancelled"],
      table_status: ["available", "occupied", "reserved", "dirty", "blocked"],
    },
  },
} as const
