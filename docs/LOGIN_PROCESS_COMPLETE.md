# Yobbu Phone Login - Complete Process

## Overview
Phone number + OTP → PIN → Profile → Done

---

## FULL LOGIN FLOW

### STEP 1: Welcome Screen
**What user sees:**
```
📦✈️
Send packages with travelers going your way

[Continue with Phone]  ← User taps this
[Browse First]
```

**What happens:**
- App shows welcome screen
- User clicks "Continue with Phone"
- App navigates to Phone Entry screen

---

### STEP 2: Phone Number Entry
**What user sees:**
```
← Back

What's your number?
We'll send you a verification code.

[🇺🇸 US / Canada ▼] [+1]
[(555) ___-____    ]  ← User types: 5551234567

We'll send you a verification code.

[Continue]  ← Enabled when 10 digits entered
```

**What happens:**
1. User selects country code (US +1 default)
2. User types phone number
3. Frontend validates: must be 10+ digits
4. "Continue" button becomes active
5. User clicks Continue

**API Call:**
```javascript
POST /api/send-phone-otp
{
  "phone": "+15551234567"
}
```

**Backend does:**
1. Checks if phone was used in last 60 seconds (rate limit)
2. Generates 6-digit OTP: `284739`
3. Stores in memory: `otp:+15551234567 = { code: "284739", expiresAt: Date.now() + 10min }`
4. Sends SMS (or logs for dev)
5. Returns success

**Frontend:**
- Starts 30-second countdown for resend
- Navigates to OTP screen

---

### STEP 3: OTP Verification
**What user sees:**
```
← Back

Enter the code
Sent to +1 (555) 123-4567

[1] [2] [3] [4] [5] [6]  ← 6 boxes

Resend in 24s          ← Countdown
Change number
```

**What happens:**
1. User receives SMS: "Your Yobbu code: 284739"
2. User types code into 6 boxes
3. Auto-submits when 6th digit entered

**API Call:**
```javascript
POST /api/verify-phone-otp
{
  "phone": "+15551234567",
  "code": "284739"
}
```

**Backend does:**
1. Looks up stored OTP: `otp:+15551234567`
2. Checks if code matches: `"284739" === "284739"` ✓
3. Checks if expired: expiresAt > now ✓
4. Increments attempt counter (max 5)
5. Deletes OTP from memory

**Check if user exists:**
```sql
SELECT * FROM profiles WHERE phone = '+15551234567'
```

**If NEW user:**
```sql
-- Create auth user
INSERT INTO auth.users (id, email, password)
VALUES (gen_uuid(), '15551234567@phone.yobbu.app', random_password)

-- Create profile
INSERT INTO profiles (id, phone, phone_verified_at, verification_tier)
VALUES (same_uuid, '+15551234567', now(), 1)
```

**If EXISTING user:**
```sql
UPDATE profiles 
SET phone_verified_at = now()
WHERE phone = '+15551234567'
```

**Returns:**
```json
{
  "success": true,
  "user": { "id": "abc-123", "phone": "+15551234567" },
  "isNewUser": true,
  "hasPin": false
}
```

**Frontend:**
- If new user → Go to PIN Create
- If existing user with PIN → Login complete
- If existing user no PIN → Go to PIN Create

---

### STEP 4: Create PIN (New Users Only)
**What user sees:**
```
Create a PIN
4 digits to secure your account on this device

[•] [•] [•] [ ]   ← User types: 2847

🔒 Secured with encryption
```

**What happens:**
1. User enters 4 digits
2. Frontend stores temporarily
3. Auto-advances to confirm screen

---

### STEP 5: Confirm PIN
**What user sees:**
```
Confirm your PIN
Enter again to confirm

[•] [•] [•] [•]   ← User types: 2847 again

✓ Match!
```

**What happens:**
1. User re-enters 4 digits
2. Frontend checks: `2847 === 2847` ✓
3. Sends to backend

