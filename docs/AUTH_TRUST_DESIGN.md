# Yobbu Auth & Trust System Design
## Mobile-First, Trust-First Connector Platform

---

## 1. PRODUCT STRATEGY

### Core Philosophy
**"Browse freely, verify to transact"**

Users can explore the app immediately, but verification gates unlock actions. This reduces signup friction while maintaining trust for actual transactions.

### Key Decisions

| Decision | Rationale |
|----------|-----------|
| Phone + OTP only | No passwords to forget; works on all phones |
| 4-digit PIN | Faster than 6 digits; sufficient with device binding |
| Progressive verification | Collect data only when needed |
| Tiered traveler levels | Higher-value jobs require more trust |
| In-app chat first | Protect phone numbers until both parties agree |
| Optional everything except phone | Email, Facebook, ID - all optional but rewarded |

---

## 2. SCREEN-BY-SCREEN USER JOURNEY

### A. SIGNUP FLOW (New Users)

#### Screen 1: Welcome
```
[Logo]

Send packages with travelers
going your way

[Continue with Phone]  ← Primary CTA
[Browse First]         ← Ghost button

Already have an account?
[Log In]
```

#### Screen 2: Enter Phone
```
What's your number?

We'll send you a code to verify.

[🇺🇸 +1] [ _ _ _   _ _ _   _ _ _ _ ]
         
[Continue] ← Disabled until valid

By continuing, you agree to our 
[Terms] and [Privacy Policy]
```

#### Screen 3: OTP Verification
```
Enter the 6-digit code

Sent to +1 (555) 123-4567

[1] [2] [3] [4] [5] [6]

Didn't get it?
[Resend code] ← 30s countdown
[Change number]
```

#### Screen 4: Create PIN
```
Create a 4-digit PIN

This keeps your account secure
on this device.

[•] [•] [•] [ ]

Forgot PIN? You'll need your phone
number to reset it.
```

#### Screen 5: Confirm PIN
```
Confirm your PIN

[•] [•] [•] [•]

[Pins don't match - try again]
```

#### Screen 6: Name & Role
```
What should we call you?

[First Name          ]
[Last Name (optional)  ]

I want to:
( ) Send packages
( ) Travel with packages
( ) Both

[Continue]
[Skip for now] ← Can finish in profile
```

#### Screen 7: Enable Biometrics (Optional)
```
Use Face ID next time?

Faster and more secure than typing
your PIN.

[Enable Face ID]
[Maybe Later] ← Can enable in settings
```

#### Screen 8: You're In! (Home)
```
🎉 Welcome, [Name]!

Start browsing trips or post your first.

[Find a Traveler]  [Post a Trip]

Want to add email for receipts?
[Add Email (optional)]
```

### B. LOGIN FLOW (Returning Users)

#### Screen 1: Quick Access
```
[Logo]

Welcome back!

Enter your PIN

[•] [•] [•] [ ]

[Use Face ID] ← If enabled

Not you? [Switch Account]
Forgot PIN? [Reset with SMS]
```

### C. PROGRESSIVE VERIFICATION (Triggered Later)

#### Email Addition (Prompted after first booking request)
```
Add email for receipts?

We'll send booking confirmations
and updates here.

[Email                 ]

[Add Email] [Skip]
```

#### Facebook Connect (Profile enrichment)
```
Link Facebook for trust?

Travelers see you're a real person.
We never post without permission.

[Connect Facebook]
[Not Now]
```

---

## 3. DATA MODEL

