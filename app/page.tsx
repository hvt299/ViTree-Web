'use client';

import { useEffect, useState, useMemo } from 'react';
import { LogOut, Users, GitMerge, Loader2, Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { memberService } from '@/services/memberService';
import { Member } from '@/types/member';
import MemberModal from '@/components/MemberModal';
import FamilyTree from '@/components/FamilyTree';

export default function DashboardPage() {
  const router = useRouter();

  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [maxGeneration, setMaxGeneration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'TABLE' | 'TREE'>('TABLE');
  const [genderFilter, setGenderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [rootMemberId, setRootMemberId] = useState('');
  const [maxGenFilter, setMaxGenFilter] = useState<number>(0);

  const handleLogout = () => {
    Cookies.remove('access_token');
    router.push('/login');
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const res = await memberService.getMembers(1, 5000);
      const data = res.data || [];
      setAllMembers(data);
      if (data.length > 0) {
        setMaxGeneration(Math.max(...data.map(m => m.generation || 1)));
      } else {
        setMaxGeneration(0);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const structuralMembers = useMemo(() => {
    let result = allMembers;

    if (rootMemberId) {
      const keepIds = new Set<string>();
      const queue = [rootMemberId];

      const addSpouses = (mId: string) => {
        const m = allMembers.find(x => x._id === mId);
        if (m && m.spouseIds) {
          m.spouseIds.forEach(s => keepIds.add(typeof s === 'string' ? s : s._id));
        }
      };

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (!keepIds.has(currentId)) {
          keepIds.add(currentId);
          addSpouses(currentId);

          const children = allMembers.filter(m =>
            m.fatherIds?.some(f => (typeof f === 'string' ? f : f._id) === currentId) ||
            m.motherIds?.some(mo => (typeof mo === 'string' ? mo : mo._id) === currentId)
          );
          children.forEach(c => queue.push(c._id));
        }
      }
      result = result.filter(m => keepIds.has(m._id));
    }

    if (maxGenFilter > 0) {
      result = result.filter(m => (m.generation || 1) <= maxGenFilter);
    }

    return result;
  }, [allMembers, rootMemberId, maxGenFilter]);

  const filteredMembers = useMemo(() => {
    return structuralMembers.filter(m => {
      const matchSearch = m.fullName.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchGender = genderFilter ? m.gender === genderFilter : true;
      const matchStatus = statusFilter ? m.status === statusFilter : true;
      return matchSearch && matchGender && matchStatus;
    });
  }, [structuralMembers, searchQuery, genderFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, genderFilter, statusFilter, rootMemberId, maxGenFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / ITEMS_PER_PAGE));
  const currentTableData = filteredMembers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa thành viên "${name}" không? Thao tác này không thể hoàn tác.`)) return;
    try {
      await memberService.remove(id);
      fetchAllData();
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa thành viên!');
    }
  };

  const handleOpenAdd = () => { setEditingMember(null); setIsModalOpen(true); };
  const handleOpenEdit = (member: Member) => { setEditingMember(member); setIsModalOpen(true); };

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages - 1, totalPages];
    if (currentPage >= totalPages - 2) return [1, 2, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const rootCandidates = useMemo(() => {
    return allMembers.filter(m => (m.generation || 1) <= 3).sort((a, b) => (a.generation || 1) - (b.generation || 1));
  }, [allMembers]);

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
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut className="w-4 h-4" /> Đăng xuất
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tổng quan gia phả</h2>
            <p className="text-gray-500 mt-1">Chào mừng bạn trở lại! Dưới đây là dữ liệu tổng hợp của dòng họ.</p>
          </div>
          <button onClick={handleOpenAdd} className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-500/20 rounded-xl transition-all">
            <Plus className="w-4 h-4" /> Thêm thành viên
          </button>
        </div>

        {/* Thống kê */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-yellow-50 text-yellow-600 rounded-xl"><Users className="w-8 h-8" /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tổng số thành viên</p>
              <p className="text-3xl font-bold text-gray-900">{loading ? '-' : allMembers.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-orange-50 text-orange-600 rounded-xl"><GitMerge className="w-8 h-8" /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Thế hệ hiện tại</p>
              <p className="text-3xl font-bold text-gray-900">{maxGeneration === 0 && loading ? '-' : maxGeneration}</p>
            </div>
          </div>
        </div>

        {/* PANEL ĐIỀU KHIỂN & BỘ LỌC MỚI (TÍCH HỢP TỈA CÀNH) */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2"><Filter className="w-5 h-5 text-orange-500" /> Bộ lọc & Chế độ xem</h3>
            <div className="flex bg-gray-100 p-1 rounded-lg shrink-0 w-fit">
              <button onClick={() => setViewMode('TABLE')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'TABLE' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Dạng bảng</button>
              <button onClick={() => setViewMode('TREE')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'TREE' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Sơ đồ Cây</button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Thanh Tìm Kiếm Mờ */}
            <div className="relative w-full sm:flex-1 sm:min-w-50">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tìm kiếm nhanh..." className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all" />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>

            {/* BỘ LỌC CẤU TRÚC */}
            <select value={rootMemberId} onChange={e => setRootMemberId(e.target.value)} className="px-3 py-2 text-sm border border-orange-200 bg-orange-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-orange-800 font-medium">
              <option value="">🌱 Toàn bộ dòng họ (Gốc)</option>
              {rootCandidates.map(m => <option key={m._id} value={m._id}>Chi của: {m.fullName} (Đời {m.generation})</option>)}
            </select>

            <select value={maxGenFilter} onChange={e => setMaxGenFilter(Number(e.target.value))} className="px-3 py-2 text-sm border border-orange-200 bg-orange-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-orange-800 font-medium">
              <option value={0}>🌳 Tất cả các Đời</option>
              {Array.from({ length: maxGeneration }, (_, i) => i + 1).map(g => <option key={g} value={g}>Chỉ hiển thị đến Đời {g}</option>)}
            </select>

            {/* BỘ LỌC CƠ BẢN */}
            <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700">
              <option value="">Tất cả giới tính</option>
              <option value="MALE">Nam giới</option>
              <option value="FEMALE">Nữ giới</option>
            </select>

            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700">
              <option value="">Tất cả tình trạng</option>
              <option value="ALIVE">Còn sống</option>
              <option value="DECEASED">Đã mất</option>
            </select>
          </div>
        </div>

        {/* Bảng dữ liệu */}
        {viewMode === 'TABLE' ? (
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
                  ) : currentTableData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">Không tìm thấy thành viên nào phù hợp.</td>
                    </tr>
                  ) : (
                    currentTableData.map((member, index) => (
                      <tr key={member._id} className="hover:bg-orange-50/50 transition-colors">
                        <td className="p-4 text-gray-500">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                        <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                          {member.avatarUrl ? (
                            <img src={member.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">{member.fullName.charAt(0)}</div>
                          )}
                          {member.fullName}
                        </td>
                        <td className="p-4 text-gray-600">Đời {member.generation}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${member.gender === 'MALE' ? 'bg-blue-50 text-blue-600' : member.gender === 'FEMALE' ? 'bg-pink-50 text-pink-600' : 'bg-gray-100 text-gray-600'}`}>{member.gender === 'MALE' ? 'Nam' : member.gender === 'FEMALE' ? 'Nữ' : 'Chưa rõ'}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${member.status === 'ALIVE' ? 'bg-green-50 text-green-600' : member.status === 'DECEASED' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-50 text-yellow-600'}`}>{member.status === 'ALIVE' ? 'Còn sống' : member.status === 'DECEASED' ? 'Đã mất' : 'Không rõ'}</span>
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleOpenEdit(member)} className="text-gray-400 hover:text-blue-600 p-1 transition-colors"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(member._id, member.fullName)} className="text-gray-400 hover:text-red-600 p-1 ml-2 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Giao diện Phân trang */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between p-4 border-t border-gray-100 bg-gray-50 gap-4">
                <p className="text-sm text-gray-500">Hiển thị <span className="font-medium text-gray-900">{currentTableData.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> đến <span className="font-medium text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredMembers.length)}</span> trong <span className="font-medium text-gray-900">{filteredMembers.length}</span> người</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                  {getPageNumbers().map((p, i) => p === '...' ? (<span key={i} className="px-3 py-1 text-gray-400">...</span>) : (<button key={i} onClick={() => setCurrentPage(p as number)} className={`min-w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors border ${currentPage === p ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>{p}</button>))}
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                  <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-300">
                    <span className="text-sm text-gray-500 hidden sm:block">Tới:</span>
                    <input type="number" min={1} max={totalPages} placeholder={currentPage.toString()} onKeyDown={(e) => { if (e.key === 'Enter') { const val = Number(e.currentTarget.value); if (val >= 1 && val <= totalPages) setCurrentPage(val); e.currentTarget.value = ''; } }} className="w-14 px-2 py-1.5 text-sm text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <FamilyTree members={structuralMembers} searchQuery={searchQuery} genderFilter={genderFilter} statusFilter={statusFilter} />
        )}
      </main>

      <MemberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); fetchAllData(); }} members={allMembers} editData={editingMember} />
    </div>
  );
}