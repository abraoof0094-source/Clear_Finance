import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Analysis } from "./pages/Analysis";
import { Budgets } from "./pages/Budgets";
import { Accounts } from "./pages/Accounts";
import { Categories } from "./pages/Categories";
import { Settings } from "./pages/Settings";
import { NotFound } from "./pages/NotFound";
import "./global.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="dark">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
