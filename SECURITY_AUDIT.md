# YOBBU Security Audit Report

**Date:** 2026-04-14  
**Auditor:** Automated Penetration Test  
**Scope:** Full codebase — frontend, API, database, secrets, dependencies  
**Overall Risk:** CRITICAL

---

## Executive Summary

The Yobbu codebase has **5 CRITICAL**, **4 HIGH**, **4 MEDIUM**, and **2 LOW** severity vulnerabilities. The most dangerous issues are **plaintext secrets exposed to the browser**, a **client-side-only admin login**, and an **OpenAI API key shipped to every visitor**. An attacker can take full admin control, drain your OpenAI/Twilio credits, and read/write every row in your database — all from the browser DevTools console.

---

## CRITICAL Severity (Immediate Action Required)

### VULN-01: OpenAI API Key Exposed to Every Browser User
| Field | Detail |
|-------|--------|
| **File** | `.env` line 7, `src/components/FacebookGPExtractor.jsx` line 5 |
| **Variable** | `VITE_OPENAI_API_KEY` |
| **Impact** | Any visitor can open DevTools → Sources, copy your `sk-proj-…` key, and make unlimited GPT-4 calls billed to your account. |
| **Proof** | The key is embedded in the JS bundle because Vite inlines all `VITE_*` env vars at build time. |
| **Fix** | Remove the `VITE_` prefix. Proxy OpenAI calls through your server-side API (`api/extract-screenshot.js`). The frontend should call `/api/extract-screenshot` which uses the server-only `OPENAI_API_KEY`. |

---

### VULN-02: Admin Credentials Hardcoded & Shipped to Frontend
| Field | Detail |
|-------|--------|
| **File** | `.env` lines 9-10, `src/pages/AdminLogin.jsx` lines 3-4 |
| **Variables** | `VITE_ADMIN_EMAIL=papamamadous@gmail.com`, `VITE_ADMIN_PASSWORD=123456` |
| **Impact** | The admin email and password are baked into the production JS bundle. Any visitor can read them. The password is `123456` — the #1 most common password globally. |
| **Proof** | `AdminLogin.jsx` does a pure client-side check: `if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) onLogin()`. There is zero server-side validation. |
| **Fix** | Delete `VITE_ADMIN_EMAIL` and `VITE_ADMIN_PASSWORD`. Implement server-side admin authentication using Supabase Auth with an `is_admin` column or a JWT custom claim. |

---

### VULN-03: Admin API Secret Exposed to Frontend
| Field | Detail |
|-------|--------|
| **File** | `.env` line 19, `src/pages/AdminPanel.jsx` lines 241, 266 |
| **Variable** | `VITE_ADMIN_API_SECRET` |
| **Impact** | The secret used to authorize email-sending API endpoints is in the browser bundle. An attacker can call `/api/send-approval-email` or `/api/send-rejection-email` with this header and send phishing/spam emails from your Gmail. |
| **Fix** | Remove the `VITE_` prefix. The admin panel should authenticate via a Supabase session, and the server API should verify the session token instead of a static secret. |

---

