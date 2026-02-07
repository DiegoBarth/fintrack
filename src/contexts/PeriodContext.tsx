import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

interface PeriodContextType {
   month: string;
   setMonth: (month: string) => void;
   year: number;
   setYear: (year: number) => void;
}

const today = new Date();
const currentMonth = String(today.getMonth() + 1);
const currentYear = today.getFullYear();

const defaultValue: PeriodContextType = {
   month: currentMonth,
   setMonth: () => { },
   year: currentYear,
   setYear: () => { }
};

export const PeriodContext = createContext<PeriodContextType>(defaultValue);

export function PeriodProvider({ children }: { children: ReactNode }) {
   const [month, setMonth] = useState(currentMonth);
   const [year, setYear] = useState(currentYear);

   return (
      <PeriodContext.Provider value={{ month, setMonth, year, setYear }}>
         {children}
      </PeriodContext.Provider>
   );
}

export const usePeriod = () => useContext(PeriodContext);