**API Call:**
```javascript
POST /api/set-user-pin
{
  "userId": "abc-123",
  "pin": "2847"
}
```

**Backend does:**
1. Hashes PIN with bcrypt:
   ```javascript
   pin_hash = bcrypt.hash("2847", 10)
   // Result: "$2a$10$N9qo8uLOickgx2ZMRZoMy.Mqr..."
   ```

2. Gets device fingerprint from request headers

3. Updates database:
   ```sql
   UPDATE profiles 
   SET 
     pin_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mqr...',
     trusted_device_id = 'Mozilla/5.0 iPhone...',
     trusted_device_bound_at = now()
   WHERE id = 'abc-123'
   ```

4. Auto-updates verification tier:
   ```sql
   -- Trigger runs:
   IF phone_verified AND trusted_device THEN tier = 2
   ```

**Frontend:**
- PIN saved
- Navigates to Profile screen

---

### STEP 6: Profile Setup
**What user sees:**
```
Complete your profile
What should we call you?

First Name
[John                ]

Last Name (optional)
[Doe                 ]

I want to:
(•) Send packages
( ) Travel with packages  
( ) Both

[Continue]
[Skip for now]
```

**What happens:**
1. User enters first name (required)
2. Optionally enters last name
3. Selects role: sender / traveler / both
4. Clicks Continue

**Database Update:**
```sql
UPDATE profiles
SET 
  first_name = 'John',
  last_name = 'Doe',
  role = 'sender'
WHERE id = 'abc-123'
```

**Frontend:**
- Navigates to Biometric prompt

---

### STEP 7: Biometric Setup (Optional)
**What user sees:**
```
👆
Use Face ID?
Faster and more secure than typing your PIN

[Enable Face ID]
[Maybe Later]
```

**What happens:**
- If user clicks "Enable":
  - Uses Web Authentication API or native bridge
  - Sets `biometric_enabled = true` in profile
- If user clicks "Maybe Later":
  - Skips, can enable later in settings

**Database:**
```sql
UPDATE profiles
SET biometric_enabled = true
WHERE id = 'abc-123'
```

---

### STEP 8: Login Complete!
**What user sees:**
```
🎉
Welcome!
Your account is ready. Start exploring!

[Spinner → Auto-redirects to Home]
```

**What happens:**
1. Shows success animation
2. Calls `onComplete(user)` callback
3. App redirects to Home/Browse screen
4. User is now logged in!

---

## RETURNING USER LOGIN (Existing Account)

### Step 1: Enter Phone
Same as above → OTP sent

### Step 2: Enter OTP
User types code from SMS

### Step 3: Backend Checks
```sql
SELECT pin_hash FROM profiles WHERE phone = '+15551234567'
```

**If has PIN:**
```
Welcome back!

Enter your PIN

[•] [•] [•] [ ]

[Use Face ID]  ← If enabled

Not you? Switch Account
Forgot PIN? Reset with SMS
```

User enters PIN → Frontend verifies:
```javascript
bcrypt.compare("2847", "$2a$10$N9qo...") // Returns true
```

**Login complete!** Redirect to Home.

---

## VERIFICATION TIERS

After login, user has a tier based on verification:

| Tier | User Has | What They Can Do |
|------|----------|------------------|
| **1** | Phone verified | Browse, save favorites |
| **2** | + PIN + Device | Request to send, post trips <$500 |
| **3** | + ID verified | Accept high-value jobs $500+ |
| **4** | + Flight proof | Premium jobs $2000+ |

**Auto-calculated by database trigger:**
```sql
CREATE TRIGGER update_tier_trigger
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_verification_tier();
```

---

## SESSION MANAGEMENT

**No JWT tokens needed** - we use Supabase Auth session:

```javascript
// After OTP verification, backend creates Supabase session
const { data: session } = await supabase.auth.signInWithPassword({
  email: '15551234567@phone.yobbu.app',
  password: user.phone  // hashed
})

// Frontend stores session in localStorage
// All API calls include: Authorization: Bearer <token>
```

