import React, { useState, useMemo } from 'react';
import { useCinema } from '../../context/CinemaContext';
import { InventoryItem, InventoryCategory, TransactionType } from '../../types';
import { StatusBadge } from '../ui/Badge';
import {
  Package,
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  ClipboardList,
  AlertTriangle,
  History,
  Filter,
  Download,
  Edit2,
  Trash2,
  X,
  Building,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const {
    inventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    recordStockTransaction,
    transactions,
    currentUser,
    askConfirm,
  } = useCinema();

  const isCrew = currentUser.role === 'CREW';
  const isManager = currentUser.role === 'ADMIN';

  // Tabs
  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isStockActionModalOpen, setIsStockActionModalOpen] = useState(false);
  const [stockActionType, setStockActionType] = useState<TransactionType>('STOCK_IN');
  const [selectedItemForAction, setSelectedItemForAction] = useState<InventoryItem | null>(null);
  const [actionQuantity, setActionQuantity] = useState('');
  const [actionNotes, setActionNotes] = useState('');

  // Item Form State
  const [formData, setFormData] = useState({
    itemCode: '',
    itemName: '',
    category: 'Food & Beverage' as InventoryCategory,
    unit: 'Pcs',
    currentStock: 10,
    minimumStock: 5,
    maximumStock: 50,
    location: 'Gudang Concession A1',
    supplier: 'PT Supplier Cinema',
    notes: '',
  });

  const categories: InventoryCategory[] = [
    'Food & Beverage',
    'Cleaning Supplies',
    'Operational Supplies',
    'Office Supplies',
    'Packaging',
    'Maintenance',
    'Other',
  ];

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchSearch =
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [inventory, searchTerm, categoryFilter, statusFilter]);

  // Open add modal
  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      itemCode: `SKU-${String(inventory.length + 1).padStart(3, '0')}`,
      itemName: '',
      category: 'Food & Beverage',
      unit: 'Pcs',
      currentStock: 10,
      minimumStock: 5,
      maximumStock: 50,
      location: 'Gudang Concession',
      supplier: 'PT Pangan Nusantara',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      itemCode: item.itemCode,
      itemName: item.itemName,
      category: item.category,
      unit: item.unit,
      currentStock: item.currentStock,
      minimumStock: item.minimumStock,
      maximumStock: item.maximumStock,
      location: item.location,
      supplier: item.supplier,
      notes: item.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemName.trim() || !formData.itemCode.trim()) {
      alert('Kode dan nama barang wajib diisi.');
      return;
    }

    if (editingItem) {
      updateInventoryItem(editingItem.id, formData);
    } else {
      addInventoryItem(formData);
    }
    setIsAddModalOpen(false);
  };

  const openStockModal = (item: InventoryItem, type: TransactionType) => {
    setSelectedItemForAction(item);
    setStockActionType(type);
    setActionQuantity('');
    setActionNotes('');
    setIsStockActionModalOpen(true);
  };

  const handleStockActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(actionQuantity);
    if (isNaN(qty) || qty < 0) {
      alert('Masukkan kuantitas yang valid.');
      return;
    }
    if (!selectedItemForAction) return;

    recordStockTransaction({
      itemId: selectedItemForAction.id,
      type: stockActionType,
      quantity: qty,
      notes: actionNotes,
    });
    setIsStockActionModalOpen(false);
  };

  const handleDelete = (item: InventoryItem) => {
    askConfirm({
      title: 'Hapus Item Inventory',
      message: `Hapus item "${item.itemName}" (${item.itemCode}) secara permanen dari daftar inventaris?`,
      confirmText: 'Hapus Item',
      danger: true,
      onConfirm: () => deleteInventoryItem(item.id),
    });
  };

  // Export inventory to CSV
  const exportToCsv = () => {
    const headers = [
      'Item Code',
      'Nama Barang',
      'Kategori',
      'Satuan',
      'Stok Saat Ini',
      'Min Stok',
      'Max Stok',
      'Lokasi',
      'Supplier',
      'Status',
      'Update Terakhir',
    ];
    const rows = filteredInventory.map((i) => [
      i.itemCode,
      `"${i.itemName}"`,
      `"${i.category}"`,
      i.unit,
      i.currentStock,
      i.minimumStock,
      i.maximumStock,
      `"${i.location}"`,
      `"${i.supplier}"`,
      i.status,
      i.lastStockUpdate,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_cinema_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Inventory / Stock Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pengelolaan stok barang concession, packaging, chemical cleaning, dan perlengkapan bioskop
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={exportToCsv}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-amber-400" />
            Export Data
          </button>

          {!isCrew && (
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-all"
            >
              <Plus className="w-4 h-4" />
              Tambah Item
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher: Inventory Items vs Stock History */}
      <div className="flex border-b border-slate-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'border-amber-500 text-amber-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          Daftar Item Barang ({inventory.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-amber-500 text-amber-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          Histori Mutasi Stok ({transactions.length})
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <>
          {/* Search and Filters */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama barang, kode SKU, gudang, supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">Semua Status Stok</option>
                <option value="SAFE">Stock Aman</option>
                <option value="LOW_STOCK">Stock Menipis (Low Stock)</option>
                <option value="OUT_OF_STOCK">Stock Habis (Out of Stock)</option>
              </select>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-850 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Kode & Nama Item</th>
                    <th className="p-3.5">Kategori</th>
                    <th className="p-3.5">Stok Saat Ini</th>
                    <th className="p-3.5">Min / Max</th>
                    <th className="p-3.5">Lokasi / Gudang</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Terakhir Update</th>
                    <th className="p-3.5 text-right">Aksi Stok</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        Tidak ada barang yang sesuai kriteria pencarian
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5">
                          <p className="font-bold text-slate-100">{item.itemName}</p>
                          <span className="font-mono text-[11px] text-amber-400 font-semibold">{item.itemCode}</span>
                          {item.notes && <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">{item.notes}</p>}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-baseline gap-1">
                            <span
                              className={`text-sm font-extrabold ${
                                item.status === 'OUT_OF_STOCK'
                                  ? 'text-rose-400'
                                  : item.status === 'LOW_STOCK'
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {item.currentStock}
                            </span>
                            <span className="text-[11px] text-slate-400">{item.unit}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-400">
                          Min: <span className="text-slate-200 font-semibold">{item.minimumStock}</span> / Max: {item.maximumStock}
                        </td>
                        <td className="p-3.5">
                          <p className="text-slate-300 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" /> {item.location}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.supplier}</p>
                        </td>
                        <td className="p-3.5">
                          <StatusBadge status={item.status} size="sm" />
                        </td>
                        <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                          {item.lastStockUpdate}
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          {!isCrew && (
                            <>
                              <button
                                type="button"
                                onClick={() => openStockModal(item, 'STOCK_IN')}
                                className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30 text-[11px] font-bold"
                                title="Stock In"
                              >
                                + In
                              </button>
                              <button
                                type="button"
                                onClick={() => openStockModal(item, 'STOCK_OUT')}
                                className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30 text-[11px] font-bold"
                                title="Stock Out"
                              >
                                - Out
                              </button>
                              <button
                                type="button"
                                onClick={() => openStockModal(item, 'ADJUSTMENT')}
                                className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30 text-[11px] font-bold"
                                title="Stock Adjustment / Opname"
                              >
                                Adjust
                              </button>
                              {isManager && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(item)}
                                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-amber-400"
                                    title="Edit Item"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(item)}
                                    className="p-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                                    title="Hapus Item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Stock History Tab */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-200">Histori Transaksi & Mutasi Stok</h3>
              <p className="text-xs text-slate-400">Pencatatan audit log keluar-masuk dan stock opname barang</p>
            </div>
            <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
              {transactions.length} Total Rekaman
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-850 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Waktu</th>
                  <th className="p-3.5">Nama Barang</th>
                  <th className="p-3.5">Tipe Transaksi</th>
                  <th className="p-3.5">Kuantitas</th>
                  <th className="p-3.5">Sebelum & Sesudah</th>
                  <th className="p-3.5">Operator</th>
                  <th className="p-3.5">Keterangan / PO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      Belum ada catatan mutasi stok
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-mono text-slate-400">{tx.date}</td>
                      <td className="p-3.5">
                        <p className="font-bold text-slate-100">{tx.itemName}</p>
                        <span className="font-mono text-[10px] text-amber-400">{tx.itemCode}</span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            tx.transactionType === 'STOCK_IN'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : tx.transactionType === 'STOCK_OUT'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {tx.transactionType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-100">
                        {tx.transactionType === 'STOCK_IN' ? '+' : tx.transactionType === 'STOCK_OUT' ? '-' : ''}
                        {tx.quantity}
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono">
                        {tx.beforeStock} → <span className="font-bold text-amber-400">{tx.afterStock}</span>
                      </td>
                      <td className="p-3.5 font-medium text-slate-300">{tx.user}</td>
                      <td className="p-3.5 text-slate-400">{tx.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Inventory Item */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl my-8 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
              <h3 className="font-bold text-base text-slate-100">
                {editingItem ? 'Edit Data Barang' : 'Tambah Barang Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Kode Item (SKU) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.itemCode}
                    onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Nama Barang <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama barang..."
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Satuan Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pcs, Dus, Box, Jerigen, Zak"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Stok Awal</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Batas Min Stok</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Kapasitas Max</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.maximumStock}
                    onChange={(e) => setFormData({ ...formData, maximumStock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Lokasi Penyimpanan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Gudang Concession A1"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Nama Supplier / Vendor</label>
                  <input
                    type="text"
                    required
                    placeholder="PT / CV Supplier..."
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Catatan</label>
                <textarea
                  rows={2}
                  placeholder="Informasi tambahan masa simpan, instruksi penanganan..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Stock Action: IN, OUT, ADJUSTMENT */}
      {isStockActionModalOpen && selectedItemForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
              <h3 className="font-bold text-base text-slate-100">
                {stockActionType === 'STOCK_IN' && 'Penerimaan Stok (Stock In)'}
                {stockActionType === 'STOCK_OUT' && 'Pengeluaran Stok (Stock Out)'}
                {stockActionType === 'ADJUSTMENT' && 'Penyesuaian Fisik / Stock Opname'}
              </h3>
              <button
                type="button"
                onClick={() => setIsStockActionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockActionSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 text-xs space-y-1">
                <p className="font-bold text-slate-200 text-sm">{selectedItemForAction.itemName}</p>
                <p className="text-amber-400 font-mono">{selectedItemForAction.itemCode}</p>
                <p className="text-slate-400">
                  Stok Saat Ini: <span className="text-white font-bold">{selectedItemForAction.currentStock}</span>{' '}
                  {selectedItemForAction.unit}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  {stockActionType === 'ADJUSTMENT' ? 'Stok Fisik Aktual Baru' : 'Jumlah Kuantitas'}{' '}
                  <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  placeholder={`Kuantitas (${selectedItemForAction.unit})...`}
                  value={actionQuantity}
                  onChange={(e) => setActionQuantity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Keterangan / Nomor Dokumen
                </label>
                <textarea
                  rows={2}
                  placeholder="PO supplier, tujuan divisi, alasan selisih stok..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsStockActionModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
