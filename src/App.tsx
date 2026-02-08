import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Incomes } from './pages/Incomes';
import { Expenses } from './pages/Expenses';
import { Commitments } from './pages/Commitments';
import { Dashboard } from './pages/Dashboard';
import './index.css';

function App() {
   return (
      <Routes>
         <Route path="/" element={<Home />} />
         <Route path="/incomes" element={<Incomes />} />
         <Route path="/expenses" element={<Expenses />} />
         <Route path="/commitments" element={<Commitments />} />
         <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
   );
}

export default App;