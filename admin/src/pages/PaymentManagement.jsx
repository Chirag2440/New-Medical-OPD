// admin/src/pages/PaymentManagement.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  FaSearch, 
  FaMoneyBillWave, 
  FaDownload, 
  FaFilter,
  FaCreditCard,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaUndo
} from 'react-icons/fa';
import api from '../services/api';
import DataTable from '../components/DataTable';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [stats, setStats] = useState({
    totalRevenue: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    refundedPayments: 0
  });

  const calculateStats = useCallback(() => {
    const totalRevenue = payments
      .filter((p) => p.status === 'success')
      .reduce((sum, p) => sum + p.amount, 0);

    const successfulPayments = payments.filter((p) => p.status === 'success').length;
    const pendingPayments = payments.filter((p) => p.status === 'pending').length;
    const failedPayments = payments.filter((p) => p.status === 'failed').length;
    const refundedPayments = payments.filter((p) => p.status === 'refunded').length;

    setStats({
      totalRevenue,
      successfulPayments,
      pendingPayments,
      failedPayments,
      refundedPayments
    });
  }, [payments]);

  const filterPayments = useCallback(() => {
    let filtered = [...payments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.razorpayPaymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.razorpayOrderId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((payment) => payment.status === filterStatus);
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((payment) => {
        const paymentDate = new Date(payment.createdAt);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return paymentDate >= startDate && paymentDate <= endDate;
      });
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, filterStatus, dateRange]);

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [filterPayments]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/payments/history');
      setPayments(response.data.payments);
    } catch (error) {
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      success: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800'
    };

    const icons = {
      success: <FaCheckCircle className="inline mr-1" />,
      pending: <FaHourglassHalf className="inline mr-1" />,
      failed: <FaTimesCircle className="inline mr-1" />,
      refunded: <FaUndo className="inline mr-1" />
    };

    return (
      <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const exportToCSV = () => {
    if (filteredPayments.length === 0) {
      toast.error('No payments to export');
      return;
    }

    const csvData = filteredPayments.map(payment => ({
      'Payment ID': payment.razorpayPaymentId || payment.razorpayOrderId,
      'Patient Name': payment.patient?.name || 'N/A',
      'Patient Email': payment.patient?.email || 'N/A',
      'Amount': payment.amount,
      'Status': payment.status,
      'Date': new Date(payment.createdAt).toLocaleDateString(),
      'Time': new Date(payment.createdAt).toLocaleTimeString()
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Export completed successfully');
  };

  const columns = [
    {
      key: 'paymentId',
      label: 'Payment ID',
      sortable: true,
      render: (row) => (
        <div className="font-mono text-xs">
          {row.razorpayPaymentId || row.razorpayOrderId}
        </div>
      )
    },
    {
      key: 'patient',
      label: 'Patient',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.patient?.name || 'N/A'}</div>
          <div className="text-xs text-gray-500">{row.patient?.email || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (row) => (
        <div className="font-bold text-gray-900">₹{row.amount.toLocaleString()}</div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => getStatusBadge(row.status)
    },
    {
      key: 'date',
      label: 'Date & Time',
      sortable: true,
      render: (row) => (
        <div>
          <div className="text-sm text-gray-900">
            {new Date(row.createdAt).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(row.createdAt).toLocaleTimeString()}
          </div>
        </div>
      )
    },
    {
      key: 'method',
      label: 'Method',
      render: (row) => (
        <div className="flex items-center text-sm text-gray-700">
          <FaCreditCard className="mr-2 text-blue-500" />
          {row.paymentMethod || 'Card'}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Payment Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all payment transactions</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={filteredPayments.length === 0}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaDownload />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Revenue</p>
              <h3 className="text-3xl font-bold mt-2">₹{stats.totalRevenue.toLocaleString()}</h3>
            </div>
            <FaMoneyBillWave className="text-5xl text-green-200 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Success</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.successfulPayments}</h3>
            </div>
            <FaCheckCircle className="text-3xl text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.pendingPayments}</h3>
            </div>
            <FaHourglassHalf className="text-3xl text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Failed</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.failedPayments}</h3>
            </div>
            <FaTimesCircle className="text-3xl text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Refunded</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.refundedPayments}</h3>
            </div>
            <FaUndo className="text-3xl text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FaFilter className="text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or payment ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Date Range - Start */}
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Start Date"
          />

          {/* Date Range - End */}
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="End Date"
          />
        </div>

        {/* Active Filters Count */}
        {(searchTerm || filterStatus !== 'all' || dateRange.start || dateRange.end) && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredPayments.length} of {payments.length} payments
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setDateRange({ start: '', end: '' });
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredPayments}
        loading={loading}
        showPagination={true}
      />
    </div>
  );
};

export default PaymentManagement;