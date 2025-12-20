// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { NavBar } from "./components/NavBar"; // 引入提取后的组件
import { Home } from "./pages/Home";
import { CollectionDetail } from "./pages/CollectionDetail";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* 使用提取后的 NavBar 组件 */}
          <NavBar />

          {/* 主内容路由区 */}
          <main className="animate-in fade-in duration-500">
            <Routes>
              <Route path="/" element={<Home />} />
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
