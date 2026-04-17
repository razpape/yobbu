# Deployment Instructions

Follow these steps in order to deploy the security fixes to production.

---

## PHASE 1: ENVIRONMENT VARIABLES (5 min)

### On Vercel Dashboard:

1. Go to your Yobbu project → Settings → Environment Variables
2. **Delete or modify** (set to empty):
   - `VITE_ADMIN_API_SECRET`
   - `VITE_ADMIN_EMAIL`
3. **Add new variable:**
   ```
   Key: ADMIN_EMAILS
   Value: admin1@yourdomain.com,admin2@yourdomain.com
   (comma-separated, no spaces, case-insensitive)
   ```
4. Make sure existing variables are still present:
   - `VITE_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `TWILIO_*` variables
   - `GMAIL_*` variables
5. Redeploy: Click "Deployments" → Latest → "Redeploy"

### In `.env` locally:

```env
# DELETE THESE LINES:
# VITE_ADMIN_API_SECRET=xxx
# VITE_ADMIN_EMAIL=xxx

# ADD THIS LINE:
ADMIN_EMAILS=admin1@yourdomain.com,admin2@yourdomain.com
```

**Do NOT commit `.env`**

---

## PHASE 2: DATABASE SCHEMA (10 min)

### In Supabase Dashboard:

1. Navigate to: **SQL Editor** (left sidebar)
2. Click **New Query**
3. Paste the entire SQL block below (copy carefully):

```sql
-- ============================================
-- YOBBU SECURITY HARDENING - DATABASE SCHEMA
-- ============================================

-- 1. UPDATE otp_codes TABLE
-- Add columns for hashed OTP, IP tracking, timestamps
ALTER TABLE otp_codes
ADD COLUMN IF NOT EXISTS code_hash TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Backfill code_hash from existing plaintext codes
UPDATE otp_codes 
SET code_hash = encode(digest(code, 'sha256'), 'hex')
WHERE code IS NOT NULL AND code_hash = '';

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone_deleted 
  ON otp_codes(phone, deleted_at DESC);

-- 2. UPDATE admin_audit_log TABLE
-- Add admin_id (links to auth user) and timestamp fields
ALTER TABLE admin_audit_log
ADD COLUMN IF NOT EXISTS admin_id UUID,
ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP DEFAULT NOW();

