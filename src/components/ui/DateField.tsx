import { useState, useRef } from "react"
import { createPortal } from "react-dom"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import "react-day-picker/dist/style.css"

export function DateField({ value, onChange }: any) {
   const [open, setOpen] = useState(false)
   const buttonRef = useRef<HTMLButtonElement | null>(null)

   const buttonRect = buttonRef.current?.getBoundingClientRect()

   return (
      <div className="relative">
         <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen(!open)}
            className="w-full border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 
                   text-gray-900 dark:text-gray-100
                   rounded-md p-2 text-left
                   focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-500"
         >
            {value
               ? format(value, "PPP", { locale: ptBR })
               : "Selecione uma data"}
         </button>

         {open &&
            buttonRect &&
            createPortal(
               <div
                  className="fixed z-[9999] 
                       bg-white dark:bg-gray-800 
                       border border-gray-200 dark:border-gray-700
                       rounded-lg shadow-lg p-3"
                  style={{
                     top: buttonRect.top - 320,
                     left: buttonRect.left,
                  }}
               >
                  <DayPicker
                     mode="single"
                     selected={value}
                     onSelect={(date) => {
                        onChange(date)
                        setOpen(false)
                     }}
                     locale={ptBR}
                     className="custom-calendar"
                  />
               </div>,
               document.body
            )}
      </div>
   )
}
