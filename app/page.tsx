'use client';

import { useEffect, useState } from 'react';
import { LogOut, Users, GitMerge, Loader2, Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { memberService } from '@/services/memberService';
import { Member } from '@/types/member';
import MemberModal from '@/components/MemberModal';

export default function DashboardPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    Cookies.remove('access_token');
    router.push('/login');
  };

  const fetchMembers = async (pageToFetch = currentPage) => {
    try {
      setLoading(true);
      const res = await memberService.getMembers(pageToFetch, 10);
      setMembers(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages || Math.ceil(res.total / 10));
    } catch (error) {
      console.error('Lỗi khi tải danh sách:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchMembers();
      return;
    }

    try {
      setLoading(true);
      const res = await memberService.search(searchQuery);
      setMembers(res);
      setTotal(res.length);
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa thành viên "${name}" không? Thao tác này không thể hoàn tác.`)) {
      return;
    }

    try {
      await memberService.remove(id);
      fetchMembers();
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa thành viên!');
    }
  };

  const handleOpenAdd = () => {
    setEditingMember(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: Member) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      fetchMembers(currentPage);
    }
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
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

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tổng quan gia phả</h2>
            <p className="text-gray-500 mt-1">Chào mừng bạn trở lại! Dưới đây là dữ liệu tổng hợp của dòng họ.</p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Thêm thành viên
          </button>
        </div>

        {/* Thống kê */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-yellow-50 text-yellow-600 rounded-xl">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tổng số thành viên</p>
              <p className="text-3xl font-bold text-gray-900">{loading ? '-' : total}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-orange-50 text-orange-600 rounded-xl">
              <GitMerge className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Thế hệ hiện tại</p>
              <p className="text-3xl font-bold text-gray-900">
                {/* Lấy generation lớn nhất trong danh sách */}
                {loading ? '-' : (members.length > 0 ? Math.max(...members.map(m => m.generation)) : 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Giao diện Thanh tìm kiếm */}
        <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm thành viên theo tên..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <button type="submit" className="hidden">Search</button>
          </form>
        </div>

        {/* Bảng dữ liệu */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600">
                  <th className="p-4">STT</th>
                  <th className="p-4">Họ và tên</th>
                  <th className="p-4">Đời thứ</th>
                  <th className="p-4">Giới tính</th>
                  <th className="p-4">Tình trạng</th>
                  <th className="p-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <Loader2 className="w-6 h-6 text-orange-500 animate-spin mx-auto" />
                      <p className="text-gray-500 mt-2 text-sm">Đang tải dữ liệu...</p>
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      Chưa có dữ liệu thành viên nào.
                    </td>
                  </tr>
                ) : (
                  members.map((member, index) => (
                    <tr key={member._id} className="hover:bg-orange-50/50 transition-colors">
                      <td className="p-4 text-gray-500">{index + 1}</td>
                      <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                            {member.fullName.charAt(0)}
                          </div>
                        )}
                        {member.fullName}
                      </td>
                      <td className="p-4 text-gray-600">Đời {member.generation}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${member.gender === 'MALE' ? 'bg-blue-50 text-blue-600' :
                          member.gender === 'FEMALE' ? 'bg-pink-50 text-pink-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                          {member.gender === 'MALE' ? 'Nam' : member.gender === 'FEMALE' ? 'Nữ' : 'Chưa rõ'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${member.isAlive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                          {member.isAlive ? 'Còn sống' : 'Đã mất'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenEdit(member)}
                          className="text-gray-400 hover:text-blue-600 p-1 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(member._id, member.fullName)}
                          className="text-gray-400 hover:text-red-600 p-1 ml-2 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Giao diện Phân trang */}
          {!searchQuery && totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-500">
                Trang <span className="font-medium text-gray-900">{currentPage}</span> / {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <MemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchMembers(currentPage);
        }}
        members={members}
        editData={editingMember}
      />
    </div>
  );
}