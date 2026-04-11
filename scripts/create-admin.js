import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const email = process.env.VITE_ADMIN_EMAIL
const password = '123456'

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
})

if (error) {
  // Try updating password if user already exists
  const { data: list } = await supabase.auth.admin.listUsers()
  const existing = list?.users?.find(u => u.email === email)
  if (existing) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, { password })
    if (updateError) console.error('Update failed:', updateError.message)
    else console.log('Password updated for', email)
  } else {
    console.error('Error:', error.message)
  }
} else {
  console.log('Admin account created:', data.user.email)
}
