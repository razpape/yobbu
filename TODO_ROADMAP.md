# Yobbu App - TODO & Roadmap

> Last updated: April 8, 2026

---

## 🔴 CRITICAL - Fix ASAP

### 1. Facebook OAuth (IN PROGRESS)
**Status:** Not working - redirects to homepage with `state parameter missing` error
- [ ] Debug Facebook redirect URI mismatch
- [ ] Try adding `https://wkjphmwdriwhosbsysyv.supabase.co/auth/v1/callback?provider=facebook` to Valid OAuth Redirect URIs
- [ ] Alternative: Remove Facebook button, keep only Google + Email for now
- [ ] Test after each fix

### 2. Database Schema
**Status:** May need updates
- [ ] Add `flight_number` column to `trips` table:
  ```sql
  ALTER TABLE trips ADD COLUMN flight_number TEXT;
  ```
- [ ] Verify all RLS policies are working correctly

---

## 🟠 HIGH PRIORITY - For Connector-Only Model

**Business Model:** Matching platform only. No payments, no disputes. Users connect via WhatsApp and handle everything externally.

### 3. Trust & Verification System ⭐ ✅ COMPLETED
**Why:** Trust is everything when you're not handling payments
- [x] WhatsApp verification (already done)
- [x] Flight number field (already done)
- [x] **ID Verification badge** - Upload passport/driver's license
- [x] **Social proof** - Link Facebook/LinkedIn profile
- [x] **Completed trips counter** visible on profile
- [x] **"Super Traveler"** badge after 5+ successful trips

**Components created:**
- `TrustBadges.jsx` - Displays all badges (WhatsApp, ID, Flight, Super Traveler, Social)
- `IDVerificationUpload.jsx` - Upload ID docs with status tracking
- `SocialProfileLinks.jsx` - Link Facebook/LinkedIn profiles

**Database migration:** `trust_verification_migration.sql`
- New columns: `id_document_url`, `id_verification_status`, `facebook_url`, `linkedin_url`, `completed_trips`, `super_traveler`
- New `reviews` table with triggers for auto-updating ratings

### 4. Simple Booking Request (No Payment)
**Why:** Let senders "book" a spot, traveler confirms via WhatsApp
- [ ] "Request to Send" button on trip card
- [ ] Traveler gets notification (email + WhatsApp)
- [ ] Traveler approves/rejects in app
- [ ] Both get WhatsApp contact to arrange details
- [ ] No money changes hands in app

### 5. Rating & Review System
**Why:** Builds trust and weeds out bad actors
- [ ] Rate travelers 1-5 stars after completed delivery
- [ ] Write text reviews
- [ ] Display average rating + review count on profile
- [ ] **Flag/report bad travelers** - admin can ban
- [ ] Reviews only visible after both parties complete

---

## 🟡 MEDIUM PRIORITY - Enhancements

### 6. Route Matching & Notifications
**Why:** Help senders find travelers automatically
- [ ] Save favorite routes (e.g., "NYC → Dakar")
- [ ] Get email/WhatsApp notification when matching trip posted
- [ ] Subscribe to route alerts
- [ ] Weekly digest of new trips matching saved routes

### 7. Search & Filter Improvements
- [ ] Filter by traveler rating (4+ stars only)
- [ ] Filter by verification level (WhatsApp verified, ID verified)
- [ ] Filter by flight date range
- [ ] Sort by: most reliable, cheapest, soonest departure

### 8. Traveler Incentives
- [ ] Referral code: "Invite a friend traveler, get premium badge"
- [ ] Leaderboard: Top travelers by completed trips
- [ ] Priority listing for verified travelers

---

## � CONTAINER SHIPPING (B2B Expansion)

**New User Type:** Shipping Companies (not individual travelers)
**Business Model:** Same connector approach - match shippers with container space

