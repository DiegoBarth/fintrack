import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'

interface CustomSelectProps {
   value: string;
   onChange: (value: string) => void;
   options: string[];
   placeholder?: string;
}

/**
 * A custom dropdown component that uses React Portals to render the menu.
 * This prevents the menu from being cut off by containers with 'overflow: hidden'.
 */
export function CustomSelect({ value, onChange, options, placeholder = "Selecione" }: CustomSelectProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

   const containerRef = useRef<HTMLDivElement>(null);
   const selectedItemRef = useRef<HTMLDivElement>(null);

   // Update floating menu position based on the trigger button's coordinates
   useEffect(() => {
      if (isOpen && containerRef.current) {
         const rect = containerRef.current.getBoundingClientRect();
         setCoords({
            top: rect.top,
            left: rect.left,
            width: rect.width
         });
      }
   }, [isOpen]);

   // Auto-scroll to the selected item when the menu opens
   useEffect(() => {
      if (isOpen && selectedItemRef.current) {
         const timer = setTimeout(() => {
            selectedItemRef.current?.scrollIntoView({
               block: 'center',
               behavior: 'auto'
            });
         }, 10);
         return () => clearTimeout(timer);
      }
   }, [isOpen]);

   // Close menu when clicking outside the component
   useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
         if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
            setIsOpen(false);
         }
      }
      if (isOpen) {
         document.addEventListener("mousedown", handleClickOutside);
      }
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, [isOpen]);

   const handleSelect = (option: string) => {
      onChange(option);
      setIsOpen(false);
   };

   return (
      <div className="relative w-full" ref={containerRef}>
         <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-full items-center justify-between rounded-md border bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-black"
         >
            <span className={value ? "text-black" : "text-muted-foreground"}>
               {value || placeholder}
            </span>
            <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
         </button>

         {isOpen && createPortal(
            <div
               style={{
                  position: 'fixed',
                  top: coords.top,
                  left: coords.left,
                  width: coords.width,
                  // Position the menu above the button (translateY -100%)
                  transform: 'translateY(-100%) translateY(-4px)',
                  zIndex: 10000
               }}
               className="overflow-hidden rounded-md border bg-white shadow-2xl animate-in fade-in zoom-in-95"
            >
               <div className="max-h-60 overflow-y-auto p-1 scroll-smooth">
                  {options.map((option) => {
                     const isSelected = value === option;
                     return (
                        <div
                           key={option}
                           ref={isSelected ? selectedItemRef : null}
                           onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSelect(option);
                           }}
                           className={`
                              flex cursor-pointer items-center justify-between rounded-sm px-3 py-2 text-sm transition-colors hover:bg-gray-100
                              ${isSelected ? 'bg-gray-100 font-semibold text-black' : 'text-gray-600'}
                           `}
                        >
                           <span>{option}</span>
                           {isSelected && <Check className="h-4 w-4 text-black" />}
                        </div>
                     );
                  })}
               </div>
            </div>,
            document.body
         )}
      </div>
   );
}