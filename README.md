# React + Vite




- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Invoice App

A modern, full-featured invoice management application built with React, Vite, and Tailwind CSS.

## Features

- **Invoice Management**: Create, view, edit, and delete invoices
- **Project Tracking**: Organize invoices by project
- **PDF Generation**: Generate professional PDF invoices
- **Email Integration**: Send invoices directly via email with attachments
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Choose your preferred theme

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/invoice-app.git
   cd invoice-app
   ```

2. Install dependencies
   ```bash
   npm install
   ```

### Running the App

You have several options to run the application:

#### Option 1: All-in-One Startup (Recommended)

Run both frontend and backend with a single command:

```bash
npm run start
```

Or simply double-click the `start-invoice-app.command` file in the project folder.

#### Option 2: Start Servers Separately

Start the development server:

```bash
npm run dev
```

Start the email server (in a separate terminal):

```bash
npm run server
```

### Auto-Starting at Login

For instructions on setting up automatic startup at login on macOS, see the [Auto-Startup Guide](docs/auto-startup.md).

## Email Functionality

The app includes a Node.js server for sending invoices via email:

1. **Setup Email**: Follow the instructions in [docs/server-setup.md](docs/server-setup.md) to configure your email credentials
2. **Generate Invoice**: Create an invoice and click "Email Invoice"
3. **Send**: The invoice will be sent as a PDF attachment

For more details on email setup, see the [Email Server Setup Guide](docs/server-setup.md).

## Build for Production

```bash
npm run build
```

## Technologies Used

- **Frontend**:

  - React
  - Redux Toolkit
  - Tailwind CSS
  - Framer Motion
  - React Router
  - React Hot Toast

- **Backend**:

  - Express
  - Nodemailer
  - Multer

- **Tools**:
  - Vite
  - React PDF

## License

[MIT](LICENSE)

## Acknowledgements

- Icons by [React Icons](https://react-icons.github.io/react-icons/)
- PDF generation by [React PDF](https://react-pdf.org/)
- Email functionality by [Nodemailer](https://nodemailer.com/)