### Container Company Features
- [ ] **Business account type** - Company name, license number, tax ID
- [ ] **Port-to-port routes** instead of city-to-city
- [ ] **Container types:** 20ft, 40ft, LCL (less than container load)
- [ ] **Pricing per cubic meter** (not per kg)
- [ ] **Departure/Arrival ports** (e.g., Port of New York → Port of Dakar)
- [ ] **Transit time:** Weeks instead of days
- [ ] **Bill of lading** document upload
- [ ] **Customs clearance** assistance badge

### How It's Different from Travelers

| Feature | Individual Travelers | Container Companies |
|---------|---------------------|---------------------|
| **Speed** | Fast (flight same day) | Slow (sea 2-6 weeks) |
| **Volume** | 5-50 kg | 100 kg - 20,000 kg |
| **Price** | Per kg ($5-15/kg) | Per m³ ($100-400/m³) |
| **Route** | Airport to airport | Port to port |
| **Verification** | WhatsApp + ID | Business license + Tax ID |
| **User** | Individual | Company account |

### Database Changes Needed
```sql
-- Add user type
ALTER TABLE profiles ADD COLUMN user_type TEXT DEFAULT 'traveler'; 
-- 'traveler' | 'container_company' | 'sender'

-- Container trips table
CREATE TABLE container_shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES profiles(id),
  departure_port TEXT,
  arrival_port TEXT,
  departure_date DATE,
  arrival_date DATE,
  container_type TEXT, -- '20ft', '40ft', 'LCL'
  available_space_m3 DECIMAL,
  price_per_m3 DECIMAL,
  currency TEXT DEFAULT 'USD',
  includes_customs BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### UI Changes
- [ ] Toggle on homepage: "Individual Travelers" | "Container Shipping"
- [ ] Different search filters for containers
- [ ] Company profile page (show fleet size, years in business)
- [ ] Port selector (not city selector)

---

## �� NICE TO HAVE - Future Ideas

### 9. Mobile App
- [ ] Build React Native or Expo app
- [ ] Same features as web
- [ ] Push notifications work better on mobile

### 10. Insurance Option
- [ ] Optional insurance for high-value items
- [ ] Calculate based on item value
- [ ] Integration with insurance API

### 11. Multi-Stop Trips
- [ ] Allow travelers to add multiple stops
- [ ] Calculate total space per leg

### 12. Item Categories
- [ ] Documents, Electronics, Medicine, Clothes, etc.
- [ ] Special handling instructions per category

### 13. Estimated Delivery Time
- [ ] Show estimated arrival based on flight
- [ ] Integration with flight tracking API

### 14. Referral System
- [ ] Invite friends, get credits
- [ ] Both sender and traveler get bonus

---

## 🐛 BUGS TO FIX

| Bug | Severity | Status |
|-----|----------|--------|
| Facebook OAuth redirect error | High | In Progress |
| Profile 404 for new OAuth users | Medium | Fixed with trigger |
| WhatsApp verification not enforced | Low | Disabled for now |
| - | - | - |

---

## 📊 COMPLETED ✅

- ✅ Basic authentication (Email, Phone, Google)
- ✅ WhatsApp verification system (inbound/outbound)
- ✅ Admin panel for trip/user management
- ✅ Flight number field with recommendation
- ✅ Trip posting with approval workflow
- ✅ Browse and search trips
- ✅ Contact traveler via WhatsApp
- ✅ Profile pages
- ✅ Responsive design

---

## 💡 WORKING ON NOW

1. Push code changes for flight number field
2. Debug Facebook OAuth (or remove it)
3. Next: Simple booking request system (no payment)

---

## 📝 NOTES

- **Supabase Project ID:** `wkjphmwdriwhosbsysyv`
- **Facebook App ID:** `985392293827679`
- **Vercel URL:** `https://yobbu.vercel.app/`
- **Test Card:** Use Google OAuth to test (working)

---

**Next Action:** Choose one from 🔴 CRITICAL or 🟠 HIGH PRIORITY and start working on it.
