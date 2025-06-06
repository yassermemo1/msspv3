# Email Notification Setup

The MSSP Client Management Platform includes automated email notification functionality for:
- Contract renewal reminders
- Financial transaction alerts
- General system notifications

## Configuration

Add the following environment variables to your `.env` file:

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@your-domain.com
```

## Supported Email Providers

### Gmail
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Use App Password, not regular password
```

### Outlook/Office 365
```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Custom SMTP
```bash
SMTP_HOST=mail.your-domain.com
SMTP_PORT=587
SMTP_SECURE=false  # or true for SSL
SMTP_USER=your-username
SMTP_PASS=your-password
```

## Email Notification Types

### 1. Contract Reminders
Automatically sent at:
- 90 days before expiry
- 60 days before expiry
- 30 days before expiry
- 14 days before expiry
- 7 days before expiry
- 1 day before expiry

### 2. Financial Alerts
Sent when:
- New financial transactions are created
- High-value transactions (≥$10,000) are recorded
- Payment status changes

### 3. General Notifications
Can be triggered manually for:
- System announcements
- Client updates
- Custom alerts

## User Preferences

Users can control their email notifications in Settings:
- **Email Notifications**: Master toggle for all email notifications
- **Contract Reminders**: Toggle for contract expiry reminders
- **Financial Alerts**: Toggle for financial transaction notifications

## Testing Email Configuration

### Admin Test Endpoints

Admin users can test email functionality via API:

```bash
# Test general notification
POST /api/admin/test-email
{
  "type": "general",
  "recipientId": 1
}

# Test contract reminder
POST /api/admin/test-email
{
  "type": "contract",
  "recipientId": 1,
  "contractId": 1
}

# Test financial alert
POST /api/admin/test-email
{
  "type": "financial",
  "recipientId": 1,
  "transactionId": 1
}

# Manually trigger contract expiry check
POST /api/admin/trigger-contract-check
```

## Scheduled Tasks

The system runs automated tasks:
- **Daily at 9 AM**: Check for expiring contracts and send reminders
- **On Transaction Creation**: Send financial alerts to relevant team members

## Troubleshooting

### No emails being sent
1. Check that SMTP environment variables are set
2. Verify SMTP credentials are correct
3. Check server logs for email errors
4. Ensure user has email notifications enabled in settings

### Gmail App Passwords
For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password instead of your regular password

### Email templates
Email templates are automatically generated with:
- Professional HTML formatting
- Responsive design
- Company branding
- Clear call-to-action information

## Security Notes

- SMTP passwords should be stored securely in environment variables
- Never commit SMTP credentials to version control
- Use App Passwords or API keys when available
- Consider using environment-specific email configurations 