-- 3. CREATE HELPER FUNCTION (optional but recommended)
-- Checks if a user is an admin by email
CREATE OR REPLACE FUNCTION is_admin_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM profiles p
    INNER JOIN auth.users au ON p.id = au.id
    WHERE p.id = user_id 
    AND au.email = ANY(
      string_to_array(
        COALESCE(current_setting('app.admin_emails', true), ''),
        ','
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin_user TO authenticated, anon;
```

4. Click **Run** button
5. Wait for success message
6. Check for any errors (scroll down in output)

### In Supabase Storage:

1. Navigate to: **Storage** (left sidebar)
2. Click **New Bucket**
3. Fill in:
   - **Name:** `id_documents`
   - **Privacy:** Uncheck "Public bucket" (must be PRIVATE)
4. Click **Create bucket**

---

## PHASE 3: ROW LEVEL SECURITY POLICIES (15 min)

### In Supabase Dashboard:

1. Navigate to: **Authentication** → **Policies** (left sidebar)
2. Select table: **trips**
3. Create the following 3 policies:

#### Policy 1: Read approved trips
- **Name:** `read_approved_trips`
- **Allowed operation:** SELECT
- **Policy definition:**
  ```sql
  approved = true AND suspended = false
  ```
- Click **Save**

#### Policy 2: Read own trips
- **Name:** `read_own_trips`
- **Allowed operation:** SELECT
- **Policy definition:**
  ```sql
  user_id = auth.uid()
  ```
- Click **Save**

#### Policy 3: Block admin updates from direct DB access
- **Name:** `block_direct_updates`
- **Allowed operation:** UPDATE
- **Policy definition:**
  ```sql
  false
  ```
- Click **Save** (all direct updates blocked; only API can update)

### For profiles table:

1. Select table: **profiles**
2. Create policies:

#### Policy 1: Public profile reads
- **Name:** `read_public_profiles`
- **Allowed operation:** SELECT
- **Policy definition:**
  ```sql
  true
  ```

#### Policy 2: Own profile updates
- **Name:** `update_own_profile`
- **Allowed operation:** UPDATE
- **Policy definition:**
  ```sql
  id = auth.uid()
  ```

#### Policy 3: Block admin direct updates
- **Name:** `block_admin_direct_updates`
- **Allowed operation:** UPDATE
- **Policy definition:**
  ```sql
  false
  ```

### For id_documents bucket (Storage):

1. Navigate to: **Storage** → **id_documents** bucket
2. Click **Policies** tab
3. Click **New policy** → **For queries**
4. Create:

#### Policy 1: Users upload own documents
- **Name:** `users_insert_own_ids`
- **Allowed operation:** INSERT
- **Policy:**
  ```sql
  auth.uid()::text = (storage.foldername()[1])
  ```
  *(This restricts uploads to folder = user's ID)*

#### Policy 2: Admins read documents (for signed URLs)
- **Name:** `admins_read_documents`
- **Allowed operation:** SELECT
- **Policy:**
  ```sql
  auth.role() = 'authenticated'
  ```
  *(Backend verifies admin role before sending signed URL)*

---

## PHASE 4: CODE DEPLOYMENT (5 min)

### Local changes:

1. Pull latest code from this repository
2. Verify these files exist:
   - ✅ `api/admin-auth.js`
   - ✅ `api/admin-check.js`
   - ✅ `api/admin-update-trip.js`
   - ✅ `api/admin-verify-user.js`
   - ✅ `api/send-phone-otp.js` (updated)
   - ✅ `api/verify-phone-otp.js` (updated)
   - ✅ `src/pages/AdminLogin.jsx` (updated)
   - ✅ `src/pages/AdminPanel.jsx` (updated)
   - ✅ `server.js` (updated)

3. Commit changes:
   ```bash
   git add .
   git commit -m "security: harden admin auth, OTP, and API endpoints"
   git push origin main
   ```

### Vercel deployment:

1. Vercel auto-deploys on push to `main`
2. Wait for build to complete
3. Check **Deployments** tab for success (green checkmark)

---

## PHASE 5: TESTING (10 min)

### Test 1: Admin Login with Non-Admin
1. Go to production: `https://yobbu.co/?admin=true` or similar
2. Login with a non-admin email (should fail)
3. Expected error: "You do not have admin access."
4. ✅ PASS if error shown, ❌ FAIL if allowed access

### Test 2: Admin Login with Admin
1. Login with an admin email (from `ADMIN_EMAILS`)
2. Expected: Login succeeds, admin panel loads
3. ✅ PASS if admin panel shows, ❌ FAIL if blocked

### Test 3: Trip Approval
1. In admin panel, click Approve on a pending trip
2. Open browser DevTools → Network tab
3. Expected: POST request to `/api/admin-update-trip`
4. ✅ PASS if API called, ❌ FAIL if direct Supabase call

### Test 4: User Verification
1. In admin panel, go to Users → Click Verify on a user
2. DevTools → Network tab
3. Expected: POST request to `/api/admin-verify-user`
4. ✅ PASS if API called, ❌ FAIL if direct Supabase call

### Test 5: OTP Generation
1. Go to login page, enter a test phone
2. Backend should generate secure code (won't be shown to browser)
3. Expected: Server logs show "[OTP] Sent to +221..."
4. ✅ PASS if SMS sent (check Twilio dashboard), ❌ FAIL if error

### Test 6: Error Messages
1. Trigger an error (e.g., invalid code)
2. Expected: Generic message to browser
3. Check server logs for detailed error
4. ✅ PASS if details only in logs, ❌ FAIL if shown to user

---

## PHASE 6: CLEANUP (5 min)

### In Supabase:

1. After 2 weeks, if `code_hash` is working well:
   ```sql
   ALTER TABLE otp_codes DROP COLUMN code;
   ```
   (Remove plaintext OTP codes)

2. Verify no code references remain:
   ```sql
   SELECT * FROM otp_codes WHERE code IS NOT NULL;
   -- Should return 0 rows
   ```

### In code:

1. Verify no remaining references to:
   - `VITE_ADMIN_API_SECRET`
   - `VITE_ADMIN_EMAIL`
   - `?admin=true` parameter handling
2. If found, these are legacy code paths that should be removed

---

## ROLLBACK PLAN

If issues occur after deployment:

### Quick Rollback:
1. Vercel Deployments → Previous working version → **Redeploy**
2. This reverts all code to previous state
3. Takes 5 minutes

### Database Rollback:
If schema changes cause issues, you can:
1. Keep all new columns (no data loss)
2. Revert only RLS policies:
   - Go to Authentication → Policies
   - Delete problematic policies
   - Re-enable any disabled policies
3. Old API endpoints will still work

---

## VERIFICATION CHECKLIST

After deployment, verify:

- [ ] `ADMIN_EMAILS` environment variable is set
- [ ] `VITE_ADMIN_API_SECRET` is removed or empty
- [ ] Database columns added: `code_hash`, `ip_address`, `created_at`, `deleted_at`
- [ ] Database columns added: `admin_id`, `timestamp` on audit log
- [ ] `id_documents` bucket created (private)
- [ ] RLS policies created for trips (3 policies)
- [ ] RLS policies created for profiles (3 policies)
- [ ] RLS policies created for id_documents (2 policies)
- [ ] Admin login works for admin emails only
- [ ] Admin panel calls API endpoints (not direct Supabase)
- [ ] OTP codes are hashed in database (no plaintext)
- [ ] Error messages are generic (no details leaked)

---

## SUPPORT

If deployment fails:

1. **Check Vercel logs:** Deployments → click failed build → View logs
2. **Check Supabase logs:** SQL Editor → previous query → View output for errors
3. **Check API logs:** Supabase → Logs → Filter for errors
4. **Test locally:** Run `npm run dev` and test with `ADMIN_EMAILS=yourtest@email.com`
5. **Ask for help:** Share deployment error message (not secrets)

---

## ESTIMATED TIME

| Phase | Duration |
|-------|----------|
| Phase 1: Environment Variables | 5 min |
| Phase 2: Database Schema | 10 min |
| Phase 3: RLS Policies | 15 min |
| Phase 4: Code Deployment | 5 min |
| Phase 5: Testing | 10 min |
| Phase 6: Cleanup (optional) | 5 min |
| **TOTAL** | **50 minutes** |

---

## QUESTIONS?

Refer to:
- **SECURITY_AUDIT_SUMMARY.md** — What was fixed and why
- **SECURITY_FIXES.md** — Detailed technical explanation
- This file — Step-by-step deployment guide
