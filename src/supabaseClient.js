import { createClient } from "@supabase/supabase-js"

// ⚡ В Vite переменные окружения доступны через import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "❌ Supabase URL или ключ не найдены. Проверь .env файл и убедись, что переменные начинаются с VITE_"
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
