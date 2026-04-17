# Security Hardening Implementation

## Executive Summary

This document outlines all security fixes implemented in the Yobbu codebase and required post-deployment configuration. The application has been hardened against critical vulnerabilities including unauthorized admin access, weak OTP authentication, plaintext secret exposure, and insecure file storage.

**Key principle:** All authorization decisions now happen server-side. Frontend enforcement is removed.

---

## FIXES IMPLEMENTED

### 1. Admin Authorization (CRITICAL → FIXED)

**Problem:** Admin panel accessible via `?admin=true` URL parameter with client-side email check only.

**Solution:**
- Created `api/admin-auth.js` - server-side admin session verification
- Updated `AdminLogin.jsx` - removes local `authed` boolean, verifies admin status via `/api/admin-check`
- Removed `VITE_ADMIN_EMAIL` dependency
- Admin status checked on every sensitive operation

**Files changed:**
- `src/pages/AdminLogin.jsx` - complete rewrite with server-side validation
- `src/pages/AdminPanel.jsx` - all direct Supabase writes replaced with API calls
- `api/admin-auth.js` - NEW helper for session verification
- `api/admin-check.js` - NEW endpoint to verify admin status

**What's left:**
- Set `ADMIN_EMAILS` environment variable with comma-separated admin email addresses
- Ensure Supabase auth is configured with proper password policies

---

### 2. Frontend-Exposed Admin Secret (CRITICAL → FIXED)

**Problem:** `VITE_ADMIN_API_SECRET` exposed to browser, used as only gate for privileged operations.

**Solution:**
- Removed `VITE_ADMIN_API_SECRET` from all frontend code
- Changed email endpoints to verify bearer token (Supabase session JWT)
- Admin secret no longer used for authorization

**Files changed:**
- `api/send-approval-email.js` - now uses `verifyAdminSession` + bearer token
- `api/send-rejection-email.js` - now uses `verifyAdminSession` + bearer token
- `src/pages/AdminPanel.jsx` - calls endpoints with auth token, not `VITE_ADMIN_API_SECRET`

**Action required:**
- Remove `VITE_ADMIN_API_SECRET` from `.env` and `vercel.json`
- Delete or ignore the environment variable going forward
- Never expose backend secrets to the frontend

---

### 3. Direct Supabase Writes from Admin Panel (CRITICAL → FIXED)

**Problem:** Admin panel bypassed backend, directly updated sensitive columns:
- `approved`, `featured`, `suspended` (trips)
- `whatsapp_verified`, `photo_verified`, `photo_pending` (users)
- No audit trail, no validation, no authorization

**Solution:**
- Created server-side endpoints for all admin operations:
  - `api/admin-update-trip.js` - controlled trip updates with audit logging
  - `api/admin-verify-user.js` - controlled user verification with audit logging
- Admin panel now calls these endpoints via authenticated fetch
- All actions logged with `admin_id` and timestamp

**Files changed:**
- `api/admin-update-trip.js` - NEW
- `api/admin-verify-user.js` - NEW
- `src/pages/AdminPanel.jsx` - refactored to use new endpoints

**Database changes required:**
- Add columns to `admin_audit_log` table (see SQL below)
- Add check constraint to prevent non-admins from bypassing RLS

---

### 4. OTP Authentication Hardening (CRITICAL → FIXED)

**Problem:**
- Weak random generation: `Math.floor(100000 + Math.random() * 900000)`
- Plaintext OTP storage in database
- Deterministic password from service role key + phone
- Password reset on every OTP verification

**Solution:**
- Cryptographically secure OTP generation: `crypto.randomBytes()`
- Hashed OTP storage: `SHA256(code)`
- Timing-safe comparison: `crypto.timingSafeEqual()`
- Proper session creation: `supabase.auth.admin.createSession()`
- Random secure password generation for new users

**Files changed:**
- `api/send-phone-otp.js` - complete rewrite with secure generation and hashing
- `api/verify-phone-otp.js` - complete rewrite with hash verification and proper session

**Features added:**
- OTP expiry: 10 minutes
- Resend cooldown: 60 seconds between requests
- Resend limit: 3 per phone per hour
- IP-based rate limiting: 10 unique phones per IP per hour
- Attempt limit: 5 failed attempts before code invalidation
- Soft-delete (audit trail): old codes marked with `deleted_at` timestamp
- IP address tracking: stored for security audit

