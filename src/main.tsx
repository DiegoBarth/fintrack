import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { PeriodProvider } from './contexts/PeriodContext';
import { DashboardProvider } from './contexts/DashboardContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
   <React.StrictMode>
      <BrowserRouter basename="/fintrack/">
         <PeriodProvider>
            <DashboardProvider>
               <App />
            </DashboardProvider>
         </PeriodProvider>
      </BrowserRouter>
   </React.StrictMode>
);