import React, { useState, useMemo } from 'react';
import { useCinema } from '../../context/CinemaContext';
import { Employee, EmployeeStatus, UserRole } from '../../types';
import { StatusBadge } from '../ui/Badge';
import { FileUpload } from '../ui/FileUpload';
import { ChangePhotoModal } from './ChangePhotoModal';
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  Phone,
  Mail,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  X,
  Building2,
  Shield,
  Camera,
  FolderOpen,
  Key,
  Lock,
  Check,
  Copy,
} from 'lucide-react';

export const EmployeeView: React.FC = () => {
  const {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    currentUser,
    askConfirm,
    users,
    showToast,
  } = useCinema();

  const isManager = currentUser.role === 'ADMIN';

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);
  const [photoModalEmployee, setPhotoModalEmployee] = useState<Employee | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    photo: '',
    position: 'Cinema Crew Usher',
    department: 'Box Office & Usher',
    role: 'CREW' as UserRole,
    joinDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE' as EmployeeStatus,
    whatsapp: '',
    email: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    notes: '',
    leaveBalance: 12,
    hasAccount: false,
    loginUsername: '',
    loginPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [copiedCredential, setCopiedCredential] = useState(false);

  // Extract unique positions & departments for filters
  const positions = useMemo(() => Array.from(new Set(employees.map((e) => e.position))), [employees]);
  const departments = useMemo(() => Array.from(new Set(employees.map((e) => e.department))), [employees]);

  // Filtered list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.whatsapp.includes(searchTerm);

      const matchPosition = positionFilter === 'ALL' || emp.position === positionFilter;
      const matchStatus = statusFilter === 'ALL' || emp.status === statusFilter;
      const matchDept = departmentFilter === 'ALL' || emp.department === departmentFilter;

      return matchSearch && matchPosition && matchStatus && matchDept;
    });
  }, [employees, searchTerm, positionFilter, statusFilter, departmentFilter]);

  // Paginated list
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, currentPage, itemsPerPage]);

  const openAddModal = () => {
    const nextId = `EMP-${String(employees.length + 1).padStart(3, '0')}`;
    setFormData({
      employeeId: nextId,
      fullName: '',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      position: 'Cinema Crew Usher',
      department: 'Box Office & Usher',
      role: 'CREW',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      whatsapp: '+628',
      email: '',
      emergencyName: '',
      emergencyRelation: 'Keluarga',
      emergencyPhone: '+628',
      notes: '',
      leaveBalance: 12,
      hasAccount: true,
      loginUsername: nextId.toLowerCase(),
      loginPassword: 'user123',
    });
    setEditingEmployee(null);
    setShowPassword(false);
    setIsAddModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    const matchedUser = users?.find(
      (u) =>
        u.employeeId.toLowerCase() === emp.employeeId.toLowerCase() ||
        (emp.email && u.email.toLowerCase() === emp.email.toLowerCase())
    );
    const hasAcc = Boolean(emp.hasAccount || matchedUser);

    setEditingEmployee(emp);
    setFormData({
      employeeId: emp.employeeId,
      fullName: emp.fullName,
      photo: emp.photo,
      position: emp.position,
      department: emp.department,
      role: emp.role,
      joinDate: emp.joinDate,
      status: emp.status,
      whatsapp: emp.whatsapp,
      email: emp.email,
      emergencyName: emp.emergencyContact?.name || '',
      emergencyRelation: emp.emergencyContact?.relationship || '',
      emergencyPhone: emp.emergencyContact?.phone || '',
      notes: emp.notes || '',
      leaveBalance: emp.leaveBalance || 12,
      hasAccount: hasAcc,
      loginUsername: emp.loginUsername || matchedUser?.username || emp.employeeId.toLowerCase(),
      loginPassword: emp.loginPassword || matchedUser?.password || '123456',
    });
    setShowPassword(false);
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.employeeId.trim()) {
      showToast('Nama lengkap dan ID Karyawan wajib diisi.', 'error');
      return;
    }

    if (formData.hasAccount && !formData.loginUsername.trim()) {
      showToast('Username login wajib diisi jika akun diaktifkan.', 'error');
      return;
    }

    const payload = {
      employeeId: formData.employeeId.trim(),
      fullName: formData.fullName.trim(),
      photo: formData.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      position: formData.position,
      department: formData.department,
      role: formData.role,
      joinDate: formData.joinDate,
      status: formData.status,
      whatsapp: formData.whatsapp,
      email: formData.email,
      emergencyContact: {
        name: formData.emergencyName,
        relationship: formData.emergencyRelation,
        phone: formData.emergencyPhone,
      },
      notes: formData.notes,
      leaveBalance: Number(formData.leaveBalance) || 12,
      hasAccount: formData.hasAccount,
      loginUsername: formData.loginUsername.trim(),
      loginPassword: formData.loginPassword.trim() || '123456',
    };

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, payload);
    } else {
      addEmployee(payload);
    }
    setIsAddModalOpen(false);
  };

  const handleDelete = (emp: Employee) => {
    askConfirm({
      title: 'Hapus Data Karyawan',
      message: `Apakah Anda yakin ingin menghapus data karyawan "${emp.fullName}" (${emp.employeeId})? Data yang dihapus tidak dapat dipulihkan.`,
      confirmText: 'Hapus Karyawan',
      danger: true,
      onConfirm: () => deleteEmployee(emp.id),
    });
  };

  // Export data to CSV / Excel format
  const exportToCsv = () => {
    const headers = [
      'Employee ID',
      'Nama Lengkap',
      'Posisi',
      'Departemen',
      'Role',
      'Tanggal Bergabung',
      'Status',
      'WhatsApp',
      'Email',
      'Kontak Darurat (Nama)',
      'Kontak Darurat (Relasi)',
      'Kontak Darurat (No)',
      'Sisa Cuti',
    ];

    const rows = filteredEmployees.map((e) => [
      e.employeeId,
      `"${e.fullName}"`,
      `"${e.position}"`,
      `"${e.department}"`,
      e.role,
      e.joinDate,
      e.status,
      `"${e.whatsapp}"`,
      e.email,
      `"${e.emergencyContact?.name || ''}"`,
      `"${e.emergencyContact?.relationship || ''}"`,
      `"${e.emergencyContact?.phone || ''}"`,
      e.leaveBalance,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `data_karyawan_cinema_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Employee Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola data staf bioskop, struktur departemen, dan hak akses
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={exportToCsv}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-amber-400" />
            Export Data (Excel/CSV)
          </button>

          {isManager && (
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-all"
            >
              <Plus className="w-4 h-4" />
              Tambah Karyawan
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama karyawan, ID (EMP-...), email, atau WhatsApp..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={positionFilter}
              onChange={(e) => {
                setPositionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Semua Posisi</option>
              {positions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Semua Departemen</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="OFF">Off Day</option>
              <option value="LEAVE">Sedang Cuti</option>
              <option value="SICK">Izin Sakit</option>
              <option value="INACTIVE">Nonaktif</option>
            </select>

            {/* View Mode Switcher */}
            <div className="flex bg-slate-800 border border-slate-700 rounded-xl p-0.5 ml-auto">
              <button
                type="button"
                onClick={() => setViewMode('card')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  viewMode === 'card' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Card
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  viewMode === 'table' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tabel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Employee List (Card Mode or Table Mode) */}
      {filteredEmployees.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold text-sm">Tidak ada karyawan yang cocok dengan kriteria filter</p>
          <p className="text-xs text-slate-500 mt-1">Coba ubah kata kunci pencarian atau reset filter</p>
        </div>
      ) : viewMode === 'card' ? (
        /* Modern Profile Card Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedEmployees.map((emp) => (
            <div
              key={emp.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/90 rounded-2xl p-5 shadow-sm transition-all relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Avatar, Status, Employee ID */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative group shrink-0">
                      <img
                        src={emp.photo}
                        alt={emp.fullName}
                        className="w-13 h-13 rounded-2xl object-cover border border-slate-700 ring-2 ring-slate-800"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotoModalEmployee(emp)}
                        className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 rounded-2xl flex flex-col items-center justify-center text-amber-300 transition-opacity cursor-pointer shadow-md"
                        title="Ganti Foto Profil dari Storage / Album"
                      >
                        <Camera className="w-4 h-4" />
                        <span className="text-[9px] font-bold mt-0.5">Ganti</span>
                      </button>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-100">{emp.fullName}</h3>
                      <p className="text-xs text-amber-400 font-medium">{emp.position}</p>
                      <div className="flex items-center flex-wrap gap-1.5 mt-1">
                        <span className="inline-block text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60 font-mono">
                          {emp.employeeId}
                        </span>
                        {emp.hasAccount || users?.some((u) => u.employeeId?.toLowerCase() === emp.employeeId.toLowerCase()) ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            <Key className="w-2.5 h-2.5" /> Akun Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-medium text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded">
                            Belum Ada Akun
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <StatusBadge status={emp.status} size="sm" />
                </div>

                {/* Information Rows */}
                <div className="space-y-2 py-3 border-t border-b border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" /> Departemen:
                    </span>
                    <span className="text-slate-200 font-medium">{emp.department}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-slate-500" /> Hak Akses:
                    </span>
                    <span className="text-amber-300 font-medium">{emp.role}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" /> WhatsApp:
                    </span>
                    <span className="text-slate-200 font-mono">{emp.whatsapp}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> Bergabung:
                    </span>
                    <span className="text-slate-300">{emp.joinDate}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 flex items-center justify-between gap-2 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setDetailEmployee(emp)}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-400" /> View Detail
                </button>

                <button
                  type="button"
                  onClick={() => setPhotoModalEmployee(emp)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-amber-400 border border-slate-700 transition-colors"
                  title="Ganti Foto Profil (Storage / Album)"
                >
                  <Camera className="w-4 h-4 text-amber-400" />
                </button>

                {isManager && (
                  <>
                    <button
                      type="button"
                      onClick={() => openEditModal(emp)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-amber-300 border border-slate-700 transition-colors"
                      title="Edit Data"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(emp)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                      title="Hapus Karyawan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-850 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Karyawan</th>
                  <th className="p-3.5">ID / Akses</th>
                  <th className="p-3.5">Posisi & Dept</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">WhatsApp / Email</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {paginatedEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative group shrink-0">
                          <img
                            src={emp.photo}
                            alt={emp.fullName}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                            referrerPolicy="no-referrer"
                          />
                          {isManager && (
                            <button
                              type="button"
                              onClick={() => setPhotoModalEmployee(emp)}
                              className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center text-amber-300 transition-opacity cursor-pointer"
                              title="Ganti Foto Profil dari Storage"
                            >
                              <Camera className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <span className="font-bold text-slate-100">{emp.fullName}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono text-amber-400">{emp.employeeId}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-[10px] text-slate-400">{emp.role}</p>
                        {emp.hasAccount || users?.some((u) => u.employeeId?.toLowerCase() === emp.employeeId.toLowerCase()) ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-400 bg-emerald-500/10 px-1 rounded border border-emerald-500/20">
                            <Key className="w-2 h-2" /> Login
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-200">{emp.position}</span>
                      <p className="text-[10px] text-slate-400">{emp.department}</p>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={emp.status} size="sm" />
                    </td>
                    <td className="p-3.5">
                      <p className="font-mono text-slate-200">{emp.whatsapp}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{emp.email}</p>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setDetailEmployee(emp)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-sky-400"
                        title="Lihat Profil"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {isManager && (
                        <button
                          type="button"
                          onClick={() => setPhotoModalEmployee(emp)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-amber-400"
                          title="Ganti Foto Profil dari Storage / Album"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isManager && (
                        <>
                          <button
                            type="button"
                            onClick={() => openEditModal(emp)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-amber-400"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(emp)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} dari {filteredEmployees.length} Karyawan
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 disabled:opacity-40 hover:bg-slate-700"
            >
              Sebelumnya
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-slate-850 border border-slate-800 text-amber-400 font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 disabled:opacity-40 hover:bg-slate-700"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Employee */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850 shrink-0">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                {editingEmployee ? <Edit2 className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-amber-400" />}
                <span>{editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              id="employee-form"
              onSubmit={handleFormSubmit}
              className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Employee ID <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Nama Lengkap <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap staf..."
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo Upload with live preview, camera, and cropping */}
              <FileUpload
                label="Foto Profil Karyawan"
                value={formData.photo}
                onChange={(photo) => setFormData({ ...formData, photo })}
                helpText="Unggah foto formal staf atau ambil langsung dengan kamera (dapat dipotong/disesuaikan)"
                enableCrop={true}
                cropCircular={true}
              />

              {/* Fitur Create Account / Buat Akun Login Karyawan */}
              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${formData.hasAccount ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-100 flex items-center gap-2">
                        <span>Akses Login Web App (Create Account)</span>
                        {formData.hasAccount ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Akun Aktif
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">
                            Belum Ada Akun
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Aktifkan akun agar karyawan dapat login ke web app sesuai hak akses role ({formData.role})
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={formData.hasAccount}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData((prev) => ({
                          ...prev,
                          hasAccount: checked,
                          loginUsername: prev.loginUsername || prev.employeeId.toLowerCase() || 'user',
                          loginPassword: prev.loginPassword || '123456',
                        }));
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {formData.hasAccount && (
                  <div className="pt-3 border-t border-slate-800/90 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-slate-300 mb-1">
                          Username / ID Login <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required={formData.hasAccount}
                          placeholder="Username atau ID Karyawan..."
                          value={formData.loginUsername}
                          onChange={(e) => setFormData({ ...formData, loginUsername: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none font-mono"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Digunakan untuk login di layar masuk sistem
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-semibold uppercase text-slate-300">
                            Password Login <span className="text-rose-400">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const randomPass = 'user' + Math.floor(1000 + Math.random() * 9000);
                              setFormData((prev) => ({ ...prev, loginPassword: randomPass }));
                              showToast(`Password baru di-generate: ${randomPass}`, 'info');
                            }}
                            className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold"
                          >
                            Generate Acak
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required={formData.hasAccount}
                            placeholder="Minimal 4 karakter..."
                            value={formData.loginPassword}
                            onChange={(e) => setFormData({ ...formData, loginPassword: e.target.value })}
                            className="w-full pl-3 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                            title={showPassword ? 'Sembunyikan' : 'Lihat'}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Kata sandi otentikasi login pengguna
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        <span>Role Login: <strong className="text-amber-400 font-bold">{formData.role}</strong></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const credText = `Kredensial Login Bioskop:\nNama: ${formData.fullName || 'Karyawan'}\nUsername/ID: ${formData.loginUsername || formData.employeeId}\nPassword: ${formData.loginPassword}\nRole: ${formData.role}`;
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(credText);
                            setCopiedCredential(true);
                            showToast('Kredensial akun disalin ke clipboard.', 'success');
                            setTimeout(() => setCopiedCredential(false), 2000);
                          }
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 text-[11px] font-semibold rounded-md border border-slate-700 flex items-center gap-1 transition-colors"
                      >
                        {copiedCredential ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCredential ? 'Tersalin' : 'Salin Kredensial'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Posisi Jabatan</label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: Cinema Crew Usher"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Departemen</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Box Office & Usher">Box Office & Usher</option>
                    <option value="Food & Beverage">Food & Beverage (Concession)</option>
                    <option value="Operations">Operations Floor</option>
                    <option value="Engineering">Engineering & Projectionist</option>
                    <option value="Housekeeping">Housekeeping & Cleaning</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Hak Akses Role</label>
                  <select
                    value={formData.role}
                    onChange={(e: any) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="CREW">CREW</option>
                    <option value="SUPERVISOR">SUPERVISOR</option>
                    <option value="ADMIN">ADMIN / CINEMA MANAGER</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Status Karyawan</label>
                  <select
                    value={formData.status}
                    onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="ACTIVE">Aktif (Active)</option>
                    <option value="OFF">Off Day</option>
                    <option value="LEAVE">Sedang Cuti</option>
                    <option value="SICK">Izin Sakit</option>
                    <option value="INACTIVE">Nonaktif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Tanggal Bergabung</label>
                  <input
                    type="date"
                    required
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Saldo Cuti (Hari)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.leaveBalance}
                    onChange={(e) => setFormData({ ...formData, leaveBalance: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    required
                    placeholder="+628123456789"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Alamat Email</label>
                  <input
                    type="email"
                    required
                    placeholder="nama@cinema.id"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Catatan Staf</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan spesialisasi kerja, nomor loker, shift khusus, dll."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </form>

            {/* Modal Actions Footer - Always visible on mobile & desktop */}
            <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                {formData.hasAccount ? 'Akun login otomatis aktif untuk karyawan' : 'Simpan data karyawan'}
              </span>
              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="employee-form"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  {editingEmployee ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Simpan Perubahan</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Tambah Karyawan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal View Detail Profile */}
      {(() => {
        const activeEmp = detailEmployee
          ? employees.find((e) => e.id === detailEmployee.id) || detailEmployee
          : null;
        if (!activeEmp) return null;

        const matchedUser = users?.find(
          (u) =>
            u.employeeId.toLowerCase() === activeEmp.employeeId.toLowerCase() ||
            (activeEmp.email && u.email.toLowerCase() === activeEmp.email.toLowerCase())
        );
        const hasAccount = Boolean(activeEmp.hasAccount || matchedUser);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850 shrink-0">
                <h3 className="font-bold text-base text-slate-100">Detail Profil Karyawan</h3>
                <button
                  type="button"
                  onClick={() => setDetailEmployee(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-850 border border-slate-800">
                  <div className="relative group shrink-0">
                    <img
                      src={activeEmp.photo}
                      alt={activeEmp.fullName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/30 ring-2 ring-slate-800"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoModalEmployee(activeEmp)}
                      className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 rounded-2xl flex flex-col items-center justify-center text-amber-300 transition-opacity cursor-pointer shadow-lg"
                      title="Ganti Foto Profil dari Storage"
                    >
                      <Camera className="w-4 h-4" />
                      <span className="text-[9px] font-bold mt-0.5">Ganti</span>
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-base text-slate-100 truncate">{activeEmp.fullName}</h4>
                      <button
                        type="button"
                        onClick={() => setPhotoModalEmployee(activeEmp)}
                        className="shrink-0 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                        title="Upload dari Storage / Album"
                      >
                        <FolderOpen className="w-3.5 h-3.5" /> Ganti Foto
                      </button>
                    </div>
                    <p className="text-xs text-amber-400 font-semibold">{activeEmp.position}</p>
                    <p className="text-xs text-slate-400">{activeEmp.department}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <StatusBadge status={activeEmp.status} size="sm" />
                      <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {activeEmp.employeeId}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Akun Login */}
                <div className="p-3.5 rounded-xl bg-slate-850/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${hasAccount ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">
                        {hasAccount ? 'Akun Login Aktif' : 'Belum Ada Akun Login'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {hasAccount ? (
                          <>Username: <span className="font-mono text-amber-400 font-semibold">{matchedUser?.username || activeEmp.loginUsername || activeEmp.employeeId.toLowerCase()}</span></>
                        ) : (
                          'Edit karyawan untuk membuat akun login'
                        )}
                      </p>
                    </div>
                  </div>
                  {hasAccount ? (
                    <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Siap Login
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                      Nonaktif
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Hak Akses Role Sistem:</span>
                    <span className="font-bold text-amber-300">{activeEmp.role}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Tanggal Mulai Bergabung:</span>
                    <span className="text-slate-200">{activeEmp.joinDate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Sisa Hak Cuti Tahunan:</span>
                    <span className="text-emerald-400 font-bold">{activeEmp.leaveBalance} Hari</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Nomor WhatsApp:</span>
                    <span className="text-slate-200 font-mono">{activeEmp.whatsapp}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Email Resmi:</span>
                    <span className="text-slate-200">{activeEmp.email}</span>
                  </div>
                </div>

                {activeEmp.notes && (
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Catatan:</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{activeEmp.notes}</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-850 border-t border-slate-800 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setDetailEmployee(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal Upload & Ganti Foto Profil dari Storage / Album Perangkat */}
      {photoModalEmployee && (
        <ChangePhotoModal
          employee={photoModalEmployee}
          isOpen={!!photoModalEmployee}
          onClose={() => setPhotoModalEmployee(null)}
        />
      )}
    </div>
  );
};
