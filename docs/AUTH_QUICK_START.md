# Auth & Trust System - Quick Implementation Guide

## TL;DR Strategy

**"Phone first, PIN second, everything else later"**

---

## Recommended Flow (8 Screens)

### Signup (New User)

1. **Welcome** → [Continue with Phone]
2. **Phone** → [+1] [___ ___ ____] [Continue]
3. **OTP** → [1][2][3][4][5][6] [Resend 30s]
4. **Create PIN** → [•][•][•][_] 
5. **Confirm PIN** → [•][•][•][•]
6. **Name & Role** → [First] [Last] ( )Send ( )Travel ( )Both
7. **Biometric** → [Enable Face ID] [Maybe Later]
8. **Home** → 🎉 Welcome! [Find Traveler] [Post Trip]

### Login (Returning)

1. **PIN or Biometric** → [•][•][•][_] or [Use Face ID]

---

## Data Model (Essential Columns)

```sql
-- Core auth
ALTER TABLE profiles ADD COLUMN phone TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN phone_verified_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN pin_hash TEXT;
ALTER TABLE profiles ADD COLUMN trusted_device_id TEXT;
ALTER TABLE profiles ADD COLUMN biometric_enabled BOOLEAN DEFAULT FALSE;

-- Optional
ALTER TABLE profiles ADD COLUMN email TEXT;
ALTER TABLE profiles ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN facebook_id TEXT;

-- Verification tiers
ALTER TABLE profiles ADD COLUMN verification_tier INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN id_verification_status TEXT;

-- Trust
ALTER TABLE profiles ADD COLUMN completed_trips INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN avg_rating DECIMAL(2,1) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN response_time_minutes INTEGER;
```

---

## Tier Rules (What Unlocks What)

| Tier | Has | Can Do |
|------|-----|--------|
| 1 | Phone only | Browse, save favorites |
| 2 | + Email + Device | Request to send, post trips <$500 |
| 3 | + ID verified | Accept jobs $500+, share phone |
| 4 | + Flight proof | Accept premium jobs $2000+ |

---

## Key UI Copy

```javascript
// Welcome
"Send packages with travelers going your way"

// Phone
"What's your number? We'll send you a code."

// PIN
"Create a 4-digit PIN. This secures your account."

// Biometric
"Use Face ID next time? Faster than typing."

// Trust badges
"📱 Phone verified" / "✉️ Email added" / "🛡️ ID verified"

// Blocked action
"Complete ID verification to accept high-value jobs"
```

---

## Implementation Order

**Week 1:** Phone OTP + PIN  
**Week 2:** Email/Facebook (optional)  
**Week 3:** Reviews + ratings  
**Week 4:** ID verification + tiers  

---

## Files to Create

```
src/
  components/
    PhoneInput.jsx          # Country code + phone
    OTPInput.jsx            # 6-digit boxes
    PINInput.jsx            # 4-digit secure input
    BiometricPrompt.jsx     # Face ID / Touch ID
    TrustBadge.jsx          # Tier display
    ReviewCard.jsx          # Star + tags display
    VerificationGate.jsx    # Blocks actions by tier
  
  pages/
    Welcome.jsx             # Screen 1
    PhoneEntry.jsx          # Screen 2
    OTPVerify.jsx           # Screen 3
    PINCreate.jsx           # Screens 4-5
    OnboardingProfile.jsx   # Screen 6
    BiometricSetup.jsx      # Screen 7
```

---

## Security Checklist

- [ ] PIN hashed with bcrypt
- [ ] Max 3 PIN attempts → SMS reset
- [ ] Device fingerprinting
- [ ] Rate limit OTP sends (1 per minute)
- [ ] Review moderation queue
- [ ] Auto-suspend on 3+ reports

---

See `AUTH_TRUST_DESIGN.md` for complete details.
