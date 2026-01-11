// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { NavBar } from "./components/NavBar";
import { Home } from "./pages/Home";
import { CollectionDetail } from "./pages/CollectionDetail";
import { Mine } from "./pages/Mine";
// 🚀 引入新页面
import { Account } from "./pages/Account";
import { getUserSettings } from "./services/storage/userStore";

const IndexRedirect = () => {
  const settings = getUserSettings();
  const target = settings.mineAsHomepage ? "/mine" : "/home";
  return <Navigate to={target} replace />;
};

export default function App() {
  const { t } = useTranslation();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-text-main selection:bg-link/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <NavBar />

          <main className="animate-in fade-in duration-500">
            <Routes>
              <Route path="/" element={<IndexRedirect />} />
              <Route path="/home" element={<Home />} />
              <Route path="/mine" element={<Mine />} />
              <Route path="/collection/:id" element={<CollectionDetail />} />

              {/* 🚀 新增 Account 路由 */}
              <Route path="/account/:input" element={<Account />} />

              <Route
                path="*"
                element={
                  <div className="text-center py-20 text-gray-400">
                    {t("app.not_found")}
                  </div>
                }
              />
            </Routes>
          </main>
        </div>

        <Toaster
          position="bottom-right"
          toastOptions={{ className: "!bg-gray-800 !text-white !rounded-lg" }}
        />
      </div>
    </BrowserRouter>
  );
}