### Users Table
```sql
CREATE TABLE profiles (
  -- Core Identity
  id UUID PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  phone_verified_at TIMESTAMPTZ,
  
  -- Auth
  pin_hash TEXT, -- bcrypt hash of 4-digit PIN
  trusted_device_id TEXT, -- device fingerprint
  biometric_enabled BOOLEAN DEFAULT FALSE,
  
  -- Optional Identity
  email TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  facebook_id TEXT,
  facebook_connected_at TIMESTAMPTZ,
  
  -- Profile
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('sender', 'traveler', 'both')),
  
  -- Verification Tiers
  verification_tier INTEGER DEFAULT 1 CHECK (tier IN (1,2,3,4)),
  
  -- Tier 2: Device & Email
  trusted_device_bound_at TIMESTAMPTZ,
  
  -- Tier 3: ID Verification
  id_document_url TEXT,
  id_verification_status TEXT CHECK (status IN ('pending', 'approved', 'rejected')),
  selfie_url TEXT,
  liveness_check_passed BOOLEAN DEFAULT FALSE,
  id_verified_at TIMESTAMPTZ,
  
  -- Tier 4: Premium
  flight_itinerary_url TEXT,
  premium_verified_at TIMESTAMPTZ,
  
  -- Trust Metrics
  completed_trips INTEGER DEFAULT 0,
  completed_sends INTEGER DEFAULT 0,
  avg_rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  response_time_minutes INTEGER, -- average
  repeat_counterparties INTEGER DEFAULT 0,
  
  -- Safety
  reports_received INTEGER DEFAULT 0,
  blocks_received INTEGER DEFAULT 0,
  account_status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Reviews Table
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id),
  reviewer_id UUID REFERENCES profiles(id),
  reviewee_id UUID REFERENCES profiles(id),
  reviewer_role TEXT CHECK (role IN ('sender', 'traveler')),
  
  -- Rating
  stars INTEGER CHECK (stars BETWEEN 1 AND 5),
  
  -- Tags (multiple allowed)
  tags TEXT[] DEFAULT '{}', -- ['on_time', 'good_communication', 'reliable', 'paid_fast']
  
  -- Optional comment
  comment TEXT CHECK (LENGTH(comment) <= 500),
  
  -- Response from reviewee
  response TEXT,
  responded_at TIMESTAMPTZ,
  
  -- Visibility
  is_public BOOLEAN DEFAULT TRUE,
  moderated_at TIMESTAMPTZ,
  moderation_status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'removed')),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Trust Tags (Enum)
```sql
CREATE TYPE trust_tag AS ENUM (
  'on_time',           -- Traveler: delivered on schedule
  'good_communication', -- Both: responsive and clear
  'reliable',          -- Both: did what they promised
  'paid_fast',         -- Sender: quick payment
  'careful_handling',  -- Traveler: package arrived perfect
  'flexible',          -- Both: accommodating to changes
  'professional',      -- Both: business-like conduct
  'friendly'           -- Both: pleasant to work with
);
```

### Verification Log (Audit Trail)
```sql
CREATE TABLE verification_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL, -- 'phone_verified', 'id_submitted', 'tier_upgraded', etc.
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. TRUST & SECURITY RULES

### Verification Tiers & Permissions

| Tier | Requirements | Can Do |
|------|---------------|--------|
| **1** | Phone verified only | Browse, save favorites, contact support |
| **2** | Phone + Email + Trusted Device | Send booking requests, post trips under $500 value |
| **3** | + Government ID + Selfie | Post any trip value, accept high-value sends ($1000+) |
| **4** | + Flight proof | Accept premium jobs, get "Verified Traveler" badge |

### Action Gates

| Action | Minimum Tier | Other Requirements |
|--------|-------------|-------------------|
| Browse all trips | None | - |
| Save favorite routes | 1 | Phone verified |
| Contact traveler | 2 | Email added |
| Request to send | 2 | Trusted device |
| Post a trip | 2 | - |
| Accept $500+ send | 3 | ID verified |
| Accept $2000+ send | 4 | Flight verified |
| In-app chat unlock | 2 | Both parties confirmed interest |
| Share phone number | 3 | After chat exchange |

### Fraud Prevention

```javascript
// Risk scoring (pseudocode)
function calculateRiskScore(user, action) {
  let score = 0;
  
  // Negative signals
  if (user.reports_received > 2) score += 30;
  if (user.blocks_received > 5) score += 40;
  if (user.response_time_minutes > 1440) score += 10; // Slow responder
  if (user.created_at < 7 days ago) score += 15; // New account
  
  // Positive signals
  if (user.verification_tier >= 3) score -= 20;
  if (user.completed_trips > 5) score -= 15;
  if (user.avg_rating > 4.5) score -= 10;
  if (user.repeat_counterparties > 2) score -= 10;
  
  return Math.max(0, score);
}

// Actions based on score
// 0-20: Green - proceed
// 21-50: Yellow - extra verification required
// 51+: Red - block action, manual review
```