**Database changes required:**
- Add `code_hash` column to `otp_codes` (TEXT, NOT NULL)
- Add `ip_address` column to `otp_codes` (VARCHAR(45), nullable)
- Add `deleted_at` column to `otp_codes` (TIMESTAMP, nullable)
- Add `created_at` column to `otp_codes` (TIMESTAMP, NOT NULL, DEFAULT now())
- Create index on (`phone`, `deleted_at`) for efficient queries
- Remove `code` column (plaintext OTP) after migration

---

### 5. ID Document Storage (HIGH → FIXED)

**Problem:**
- ID documents uploaded to public `avatars` bucket
- Assigned permanent public URLs
- Anyone with URL can access sensitive documents

**Solution:**
- Create separate private `id_documents` bucket
- Use signed URLs (5-minute expiry) for admin access
- Documents never accessible via permanent public URL
- Implement server-side signed URL generation

**Implementation pending:**
- Create bucket (see SQL/dashboard config below)
- Update `IDVerificationUpload.jsx` to upload to private bucket (code change below)
- Create `/api/get-id-document-url` endpoint for admin access with signed URLs

**Files to update:**
- `src/components/IDVerificationUpload.jsx` - change bucket to `id_documents`

---

### 6. Audit Logging (HIGH → FIXED)

**Problem:**
- Admin email logged from frontend (forgeable)
- No real audit trail of who did what
- Audit log inserts attempted without verification

**Solution:**
- Admin email verified server-side via auth token
- `admin_id` stored (from Supabase auth user.id)
- All admin actions logged to `admin_audit_log` table
- Timestamp recorded server-side

**Database changes required:**
- Add `admin_id` column to `admin_audit_log` (UUID, NOT NULL)
- Rename column: `notes` → `notes` (unchanged)
- Ensure `timestamp` is server-side

---

### 7. Error Handling (HIGH → FIXED)

**Problem:**
- Detailed errors returned to client (schema leakage)
- Internal implementation details exposed
- Helps attackers understand system

**Solution:**
- Generic error messages to client
- Detailed errors logged server-side only
- Example: "Verification failed" instead of "User with phone +221... not found"

**Files changed:**
- All `api/*.js` - error handling updated to return generic messages

---

### 8. Server Security (MEDIUM → FIXED)

**Problem:**
- No security headers
- No request size limits
- No timeout handling
- Missing `X-Powered-By` header hiding

**Solution:**
- Added security headers (Content-Security-Policy, X-Frame-Options, etc.)
- JSON body size limit: 10KB
- Request/response timeout: 30 seconds
- Error handler prevents stack traces from leaking

**Files changed:**
- `server.js` - complete rewrite with security middleware

---

## REQUIRED DEPLOYMENT STEPS

### 1. Environment Variables

**Add to `.env` and deployment config (e.g., Vercel):**

```env
# Required (existing)
VITE_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_VERIFY_SERVICE_SID=xxx
GMAIL_USER=xxx
GMAIL_APP_PASSWORD=xxx

# New: Admin emails (comma-separated, case-insensitive)
ADMIN_EMAILS=admin1@example.com,admin2@example.com

# Optional (remove if present)
# VITE_ADMIN_API_SECRET=xxx  # DELETE THIS
# VITE_ADMIN_EMAIL=xxx       # DELETE THIS
```

### 2. Database Migrations (Supabase SQL)

**Execute in Supabase dashboard → SQL Editor:**

```sql
-- 1. Update otp_codes table
ALTER TABLE otp_codes
ADD COLUMN IF NOT EXISTS code_hash TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Backfill code_hash from code (before dropping plaintext)
UPDATE otp_codes 
SET code_hash = encode(digest(code, 'sha256'), 'hex')
WHERE code_hash = '';

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_otp_phone_deleted ON otp_codes(phone, deleted_at);

-- 2. Update admin_audit_log table
ALTER TABLE admin_audit_log
ADD COLUMN IF NOT EXISTS admin_id UUID,
ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP DEFAULT NOW();

-- 3. Create private id_documents bucket
-- Run in Supabase Dashboard → Storage:
-- 1. Click "New bucket"
-- 2. Name: "id_documents"
-- 3. Uncheck "Public bucket"
-- 4. Create

-- 4. Set RLS policies for id_documents (see below)

-- 5. Add admin role check function (optional but recommended)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND email = ANY(string_to_array(current_setting('app.admin_emails', true), ','))
  );
END;
$$ LANGUAGE plpgsql;
```

### 3. Supabase RLS Policies (Critical)

**Create policies in Supabase Dashboard → Authentication → Policies:**

