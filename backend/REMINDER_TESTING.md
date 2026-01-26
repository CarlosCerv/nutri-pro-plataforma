# Appointment Reminder System - Testing Guide

## Overview

The appointment reminder system automatically sends email and SMS reminders 24 hours before scheduled appointments.

## Configuration

### Email Setup (Gmail Example)

1. Create or use an existing Gmail account
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
4. Add to `.env`:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   EMAIL_FROM=Nutrition Platform <your-email@gmail.com>
   ```

### SMS Setup (Twilio)

1. Create a Twilio account at https://www.twilio.com
2. Get a phone number from Twilio console
3. Find your Account SID and Auth Token
4. Add to `.env`:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### Testing Without External Services

If you don't want to configure email/SMS yet, the system will still work but will only log to console without actually sending messages.

## How It Works

1. **Cron Schedule**: Runs every hour at minute 0 (e.g., 1:00, 2:00, 3:00, etc.)
2. **Time Window**: Looks for appointments 23-25 hours in the future (24 hours ±1 hour)
3. **Filtering**: Only sends to appointments that:
   - Are in "scheduled" status
   - Haven't already received a reminder (`reminderSent: false`)
4. **Notification**: Attempts both email and SMS (if contact info available)
5. **Tracking**: Updates appointment with:
   - `reminderSent: true`
   - `reminderSentAt: <timestamp>`
   - `reminderEmail: true/false`
   - `reminderSMS: true/false`

## Manual Testing

### Option 1: Run Test Script

```bash
cd backend
node src/scripts/testReminders.js
```

This will:
- Connect to the database
- Check for appointments needing reminders
- Show results in console

### Option 2: Create Test Appointment

1. **Create a test appointment** for exactly 24 hours from now:
   - Use the frontend or API to create an appointment
   - Set date to tomorrow at the current time
   - Ensure patient has email and/or phone

2. **Wait for cron or trigger manually**:
   - Wait for the next hour mark for automatic execution, or
   - Run the test script: `node src/scripts/testReminders.js`

3. **Check results**:
   - Check patient's email inbox
   - Check patient's phone for SMS
   - Check database: appointment should have `reminderSent: true`

### Option 3: Check Logs

The server logs will show:
- When cron job starts: `[Cron] 🚀 Starting appointment reminder cron job...`
- Each hourly execution: `[Cron] ⏰ Reminder cron triggered at <timestamp>`
- Reminder processing: `[Reminder Service]` messages
- Email status: `[Email Service]` messages
- SMS status: `[SMS Service]` messages

## Expected Log Output

### Successful Reminder:
```
[Cron] ⏰ Reminder cron triggered at 27/12/2025 13:00:00

[Reminder Service] 🔍 Checking for appointments needing reminders...
[Reminder Service] Looking for appointments between:
  Start: 28/12/2025 12:00:00
  End:   28/12/2025 14:00:00
[Reminder Service] 📋 Found 1 appointment(s) needing reminders

[Reminder Service] 📤 Processing reminder for:
  Patient: John Doe
  Date: 28/12/2025 at 13:00
[Email Service] ✅ Reminder sent to john@example.com - Message ID: <...>
[SMS Service] ✅ Reminder sent to +521234567890 - SID: SM...
[Reminder Service] ✅ Reminder marked as sent (Email: true, SMS: true)

[Reminder Service] 📊 Summary: 1 sent, 0 failed
```

### No Appointments:
```
[Cron] ⏰ Reminder cron triggered at 27/12/2025 13:00:00

[Reminder Service] 🔍 Checking for appointments needing reminders...
[Reminder Service] ✅ No appointments need reminders at this time
```

### Without Configuration:
```
[Email Service] Email not configured - skipping email reminder
[SMS Service] Twilio not configured - skipping SMS reminder
```

## Troubleshooting

### No emails being sent
- Check EMAIL_* variables in `.env`
- Verify Gmail App Password is correct
- Check spam folder
- Review server logs for errors

### No SMS being sent
- Check TWILIO_* variables in `.env`
- Verify Twilio account has credit
- Verify phone number format (must include country code)
- Mexico numbers: +521234567890

### Cron not running
- Check server startup logs for: `[Cron] ✅ Reminder cron job started successfully`
- Verify server is running
- Check system time is correct

### Reminders sent multiple times
- This shouldn't happen - once `reminderSent: true`, it won't send again
- If it does, check database for duplicate appointments

## Database Verification

Check appointment reminder status in MongoDB:

```javascript
db.appointments.find({
  reminderSent: true
}).sort({ reminderSentAt: -1 }).limit(10)
```

This shows the 10 most recent appointments that received reminders.
