const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Setup temporary storage for PDF files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Create temp directory if it doesn't exist
        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        // Use original filename with timestamp to avoid conflicts
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Email sending endpoint
app.post('/api/send-email', upload.single('attachment'), async (req, res) => {
    try {
        const { to, from, subject, message } = req.body;
        const attachment = req.file;

        console.log('Received email request:', { to, from, subject });
        console.log('Attachment:', attachment ? attachment.originalname : 'No attachment');

        if (!to || !from || !subject || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if EMAIL_PASSWORD is set
        if (!process.env.EMAIL_PASSWORD || process.env.EMAIL_PASSWORD === 'your-app-password-here') {
            console.error('Error: EMAIL_PASSWORD not set in .env file or still has default value');
            return res.status(500).json({
                error: 'Email configuration error',
                details: 'App password not configured. Please set up an app password in your .env file.'
            });
        }

        // Create a reusable transporter
        // Note: This example uses Gmail, but you can configure any SMTP service
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: from, // Use the sender's email
                pass: process.env.EMAIL_PASSWORD // Use an app password
            }
        });

        // Email options
        const mailOptions = {
            from: from,
            to: to,
            subject: subject,
            text: message,
            attachments: attachment ? [
                {
                    filename: attachment.originalname,
                    path: attachment.path
                }
            ] : []
        };

        try {
            // Send email
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent:', info.messageId);

            // Clean up - remove the temporary file
            if (attachment) {
                fs.unlinkSync(attachment.path);
            }

            res.status(200).json({ message: 'Email sent successfully' });
        } catch (emailError) {
            console.error('Error sending email:', emailError);

            // Handle specific Gmail auth errors
            if (emailError.code === 'EAUTH') {
                return res.status(500).json({
                    error: 'Authentication failed',
                    details: 'Gmail requires an application-specific password. Please make sure you\'ve created an App Password and added it to your .env file.',
                    link: 'https://support.google.com/mail/?p=InvalidSecondFactor'
                });
            }

            res.status(500).json({
                error: 'Failed to send email',
                details: emailError.message,
                code: emailError.code || 'UNKNOWN'
            });
        }
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Test route to check if server is running
app.get('/api/test', (req, res) => {
    res.status(200).json({ message: 'Server is running!' });
});

// Catch-all route to serve the frontend for any other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Server URL: http://localhost:${PORT}`);
}); 