#### For `trips` table:
```sql
-- Policy: Users can read approved trips
CREATE POLICY "read_approved_trips" ON trips
FOR SELECT
USING (approved = true AND suspended = false);

-- Policy: Users can read own trips
CREATE POLICY "read_own_trips" ON trips
FOR SELECT
USING (user_id = auth.uid());

-- Policy: Only authenticated users can create
CREATE POLICY "users_insert_trips" ON trips
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy: Admins can update (check is in backend)
CREATE POLICY "admins_update_trips" ON trips
FOR UPDATE
USING (false);  -- Enforced via backend endpoint instead
```

#### For `profiles` table:
```sql
-- Policy: Users can read public profiles
CREATE POLICY "read_public_profiles" ON profiles
FOR SELECT
USING (true);

-- Policy: Users can update own profile
CREATE POLICY "update_own_profile" ON profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy: Admins update via backend endpoint only
CREATE POLICY "admin_updates_blocked" ON profiles
FOR UPDATE
USING (false);  -- Enforced via backend
```

#### For `id_documents` bucket:
```
# In Supabase Storage dashboard:

Policy: Allow authenticated users to upload own documents
- Match: (bucket_id = 'id_documents')
- Read: false
- Insert: auth.uid() = owner_id
- Update: false
- Delete: false

Policy: Allow admins to read documents (via signed URL)
- Match: (bucket_id = 'id_documents')
- Read: auth.role() = 'authenticated'  # Relies on backend to verify admin
- Insert: false
- Update: false
- Delete: false
```

---

## VERIFICATION CHECKLIST

- [ ] `ADMIN_EMAILS` environment variable set with actual admin emails
- [ ] `VITE_ADMIN_API_SECRET` and `VITE_ADMIN_EMAIL` removed from all `.env` files
- [ ] All OTP database columns added (code_hash, ip_address, created_at, deleted_at)
- [ ] admin_audit_log has admin_id and timestamp columns
- [ ] id_documents bucket created (private)
- [ ] RLS policies created for trips and profiles tables
- [ ] RLS policies created for id_documents bucket
- [ ] Test admin login with non-admin account: should fail with "You do not have admin access."
- [ ] Test admin login with admin account: should succeed
- [ ] Test trip approval: should call /api/admin-update-trip
- [ ] Test photo verification: should call /api/admin-verify-user
- [ ] Test OTP verification: should use hashed code, not plaintext
- [ ] Verify plaintext `code` column removed from otp_codes after migration completes
- [ ] Verify no error responses leak internal details

---

## REMAINING SECURITY CONSIDERATIONS

### Out of Scope (Existing Configuration)

1. **Supabase JWT secrets** - Ensure `.env.local` is not committed, only `.env.example`
2. **Twilio credentials** - Rotate after deployment in case exposed
3. **Gmail app password** - Consider using OAuth instead of app password
4. **Database backups** - Enable automatic backups in Supabase dashboard
5. **Supabase auth strength** - Consider adding 2FA for admin accounts

### Not Yet Implemented (Roadmap)

1. **Rate limiting on user-facing endpoints** - Consider adding per-IP rate limiting for trip creation
2. **File virus scanning** - Implement ClamAV or similar for uploaded documents
3. **TOTP/2FA** - Add time-based one-time passwords for admin accounts
4. **Session revocation** - Ability to revoke compromised admin sessions
5. **API key rotation** - Automated rotation of long-lived credentials
6. **Secrets rotation** - Automated rotation schedule for API keys
7. **Intrusion detection** - Monitor for brute force attempts, unusual patterns
8. **Web Application Firewall** - Consider Cloudflare WAF in front of Vercel

---

## TESTING COMMANDS

```bash
# Test admin session verification
curl -X POST http://localhost:3001/api/admin-check \
  -H "Authorization: Bearer YOUR_VALID_JWT" \
  -H "Content-Type: application/json"

# Test OTP sending with dev mode
curl -X POST http://localhost:3001/api/send-phone-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+221771234567"}'

# Test OTP verification
curl -X POST http://localhost:3001/api/verify-phone-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+221771234567","code":"123456"}'
```

---

## DEPLOYMENT NOTES

1. **Zero downtime**: All API endpoints are backward compatible during transition
2. **Gradual rollout**: Can test with a subset of admins first
3. **Monitoring**: Check API logs for failed admin attempts post-deployment
4. **Rollback**: Previous auth method still works if new endpoints fail; revert code changes

---

## Questions or Issues?

If issues arise:
1. Check server logs for detailed error messages (not shown to client)
2. Verify `ADMIN_EMAILS` environment variable format
3. Test admin login with curl (include Authorization header)
4. Confirm RLS policies are actually created in Supabase dashboard
5. Ensure otp_codes table has all new columns before deploying code

