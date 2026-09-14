import React, { useState, useRef, useEffect } from 'react';
import { useCinema } from '../../context/CinemaContext';
import { safeLocalStorage } from '../../utils/safeStorage';
import { UserRole, Employee } from '../../types';
import { FileUpload } from '../ui/FileUpload';
import {
  Settings,
  Building2,
  Sliders,
  Shield,
  RotateCcw,
  Save,
  CheckCircle2,
  Users,
  AlertTriangle,
  Download,
  Upload,
  History,
  Database,
  RefreshCw,
  FileCheck,
  Check,
  User,
  Lock,
  Phone,
  Mail,
  Calendar,
  MapPin,
  KeyRound,
  Info,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  AtSign,
  Eye,
  EyeOff,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    switchUserRole,
    resetToInitialData,
    updateAdminLoginSettings,
    clearAllMenuData,
    createBackupSnapshot,
    restoreData,
    showToast,
    askConfirm,
    employees,
    updateEmployee,
    users,
    setUsers,
  } = useCinema();

  const isManager = currentUser.role === 'ADMIN';
  const isSupervisor = currentUser.role === 'SUPERVISOR';
  const isCrew = currentUser.role === 'CREW';
  const [managerTab, setManagerTab] = useState<'config' | 'profile'>('config');

  // Find linked employee record for current user
  const linkedEmployee = employees.find(
    (e) => e.employeeId === currentUser.employeeId || e.id === currentUser.id || e.fullName === currentUser.name
  );

  // Backup state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasLocalBackup, setHasLocalBackup] = useState(false);

  useEffect(() => {
    try {
      const backup = safeLocalStorage.getItem('cinema_app_backup');
      setHasLocalBackup(!!backup);
    } catch {
      setHasLocalBackup(false);
    }
  }, []);

  // Manager Cinema Configuration state
  const [cinemaName, setCinemaName] = useState('CINEPOLIS LIPPO PLAZA SIDOARJO');
  const [cinemaLocation, setCinemaLocation] = useState('Lippo Plaza Sidoarjo, Jl. Jati Raya No. 1, Sidoarjo, Jawa Timur');
  const [totalAuditorium, setTotalAuditorium] = useState('6 Studio (Dolby Atmos & Laser)');
  const [managerName, setManagerName] = useState('Ahmad Fauzi, S.E.');
  const [contactCenter, setContactCenter] = useState('+62 21 2358 0099');

  // Manager Operational thresholds
  const [offQuota, setOffQuota] = useState('2');
  const [elecThreshold, setElecThreshold] = useState('1600');
  const [waterThreshold, setWaterThreshold] = useState('45');

  // Edit Profile Form State (For Crew, Supervisor, and Manager profile tab)
  const [profileName, setProfileName] = useState(linkedEmployee?.fullName || currentUser.name);
  const [profileEmployeeId, setProfileEmployeeId] = useState(linkedEmployee?.employeeId || currentUser.employeeId || '');
  const [profileUsername, setProfileUsername] = useState(linkedEmployee?.loginUsername || currentUser.username || '');
  const [profileBirthDate, setProfileBirthDate] = useState(linkedEmployee?.birthDate || '1998-05-15');
  const [profileWhatsapp, setProfileWhatsapp] = useState(linkedEmployee?.whatsapp || '081234567890');
  const [profileEmail, setProfileEmail] = useState(linkedEmployee?.email || currentUser.email);
  const [profileAddress, setProfileAddress] = useState(linkedEmployee?.address || 'Sidoarjo, Jawa Timur');
  const [profilePhoto, setProfilePhoto] = useState(linkedEmployee?.photo || currentUser.avatar || '');
  const [emergencyName, setEmergencyName] = useState(linkedEmployee?.emergencyContact?.name || '');
  const [emergencyRelation, setEmergencyRelation] = useState(linkedEmployee?.emergencyContact?.relationship || 'Keluarga');
  const [emergencyPhone, setEmergencyPhone] = useState(linkedEmployee?.emergencyContact?.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showProfilePassword, setShowProfilePassword] = useState(false);

  const hasActiveLogin = Boolean(
    (profileEmployeeId.trim() || linkedEmployee?.employeeId || currentUser.employeeId) &&
    (newPassword.trim() || linkedEmployee?.loginPassword || currentUser.password)
  );

  // Admin Manual Login Credentials State
  const currentAdminUser = users.find((u) => u.role === 'ADMIN' || u.id === 'usr-1');
  const currentAdminEmp = employees.find((e) => e.role === 'ADMIN' || e.employeeId === '10102092' || e.id === 'emp-1');

  const [adminEmpId, setAdminEmpId] = useState(currentAdminUser?.employeeId || currentAdminEmp?.employeeId || '10102092');
  const [adminUsername, setAdminUsername] = useState(currentAdminUser?.username || currentAdminEmp?.loginUsername || 'admin');
  const [adminPassword, setAdminPassword] = useState(currentAdminUser?.password || currentAdminEmp?.loginPassword || '150215');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState(currentAdminUser?.password || currentAdminEmp?.loginPassword || '150215');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminEmail, setAdminEmail] = useState(currentAdminUser?.email || 'ajengbanu@gmail.com');

  useEffect(() => {
    if (currentAdminUser) {
      setAdminEmpId(currentAdminUser.employeeId || '10102092');
      setAdminUsername(currentAdminUser.username || 'admin');
      if (currentAdminUser.password) {
        setAdminPassword(currentAdminUser.password);
        setAdminConfirmPassword(currentAdminUser.password);
      }
      if (currentAdminUser.email) {
        setAdminEmail(currentAdminUser.email);
      }
    }
  }, [currentAdminUser]);

  const handleSaveAdminLoginSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmpId.trim()) {
      showToast('ID Karyawan admin tidak boleh kosong.', 'error');
      return;
    }
    if (!adminPassword.trim()) {
      showToast('Password admin tidak boleh kosong.', 'error');
      return;
    }
    if (adminPassword.length < 4) {
      showToast('Password admin minimal 4 karakter.', 'error');
      return;
    }
    if (adminPassword !== adminConfirmPassword) {
      showToast('Konfirmasi password baru admin tidak cocok.', 'error');
      return;
    }

    updateAdminLoginSettings({
      employeeId: adminEmpId.trim(),
      username: adminUsername.trim() || 'admin',
      password: adminPassword.trim(),
      email: adminEmail.trim(),
    });
  };

  const handleResetDefaultAdminLogin = () => {
    askConfirm({
      title: 'Reset Kredensial Login Admin ke Default?',
      message: 'ID Karyawan akan direset ke 10102092, Username ke "admin", dan Password ke "150215".',
      confirmText: 'Ya, Reset ke Default',
      cancelText: 'Batal',
      variant: 'warning',
      onConfirm: () => {
        setAdminEmpId('10102092');
        setAdminUsername('admin');
        setAdminPassword('150215');
        setAdminConfirmPassword('150215');
        updateAdminLoginSettings({
          employeeId: '10102092',
          username: 'admin',
          password: '150215',
          email: 'ajengbanu@gmail.com',
        });
      },
    });
  };

  // Sync profile form state when current user or linked employee changes
  useEffect(() => {
    if (linkedEmployee) {
      setProfileName(linkedEmployee.fullName);
      setProfileEmployeeId(linkedEmployee.employeeId || currentUser.employeeId || '');
      setProfileUsername(linkedEmployee.loginUsername || currentUser.username || '');
      setProfileBirthDate(linkedEmployee.birthDate || '');
      setProfileWhatsapp(linkedEmployee.whatsapp || '');
      setProfileEmail(linkedEmployee.email || '');
      setProfileAddress(linkedEmployee.address || '');
      setProfilePhoto(linkedEmployee.photo || currentUser.avatar || '');
      setEmergencyName(linkedEmployee.emergencyContact?.name || '');
      setEmergencyRelation(linkedEmployee.emergencyContact?.relationship || 'Keluarga');
      setEmergencyPhone(linkedEmployee.emergencyContact?.phone || '');
    } else {
      setProfileName(currentUser.name);
      setProfileEmployeeId(currentUser.employeeId || '');
      setProfileUsername(currentUser.username || '');
      setProfileEmail(currentUser.email);
      setProfilePhoto(currentUser.avatar || '');
    }
  }, [linkedEmployee, currentUser]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileName.trim()) {
      showToast('Nama lengkap tidak boleh kosong.', 'error');
      return;
    }

    const cleanId = profileEmployeeId.trim();
    if (!cleanId) {
      showToast('ID Karyawan wajib diisi untuk hak akses login.', 'error');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      showToast('Konfirmasi kata sandi baru tidak cocok.', 'error');
      return;
    }

    if (newPassword && newPassword.length < 4) {
      showToast('Kata sandi minimal 4 karakter.', 'error');
      return;
    }

    // Effective password (either newly entered or existing)
    const effectivePassword = newPassword.trim() || linkedEmployee?.loginPassword || currentUser.password;
    const cleanUsername = profileUsername.trim() || cleanId;

    if (linkedEmployee) {
      const updates: Partial<Employee> = {
        fullName: isNameLocked ? linkedEmployee.fullName : profileName.trim(),
        birthDate: isBirthDateLocked ? linkedEmployee.birthDate : profileBirthDate,
        nameLocked: true,
        birthDateLocked: true,
        employeeId: cleanId,
        whatsapp: profileWhatsapp.trim(),
        email: profileEmail.trim(),
        address: profileAddress.trim(),
        photo: profilePhoto,
        emergencyContact: {
          name: emergencyName.trim(),
          relationship: emergencyRelation,
          phone: emergencyPhone.trim(),
        },
      };

      if (effectivePassword) {
        updates.loginPassword = effectivePassword;
        updates.loginUsername = cleanUsername;
        updates.hasAccount = true;
      }

      updateEmployee(linkedEmployee.id, updates);
    } else {
      // Standalone user without linked employee record
      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id
            ? {
                ...u,
                employeeId: cleanId,
                username: cleanUsername,
                password: effectivePassword || u.password,
                hasLoginAccount: Boolean(effectivePassword),
              }
            : u
        )
      );
    }

    // Sync currentUser in local state and safe storage if currently matching
    if (cleanId || effectivePassword) {
      const updatedUser = {
        ...currentUser,
        employeeId: cleanId || currentUser.employeeId,
        username: cleanUsername || currentUser.username,
        password: effectivePassword || currentUser.password,
        hasLoginAccount: Boolean(effectivePassword),
      };
      safeLocalStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }

    setNewPassword('');
    setConfirmPassword('');

    if (effectivePassword) {
      showToast(
        `Hak akses login aktif! ID Karyawan "${cleanId}" berhasil disimpan dan diizinkan login ke sistem bioskop.`,
        'success',
        'Izin Akses Aktif'
      );
    } else {
      showToast('Profil berhasil disimpan. Masukkan kata sandi untuk mengaktifkan izin login.', 'info');
    }
  };

  const handleSaveCinemaInfo = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Profil dan parameter bioskop berhasil disimpan', 'success');
  };

  const handleCreateManualBackup = () => {
    createBackupSnapshot();
    setHasLocalBackup(true);
    const raw = safeLocalStorage.getItem('cinema_ops_v1_backup_snapshot') || '{}';
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_cinepolis_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Cadangan berhasil diunduh dan disimpan ke memori lokal.', 'success');
  };

  const handleRestoreFromLocal = () => {
    askConfirm({
      title: 'Pulihkan Data dari Cadangan Terakhir?',
      message: 'Sistem akan memulihkan seluruh data operasional, permohonan, checklist, dan akun karyawan dari snapshot cadangan terakhir.',
      confirmText: 'Ya, Pulihkan Data',
      cancelText: 'Batal',
      variant: 'warning',
      onConfirm: () => {
        const saved =
          safeLocalStorage.getItem('cinema_ops_v1_backup_snapshot') ||
          safeLocalStorage.getItem('cinema_app_backup');
        if (!saved) {
          showToast('Tidak ada snapshot cadangan yang ditemukan.', 'error');
          return;
        }
        const success = restoreData();
        if (success) {
          setHasLocalBackup(true);
        }
      },
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) {
        showToast('File cadangan kosong atau tidak valid.', 'error');
        return;
      }
      askConfirm({
        title: 'Pulihkan Data dari File Cadangan?',
        message: `Anda akan memulihkan data dari file "${file.name}". Seluruh data saat ini akan ditimpa dengan data cadangan tersebut.`,
        confirmText: 'Lanjutkan Pemulihan',
        cancelText: 'Batal',
        variant: 'warning',
        onConfirm: () => {
          try {
            const parsed = JSON.parse(content);
            const success = restoreData(parsed);
            if (success) {
              setHasLocalBackup(true);
              showToast('Data bioskop berhasil dipulihkan dari file JSON!', 'success');
            }
          } catch {
            showToast('Format file cadangan JSON tidak valid.', 'error');
          }
        },
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAllMenus = () => {
    askConfirm({
      title: 'Konfirmasi Reset Riwayat Data (4 Menu)?',
      message:
        'Sesuai ketentuan, tindakan ini HANYA menghapus riwayat data pada 4 menu:\n1. Inventory / Stock Management (Riwayat Transaksi)\n2. Utility Monitoring (Pencatatan Meteran Listrik & Air)\n3. Daily Cleaning (Checklist Pembersihan)\n4. Manajemen Izin & Cuti (Riwayat Off Day, Cuti, & Izin Sakit)\n\nData Master Karyawan, Akun Login, Stok Item, dan Jadwal Kerja TETAP AMAN dan TIDAK DIHAPUS. Snapshot cadangan otomatis disimpan terlebih dahulu.',
      confirmText: 'Ya, Reset Riwayat 4 Menu',
      cancelText: 'Batal',
      variant: 'danger',
      onConfirm: () => {
        clearAllMenuData();
        setHasLocalBackup(true);
      },
    });
  };

  const isNameLocked = Boolean(linkedEmployee?.nameLocked || (linkedEmployee?.fullName && linkedEmployee.fullName.trim().length > 0));
  const isBirthDateLocked = Boolean(linkedEmployee?.birthDateLocked || (linkedEmployee?.birthDate && linkedEmployee.birthDate.trim().length > 0));

  // Profile Edit Component (Used for Crew & Supervisor, and optionally Manager)
  const renderEditProfileContent = () => (
    <div className="space-y-6">
      {/* Main Profile Edit Form */}
      <form onSubmit={handleSaveProfile} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-800">
          <div className="shrink-0 flex flex-col items-center">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt={profileName}
                className="w-24 h-24 rounded-full object-cover border-2 border-amber-400/60 shadow-lg shadow-amber-500/10"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400">
                <User className="w-10 h-10" />
              </div>
            )}
            <span className="mt-2 text-[11px] font-bold text-amber-400 uppercase tracking-wide bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              {currentUser.role === 'ADMIN' ? 'Cinema Manager' : currentUser.role === 'SUPERVISOR' ? 'Supervisor' : 'Cinema Crew'}
            </span>
          </div>

          <div className="flex-1 w-full space-y-3">
            <div>
              <h3 className="text-base font-bold text-slate-100">{profileName || currentUser.name}</h3>
              <p className="text-xs text-slate-400">{currentUser.position} • {currentUser.department}</p>
            </div>

            <FileUpload
              label="Ubah Foto Profil (Kamera / Unggah)"
              value={profilePhoto}
              onChange={(photo) => setProfilePhoto(photo)}
              helpText="Format JPG/PNG. Anda dapat mengambil foto langsung atau mengunggah gambar."
              allowCamera={true}
              enableCrop={true}
              cropCircular={true}
            />
          </div>
        </div>

        {/* Read-Only System Identity Badges (Requirement #7: Informasi Karyawan) */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-amber-400" /> Informasi Karyawan
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-750 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">ID Karyawan</span>
              <span className="font-semibold text-slate-200">{linkedEmployee?.employeeId || currentUser.employeeId || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Departemen</span>
              <span className="font-semibold text-slate-200">{linkedEmployee?.department || currentUser.department || 'Cinema Operation'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Tanggal Bergabung</span>
              <span className="font-semibold text-slate-200">{linkedEmployee?.joinDate || '10 Jan 2023'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Sisa Saldo Cuti</span>
              <span className="font-semibold text-emerald-400">{linkedEmployee?.leaveBalance ?? 12} Hari</span>
            </div>
          </div>
        </div>

        {/* Editable Personal Details */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-amber-400" /> Data Pribadi yang Dapat Diperbarui
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Nama Lengkap <span className="text-rose-400">*</span>
                </label>
                {isNameLocked && (
                  <span title="Terkunci">
                    <Lock className="w-3.5 h-3.5 text-slate-500/70 shrink-0" />
                  </span>
                )}
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => !isNameLocked && setProfileName(e.target.value)}
                  disabled={isNameLocked}
                  readOnly={isNameLocked}
                  className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none transition-all ${
                    isNameLocked
                      ? 'bg-slate-950/80 border-slate-800 text-slate-400 cursor-not-allowed opacity-80'
                      : 'bg-slate-800 border-slate-700 text-slate-200 focus:border-amber-500'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Tanggal Lahir
                </label>
                {isBirthDateLocked && (
                  <span title="Terkunci">
                    <Lock className="w-3.5 h-3.5 text-slate-500/70 shrink-0" />
                  </span>
                )}
              </div>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={profileBirthDate}
                  onChange={(e) => !isBirthDateLocked && setProfileBirthDate(e.target.value)}
                  disabled={isBirthDateLocked}
                  readOnly={isBirthDateLocked}
                  className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none transition-all ${
                    isBirthDateLocked
                      ? 'bg-slate-950/80 border-slate-800 text-slate-400 cursor-not-allowed opacity-80'
                      : 'bg-slate-800 border-slate-700 text-slate-200 focus:border-amber-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nomor WhatsApp / Handphone <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  value={profileWhatsapp}
                  onChange={(e) => setProfileWhatsapp(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Alamat Email <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="nama@cinepolis.co.id"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Alamat Tempat Tinggal (Domisili)</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={profileAddress}
                onChange={(e) => setProfileAddress(e.target.value)}
                placeholder="Alamat lengkap tempat tinggal saat ini"
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Hak Akses & Kredensial Login Karyawan */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-amber-400" /> Hak Akses & Kredensial Login
            </h4>
            {hasActiveLogin ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" /> Hak Akses Aktif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <AlertCircle className="w-3.5 h-3.5" /> Menunggu ID & Password
              </span>
            )}
          </div>

          {/* Banner Status Hak Akses */}
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 transition-colors ${
              hasActiveLogin
                ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                : 'bg-amber-950/20 border-amber-500/30 text-slate-200'
            }`}
          >
            {hasActiveLogin ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5 text-[11px] flex-1">
              <p className="font-semibold text-slate-100">
                {hasActiveLogin
                  ? 'Izin Hak Akses Login Telah Diberikan'
                  : 'Lengkapi ID Karyawan & Password untuk Membuka Hak Akses'}
              </p>
              <p className="text-slate-300 leading-relaxed">
                {hasActiveLogin ? (
                  <>
                    Karyawan ini berhak login ke sistem menggunakan ID Karyawan:{' '}
                    <strong className="font-mono font-bold text-amber-300">
                      {profileEmployeeId || linkedEmployee?.employeeId || currentUser.employeeId || '-'}
                    </strong>{' '}
                    dan Kata Sandi yang telah disimpan.
                  </>
                ) : (
                  'Setiap karyawan yang mengisi ID Karyawan dan Kata Sandi pada profil ini akan otomatis diizinkan login ke sistem bioskop sesuai peran operasionalnya.'
                )}
              </p>
            </div>
          </div>

          {/* Input ID Karyawan & Username Alternatif */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ID Karyawan (ID Login Utama) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={profileEmployeeId}
                  onChange={(e) => setProfileEmployeeId(e.target.value)}
                  placeholder="Contoh: EMP-002 atau 10102092"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none font-mono"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                ID Karyawan digunakan sebagai identitas utama untuk masuk ke sistem.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Username Login (Opsional)
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={profileUsername}
                  onChange={(e) => setProfileUsername(e.target.value)}
                  placeholder="Contoh: budi_santoso"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Opsi alternatif username selain ID Karyawan.
              </p>
            </div>
          </div>

          {/* Password Fields with Eye Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kata Sandi / Password Akses{' '}
                {hasActiveLogin ? (
                  <span className="text-slate-400 font-normal">(Isi jika ingin mengganti)</span>
                ) : (
                  <span className="text-rose-400">*</span>
                )}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showProfilePassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={hasActiveLogin ? '•••••••• (Tersimpan - isi bila ingin ganti)' : 'Masukkan kata sandi baru'}
                  className="w-full pl-9 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowProfilePassword(!showProfilePassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 focus:outline-none"
                  title={showProfilePassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                >
                  {showProfilePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showProfilePassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full pl-9 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowProfilePassword(!showProfilePassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 focus:outline-none"
                  title={showProfilePassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                >
                  {showProfilePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan Profil
          </button>
        </div>
      </form>
    </div>
  );

  // If user is Cinema Crew or Supervisor, return strictly Edit Profile view!
  if (!isManager) {
    return (
      <div className="space-y-6 pb-12 max-w-3xl mx-auto">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            <span>Pengaturan Profil Pribadi</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola data diri, kontak pribadi, dan kata sandi akun {isCrew ? 'Cinema Crew' : 'Supervisor'} Anda
          </p>
        </div>

        {renderEditProfileContent()}
      </div>
    );
  }

  // CINEMA MANAGER VIEW (Full Access to Master Config, Role Switcher, Backup/Restore, and Reset Data)
  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <span>Pengaturan & Konfigurasi Sistem</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Khusus Cinema Manager: Parameter operasional bioskop, hak akses simulasi, backup database, dan profil akun
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full self-start sm:self-auto">
          <Shield className="w-3.5 h-3.5" /> Cinema Manager Authority
        </span>
      </div>

      {/* Tabs for Manager */}
      <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setManagerTab('config')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            managerTab === 'config'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Konfigurasi Sistem</span>
        </button>
        <button
          type="button"
          onClick={() => setManagerTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            managerTab === 'profile'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profil Pribadi</span>
        </button>
      </div>

      {managerTab === 'profile' ? (
        renderEditProfileContent()
      ) : (
        <>
      {/* Role Switcher Sandbox (Cinema Manager can simulate Crew / Supervisor views) */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
          <Shield className="w-4 h-4" />
          <span>Simulasi Hak Akses Role (Live Role Switcher)</span>
        </div>
        <p className="text-xs text-slate-300">
          Uji pengalaman UI/UX sesuai wewenang masing-masing pengguna (Cinema Manager, Supervisor, atau Cinema Crew):
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={() => switchUserRole('ADMIN')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              currentUser.role === 'ADMIN'
                ? 'bg-amber-500/15 border-amber-500 text-amber-300 ring-2 ring-amber-500/20 font-bold'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-750'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-100">CINEMA MANAGER</span>
              {currentUser.role === 'ADMIN' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Akses penuh, approvals, employee management, schedule, reset data</p>
          </button>

          <button
            type="button"
            onClick={() => switchUserRole('SUPERVISOR')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              currentUser.role === 'SUPERVISOR'
                ? 'bg-amber-500/15 border-amber-500 text-amber-300 ring-2 ring-amber-500/20 font-bold'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-750'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-100">SUPERVISOR</span>
              {currentUser.role === 'SUPERVISOR' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Input data, checklist cleaning, review, approval (Pengaturan: Edit Profile)</p>
          </button>

          <button
            type="button"
            onClick={() => switchUserRole('CREW')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              currentUser.role === 'CREW'
                ? 'bg-amber-500/15 border-amber-500 text-amber-300 ring-2 ring-amber-500/20 font-bold'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-750'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-100">CINEMA CREW</span>
              {currentUser.role === 'CREW' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Tugas harian: Cleaning, foto bukti, permohonan off/cuti (Pengaturan: Edit Profile)</p>
          </button>
        </div>
      </div>

      {/* Admin Login Settings Section (ID Karyawan & Password Manual Login) */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-100">
                  Pengaturan Kredensial Login Admin
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Manual Login
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Atur ID Karyawan dan Password untuk akun Administrator (Cinema Manager) agar dapat login secara manual
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetDefaultAdminLogin}
            className="text-[11px] font-semibold text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default (10102092)</span>
          </button>
        </div>

        {/* Live Active Status Box */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Kredensial Aktif untuk Login Manual
            </span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <div>
                <span className="text-slate-400">ID Karyawan: </span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {currentAdminUser?.employeeId || '10102092'}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Username: </span>
                <span className="font-mono font-bold text-slate-200">
                  {currentAdminUser?.username || 'admin'}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Password: </span>
                <span className="font-mono text-slate-200 font-bold">
                  {showAdminPassword ? (currentAdminUser?.password || '150215') : '••••••••'}
                </span>
              </div>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold self-start sm:self-center shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Siap untuk Login Manual</span>
          </div>
        </div>

        {/* Form to Update ID Karyawan and Password */}
        <form onSubmit={handleSaveAdminLoginSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ID Karyawan Admin */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                ID Karyawan Admin <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={adminEmpId}
                  onChange={(e) => setAdminEmpId(e.target.value)}
                  placeholder="Contoh: EMP-001"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 font-mono font-semibold focus:border-amber-500 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Gunakan ID ini pada input formulir Login untuk otentikasi admin.
              </p>
            </div>

            {/* Username / Alias */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                Username / Alias Login
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Contoh: admin"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Username alternatif untuk login selain menggunakan ID Karyawan.
              </p>
            </div>

            {/* Password Login Admin */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase text-slate-300">
                  Password Login Admin <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  {showAdminPassword ? (
                    <>
                      <EyeOff className="w-3 h-3" /> <span>Sembunyikan</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" /> <span>Lihat Password</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Masukkan password admin baru"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Kata sandi rahasia untuk masuk ke akun Cinema Manager (minimal 4 karakter).
              </p>
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                Konfirmasi Password Admin <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  value={adminConfirmPassword}
                  onChange={(e) => setAdminConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password admin"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Pastikan konfirmasi sama persis dengan password yang dimasukkan.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Setelah disimpan, gunakan ID Karyawan dan Password ini saat login manual.
              </span>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Kredensial Login Admin</span>
            </button>
          </div>
        </form>
      </div>

      {/* Cinema Branch Profile Settings */}
      <form onSubmit={handleSaveCinemaInfo} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Building2 className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-100">Identitas Cabang Bioskop</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Nama Bioskop / Site</label>
            <input
              type="text"
              value={cinemaName}
              onChange={(e) => setCinemaName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Jumlah Auditorium</label>
            <input
              type="text"
              value={totalAuditorium}
              onChange={(e) => setTotalAuditorium(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Alamat Gedung & Lantai</label>
          <input
            type="text"
            value={cinemaLocation}
            onChange={(e) => setCinemaLocation(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Cinema Manager</label>
            <input
              type="text"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Kontak Operasional</label>
            <input
              type="text"
              value={contactCenter}
              onChange={(e) => setContactCenter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Operational Thresholds */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Threshold & Kuota Operasional</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Kuota Max Off Day / Hari</label>
              <input
                type="number"
                value={offQuota}
                onChange={(e) => setOffQuota(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Batas Warning Listrik (kWh/hari)</label>
              <input
                type="number"
                value={elecThreshold}
                onChange={(e) => setElecThreshold(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Batas Warning Air (m³/hari)</label>
              <input
                type="number"
                value={waterThreshold}
                onChange={(e) => setWaterThreshold(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan Pengaturan
          </button>
        </div>
      </form>

      {/* Cadangan & Pemulihan Database (Backup & Restore System) */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4" /> Cadangan & Pemulihan Database (Backup & Restore)
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Amankan data bioskop ke file cadangan JSON atau pulihkan data saat diperlukan.
            </p>
          </div>
          {hasLocalBackup && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shrink-0">
              <Check className="w-3 h-3" /> Snapshot Tersimpan di Memori
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Download Backup */}
          <button
            type="button"
            onClick={handleCreateManualBackup}
            className="p-3.5 bg-slate-850 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition-colors flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-sky-500/10 text-sky-400 group-hover:bg-sky-500/20 transition-colors">
                <Download className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">.JSON</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Unduh Cadangan</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Simpan salinan database lengkap ke perangkat Anda</p>
            </div>
          </button>

          {/* Upload Restore File */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3.5 bg-slate-850 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition-colors flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                <Upload className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">PILIH FILE</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Pulihkan dari File</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Unggah file backup .JSON untuk memulihkan seluruh data</p>
            </div>
          </button>

          {/* Quick Restore from Last Snapshot */}
          <button
            type="button"
            onClick={handleRestoreFromLocal}
            disabled={!hasLocalBackup}
            className="p-3.5 bg-slate-850 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700/80 rounded-xl text-left transition-colors flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                <History className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">SNAPSHOT</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Restore Snapshot Terakhir</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Pulihkan otomatis dari cadangan memori sebelum reset</p>
            </div>
          </button>
        </div>
      </div>

      {/* Hidden File Input for Restore JSON */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json,application/json"
        className="hidden"
      />

      {/* RESET DATA (Requirement 2: Strictly resets history on 4 menus only) */}
      <div className="p-5 bg-slate-900 border border-rose-900/40 rounded-2xl space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              Reset Data Riwayat Operasional (Cinema Manager)
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Sesuai regulasi sistem, fitur Reset Data hanya menghapus <span className="text-rose-300 font-semibold">riwayat transaksi data</span> pada 4 modul di bawah ini. Data master akun, employee management, schedule, dan konfigurasi sistem tidak akan pernah terhapus.
          </p>
        </div>

        {/* 4 Scope Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>Scope 4 Menu yang Di-reset:</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc marker:text-rose-400">
              <li>
                <strong className="text-slate-100">Inventory / Stock:</strong> Riwayat transaksi barang masuk & keluar
              </li>
              <li>
                <strong className="text-slate-100">Utility Monitoring:</strong> Catatan histori meteran listrik & air
              </li>
              <li>
                <strong className="text-slate-100">Daily Cleaning:</strong> Riwayat laporan & checklist kebersihan area
              </li>
              <li>
                <strong className="text-slate-100">Manajemen Izin & Cuti:</strong> Riwayat pengajuan Off Day, Cuti, & Izin Sakit
              </li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Data yang Tetap Aman & Dipertahankan:</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc marker:text-emerald-400">
              <li>
                <strong className="text-slate-100">Employee Management:</strong> Data seluruh akun & profil karyawan
              </li>
              <li>
                <strong className="text-slate-100">Katalog Stok:</strong> Daftar master produk & stok barang aktif
              </li>
              <li>
                <strong className="text-slate-100">Schedule Kerja:</strong> Jadwal kerja mingguan & plotting bioskop
              </li>
              <li>
                <strong className="text-slate-100">Konfigurasi Bioskop:</strong> Nama site, studio, dan parameter sistem
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-800">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Snapshot cadangan otomatis disimpan ke memori sebelum reset dijalankan.
          </span>

          <button
            type="button"
            onClick={handleClearAllMenus}
            className="px-5 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-md active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Riwayat Data 4 Menu
          </button>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
