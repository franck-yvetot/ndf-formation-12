import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ExpenseReportsPage } from './pages/ExpenseReportsPage';
import { NewExpenseReportPage } from './pages/NewExpenseReportPage';

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ExpenseReportsPage />} />
        <Route path="/reports/new" element={<NewExpenseReportPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
