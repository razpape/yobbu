# WhatsApp Inbound Verification Setup

This document explains how to set up the inbound WhatsApp verification system for Yobbu travelers.

## Overview

**Inbound verification** allows travelers to verify their WhatsApp by sending a code TO your WhatsApp business number, rather than receiving an OTP FROM you. This is often more reliable in regions with SMS delivery issues.

### How it works:
1. User generates a unique 6-digit code
2. User sends the code to your WhatsApp business number
3. Webhook receives the message and verifies the code
4. User's account is automatically verified

## Setup Instructions

### 1. Database Migration

Run the migration file to add the necessary columns:

```bash
# Run in Supabase SQL Editor
supabase_inbound_migration.sql
```

This adds:
- `whatsapp_inbound_code` - The code the user must send
- `whatsapp_inbound_expires_at` - Code expiry timestamp
- `whatsapp_inbound_attempts` - Rate limiting counter
- `whatsapp_inbound_verified_from` - Source phone number

### 2. Environment Variables

Add to your `.env` file:

```
# Your WhatsApp Business API number (for display purposes)
WHATSAPP_BUSINESS_NUMBER=+1234567890

# Supabase service role key (for API routes)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. WhatsApp Business API / Webhook Provider

You need a WhatsApp Business API provider to receive incoming messages. Popular options:

#### Option A: Twilio WhatsApp
1. Sign up at [twilio.com](https://twilio.com)
2. Get a WhatsApp-enabled number
3. Set webhook URL: `https://yourdomain.com/api/verify-inbound-message`
4. Configure the webhook to forward incoming messages

#### Option B: Meta Business Platform (Direct)
1. Set up WhatsApp Business API through Meta
2. Configure webhook at `https://yourdomain.com/api/verify-inbound-message`
3. Subscribe to `messages` webhook events

#### Option C: 360dialog / WATI / Other Providers
1. Configure webhook URL in provider dashboard
2. Ensure message body and sender number are passed

### 4. Webhook Configuration

The webhook handler is at `/api/verify-inbound-message.js` and expects:

**Request Format:**
```json
{
  "From": "+1234567890",
  "Body": "123456"
}
```

Or:
```json
{
  "from": "+1234567890",
  "message": "123456"
}
```

### 5. Testing

1. Sign up as a new traveler
2. At the WhatsApp verification step, choose "Send us a message"
3. A 6-digit code will be generated
4. Send that code to your WhatsApp business number
5. The system should automatically verify the user

## Security Considerations

1. **Rate Limiting**: Codes expire after 10 minutes and are single-use
2. **Phone Hashing**: Phone numbers are SHA-256 hashed before storage
3. **Code Uniqueness**: Each code is randomly generated and unique
4. **Audit Logging**: All attempts are logged in `whatsapp_inbound_logs`

## Troubleshooting

### Code not found
- Check if code has expired (10 minute limit)
- Verify webhook is receiving messages correctly
- Check Supabase logs for errors

### Webhook not receiving messages
- Verify webhook URL is publicly accessible
- Check SSL certificate is valid
- Ensure webhook is configured in provider dashboard

### Provider-specific notes

#### Twilio
- Use POST method
- Content-Type: application/x-www-form-urlencoded
- Request body will be FormData, not JSON

#### Meta
- Verify webhook via GET challenge
- Messages come as JSON payload
- May need signature verification

## API Endpoints

### POST /api/generate-inbound-code
Generates a verification code for the user.

**Request:**
```json
{
  "userId": "uuid"
}
```

**Response:**
```json
{
  "code": "123456",
  "expiresAt": "2024-01-01T12:00:00Z",
  "instructions": {
    "en": "Send this code to our WhatsApp: 123456",
    "fr": "Envoyez ce code à notre WhatsApp : 123456"
  },
  "businessNumber": "+1234567890"
}
```

### POST /api/verify-inbound-message
Webhook handler for incoming WhatsApp messages.

**Response:**
```json
{
  "status": "success",
  "message": "WhatsApp verified successfully",
  "userId": "uuid"
}
```

## Files Changed

- `api/generate-inbound-code.js` - New API endpoint
- `api/verify-inbound-message.js` - New webhook handler
- `src/components/WhatsAppInboundVerification.jsx` - Standalone inbound verification modal
- `src/components/AuthModal.jsx` - Updated with inbound verification option
- `supabase_inbound_migration.sql` - Database migration

## Support

For issues or questions:
1. Check webhook logs in your provider dashboard
2. Verify environment variables are set correctly
3. Check Supabase RLS policies allow updates
