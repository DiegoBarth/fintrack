import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function MonthField({
   value,
   onChange,
   required
}: {
   value: string | undefined
   onChange: (value: string | undefined) => void
   required?: boolean
}) {
   const idRef = useRef(Math.random().toString(36).slice(2))
   const [open, setOpen] = useState(false)

   const now = new Date()

   const initialYear = value
      ? Number(value.split("-")[0])
      : now.getFullYear()

   const selectedDate = value
      ? (() => {
         const [year, month] = value.split("-")
         return new Date(Number(year), Number(month) - 1, 1)
      })()
      : undefined


   const [year, setYear] = useState<number>(initialYear)

   const buttonRef = useRef<HTMLButtonElement | null>(null)
   const buttonRect = buttonRef.current?.getBoundingClientRect()

   const selectedMonthIndex = value
      ? Number(value.split("-")[1]) - 1
      : undefined

   const months = Array.from({ length: 12 }).map((_, i) =>
      format(new Date(2000, i, 1), "MMM", { locale: ptBR })
   )

   useEffect(() => {
      if (open) {
         const onAnyOpen = (e: CustomEvent) => {
            if (e.detail !== idRef.current) setOpen(false)
         }

         window.addEventListener("monthfield:open", onAnyOpen as EventListener)
         window.dispatchEvent(
            new CustomEvent("monthfield:open", {
               detail: idRef.current
            })
         )

         return () => {
            window.removeEventListener(
               "monthfield:open",
               onAnyOpen as EventListener
            )
         }
      }
   }, [open])

   return (
      <div className="relative flex items-center gap-2">
         <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen(!open)}
            className="w-full border border-gray-300 dark:border-gray-600
               bg-white dark:bg-gray-700
               text-gray-900 dark:text-gray-100
               rounded-md p-2 text-left focus:outline-none
               focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500"
         >
            {value
               ? format(
                  new Date(
                     Number(value.split("-")[0]),
                     Number(value.split("-")[1]) - 1,
                     1
                  ),
                  "MMMM yyyy",
                  { locale: ptBR }
               )
               : required
                  ? <span className="text-muted-foreground">Selecione um mês *</span>
                  : <span className="text-muted-foreground">Selecione um mês</span>
            }
         </button>

         {value && (
            <button
               type="button"
               className="ml-1 px-2 py-1 rounded text-xs
                  text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2
                  focus:ring-gray-300 dark:focus:ring-gray-500"
               onClick={() => onChange(undefined)}
            >
               &#10005;
            </button>
         )}

         {open && buttonRect &&
            createPortal(
               <div
                  className="fixed z-[9999]
                     bg-white dark:bg-gray-800
                     border border-gray-200 dark:border-gray-700
                     rounded-lg shadow-lg p-4 w-72"
                  style={{
                     top: buttonRect.top - 280,
                     left: buttonRect.left
                  }}
               >
                  {/* Year selector */}
                  <div className="flex justify-between items-center mb-4">
                     <button
                        onClick={() => setYear(prev => prev - 1)}
                        className="text-2xl text-blue-400 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                     >
                        -
                     </button>

                     <span className="font-medium">{year}</span>

                     <button
                        onClick={() => setYear(prev => prev + 1)}
                        className="text-2xl text-blue-400 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                     >
                        +
                     </button>
                  </div>

                  {/* Months grid */}
                  <div className="grid grid-cols-3 gap-2">
                     {months.map((monthLabel, index) => {
                        const isSelected =
                           selectedMonthIndex === index &&
                           Number(value?.split("-")[0]) === year

                        return (
                           <button
                              key={index}
                              onClick={() => {
                                 const month = String(index + 1).padStart(2, "0")
                                 onChange(`${year}-${month}`)
                                 setOpen(false)
                              }}
                              className={`p-2 rounded-md text-sm
                                 ${isSelected
                                    ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                 }`}
                           >
                              {monthLabel}
                           </button>
                        )
                     })}
                  </div>
               </div>,
               document.body
            )}
      </div>
   )
}