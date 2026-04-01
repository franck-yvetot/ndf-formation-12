import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ExpenseReportDetailsPage } from './pages/ExpenseReportDetailsPage';
import { ExpenseReportsPage } from './pages/ExpenseReportsPage';
import { NewExpenseReportPage } from './pages/NewExpenseReportPage';

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ExpenseReportsPage />} />
        <Route path="/reports/new" element={<NewExpenseReportPage />} />
        <Route path="/expense-reports/:id" element={<ExpenseReportDetailsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