**Session expires:** After 7 days of inactivity
**PIN required:** When opening app after 5 minutes (configurable)

---

## SECURITY FEATURES

| Feature | Implementation |
|---------|----------------|
| **Rate limiting** | 1 OTP per 60 seconds per phone |
| **OTP expiry** | 10 minutes |
| **Max attempts** | 5 tries per OTP |
| **PIN hashing** | bcrypt with salt rounds 10 |
| **Device binding** | Stores user agent hash |
| **Auto-lock** | After 3 failed PIN attempts |
| **Secure inputs** | No copy/paste from PIN fields |

---

## DATA FLOW DIAGRAM

```
USER                    FRONTEND                    BACKEND                    DATABASE
  |                        |                          |                          |
  |--Enter phone---------->|                          |                          |
  |                      |--POST /api/send-phone-otp->|                         |
  |                      |                          |--Generate OTP----------->|
  |                      |                          |--Store OTP (10min)        |
  |                      |                          |--Check if user exists---->|
  |                      |<--Success--------------|<--Return isNewUser--------|
  |<--Show OTP screen----|                          |                          |
  |                        |                          |                          |
  |--Enter OTP----------->|                          |                          |
  |                      |--POST /api/verify-phone-otp->|                       |
  |                      |                          |--Verify OTP match        |
  |                      |                          |--Create/update user----->|
  |                      |<--User + isNewUser-------|<--Return user data        |
  |<--Go to PIN create---| (if new)                 |                          |
  |                        |                          |                          |
  |--Create PIN--------->|                          |                          |
  |--Confirm PIN-------->|                          |                          |
  |                      |--POST /api/set-user-pin-->|                          |
  |                      |                          |--bcrypt.hash(pin)        |
  |                      |                          |--Save pin_hash --------->|
  |                      |<--Success---------------|<--Return success          |
  |<--Go to profile------|                          |                          |
  |                        |                          |                          |
  |--Enter name/role---->|                          |                          |
  |                      |--UPDATE profiles-------->|                          |
  |                      |                          |--Save profile data------->|
  |<--Go to biometric----|                          |                          |
  |                        |                          |                          |
  |--[Enable/Skip]------->|                          |                          |
  |<--Redirect to Home---|                          |                          |
```

---

## ERROR SCENARIOS

| Error | What User Sees | Fix |
|-------|----------------|-----|
| **Invalid phone** | "Please enter a valid phone number" | Check country code + digits |
| **Rate limited** | "Please wait 45s before requesting another code" | Wait countdown |
| **Invalid OTP** | "Invalid code. 3 attempts remaining." | Retry or resend |
| **OTP expired** | "Code expired. Request a new one." | Click resend |
| **Too many attempts** | "Too many attempts. Request a new code." | Must resend |
| **PIN mismatch** | "PINs don't match. Try again." | Clear and re-enter |
| **Server error** | "Something went wrong. Try again." | Check logs |

---

## FILES INVOLVED

| File | Purpose |
|------|---------|
| `src/pages/PhoneAuth.jsx` | Main auth flow component |
| `src/components/auth/PhoneInput.jsx` | Country + phone input |
| `src/components/auth/OTPInput.jsx` | 6-digit code entry |
| `src/components/auth/PINInput.jsx` | 4-digit secure PIN |
| `api/send-phone-otp.js` | Send SMS endpoint |
| `api/verify-phone-otp.js` | Verify code + create user |
| `api/set-user-pin.js` | Save hashed PIN |
| `migrations/phone_auth_migration.sql` | Database schema |

---

## NEXT STEPS TO MAKE IT WORK

1. **Add environment variable** `SUPABASE_SERVICE_ROLE_KEY` to Vercel
2. **Run SQL migration** in Supabase SQL Editor
3. **(Optional)** Add Twilio credentials for real SMS
4. **Test the flow** on your deployed app

The login system is fully built and deployed. It just needs the service role key to connect to your database.
