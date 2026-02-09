import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from '@/App';
import { PeriodProvider } from '@/contexts/PeriodContext';
import { DashboardProvider } from '@/contexts/DashboardContext';
import '@/index.css';
import { ToastProvider } from '@/contexts/toast';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')!).render(
   <React.StrictMode>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
         <BrowserRouter basename="/fintrack/">
            <PeriodProvider>
               <DashboardProvider>
                  <ToastProvider>
                     <App />
                  </ToastProvider>
               </DashboardProvider>
            </PeriodProvider>
         </BrowserRouter>
      </GoogleOAuthProvider>
   </React.StrictMode>
);