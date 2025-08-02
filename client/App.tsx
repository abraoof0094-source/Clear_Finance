import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Analysis } from "./pages/Analysis";
import { Tracker } from "./pages/Tracker";
import { Budgets } from "./pages/Budgets";
import { Categories } from "./pages/Categories";
import { Settings } from "./pages/Settings";
import { Preferences } from "./pages/Preferences";
import { ExportRecords } from "./pages/ExportRecords";
import { BackupRestore } from "./pages/BackupRestore";
import { NotFound } from "./pages/NotFound";
import "./global.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="dark">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
