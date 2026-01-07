// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { NavBar } from "./components/NavBar";
import { Home } from "./pages/Home";
import { CollectionDetail } from "./pages/CollectionDetail";
import { Mine } from "./pages/Mine";
// 🚀 引入获取设置的方法
import { getUserSettings } from "./services/storage/userStore";

// 🚀 新增：根路径重定向组件
const IndexRedirect = () => {
  const settings = getUserSettings();
  // 如果设置为 Mine 为首页，则跳转到 /mine，否则跳转到 /home
  const target = settings.mineAsHomepage ? "/mine" : "/home";
  return <Navigate to={target} replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-text-main selection:bg-link/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <NavBar />

          <main className="animate-in fade-in duration-500">
            <Routes>
              {/* 🚀 变更 1: 根路径不再直接渲染 Home，而是由 Redirector 接管 */}
              <Route path="/" element={<IndexRedirect />} />

              {/* 🚀 变更 2: Home 页面移动到 /home 路径 */}
              <Route path="/home" element={<Home />} />

              <Route path="/mine" element={<Mine />} />
              <Route path="/collection/:id" element={<CollectionDetail />} />
              <Route
                path="*"
                element={
                  <div className="text-center py-20 text-gray-400">
                    404 | 页面不存在
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
