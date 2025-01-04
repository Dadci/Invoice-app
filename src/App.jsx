import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import InvoiceDetails from "./pages/InvoiceDetails";
import Sidebar from "./components/Sidebar";
import { Toaster } from 'react-hot-toast'

const App = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col md:flex-row min-h-screen bg-[#F8F8FB]">
        <Sidebar />
        <main className="flex-1 md:ml-24">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/invoice/:id" element={<InvoiceDetails />} />
          </Routes>
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#0C0E16',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              fontSize: '14px'
            },
            success: {
              iconTheme: {
                primary: '#33D69F',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EC5757',
                secondary: '#fff',
              },
            }
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
