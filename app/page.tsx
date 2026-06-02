'use client';

import { LogOut, Users, GitMerge } from 'lucide-react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('access_token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header (Navbar) */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <span className="text-orange-700 font-bold text-xl">V</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">ViTree Dashboard</h1>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Tổng quan gia phả</h2>
          <p className="text-gray-500 mt-1">Chào mừng bạn trở lại! Dưới đây là dữ liệu tổng hợp của dòng họ.</p>
        </div>

        {/* Thẻ thống kê tạm thời */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-yellow-50 text-yellow-600 rounded-xl">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tổng số thành viên</p>
              <p className="text-3xl font-bold text-gray-900">--</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-orange-50 text-orange-600 rounded-xl">
              <GitMerge className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tổng số đời (Thế hệ)</p>
              <p className="text-3xl font-bold text-gray-900">--</p>
            </div>
          </div>
        </div>

        {/* Khung chứa Bảng danh sách thành viên sắp làm */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-100 p-6 flex items-center justify-center">
          <p className="text-gray-400 text-lg border-2 border-dashed border-gray-200 p-8 rounded-xl">
            [ Khu vực này sẽ chứa Bảng quản lý Danh sách Thành viên ]
          </p>
        </div>
      </main>
    </div>
  );
}