# Node.js Email Server Setup

This guide explains how to set up and use the Node.js server for sending emails with invoice attachments.

## Overview

The Invoice App now includes a Node.js server that handles email sending using standard SMTP protocols. This approach:

- Uses direct SMTP connection for reliable email delivery
- Properly handles PDF attachments
- Works with your existing email account (Gmail, Outlook, etc.)
- Runs on your local machine for complete privacy and control

## Setup Instructions

### 1. Install Dependencies

The server requires several Node.js packages. These should already be installed, but if you need to install them manually:

```bash
# Install the required packages
npm install cors nodemailer multer path fs dotenv

# Important: Make sure to use Express v4.18.x (not v5)
npm install express@4.18.3
```

**Note**: The server requires Express v4.18.x specifically. Express v5 may cause compatibility issues with path-to-regexp.

### 2. Create .env File

Create a file named `.env` in the root directory with the following content:

```
# Email Configuration
# For Gmail, you need to use an App Password: https://support.google.com/accounts/answer/185833
EMAIL_PASSWORD=your-app-password-here

# Server Configuration
PORT=3001
```

### 3. Gmail App Password Setup

For Gmail accounts, you need to set up an App Password:

1. Go to your Google Account settings: https://myaccount.google.com/
2. Select "Security"
3. Under "Signing in to Google", select "2-Step Verification" (must be enabled)
4. At the bottom, select "App passwords"
5. Create a new app password for "Mail" and "Other (Custom name)" - name it "Invoice App"
6. Copy the generated 16-character password
7. Paste this password in your `.env` file as EMAIL_PASSWORD

**For detailed instructions with screenshots, see [Gmail App Password Setup Guide](./gmail-app-password.md)**

### 4. Running the Server

To start the email server:

```bash
npm run server
```

For development with auto-restart:

```bash
npm run dev:server
```

The server will run on port 3001 by default.

### 5. Testing the Server

To check if the server is running correctly, open your browser and visit:

```
http://localhost:3001/api/test
```

You should see a JSON response: `{"message":"Server is running!"}`

## Important Notes

- The server uses CommonJS format (with `require()`) instead of ES modules
- The server file is named `server.cjs` to explicitly use CommonJS
- This avoids conflicts with the frontend's ES module system
- The server requires Express v4.18.x specifically (not v5)

## Using the Email Feature

1. Make sure the server is running
2. Generate your invoice PDF in the app
3. Enter recipient details and click "Send Email"
4. The app will send the email through your own email account

## Troubleshooting

### Authentication Failed

If you see authentication errors:

1. Double-check your EMAIL_PASSWORD in the .env file
2. For Gmail, ensure you're using an App Password, not your regular password
3. Make sure 2-Step Verification is enabled on your Google account

### Server Not Running

If the server isn't running:

1. Check if the terminal shows any errors
2. Make sure port 3001 is available
3. Try restarting the server

### Path-to-regexp Error

If you see an error with "Missing parameter name at 1: https://git.new/pathToRegexpError":

1. Make sure you're using Express v4.18.x (not v5)
2. Run: `npm uninstall express && npm install express@4.18.3`
3. Try running the server again

### Connection Refused Error

If you see "ERR_CONNECTION_REFUSED" in the browser console:

1. Make sure the server is running with `npm run server`
2. Check the terminal for any startup errors
3. Verify that port 3001 is not blocked by a firewall
4. Try using a different port in the .env file if 3001 is in use

### Email Not Sending

If emails aren't being sent:

1. Check for error messages in the server console
2. Verify your email account hasn't hit sending limits
3. Try using a different email provider

## Configuration for Other Email Providers

The server is configured for Gmail by default, but you can use other providers:

### Outlook/Hotmail

```javascript
const transporter = nodemailer.createTransport({
  service: "outlook",
  auth: {
    user: from,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

### Yahoo

```javascript
const transporter = nodemailer.createTransport({
  service: "yahoo",
  auth: {
    user: from,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

### Custom SMTP Server

```javascript
const transporter = nodemailer.createTransport({
  host: "your-smtp-server.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: from,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

## Security Considerations

1. Never commit your .env file to version control
2. The server only accepts requests from your own application
3. Files are temporarily stored and automatically deleted after sending
4. The server runs locally on your machine for maximum privacy
 