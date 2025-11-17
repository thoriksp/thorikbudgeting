import React, { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Target, Edit2, Check, X, Zap, Calendar, Filter, Download, Search, AlertTriangle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function BudgetTracker() {
  const [transactions, setTransactions] = useState([]);
  const [bulkInput, setBulkInput] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Makanan');
  const [type, setType] = useState('pengeluaran');
  const [targets, setTargets] = useState([
    { id: 1, name: 'Ortu', target: 2000000, spent: 0, keywords: ['ortu', 'orang tua', 'orangtua'] },
    { id: 2, name: 'Tabungan', target: 1000000, spent: 0, keywords: ['tabungan', 'nabung', 'saving'] },
    { id: 3, name: 'Cicilan', target: 500000, spent: 0, keywords: ['cicilan', 'bayar cicilan'] }
  ]);
  const [editingTarget, setEditingTarget] = useState(null);
  const [newTargetName, setNewTargetName] = useState('');
  const [newTargetAmount, setNewTargetAmount] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(true);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [chartWeekOffset, setChartWeekOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAnimation, setShowAnimation] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = {
    pengeluaran: ['Makanan', 'Transport', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Ortu', 'Tabungan', 'Cicilan', 'Lainnya'],
    pemasukan: ['Gaji', 'Bonus', 'Hadiah', 'Lainnya']
  };

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'];

  // Load data from localStorage
  useEffect(() => {
    try {
      const transData = localStorage.getItem('transactions');
      const targetsData = localStorage.getItem('targets');
      
      if (transData) {
        setTransactions(JSON.parse(transData));
      }
      if (targetsData) {
        setTargets(JSON.parse(targetsData));
      }
    } catch (error) {
      console.log('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save transactions to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  }, [transactions, isLoading]);

  // Save targets to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('targets', JSON.stringify(targets));
    }
  }, [targets, isLoading]);

  // Check for budget alerts
  useEffect(() => {
    const newAlerts = [];
    targets.forEach(target => {
      const percentage = (target.spent / target.target) * 100;
      if (percentage >= 100) {
        newAlerts.push({
          type: 'danger',
          message: `⚠️ Target ${target.name} telah melewati budget! (${percentage.toFixed(0)}%)`
        });
      } else if (percentage >= 80) {
        newAlerts.push({
          type: 'warning',
          message: `⚡ Target ${target.name} sudah ${percentage.toFixed(0)}% dari budget`
        });
      }
    });
    setAlerts(newAlerts);
  }, [targets]);

  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/');
    return new Date(year, month - 1, day);
  };

  const filteredTransactions = transactions.filter(t => {
    let dateMatch = true;
    if (filterStartDate || filterEndDate) {
      const transDate = parseDate(t.date);
      const startDate = filterStartDate ? new Date(filterStartDate) : null;
      const endDate = filterEndDate ? new Date(filterEndDate) : null;
      
      if (startDate && endDate) {
        dateMatch = transDate >= startDate && transDate <= endDate;
      } else if (startDate) {
        dateMatch = transDate >= startDate;
      } else if (endDate) {
        dateMatch = transDate <= endDate;
      }
    }

    const searchMatch = searchQuery === '' || 
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    const categoryMatch = filterCategory === 'all' || t.category === filterCategory;

    return dateMatch && searchMatch && categoryMatch;
  });

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const getPieChartData = () => {
    const categoryTotals = {};
    filteredTransactions
      .filter(t => t.type === 'pengeluaran')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value
    }));
  };

  useEffect(() => {
    const updatedTargets = targets.map(target => {
      const spent = transactions
        .filter(t => t.type === 'pengeluaran' && t.category === target.name)
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...target, spent };
    });
    setTargets(updatedTargets);
  }, [transactions]);

  const getWeeklyData = () => {
    const weekDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const today = new Date();
    const data = [];
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (chartWeekOffset * 7) - 6);
    
    let startDateStr = '';
    let endDateStr = '';

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toLocaleDateString('id-ID');
      const dayName = weekDays[date.getDay()];

      if (i === 0) startDateStr = dateStr;
      if (i === 6) endDateStr = dateStr;

      const dayIncome = transactions
        .filter(t => t.type === 'pemasukan' && t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);

      const dayExpense = transactions
        .filter(t => t.type === 'pengeluaran' && t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);

      data.push({
        day: `${dayName}\\n${date.getDate()}/${date.getMonth() + 1}`,
        Pemasukan: dayIncome,
        Pengeluaran: dayExpense
      });
    }

    return { data, startDateStr, endDateStr };
  };

  const parseAmount = (amountStr) => {
    const cleaned = amountStr.toLowerCase().replace(/\\s/g, '');
    
    if (cleaned.includes('k')) {
      return parseFloat(cleaned.replace('k', '')) * 1000;
    }
    if (cleaned.includes('jt') || cleaned.includes('juta')) {
      return parseFloat(cleaned.replace(/jt|juta/g, '')) * 1000000;
    }
    return parseFloat(cleaned);
  };

  const detectCategory = (description) => {
    const lowerDesc = description.toLowerCase();
    
    for (const target of targets) {
      for (const keyword of target.keywords) {
        if (lowerDesc.includes(keyword)) {
          return target.name;
        }
      }
    }
    
    const keywords = {
      'Makanan': ['makan', 'sarapan', 'lunch', 'dinner', 'nasi', 'ayam', 'snack', 'cemilan', 'kopi', 'minum', 'food', 'resto', 'warteg', 'mie', 'bakso'],
      'Transport': ['bensin', 'grab', 'gojek', 'ojol', 'parkir', 'tol', 'transport', 'angkot', 'bus', 'kereta', 'travel'],
      'Belanja': ['belanja', 'indomaret', 'alfamart', 'supermarket', 'grocery', 'shopee', 'tokopedia', 'lazada', 'beli'],
      'Hiburan': ['nonton', 'bioskop', 'game', 'streaming', 'spotify', 'netflix', 'jalan', 'wisata', 'karaoke', 'fm', 'mall'],
      'Tagihan': ['listrik', 'air', 'pdam', 'internet', 'wifi', 'pulsa', 'token', 'tagihan', 'bayar'],
      'Kesehatan': ['obat', 'dokter', 'rumah sakit', 'klinik', 'vitamin', 'apotek', 'medical']
    };
    
    for (const [cat, words] of Object.entries(keywords)) {
      if (words.some(word => lowerDesc.includes(word))) {
        return cat;
      }
    }
    
    return 'Lainnya';
  };

  const handleBulkInput = () => {
    if (!bulkInput.trim()) return;

    const lines = bulkInput.split('\\n').filter(line => line.trim());
    const newTransactions = [];
    const currentDate = new Date().toLocaleDateString('id-ID');

    lines.forEach(line => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        const desc = parts[0];
        const amountStr = parts[1];
        const amount = parseAmount(amountStr);
        const category = detectCategory(desc);

        if (desc && !isNaN(amount) && amount > 0) {
          newTransactions.push({
            id: Date.now() + Math.random(),
            description: desc,
            amount: amount,
            category: category,
            type: 'pengeluaran',
            date: currentDate
          });
        }
      }
    });

    if (newTransactions.length > 0) {
      setTransactions([...newTransactions, ...transactions]);
      setBulkInput('');
      triggerAnimation();
    }
  };

  const handleAddTransaction = () => {
    if (!description || !amount) return;

    const newTransaction = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      category,
      type,
      date: new Date().toLocaleDateString('id-ID')
    };

    setTransactions([newTransaction, ...transactions]);
    setDescription('');
    setAmount('');
    triggerAnimation();
  };

  const triggerAnimation = () => {
    setShowAnimation(true);
    setTimeout(() => setShowAnimation(false), 1000);
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleAddTarget = () => {
    if (!newTargetName || !newTargetAmount) return;
    
    const keywords = newTargetName.toLowerCase().split(' ');
    const newTarget = {
      id: Date.now(),
      name: newTargetName,
      target: parseFloat(newTargetAmount),
      spent: 0,
      keywords: keywords
    };
    
    setTargets([...targets, newTarget]);
    
    if (!categories.pengeluaran.includes(newTargetName)) {
      categories.pengeluaran.push(newTargetName);
    }
    
    setNewTargetName('');
    setNewTargetAmount('');
  };

  const handleEditTarget = (target) => {
    setEditingTarget(target.id);
  };

  const handleUpdateTarget = (id, newAmount) => {
    setTargets(targets.map(t => 
      t.id === id ? { ...t, target: parseFloat(newAmount) } : t
    ));
    setEditingTarget(null);
  };

  const handleDeleteTarget = (id) => {
    setTargets(targets.filter(t => t.id !== id));
  };

  const clearFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setSearchQuery('');
    setFilterCategory('all');
  };

  const exportToExcel = () => {
    let csv = 'Tanggal,Deskripsi,Kategori,Tipe,Jumlah\\n';
    
    transactions.forEach(t => {
      csv += `${t.date},${t.description},${t.category},${t.type},${t.amount}\\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `budget_tracker_${new Date().toLocaleDateString('id-ID')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const { data: weeklyData, startDateStr, endDateStr } = getWeeklyData();
  const pieData = getPieChartData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
          💰 Budget Tracker Harian
        </h1>

        {alerts.length > 0 && (
          <div className="mb-4 space-y-2">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`p-3 sm:p-4 rounded-lg flex items-center gap-2 sm:gap-3 ${
                  alert.type === 'danger' 
                    ? 'bg-red-100 border-l-4 border-red-500 text-red-800' 
                    : 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800'
                }`}
              >
                <AlertTriangle size={20} className="flex-shrink-0" />
                <p className="text-sm sm:text-base font-medium">{alert.message}</p>
              </div>
            ))}
          </div>
        )}

        {showAnimation && (
          <div className="fixed top-20 right-4 sm:right-8 z-50 animate-bounce">
            <div className="bg-green-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg flex items-center gap-2">
              <CheckCircle size={20} />
              <span className="font-semibold text-sm sm:text-base">Berhasil ditambahkan!</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Pemasukan</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              </div>
              <TrendingUp className="text-green-600" size={28} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Pengeluaran</p>
                <p className="text-lg sm:text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
              </div>
              <TrendingDown className="text-red-600" size={28} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Saldo</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
              <Zap size={24} />
              <span className="hidden sm:inline">Input Cepat - Langsung Banyak!</span>
              <span className="sm:hidden">Input Cepat</span>
            </h2>
            <button
              onClick={() => setShowBulkInput(!showBulkInput)}
              className="bg-white text-purple-600 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-50 transition"
            >
              {showBulkInput ? 'Sembunyikan' : 'Tampilkan'}
            </button>
          </div>
          
          {showBulkInput && (
            <>
              <div className="bg-white bg-opacity-20 rounded-lg p-3 sm:p-4 mb-4">
                <p className="text-xs sm:text-sm mb-2">📝 <strong>Format:</strong> Deskripsi, Jumlah (bisa pakai k untuk ribu)</p>
                <p className="text-xs opacity-90">Contoh: makan siang, 15k</p>
              </div>
              
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="makan siang, 15k\\ngrab ke kantor, 25k\\nortu, 1000k"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-gray-800 h-24 sm:h-32 resize-none focus:ring-2 focus:ring-purple-300 focus:outline-none text-sm sm:text-base"
              />
              
              <button
                onClick={handleBulkInput}
                className="w-full bg-white text-purple-600 font-bold py-2 sm:py-3 rounded-lg mt-3 hover:bg-purple-50 transition flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Zap size={20} />
                Tambahkan Semua Sekaligus!
              </button>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                📊 Grafik Mingguan
              </h2>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setChartWeekOffset(chartWeekOffset + 1)}
                  className="flex-1 sm:flex-none px-2 sm:px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs sm:text-sm"
                >
                  ← Lalu
                </button>
                <button
                  onClick={() => setChartWeekOffset(Math.max(0, chartWeekOffset - 1))}
                  disabled={chartWeekOffset === 0}
                  className={`flex-1 sm:flex-none px-2 sm:px-3 py-1 rounded-lg transition text-xs sm:text-sm ${
                    chartWeekOffset === 0 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  Depan →
                </button>
              </div>
            </div>
            
            <div className="mb-4 text-center">
              <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm">
                <Calendar size={16} />
                <span className="font-semibold">{startDateStr} - {endDateStr}</span>
              </span>
            </div>
            
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" style={{ fontSize: '10px' }} />
                <YAxis style={{ fontSize: '10px' }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Pemasukan" fill="#10b981" />
                <Bar dataKey="Pengeluaran" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">🥧 Breakdown Pengeluaran</h2>
            {pieData.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">Belum ada data pengeluaran</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2 text-xs sm:text-sm">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="truncate">{entry.name}: {formatCurrency(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
            <Target size={24} />
            Target Pengeluaran Tetap
          </h2>
          
          <div className="space-y-4 mb-4">
            {targets.map(target => {
              const remaining = target.target - target.spent;
              const percentage = (target.spent / target.target) * 100;
              const isOverBudget = target.spent > target.target;

              return (
                <div key={target.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base sm:text-lg">{target.name}</h3>
                      <button
                        onClick={() => handleEditTarget(target)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteTarget(target.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    {editingTarget === target.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue={target.target}
                          className="w-24 sm:w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                          id={`edit-${target.id}`}
                        />
                        <button
                          onClick={() => {
                            const newValue = document.getElementById(`edit-${target.id}`).value;
                            handleUpdateTarget(target.id, newValue);
                          }}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check size={18} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                        Target: {formatCurrency(target.target)}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm gap-1">
                      <span>Dikeluarkan: <span className="font-semibold text-red-600">{formatCurrency(target.spent)}</span></span>
                      <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                        {isOverBudget ? 'Lebih' : 'Sisa'}: {formatCurrency(Math.abs(remaining))}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      {percentage.toFixed(1)}% dari target
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3 text-sm sm:text-base">Tambah Target Baru</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newTargetName}
                onChange={(e) => setNewTargetName(e.target.value)}
                placeholder="Nama target"
                className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
              <input
                type="number"
                value={newTargetAmount}
                onChange={(e) => setNewTargetAmount(e.target.value)}
                placeholder="Jumlah target"
                className="w-full sm:w-40 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
              <button
                onClick={handleAddTarget}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Input Manual (Opsional)</h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Tipe Transaksi
                </label>
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setCategory(categories[e.target.value][0]);
                  }}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="pengeluaran">Pengeluaran</option>
                  <option value="pemasukan">Pemasukan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                >
                  {categories[type].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Makan siang di warteg"
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Jumlah (Rp)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50000"
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <button
                onClick={handleAddTransaction}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition text-sm sm:text-base"
              >
                <Plus size={20} />
                Tambah Transaksi
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                Riwayat Transaksi
                <Filter size={18} className="text-gray-500" />
              </h2>
              <button
                onClick={exportToExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition text-xs sm:text-sm"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
            
            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari transaksi..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Dari Tanggal</label>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Sampai Tanggal</label>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">Kategori</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Semua Kategori</option>
                  {[...categories.pengeluaran, ...categories.pemasukan].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {(filterStartDate || filterEndDate || searchQuery || filterCategory !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="w-full text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Reset Semua Filter
                </button>
              )}
            </div>

            {filteredTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">
                {filterStartDate || filterEndDate || searchQuery || filterCategory !== 'all' 
                  ? 'Tidak ada transaksi yang sesuai dengan filter' 
                  : 'Belum ada transaksi'}
              </p>
            ) : (
              <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
                {filteredTransactions.map(transaction => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 text-xs rounded ${
                          transaction.type === 'pemasukan' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {transaction.category}
                        </span>
                        <span className="text-xs text-gray-500">{transaction.date}</span>
                      </div>
                      <p className="font-medium mt-1 text-xs sm:text-sm truncate">{transaction.description}</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <p className={`text-sm sm:text-base font-semibold whitespace-nowrap ${
                        transaction.type === 'pemasukan' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'pemasukan' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </p>
                      <button
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="text-red-500 hover:text-red-700 transition flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
