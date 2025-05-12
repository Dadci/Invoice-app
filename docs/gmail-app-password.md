# Setting Up Gmail App Password

To use Gmail with the Invoice App email functionality, you need to set up an App Password. This is required because Gmail has strict security policies that prevent apps from using your regular password.

## Step-by-Step Instructions

### 1. Enable 2-Step Verification

1. Go to your [Google Account](https://myaccount.google.com/)
2. Select **Security** from the left navigation panel
3. Under "Signing in to Google", select **2-Step Verification**
4. If not already enabled, follow the steps to turn on 2-Step Verification
5. You may need to verify your identity with a code sent to your phone

### 2. Create an App Password

1. After enabling 2-Step Verification, go back to the [Security page](https://myaccount.google.com/security)
2. Under "Signing in to Google", select **App passwords**
   - If you don't see this option, 2-Step Verification may not be properly enabled
3. At the bottom, click **Select app** and choose **Mail**
4. Click **Select device** and choose **Other (Custom name)**
5. Enter "Invoice App" as the name
6. Click **Generate**

### 3. Copy Your App Password

1. Google will display a 16-character app password (with spaces)
2. **Copy this password** - it will only be shown once!
3. Example format: `xxxx xxxx xxxx xxxx`

### 4. Update Your .env File

1. Navigate to your Invoice App directory
2. Open the `.env` file in a text editor
3. Find the line that says `EMAIL_PASSWORD=your-app-password-here`
4. Replace `your-app-password-here` with the 16-character password you copied
   - You can include or remove the spaces - both will work
5. Save the file

### 5. Restart the Server

1. If the server is running, stop it (Ctrl+C in the terminal)
2. Start it again with `npm run server`

## Troubleshooting

### "Invalid login" Error

If you still see "Invalid login" or "Application-specific password required" errors:

1. Make sure you copied the entire 16-character password
2. Check that 2-Step Verification is fully enabled (not just in progress)
3. Try generating a new App Password and update your .env file

### Security Concerns

- App Passwords give full access to your Gmail account
- They can't be used to log into your account directly
- You can revoke App Passwords at any time from your Google Account security settings
- For additional security, consider creating a separate Gmail account just for sending invoices

## Important Notes

- Never share your App Password with anyone
- Don't commit your .env file to version control
- You can have multiple App Passwords for different applications
- If you're worried about security, you can delete the App Password after you're done using it
