import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { PeriodProvider } from './contexts/PeriodContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
   <React.StrictMode>
      <BrowserRouter basename="/fintrack">
         <PeriodProvider>
            <App />
         </PeriodProvider>
      </BrowserRouter>
   </React.StrictMode>
);