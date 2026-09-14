import React, { useState, useEffect, useCallback } from 'react';
import { useCinema } from '../../context/CinemaContext';
import {
  DriveFileItem,
  DriveAboutResponse,
} from '../../services/googleDriveService';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  subscribeGoogleAuth,
  GoogleAuthState,
} from '../../services/googleAuth';
import { googleDriveService } from '../../services/googleDriveService';
import { GoogleSignInButton } from '../ui/GoogleSignInButton';
import {
  HardDrive,
  FolderPlus,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  File,
  Image as ImageIcon,
  Folder,
  Trash2,
  ExternalLink,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Database,
  Calendar,
  Zap,
  Sparkles,
  Package,
  Edit2,
  X,
  Lock,
} from 'lucide-react';

export const GoogleDriveView: React.FC = () => {
  const {
    inventory,
    utilityReports,
    cleaningReports,
    offDayRequests,
    leaveRequests,
    sickLeaveRequests,
    employees,
    addToast,
    logActivity,
  } = useCinema();

  const [authState, setAuthState] = useState<GoogleAuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [aboutData, setAboutData] = useState<DriveAboutResponse | null>(null);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMimeType, setSelectedMimeType] = useState('ALL');

  // Breadcrumb / folder navigation
  const [currentFolder, setCurrentFolder] = useState<{ id?: string; name: string }>({
    id: undefined,
    name: 'Google Drive Utama',
  });
  const [folderHistory, setFolderHistory] = useState<Array<{ id?: string; name: string }>>([]);

  // Modals state
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Destructive Delete Confirmation Modal (MANDATORY per Workspace Skill)
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeletingFile, setIsDeletingFile] = useState(false);

  // Rename modal
  const [fileToRename, setFileToRename] = useState<DriveFileItem | null>(null);
  const [renamedFileName, setRenamedFileName] = useState('');
  const [isRenamingFile, setIsRenamingFile] = useState(false);

  // Upload modal / status
  const [isUploading, setIsUploading] = useState(false);
  const [activeBackupType, setActiveBackupType] = useState<string | null>(null);

  // Subscribe to Google Auth changes
  useEffect(() => {
    const unsubscribe = subscribeGoogleAuth((state) => {
      setAuthState(state);
    });

    const unsubscribeFirebase = initAuth(
      () => {
        // Success
      },
      () => {
        // Not authenticated
      }
    );

    return () => {
      unsubscribe();
      unsubscribeFirebase();
    };
  }, []);

  // Fetch Drive Files and About data when authenticated
  const loadDriveData = useCallback(async () => {
    if (!authState.isAuthenticated) return;
    setIsLoadingFiles(true);
    try {
      const [aboutRes, filesRes] = await Promise.all([
        googleDriveService.getAbout().catch((err) => {
          console.warn('Gagal memuat info profil Drive:', err);
          return null;
        }),
        googleDriveService.listFiles({
          folderId: currentFolder.id,
          searchTerm: searchTerm,
          mimeTypeFilter: selectedMimeType,
        }),
      ]);

      if (aboutRes) setAboutData(aboutRes);
      setFiles(filesRes.files || []);
    } catch (err: any) {
      console.error('Error fetching drive data:', err);
      addToast('Gagal memuat berkas dari Google Drive. Pastikan sesi login masih valid.', 'error');
    } finally {
      setIsLoadingFiles(false);
    }
  }, [authState.isAuthenticated, currentFolder.id, searchTerm, selectedMimeType, addToast]);

  useEffect(() => {
    if (authState.isAuthenticated) {
      loadDriveData();
    }
  }, [authState.isAuthenticated, loadDriveData]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        addToast(`Berhasil terhubung ke Google Drive (${result.user.email})`, 'success');
        logActivity('Google Drive', 'Koneksi akun Google Drive berhasil', `Akun: ${result.user.email}`);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      addToast(err.message || 'Gagal login dengan Google', 'error');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutGoogle();
      setAboutData(null);
      setFiles([]);
      addToast('Akun Google Drive berhasil diputuskan', 'info');
      logActivity('Google Drive', 'Putus koneksi Google Drive');
    } catch (err: any) {
      addToast('Gagal memutus akun Google', 'error');
    }
  };

  // Folder navigation
  const handleOpenFolder = (folder: DriveFileItem) => {
    setFolderHistory((prev) => [...prev, currentFolder]);
    setCurrentFolder({ id: folder.id, name: folder.name });
  };

  const handleGoBackFolder = (targetIndex: number) => {
    if (targetIndex === -1) {
      // Go to root
      setCurrentFolder({ id: undefined, name: 'Google Drive Utama' });
      setFolderHistory([]);
    } else {
      const target = folderHistory[targetIndex];
      setCurrentFolder(target);
      setFolderHistory((prev) => prev.slice(0, targetIndex));
    }
  };

  // Create folder
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setIsCreatingFolder(true);
    try {
      const created = await googleDriveService.createFolder(newFolderName, currentFolder.id);
      addToast(`Folder "${created.name}" berhasil dibuat di Google Drive`, 'success');
      logActivity('Google Drive', `Buat folder baru: ${created.name}`);
      setNewFolderName('');
      setIsNewFolderModalOpen(false);
      loadDriveData();
    } catch (err: any) {
      addToast(err.message || 'Gagal membuat folder', 'error');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // Handle destructive delete with mandatory user confirmation
  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    setIsDeletingFile(true);
    try {
      await googleDriveService.deleteFile(fileToDelete.id);
      addToast(`Berkas "${fileToDelete.name}" berhasil dihapus dari Google Drive`, 'success');
      logActivity('Google Drive', `Hapus berkas: ${fileToDelete.name}`);
      setFileToDelete(null);
      loadDriveData();
    } catch (err: any) {
      addToast(err.message || 'Gagal menghapus berkas', 'error');
    } finally {
      setIsDeletingFile(false);
    }
  };

  // Handle Rename
  const handleConfirmRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToRename || !renamedFileName.trim()) return;
    setIsRenamingFile(true);
    try {
      await googleDriveService.renameFile(fileToRename.id, renamedFileName.trim());
      addToast(`Nama berkas diubah menjadi "${renamedFileName}"`, 'success');
      logActivity('Google Drive', `Ubah nama berkas menjadi: ${renamedFileName}`);
      setFileToRename(null);
      setRenamedFileName('');
      loadDriveData();
    } catch (err: any) {
      addToast(err.message || 'Gagal mengubah nama berkas', 'error');
    } finally {
      setIsRenamingFile(false);
    }
  };

  // Upload custom local file
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];

    setIsUploading(true);
    try {
      const uploaded = await googleDriveService.uploadFile(file, currentFolder.id);
      addToast(`Berkas "${uploaded.name}" berhasil diunggah ke Google Drive`, 'success');
      logActivity('Google Drive', `Unggah berkas: ${uploaded.name}`);
      loadDriveData();
    } catch (err: any) {
      addToast(err.message || 'Gagal mengunggah berkas', 'error');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  // Cinema Operational Quick Backup Generators
  const handleBackupCleaningReports = async () => {
    setActiveBackupType('cleaning');
    try {
      const payload = {
        type: 'CINEMA_DAILY_CLEANING_BACKUP',
        exportedAt: new Date().toISOString(),
        cinemaName: 'CINEPOLIS LIPPO PLAZA SIDOARJO',
        totalRecords: cleaningReports.length,
        reports: cleaningReports,
      };

      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `Cinema_Cleaning_Audit_${dateStr}.json`;

      await googleDriveService.uploadContent(
        filename,
        JSON.stringify(payload, null, 2),
        'application/json',
        currentFolder.id
      );

      addToast(`Backup Laporan Cleaning (${filename}) tersimpan di Google Drive`, 'success');
      logActivity('Google Drive', `Backup Laporan Cleaning: ${filename}`);
      loadDriveData();
    } catch (err: any) {
      addToast(err.message || 'Gagal membuat backup', 'error');
    } finally {
      setActiveBackupType(null);
    }
  };

  const handleBackupInventory = async () => {
    setActiveBackupType('inventory');
    try {
      // Export as CSV formatted text for Google Drive Sheets compatibility
      const headers = 'Kode Barang,Nama Barang,Kategori,Stok Saat Ini,Satuan,Stok Minimum,Status Stok,Lokasi\n';
      const rows = inventory
        .map(
          (item) =>
            `"${item.itemCode}","${item.itemName}","${item.category}",${item.currentStock},"${item.unit}",${item.minimumStock},"${item.status}","${item.storageLocation}"`
        )
        .join('\n');
      const csvContent = headers + rows;

      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `Cinema_Stock_Inventory_${dateStr}.csv`;

      await googleDriveService.uploadContent(
        filename,
        csvContent,
        'text/csv',
        currentFolder.id
      );

      addToast(`Rekap Stok (${filename}) berhasil diekspor ke Google Drive`, 'success');
      logActivity('Google Drive', `Backup Stok Inventaris: ${filename}`);
      loadDriveData();
    } catch (err: any) {
      addToast(err.message || 'Gagal mengekspor data stok', 'error');
    } finally {
      setActiveBackupType(null);
    }
  };

  const handleBackupUtility = async () => {
    setActiveBackupType('utility');
    try {
      const payload = {
        type: 'CINEMA_UTILITY_MONITORING_BACKUP',
        exportedAt: new Date().toISOString(),
        totalDaysLogged: utilityReports.length,
        logs: utilityReports,
      };

      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `Cinema_Utility_Data_${dateStr}.json`;

      await googleDriveService.uploadContent(
        filename,
        JSON.stringify(payload, null, 2),
        'application/json',
        currentFolder.id
      );

      addToast(`Data Pemantauan Listrik & Air (${filename}) tersimpan di Drive`, 'success');
      logActivity('Google Drive', `Backup Data Utilitas: ${filename}`);
      loadDriveData();
    } catch (err: any) {
      addToast(err.message || 'Gagal menyimpan utilitas', 'error');
    } finally {
      setActiveBackupType(null);
    }
  };

  const handleBackupRequests = async () => {
    setActiveBackupType('requests');
    try {
      const payload = {
        type: 'CINEMA_STAFF_REQUESTS_BACKUP',
        exportedAt: new Date().toISOString(),
        summary: {
          totalOffDay: offDayRequests.length,
          totalLeave: leaveRequests.length,
          totalSickLeave: sickLeaveRequests.length,
        },
        offDayRequests,
        leaveRequests,
        sickLeaveRequests,
      };

      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `Cinema_Staff_Approvals_${dateStr}.json`;

      await googleDriveService.uploadContent(
        filename,
        JSON.stringify(payload, null, 2),
        'application/json',
        currentFolder.id
      );

      addToast(`Arsip Berkas Izin & Cuti (${filename}) tersimpan di Drive`, 'success');
      logActivity('Google Drive', `Backup Permohonan Staf: ${filename}`);
      loadDriveData();
    } catch (err: any) {
      addToast(err.message || 'Gagal menyimpan berkas izin', 'error');
    } finally {
      setActiveBackupType(null);
    }
  };

  // Helper function to render correct file icon based on mimeType
  const renderFileIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') {
      return <Folder className="w-5 h-5 text-amber-400 fill-amber-400/20" />;
    }
    if (mimeType.includes('spreadsheet') || mimeType.includes('csv')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    }
    if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('text')) {
      return <FileText className="w-5 h-5 text-sky-400" />;
    }
    if (mimeType.includes('pdf')) {
      return <FileText className="w-5 h-5 text-rose-400" />;
    }
    if (mimeType.includes('image')) {
      return <ImageIcon className="w-5 h-5 text-purple-400" />;
    }
    return <File className="w-5 h-5 text-slate-400" />;
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return '-';
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return '-';
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    if (num < 1024 * 1024 * 1024) return `${(num / (1024 * 1024)).toFixed(1)} MB`;
    return `${(num / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div id="google-drive-management-view" className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 via-sky-500/20 to-emerald-500/20 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
              <HardDrive className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
                  Google Drive Integrasi Bioskop
                </h2>
                {authState.isAuthenticated ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Terhubung
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-medium">
                    Belum Terhubung
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Simpan, backup otomatis, dan sinkronkan dokumen operasional, surat izin dokter, dan laporan bioskop ke Google Drive dengan aman.
              </p>
            </div>
          </div>

          {/* Connection Controls */}
          <div className="flex items-center gap-3">
            {!authState.isAuthenticated ? (
              <GoogleSignInButton
                onClick={handleSignIn}
                isLoading={isSigningIn}
                text="Hubungkan Google Drive"
              />
            ) : (
              <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
                {aboutData?.user && (
                  <div className="flex items-center gap-2.5 pr-2">
                    {aboutData.user.photoLink ? (
                      <img
                        src={aboutData.user.photoLink}
                        alt={aboutData.user.displayName}
                        className="w-7 h-7 rounded-full border border-slate-700"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center">
                        {aboutData.user.displayName?.[0] || 'G'}
                      </div>
                    )}
                    <div className="text-left hidden sm:block">
                      <p className="text-xs font-semibold text-slate-200 leading-tight">
                        {aboutData.user.displayName}
                      </p>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        {aboutData.user.emailAddress}
                      </p>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 text-xs font-medium transition-colors"
                >
                  Putus Akun
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quota Bar if authenticated */}
        {authState.isAuthenticated && aboutData?.storageQuota && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <span>Penggunaan Drive:</span>
              <strong className="text-slate-200">
                {formatFileSize(aboutData.storageQuota.usage)}
              </strong>
              <span>dari</span>
              <strong className="text-slate-200">
                {formatFileSize(aboutData.storageQuota.limit) === '-' ? 'Unlimited' : formatFileSize(aboutData.storageQuota.limit)}
              </strong>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-emerald-400 font-medium">✓ Izin Akses Aktif</span>
              <span>•</span>
              <span>Scope: drive, drive.file</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content: If not authenticated, show intuitive showcase */}
      {!authState.isAuthenticated ? (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <HardDrive className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-slate-100">
              Hubungkan Google Drive untuk Manajemen Berkas Terpadu
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              Dapatkan akses langsung untuk mem-backup laporan harian bioskop, menyimpan berkas audit utilitas, mengunggah surat keterangan sakit staf, dan mengelola direktori SOP bioskop secara cloud.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-xl mx-auto pt-2">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit mb-2">
                <Database className="w-4 h-4" />
              </div>
              <p className="font-semibold text-slate-200">Auto Backup</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Ekspor instan audit ke Google Drive</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 w-fit mb-2">
                <Folder className="w-4 h-4" />
              </div>
              <p className="font-semibold text-slate-200">Arsip SOP Bioskop</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Folder terpusat untuk Cinema Crew dan tim</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 w-fit mb-2">
                <Lock className="w-4 h-4" />
              </div>
              <p className="font-semibold text-slate-200">Aman & Terverifikasi</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Otorisasi OAuth dengan konfirmasi user</p>
            </div>
          </div>

          <div className="pt-2">
            <GoogleSignInButton
              onClick={handleSignIn}
              isLoading={isSigningIn}
              text="Masuk dengan Akun Google"
            />
          </div>
        </div>
      ) : (
        <>
          {/* Quick Backup Action Bar for Cinema Operations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  Quick Cinema Backup ke Google Drive
                </h3>
                <p className="text-xs text-slate-400">
                  Simpan langsung snapshot data operasional bioskop ke folder Google Drive aktif ({currentFolder.name})
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <button
                type="button"
                onClick={handleBackupCleaningReports}
                disabled={activeBackupType !== null}
                className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-left transition-all disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <p className="text-xs font-semibold text-slate-200">Backup Cleaning</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {activeBackupType === 'cleaning' ? 'Menyimpan...' : `${cleaningReports.length} Laporan Audit`}
                </p>
              </button>

              <button
                type="button"
                onClick={handleBackupInventory}
                disabled={activeBackupType !== null}
                className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-left transition-all disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                    <Package className="w-4 h-4" />
                  </div>
                  <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <p className="text-xs font-semibold text-slate-200">Export Stok (CSV)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {activeBackupType === 'inventory' ? 'Mengekspor...' : `${inventory.length} Item Bahan & F&B`}
                </p>
              </button>

              <button
                type="button"
                onClick={handleBackupUtility}
                disabled={activeBackupType !== null}
                className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-left transition-all disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <p className="text-xs font-semibold text-slate-200">Backup Utilitas</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {activeBackupType === 'utility' ? 'Menyimpan...' : `${utilityReports.length} Catatan Meteran`}
                </p>
              </button>

              <button
                type="button"
                onClick={handleBackupRequests}
                disabled={activeBackupType !== null}
                className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-left transition-all disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <p className="text-xs font-semibold text-slate-200">Backup Berkas Staf</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {activeBackupType === 'requests' ? 'Menyimpan...' : 'Izin, Cuti & Sakit'}
                </p>
              </button>
            </div>
          </div>

          {/* Drive Explorer: Toolbar + Breadcrumbs + Search & Filter */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              {/* Folder Breadcrumbs */}
              <nav className="flex items-center gap-1.5 text-xs text-slate-400 overflow-x-auto py-1">
                <button
                  type="button"
                  onClick={() => handleGoBackFolder(-1)}
                  className={`hover:text-amber-400 font-medium ${
                    folderHistory.length === 0 ? 'text-amber-400 font-bold' : ''
                  }`}
                >
                  Drive Utama
                </button>
                {folderHistory.map((folder, idx) => (
                  <React.Fragment key={folder.id || idx}>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <button
                      type="button"
                      onClick={() => handleGoBackFolder(idx)}
                      className="hover:text-amber-400 truncate max-w-[120px]"
                    >
                      {folder.name}
                    </button>
                  </React.Fragment>
                ))}
                {folderHistory.length > 0 && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span className="text-slate-200 font-semibold truncate max-w-[140px]">
                      {currentFolder.name}
                    </span>
                  </>
                )}
              </nav>

              {/* Action Buttons: New Folder, Upload File, Refresh */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewFolderModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                  Folder Baru
                </button>

                <label className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors">
                  <UploadCloud className="w-3.5 h-3.5" />
                  {isUploading ? 'Mengunggah...' : 'Upload File'}
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={loadDriveData}
                  disabled={isLoadingFiles}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Segarkan Berkas"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari berkas di Google Drive..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* MIME Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: 'ALL', label: 'Semua' },
                  { id: 'folder', label: 'Folder' },
                  { id: 'document', label: 'Dokumen' },
                  { id: 'spreadsheet', label: 'Spreadsheet' },
                  { id: 'pdf', label: 'PDF' },
                  { id: 'image', label: 'Gambar' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setSelectedMimeType(chip.id)}
                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      selectedMimeType === chip.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File Listing Container */}
            {isLoadingFiles ? (
              <div className="py-16 text-center text-xs text-slate-500 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400" />
                <p>Memuat berkas dari Google Drive...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="py-14 text-center text-xs text-slate-500 space-y-3 bg-slate-950/40 rounded-xl border border-slate-800/60 p-6">
                <Folder className="w-10 h-10 mx-auto text-slate-600" />
                <div>
                  <p className="font-semibold text-slate-300">Belum ada berkas di folder ini</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Gunakan tombol "Upload File" atau buat "Quick Cinema Backup" di atas.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {files.map((file) => {
                  const isFolder = file.mimeType === 'application/vnd.google-apps.folder';

                  return (
                    <div
                      key={file.id}
                      className="bg-slate-950/70 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3.5 flex flex-col justify-between group transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                          {renderFileIcon(file.mimeType)}
                        </div>

                        <div className="flex-1 min-w-0">
                          {isFolder ? (
                            <button
                              type="button"
                              onClick={() => handleOpenFolder(file)}
                              className="text-left font-semibold text-xs text-slate-200 hover:text-amber-400 truncate block w-full"
                              title={file.name}
                            >
                              {file.name}
                            </button>
                          ) : (
                            <p className="font-semibold text-xs text-slate-200 truncate" title={file.name}>
                              {file.name}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span>
                              {file.modifiedTime
                                ? new Date(file.modifiedTime).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* File Card Actions */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {isFolder ? (
                            <button
                              type="button"
                              onClick={() => handleOpenFolder(file)}
                              className="text-amber-400 hover:text-amber-300 font-medium text-[11px] flex items-center gap-1"
                            >
                              Buka Folder <ChevronRight className="w-3 h-3" />
                            </button>
                          ) : (
                            file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-amber-400 hover:text-amber-300 font-medium text-[11px] flex items-center gap-1"
                              >
                                Buka di Drive <ExternalLink className="w-3 h-3" />
                              </a>
                            )
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Rename */}
                          <button
                            type="button"
                            onClick={() => {
                              setFileToRename(file);
                              setRenamedFileName(file.name);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                            title="Ganti Nama"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Action triggers MANDATORY confirmation dialog */}
                          <button
                            type="button"
                            onClick={() => setFileToDelete(file)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                            title="Hapus dari Google Drive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* New Folder Modal */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-amber-400" />
                Buat Folder Baru di Google Drive
              </h4>
              <button
                type="button"
                onClick={() => setIsNewFolderModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Folder
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Contoh: Dokumen SOP Cinema 2026"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Folder akan dibuat di dalam "{currentFolder.name}"
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewFolderModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCreatingFolder}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  {isCreatingFolder ? 'Membuat...' : 'Buat Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {fileToRename && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                Ganti Nama Berkas
              </h4>
              <button
                type="button"
                onClick={() => setFileToRename(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmRename} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Berkas Baru
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={renamedFileName}
                  onChange={(e) => setRenamedFileName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFileToRename(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isRenamingFile}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  {isRenamingFile ? 'Menyimpan...' : 'Simpan Nama'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANDATORY Explicit Confirmation Dialog for Destructive Operations */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-100">
                  Konfirmasi Hapus Berkas dari Google Drive
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Apakah Anda yakin ingin menghapus berkas berikut secara permanen dari akun Google Drive Anda?
                </p>
              </div>
            </div>

            {/* Target Item Details */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Nama Berkas:</span>
                <span className="font-bold text-slate-200 truncate max-w-[220px]">
                  {fileToDelete.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tipe / Format:</span>
                <span className="text-slate-300 truncate max-w-[220px]">
                  {fileToDelete.mimeType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ukuran:</span>
                <span className="text-slate-300">
                  {formatFileSize(fileToDelete.size)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-rose-400/90 font-medium">
              Tindakan ini tidak dapat dibatalkan dan akan langsung memperbarui Google Drive Anda.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={isDeletingFile}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeletingFile}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-500/20"
              >
                <Trash2 className="w-4 h-4" />
                {isDeletingFile ? 'Menghapus...' : 'Ya, Hapus Permanen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
