import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { NavBar } from "./components/NavBar";
import { Home } from "./pages/Home";
import { CollectionDetail } from "./pages/CollectionDetail";

export default function App() {
  return (
    <BrowserRouter>
      {/* 🚀 样式简化：字体默认生效，背景色语义化 */}
      <div className="min-h-screen bg-background text-text-main selection:bg-link/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <NavBar />

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
