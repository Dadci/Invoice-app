# Email Setup for Invoice App

This guide explains the email options available in the Invoice App.

## Email Options

The Invoice App provides two methods for sending invoices:

### 1. Direct Email (Best for Testing)

The app includes a built-in email sending capability using SMTP.js:

- **Simple Testing**: Works for basic testing but has limitations
- **PDF Attachments**: Attaches invoices as PDF files
- **May Have Restrictions**: Free SMTP services often have sending limitations

### 2. Email Client (Recommended for Personal Use)

The most reliable option is using your own email client:

- **Most Reliable**: Uses your existing email account with your credentials
- **No Limitations**: No third-party restrictions or authentication issues
- **Full Control**: You can see exactly what's being sent
- **Simple Process**:
  1. Click "Generate PDF" to create the invoice
  2. Click "Use email client" to open your email app
  3. The PDF will open in another tab for you to download and attach
  4. Send the email normally from your email client

## How to Use the Email Client Option

1. In the Email Invoice modal, click "Generate PDF" first
2. After the PDF is generated, click "Use email client"
3. Your default email app will open with pre-filled recipient, subject, and message
4. The PDF will open in a new browser tab
5. Save the PDF (usually Ctrl+S or Cmd+S)
6. Attach the PDF to your email
7. Send the email as normal

This approach is the most reliable because it uses your own email credentials without any third-party services.

## Troubleshooting Direct Email

If you're experiencing issues with the direct email option:

1. This is expected - free SMTP services have significant limitations
2. The direct option is primarily for testing purposes
3. For reliable sending, use the "Use email client" option

## Your Business Email

Make sure your business email is set correctly in Settings, as it's used as the sender address for both email methods.

## Setting Up Your Own SMTP Server (Advanced)

For dedicated users who want direct email functionality:

1. Create your own account at [ElasticEmail](https://elasticemail.com), [SMTP2GO](https://www.smtp2go.com/), or a similar service
2. Get your SMTP credentials or secure token
3. Update the EmailInvoiceModal.jsx file with your credentials

Note that even with your own SMTP server, you may still face deliverability issues as many email services have strict policies about sending emails from third-party applications.
