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
      bill_payments: {
        Row: {
          amount: number
          bill_id: string
          created_at: string
          id: string
          method: string
        }
        Insert: {
          amount?: number
          bill_id: string
          created_at?: string
          id?: string
          method?: string
        }
        Update: {
          amount?: number
          bill_id?: string
          created_at?: string
          id?: string
          method?: string
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
          discount_amount: number | null
          discount_pct: number | null
          discount_reason: string | null
          grand_total: number | null
          id: string
          order_id: string
          packaging_charge: number | null
          restaurant_id: string
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
          discount_amount?: number | null
          discount_pct?: number | null
          discount_reason?: string | null
          grand_total?: number | null
          id?: string
          order_id: string
          packaging_charge?: number | null
          restaurant_id: string
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
          discount_amount?: number | null
          discount_pct?: number | null
          discount_reason?: string | null
          grand_total?: number | null
          id?: string
          order_id?: string
          packaging_charge?: number | null
          restaurant_id?: string
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
          {
            foreignKeyName: "bills_restaurant_id_fkey"
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
          name: string
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          name: string
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
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
      menu_categories: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          restaurant_id: string
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          restaurant_id: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          restaurant_id?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          hsn_code: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          item_type: string | null
          name: string
          price: number
          tax_rate: number | null
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          hsn_code?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          item_type?: string | null
          name: string
          price?: number
          tax_rate?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          hsn_code?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          item_type?: string | null
          name?: string
          price?: number
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
          id: string
          item_id: string
          modifier_type: string | null
          name: string
          price_modifier: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          modifier_type?: string | null
          name: string
          price_modifier?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          modifier_type?: string | null
          name?: string
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
          created_at: string
          id: string
          is_addon: boolean | null
          item_id: string
          kot_number: number | null
          kot_status: Database["public"]["Enums"]["kot_status"] | null
          order_id: string
          qty: number
          special_instructions: string | null
          unit_price: number
          updated_at: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_addon?: boolean | null
          item_id: string
          kot_number?: number | null
          kot_status?: Database["public"]["Enums"]["kot_status"] | null
          order_id: string
          qty?: number
          special_instructions?: string | null
          unit_price?: number
          updated_at?: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_addon?: boolean | null
          item_id?: string
          kot_number?: number | null
          kot_status?: Database["public"]["Enums"]["kot_status"] | null
          order_id?: string
          qty?: number
          special_instructions?: string | null
          unit_price?: number
          updated_at?: string
          variant_id?: string | null
        }
        Relationships: [
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
          guest_count: number | null
          id: string
          is_priority: boolean | null
          order_type: string | null
          restaurant_id: string
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
          guest_count?: number | null
          id?: string
          is_priority?: boolean | null
          order_type?: string | null
          restaurant_id: string
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
          guest_count?: number | null
          id?: string
          is_priority?: boolean | null
          order_type?: string | null
          restaurant_id?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          table_id?: string | null
          token_number?: number | null
          updated_at?: string
          waiter_id?: string | null
        }
        Relationships: [
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
      restaurants: {
        Row: {
          address_1: string | null
          address_2: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          facebook: string | null
          fssai: string | null
          gstin: string | null
          id: string
          instagram: string | null
          logo_url: string | null
          name: string
          onboarding_complete: boolean | null
          pan: string | null
          phone: string | null
          pin: string | null
          state: string | null
          type: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address_1?: string | null
          address_2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          facebook?: string | null
          fssai?: string | null
          gstin?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          name: string
          onboarding_complete?: boolean | null
          pan?: string | null
          phone?: string | null
          pin?: string | null
          state?: string | null
          type?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address_1?: string | null
          address_2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          facebook?: string | null
          fssai?: string | null
          gstin?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          name?: string
          onboarding_complete?: boolean | null
          pan?: string | null
          phone?: string | null
          pin?: string | null
          state?: string | null
          type?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
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
          floor_id: string
          id: string
          number: string
          shape: string | null
          status: Database["public"]["Enums"]["table_status"] | null
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          floor_id: string
          id?: string
          number: string
          shape?: string | null
          status?: Database["public"]["Enums"]["table_status"] | null
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          floor_id?: string
          id?: string
          number?: string
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
      get_user_profile_id: { Args: never; Returns: string }
      get_user_restaurant_id: { Args: never; Returns: string }
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
