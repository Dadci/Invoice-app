# Auto-Starting the Invoice App

This guide explains various methods to automatically start the Invoice App whenever you need it.

## Quick Start Options

### Option 1: Double-Click Launcher (Simplest)

1. In your Invoice App folder, find the file: `start-invoice-app.command`
2. Double-click this file to start both the frontend and backend servers
3. The app will open in your default browser automatically

### Option 2: Single Command in Terminal

1. Open Terminal
2. Navigate to your Invoice App folder:
   ```bash
   cd /Users/raouf/Desktop/Dev/Invoice-app
   ```
3. Run the start command:
   ```bash
   npm run start
   ```

## Setting Up Automatic Startup at Login (macOS)

If you want the Invoice App to start automatically when you log in to your Mac:

### Method 1: Using Login Items

1. Copy the `start-invoice-app.command` file to your Applications folder
2. Open System Preferences > Users & Groups
3. Select your user account
4. Click on "Login Items"
5. Click the + button
6. Navigate to the Applications folder and select `start-invoice-app.command`
7. Click "Add"

Now the Invoice App will start automatically when you log in.

### Method 2: Using macOS Automator (More Flexible)

1. Open Automator (found in Applications)
2. Create a new Application
3. Add a "Run Shell Script" action
4. Enter the following script:
   ```bash
   cd /Users/raouf/Desktop/Dev/Invoice-app
   npm run start
   ```
5. Save the Application to your Applications folder as "Start Invoice App"
6. Add this application to your Login Items as described in Method 1

### Method 3: Create a LaunchAgent (Advanced)

1. Create a file in `~/Library/LaunchAgents/com.user.invoiceapp.plist`:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
       <key>Label</key>
       <string>com.user.invoiceapp</string>
       <key>ProgramArguments</key>
       <array>
           <string>bash</string>
           <string>-c</string>
           <string>cd /Users/raouf/Desktop/Dev/Invoice-app && npm run start</string>
       </array>
       <key>RunAtLoad</key>
       <true/>
       <key>KeepAlive</key>
       <true/>
   </dict>
   </plist>
   ```
2. Load the LaunchAgent:
   ```bash
   launchctl load ~/Library/LaunchAgents/com.user.invoiceapp.plist
   ```

## Stopping the Servers

To stop the Invoice App servers:

1. Find the Terminal window running the servers
2. Press `Ctrl+C` to stop both servers
3. Or close the Terminal window

## Troubleshooting

### If the app doesn't start:

1. Check if another instance is already running
2. Verify that port 3000 (frontend) and 3001 (backend) are not in use
3. Try running each server manually to see specific errors:
   ```bash
   npm run dev    # Start frontend
   npm run server # Start backend
   ```

### If the browser doesn't open automatically:

Manually visit:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api/test (should show "Server is running!")