### Automatic Protections

1. **New traveler limits**: First 3 trips max $200 value
2. **Velocity checks**: Max 5 bookings per day for new users
3. **Geographic blocks**: Different rules for high-risk countries
4. **Device fingerprinting**: Alert on new device login
5. **PIN attempts**: Lock after 3 failed attempts, require SMS reset

---

## 5. EXACT UI COPY

### Microcopy Dictionary

| Scenario | English | French |
|----------|---------|--------|
| Phone input label | "Mobile number" | "Numéro de mobile" |
| OTP helper | "Code sent to {phone}" | "Code envoyé au {phone}" |
| PIN create | "Create 4-digit PIN" | "Créer un code PIN à 4 chiffres" |
| PIN confirm | "Confirm your PIN" | "Confirmer votre code PIN" |
| PIN mismatch | "PINs don't match. Try again." | "Les codes ne correspondent pas. Réessayez." |
| Biometric prompt | "Use {biometric} for faster login?" | "Utiliser {biometric} pour une connexion plus rapide?" |
| Trust badge: Phone | "📱 Phone verified" | "📱 Téléphone vérifié" |
| Trust badge: Email | "✉️ Email added" | "✉️ Email ajouté" |
| Trust badge: ID | "🛡️ ID verified" | "🛡️ Pièce d'identité vérifiée" |
| Trust badge: Premium | "✈️ Premium traveler" | "✈️ Voyageur premium" |
| Review tag: On time | "On time" | "À l'heure" |
| Review tag: Good comms | "Good communication" | "Bonne communication" |
| Review tag: Reliable | "Reliable" | "Fiable" |
| Block button | "Block user" | "Bloquer cet utilisateur" |
| Report button | "Report issue" | "Signaler un problème" |

### Error Messages

```
Invalid phone:
"Please enter a valid phone number"
"Veuillez entrer un numéro de téléphone valide"

Invalid OTP:
"Incorrect code. {attempts} tries remaining."
"Code incorrect. {attempts} essais restants."

Too many PIN attempts:
"Too many attempts. Reset via SMS sent."
"Trop de tentatives. Réinitialisation par SMS envoyée."

Action blocked (tier):
"Complete ID verification to accept high-value jobs"
"Vérifiez votre identité pour accepter des missions de grande valeur"

Chat locked:
"Both users must confirm interest before chat unlocks"
"Les deux utilisateurs doivent confirmer leur intérêt avant de discuter"
```

### Empty States

```
No trips posted yet:
"No trips yet. Post your first to start earning!"
"Pas encore de voyages. Publiez votre premier pour commencer à gagner!"

No reviews:
"No reviews yet. Complete trips to build your reputation."
"Pas encore d'avis. Complétez des voyages pour construire votre réputation."

Verification incomplete:
"Add ID to unlock high-value jobs"
"Ajoutez votre pièce d'identité pour débloquer les missions de grande valeur"
```

---

## 6. IMPLEMENTATION PRIORITY

### Phase 1: Core Auth (Week 1-2)
- [ ] Phone + OTP signup/login
- [ ] 4-digit PIN creation
- [ ] Basic profile (name, role)
- [ ] Session management

### Phase 2: Progressive Features (Week 3-4)
- [ ] Optional email
- [ ] Optional Facebook connect
- [ ] Biometric prompt
- [ ] Device binding

### Phase 3: Trust System (Week 5-6)
- [ ] Review system
- [ ] Star ratings
- [ ] Trust tags
- [ ] Traveler tier display

### Phase 4: Advanced Verification (Week 7-8)
- [ ] ID upload
- [ ] Selfie/liveness
- [ ] Flight proof
- [ ] In-app chat

### Phase 5: Safety (Week 9)
- [ ] Report/block
- [ ] Risk scoring
- [ ] Admin moderation tools

---

## Summary

This design prioritizes:
1. **Speed**: Phone + OTP is fastest on mobile
2. **Trust**: Progressive verification builds confidence
3. **Safety**: Tiered access prevents fraud
4. **UX**: One action per screen, clear copy

The "browse before verify" approach reduces signup drop-off while the tiered system ensures high-value transactions are protected.