### VULN-04: Supabase Service Role Key in `.env` — Potential Leak Vector
| Field | Detail |
|-------|--------|
| **File** | `.env` line 3 |
| **Variable** | `SUPABASE_SERVICE_ROLE_KEY` |
| **Impact** | This key bypasses all Row Level Security. While it is NOT prefixed with `VITE_` (so it won't be in the browser bundle), it sits alongside `VITE_*` keys in the same file. If `.env` is ever committed to git, shared, or leaked, full database access is compromised. The key also appears in `scripts/create-admin.js` with a hardcoded password of `123456`. |
| **Fix** | Use Vercel environment variables or a secrets manager. Ensure `.env` is never committed (verified: `.gitignore` does list `.env`). Rotate the key if it has ever been committed. |

---

### VULN-05: Client-Side Admin Auth — Full Bypass
| Field | Detail |
|-------|--------|
| **File** | `src/pages/Admin.jsx`, `src/pages/AdminLogin.jsx`, `src/pages/AdminPanel.jsx` |
| **Impact** | Admin auth is a React `useState(false)` toggle. An attacker can: (1) Open DevTools console, (2) Access React internals or simply patch the JS, (3) Set `authed = true`, (4) Access the full admin panel including user management, trip approval, user verification, bulk operations, etc. |
| **Proof** | In `Admin.jsx`: `const [authed, setAuthed] = useState(false)` — flipping this to `true` gives full admin access. |
| **Fix** | Use server-side session validation. The admin panel should verify a valid Supabase admin session on every data fetch. Add an `is_admin` check to RLS policies. |

---

## HIGH Severity

### VULN-06: Twilio Credentials in `.env` — SMS Billing Abuse
| Field | Detail |
|-------|--------|
| **File** | `.env` lines 12-16 |
| **Variables** | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`, `TWILIO_PHONE_NUMBER` |
| **Impact** | While not prefixed with `VITE_`, these are in the same `.env`. If the file leaks, an attacker can send unlimited SMS (billed to you), make calls, or use your Twilio account for spam. |
| **Fix** | Use Vercel env vars for production. Rotate tokens regularly. Enable Twilio spending limits. |

---

### VULN-07: Deterministic User Passwords — Account Takeover
| Field | Detail |
|-------|--------|
| **File** | `api/verify-phone-otp.js` lines 132-137 |
| **Code** | `crypto.createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY).update(phone).digest('hex')` |
| **Impact** | User passwords are deterministic: `HMAC-SHA256(service_role_key, phone_number)`. If the service role key leaks, an attacker can compute the password for ANY user and sign in as them via `signInWithPassword()`. |
| **Fix** | Use `supabase.auth.admin.generateLink()` or custom JWT tokens instead of setting deterministic passwords. Alternatively, use `crypto.randomUUID()` per session. |

---

### VULN-08: No RLS on `trips` Table
| Field | Detail |
|-------|--------|
| **File** | All SQL migration files |
| **Impact** | None of the migration files enable Row Level Security on the `trips` table. Using the Supabase anon key (which IS in the browser), any user can SELECT, INSERT, UPDATE, or DELETE **any trip** directly from the client. |
| **Proof** | Searched all `.sql` files for `trips.*ENABLE ROW LEVEL SECURITY` — zero results. |
| **Fix** | Add RLS to the trips table: users can read approved trips, users can only insert/update/delete their own trips, admins can manage all. |

---

### VULN-09: No RLS on `facebook_posts` Table
| Field | Detail |
|-------|--------|
| **File** | All SQL migration files |
| **Impact** | The `facebook_posts` table (used by the admin GP extractor) has no RLS. Any authenticated user can read all scraped Facebook data and insert/modify records. |
| **Fix** | Enable RLS. Only admin users should have access to this table. |

---

## MEDIUM Severity

### VULN-10: Error Messages Leak Internal Details
| Field | Detail |
|-------|--------|
| **File** | `api/verify-phone-otp.js` line 168, `api/send-phone-otp.js` line 117 |
| **Code** | `return res.status(500).json({ error: 'Verification failed: ' + err.message })` |
| **Impact** | Stack traces and internal error messages are returned to the client, helping attackers understand your infrastructure. |
| **Fix** | Return generic error messages to clients. Log detailed errors server-side only. |

---

### VULN-11: OTP Generated with `Math.random()` — Not Cryptographically Secure
| Field | Detail |
|-------|--------|
| **File** | `api/send-phone-otp.js` line 50 |
| **Code** | `Math.floor(100000 + Math.random() * 900000)` |
| **Impact** | `Math.random()` is not cryptographically secure. With enough samples, an attacker could predict future OTP codes. |
| **Fix** | Use `crypto.randomInt(100000, 999999)` (Node.js built-in CSPRNG). |

---

### VULN-12: Admin Email Mismatch — Hardcoded Admin in RLS vs `.env`
| Field | Detail |
|-------|--------|
| **File** | `supabase_migration.sql` lines 82-88 vs `.env` line 9 |
| **Detail** | RLS policies check `(auth.jwt() ->> 'email') = 'papamamadous@outlook.com'` but the `.env` admin email is `papamamadous@gmail.com`. These are different email providers. |
| **Impact** | Admin RLS policies may not match the actual admin account, potentially locking out the admin or granting access to the wrong account. |
| **Fix** | Align the admin email across all configurations. Better yet, use a role-based approach (`is_admin` column or JWT claim). |

---

### VULN-13: No Rate Limiting on Admin Panel or API Endpoints
| Field | Detail |
|-------|--------|
| **Files** | `server.js`, `api/send-approval-email.js`, `api/send-rejection-email.js` |
| **Impact** | The Express server has no rate limiting middleware. An attacker can brute-force the admin login (unlimited attempts), spam the email endpoints, or flood the OTP endpoint beyond Twilio's built-in cooldown. |
| **Fix** | Add `express-rate-limit` middleware. Implement account lockout after N failed admin login attempts. |

---

## LOW Severity

### VULN-14: Vite Path Traversal Vulnerability (CVE in dependency)
| Field | Detail |
|-------|--------|
| **Package** | `vite@5.1.4` |
| **Advisory** | GHSA-4w7w-66w2-5vf9 — Path Traversal in Optimized Deps `.map` Handling |
| **Fix** | Upgrade vite: `npm install vite@latest` |

---

### VULN-15: esbuild CORS Bypass in Dev Server
| Field | Detail |
|-------|--------|
| **Package** | `esbuild` (transitive via vite) |
| **Advisory** | GHSA-67mh-4wv8-2f99 — Any website can read dev server responses |
| **Fix** | Upgrade vite to v6.4.2+ or v8+. Dev-only risk but still important. |

---

## Attack Scenarios

### Scenario A: "Full Admin Takeover in 30 Seconds"
1. Visit the site, open DevTools → Sources
2. Search the JS bundle for `VITE_ADMIN` — find email & password `123456`
3. Navigate to `/?admin=true`
4. Log in with the exposed credentials
5. **Result:** Full admin access — approve/reject trips, manage all users, send emails

### Scenario B: "Drain the OpenAI Account"
1. Open DevTools → Sources, search for `sk-proj`
2. Copy the OpenAI API key
3. Use it in a script to make thousands of GPT-4 Vision calls
4. **Result:** Potentially thousands of dollars in charges

### Scenario C: "Impersonate Any User"
1. If the service role key leaks (same `.env` file), compute `HMAC-SHA256(serviceKey, "+1234567890")`
2. Sign in with `1234567890@phone.yobbu.app` + computed password
3. **Result:** Full access to any user's account

### Scenario D: "Delete All Trips via Browser Console"
1. Open browser console on yobbu.co
2. Run: `supabase.from('trips').delete().neq('id', '00000000-0000-0000-0000-000000000000')`
3. **Result:** All trip data deleted (no RLS protection)

---

## Remediation Priority

| Priority | Vuln | Action |
|----------|------|--------|
| **NOW** | VULN-01 | Remove `VITE_OPENAI_API_KEY`, proxy through server |
| **NOW** | VULN-02 | Delete `VITE_ADMIN_EMAIL/PASSWORD`, implement server auth |
| **NOW** | VULN-03 | Remove `VITE_ADMIN_API_SECRET`, use session-based auth |
| **NOW** | VULN-05 | Replace client-side admin auth with Supabase session checks |
| **NOW** | VULN-08 | Enable RLS on `trips` table immediately |
| **THIS WEEK** | VULN-07 | Replace deterministic passwords with secure tokens |
| **THIS WEEK** | VULN-09 | Enable RLS on `facebook_posts` table |
| **THIS WEEK** | VULN-06 | Move Twilio creds to Vercel env vars, set spending caps |
| **THIS WEEK** | VULN-11 | Use `crypto.randomInt()` for OTP generation |
| **THIS WEEK** | VULN-13 | Add rate limiting to all endpoints |
| **SOON** | VULN-04 | Rotate service role key if ever exposed |
| **SOON** | VULN-10 | Sanitize error responses |
| **SOON** | VULN-12 | Align admin email across all configs |
| **SOON** | VULN-14/15 | `npm update vite` |

---

## What's Actually Good

- `.gitignore` correctly excludes `.env` files
- API email endpoints sanitize HTML output (prevents XSS in emails)
- CORS origin checking is implemented on all API endpoints
- OTP brute-force protection (5 attempts max) is in place
- OTP cooldown (60s between sends) is implemented
- No `dangerouslySetInnerHTML` or `eval()` usage found in React code
- Phone number input validation uses E.164 regex
- Supabase anon key (not service key) is used on the client side

---

*End of report. Rotate all exposed keys immediately.*
