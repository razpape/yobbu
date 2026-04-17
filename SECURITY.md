# Yobbu Security Implementation Guide

## Overview
This document outlines the security measures implemented in the Yobbu application to protect user data and prevent common attacks.

---

## 🔐 Authentication & Authorization

### OTP (One-Time Password) System
- **Secure Generation**: Uses `crypto.randomBytes()` for cryptographically secure 6-digit codes
- **Code Hashing**: OTP codes are hashed with SHA256 before storage; never stored in plaintext
- **Timing-Safe Comparison**: Uses `crypto.timingSafeEqual()` to prevent timing attacks
- **Expiration**: Codes expire after 10 minutes
- **Code Destruction**: Codes are deleted immediately after successful verification

### Session Management
- **Secure Tokens**: Supabase-managed JWT tokens with automatic refresh
- **Session Creation**: Uses `supabase.auth.admin.createSession()` for secure session generation
- **Token Storage**: Tokens stored in `localStorage` with key `yobbu-auth`
- **Auto-Refresh**: Tokens automatically refresh before expiration

### Admin Authentication
- **Bearer Tokens**: Admin endpoints require valid Supabase session tokens in Authorization header
- **Email Verification**: Only users with emails in `ADMIN_EMAILS` environment variable can access admin endpoints
- **Session Validation**: Tokens verified server-side on every admin request

---

## 🛡️ Rate Limiting & Brute Force Protection

### OTP Request Rate Limiting
- **Phone-Level**: Max 3 OTP requests per phone number per hour
- **IP-Level**: Max 10 different phone numbers per IP per hour
- **Cooldown**: 60-second minimum between requests for same phone number
- **Enforcement**: Rate limits enforced at database level with timestamp verification

### OTP Verification Protection
- **Attempt Limit**: Maximum 5 failed verification attempts per OTP
- **Lockout**: After 5 failures, code is invalidated and must be re-requested
- **Tracking**: Failed attempts logged with user identifier for security auditing

### API-Wide Rate Limiting
- **Global Limit**: 100 requests per IP per 15 minutes
- **Headers**: Rate limit information sent in response headers
- **Exclusions**: OPTIONS requests excluded from rate limits

---

## 🔒 Data Security

### Input Validation
- **Phone Numbers**: Validated against E.164 format with additional country code checks
- **Email Addresses**: Basic email format validation required
- **Rejection**: Invalid inputs rejected with 400 status, no processing
- **No Injection**: All inputs validated before database operations

### Data Sanitization
- **HTML Escaping**: User input in emails sanitized to prevent HTML/JavaScript injection
- **Special Characters**: `<>&"'` escaped to HTML entities
- **Safe Output**: All user-provided data sanitized before including in email templates

### Password Security
- **Secure Generation**: Random UUID used for initial passwords
- **Not Exposed**: Passwords never returned to client; only session tokens used
- **Hashing**: Passwords hashed by Supabase auth system

---

## 🌐 Network Security

### HTTPS/TLS Enforcement
- **Production**: All HTTP requests redirected to HTTPS in production
- **Header Checking**: Uses `x-forwarded-proto` header from reverse proxies
- **HSTS**: Strict-Transport-Security header enforces HTTPS for 1 year

### CORS (Cross-Origin Resource Sharing)
- **Whitelist**: Only specified origins allowed
- **Production**: `localhost:5173` excluded in production
- **Allowed**: `https://yobbu.vercel.app`, `https://yobbu.com`
- **Headers**: Proper CORS headers set on all responses

### Security Headers
- **X-Content-Type-Options**: `nosniff` - Prevents MIME type sniffing
- **X-Frame-Options**: `DENY` - Prevents clickjacking attacks
- **X-XSS-Protection**: `1; mode=block` - Legacy XSS protection
- **CSP**: Restricts script/style sources to same-origin only
- **Referrer-Policy**: `strict-origin-when-cross-origin` - Limits referrer info

### Request Size Limits
- **Body Limit**: 10KB maximum JSON payload to prevent resource exhaustion
- **Timeout**: 30-second request/response timeout

---

## 📝 Audit & Logging

### Security Event Logging
All security events logged to `/logs/security.log`:
- **Failed Authentication**: Invalid codes, expired sessions
- **Unauthorized Access**: Attempts to access restricted endpoints
- **Rate Limit Breaches**: IP/phone rate limit violations
- **Brute Force Attempts**: Multiple failed OTP verification attempts
- **Invalid Inputs**: Malformed phone numbers, emails

### Log Format
```json
{
  "timestamp": "2026-04-17T12:00:00.000Z",
  "type": "FAILED_AUTH",
  "reason": "Invalid code",
  "phone": "****1234"
}
```

### Log Retention
- Logs stored in `logs/` directory
- Recommended: Rotate logs daily, retain 30 days
- Sensitive data masked: Phone numbers show only last 4 digits

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] **Rotate Secrets**: Generate new API keys, passwords, email credentials
- [ ] **Set Environment Variables**: Configure all required env vars in hosting platform
- [ ] **Remove Dev Origins**: Ensure `localhost` not in CORS whitelist for production
- [ ] **Enable HTTPS**: Verify SSL/TLS certificate is valid
- [ ] **Configure Admin Emails**: Set `ADMIN_EMAILS` environment variable
- [ ] **Enable Logging**: Ensure `/logs` directory writable on server
- [ ] **Run npm audit**: Check for known vulnerabilities: `npm audit fix`
- [ ] **Test Rate Limiting**: Verify rate limits working as expected
- [ ] **Test Admin Access**: Verify only authorized admins can access admin endpoints
- [ ] **Database Backups**: Enable automated backups in Supabase
- [ ] **Monitor Logs**: Set up alerts for security events

---

## 🔄 Environment Variables

### Required
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_VERIFY_SERVICE_SID=your-verify-sid
TWILIO_PHONE_NUMBER=+1234567890
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
ADMIN_API_SECRET=your-admin-secret
ADMIN_EMAILS=admin@yobbu.co,admin2@yobbu.co
```

### Optional
```
NODE_ENV=production
ALLOWED_ORIGINS=https://yobbu.vercel.app,https://yobbu.com
API_PORT=3001
DEV_SKIP_SMS=false
```

---

## 📊 Security Testing

### Manual Testing Checklist
- [ ] Test OTP with invalid phone numbers (should reject)
- [ ] Test rate limiting with rapid requests (should block)
- [ ] Test brute force protection (5 wrong attempts locks code)
- [ ] Test admin endpoints without auth (should return 401)
- [ ] Test CORS from unauthorized origin (should block)
- [ ] Verify error messages are generic (no info leakage)
- [ ] Check security headers in response (use browser dev tools)
- [ ] Test HTTPS redirect in production
- [ ] Verify logs are created for security events
- [ ] Test email sanitization (try HTML in input)

---

## 🔗 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [E.164 Phone Format](https://en.wikipedia.org/wiki/E.164)
- [Supabase Security](https://supabase.com/docs/guides/auth)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## 📧 Reporting Security Issues

Found a security vulnerability? Please report it to: **security@yobbu.co** with details of the issue. Do not open public GitHub issues for security problems.

---

**Last Updated**: April 2026
**Version**: 1.0.0
