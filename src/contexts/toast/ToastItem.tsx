import { Toast } from '@/contexts/toast/ToastContext';

interface ToastItemProps {
   toast: Toast;
   onRemove: () => void;
}

import { useEffect, useRef, useState } from 'react'

export function ToastItem({ toast, onRemove }: ToastItemProps) {
   const [visible, setVisible] = useState(false);
   const ref = useRef<HTMLDivElement>(null);

   useEffect(() => {
      setTimeout(() => setVisible(true), 10);
   }, []);

   const handleClose = () => {
      setVisible(false);
      setTimeout(onRemove, 300);
   };

   const borderColors: Record<Toast['type'], string> = {
      success: 'border-green-400',
      error: 'border-red-400',
      info: 'border-blue-400',
      warning: 'border-yellow-400',
   };
   const icons: Record<Toast['type'], React.ReactElement> = {
      success: <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
      error: <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
      info: <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" /></svg>,
      warning: <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 17a5 5 0 100-10 5 5 0 000 10z" /></svg>,
   };
   return (
      <div
         ref={ref}
         onClick={handleClose}
         className={`bg-[#222A36] text-gray-100 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 pointer-events-auto border-l-4 ${borderColors[toast.type]} transition-all duration-300 cursor-pointer ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-24'}`}
         style={{ minWidth: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
      >
         <span className="toast-icon flex-shrink-0">{icons[toast.type]}</span>
         <p className="text-sm font-medium flex-1">{toast.message}</p>
      </div>
   );
}