import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { usePeriod } from "@/contexts/PeriodContext"
import { Skeleton } from "../ui/Skeleton"

interface PeriodFiltersProps {
   month: string
   year: number
   onMonthChange: (month: string) => void
   onYearChange: (year: number) => void
   isLoading: boolean
}

/**
 * List of months for the filter dropdown.
 * 'all' value represents the cumulative data for the entire year.
 */
const months = [
   { value: "all", label: "Ano Inteiro" },
   { value: "1", label: "Janeiro" },
   { value: "2", label: "Fevereiro" },
   { value: "3", label: "Março" },
   { value: "4", label: "Abril" },
   { value: "5", label: "Maio" },
   { value: "6", label: "Junho" },
   { value: "7", label: "Julho" },
   { value: "8", label: "Agosto" },
   { value: "9", label: "Setembro" },
   { value: "10", label: "Outubro" },
   { value: "11", label: "Novembro" },
   { value: "12", label: "Dezembro" },
]

/**
 * Component to toggle between different months and years.
 * Uses Radix UI Dropdown Menu for selection.
 */
export function PeriodFilters({
   month,
   year,
   onMonthChange,
   onYearChange,
   isLoading
}: PeriodFiltersProps) {
   const { summary } = usePeriod();

   const years = summary?.availableYears
      ?.slice()
      .sort((a, b) => a - b) ?? [];

   const currentMonthLabel = months.find((m) => m.value === month)?.label || "Ano Inteiro"

   return (
      <div className="flex gap-2">
         {/* Month Selector */}
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button
                  variant="outline"
                  className="justify-between gap-2 rounded-full border-border bg-background px-4"
               >
                  {currentMonthLabel}
                  <ChevronDown className="h-4 w-4" />
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
               {months.map((m) => (
                  <DropdownMenuItem key={m.value} onClick={() => onMonthChange(m.value)}>
                     {m.label}
                  </DropdownMenuItem>
               ))}
            </DropdownMenuContent>
         </DropdownMenu>

         {/* Year Selector */}
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button
                  variant="outline"
                  className="justify-between gap-2 rounded-full border-border bg-background px-4"
               >
                  {year}
                  <ChevronDown className="h-4 w-4" />
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
               {isLoading ? (
                  <div className="flex flex-col gap-2 p-2 w-25 shadow-sm">
                     <Skeleton className="h-5 w-12 rounded-sm" />
                     <Skeleton className="h-5 w-12 rounded-sm" />
                     <Skeleton className="h-5 w-12 rounded-sm" />
                  </div>
               ) : (
                  years.map((a) => (
                     <DropdownMenuItem key={a} onClick={() => onYearChange(a)}>
                        {a}
                     </DropdownMenuItem>
                  ))
               )}
            </DropdownMenuContent>
         </DropdownMenu>
      </div>
   )
}