import React, { useState, useEffect } from 'react';
import { Wallet, History, Plus, Minus, ArrowUpRight, ArrowDownRight, Activity, PieChart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AssetCharts from './AssetCharts';
import {
  getPortfolioSummary,
  getAssetBreakdownData,
  getPortfolioPerformanceData,
  getSettlement,
  getTransactions,
  addTransaction
} from '../services/api';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assetBreakdown, setAssetBreakdown] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [transactionType, setTransactionType] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [settlementBalance, setSettlementBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, breakdownRes, performanceRes, settlementRes, transactionsRes] = await Promise.all([
        getPortfolioSummary(),
        getAssetBreakdownData(),
        getPortfolioPerformanceData(),
        getSettlement(),
        getTransactions()
      ]);
      setSummary(summaryRes);
      setAssetBreakdown(breakdownRes);
      setPerformanceData(performanceRes);
      setSettlementBalance(settlementRes.balance);
      setTransactions(transactionsRes);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    if (transactionType === 'withdrawal' && amt > settlementBalance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      const transactionData = {
        type: transactionType,
        amount: amt,
        description: description || (transactionType === 'deposit' ? 'Cash deposit' : 'Cash withdrawal')
      };

      const newTransaction = await addTransaction(transactionData);
      
      // Update local state
      setTransactions([newTransaction, ...transactions]);
      setSettlementBalance(newTransaction.balance);
      setAmount('');
      setDescription('');
      setShowSettlementModal(false);
      
      toast.success(`${transactionType === 'deposit' ? 'Deposit' : 'Withdrawal'} successful`);
    } catch (error) {
      console.error('Transaction error:', error);
      toast.error('Transaction failed. Please try again.');
    }
  };

  const totalValue = summary?.total_value || 0;
  const totalGainLoss = summary?.total_gain_loss || 0;
  const isPositive = totalGainLoss >= 0;
  const percentageChange = totalValue > 0 ? ((totalGainLoss / (totalValue - totalGainLoss)) * 100) : 0;

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>Loading Dashboard...</div>;
  }

  return (
    <div style={{ padding: '2rem', color: 'white', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <h1 style={{
        fontSize: '3rem',
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: '3rem',
        background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        Portfolio Dashboard
      </h1>

      {/* Charts */}
      <AssetCharts pieData={assetBreakdown} lineData={performanceData} />

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
        {/* Portfolio Value */}
        <div style={{
          flex: 1,
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          color: '#000',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '12px', borderRadius: '12px'
            }}>
              <PieChart size={24} color="white" />
            </div>
            <div style={{ color: isPositive ? '#10b981' : '#ef4444', fontWeight: '600' }}>
              {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />} {percentageChange.toFixed(2)}%
            </div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'monospace' }}>
            ${totalValue.toLocaleString()}
          </div>
          <div style={{ color: '#6b7280' }}>Total Portfolio Value</div>
          <div style={{ marginTop: '1rem', color: isPositive ? '#10b981' : '#ef4444', fontWeight: '600' }}>
            {isPositive ? '+' : '-'}${Math.abs(totalGainLoss).toLocaleString()} P&L
          </div>
        </div>

        {/* Asset Breakdown */}
        <div style={{
          flex: 1,
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          color: '#000',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} />
            Asset Breakdown
          </h3>
          <div style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
            {summary?.by_type?.map(type => (
              <div key={type.type} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1rem', background: '#f9fafb', marginBottom: '0.5rem', borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    background: type.type === 'stock' ? '#3b82f6'
                      : type.type === 'bond' ? '#10b981'
                      : type.type === 'crypto' ? '#f59e0b'
                      : '#8b5cf6',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    color: 'white'
                  }}>
                    {type.type === 'stock' ? '📈' : type.type === 'bond' ? '🏛️' : type.type === 'crypto' ? '₿' : '💰'}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600' }}>{type.count} {type.type?.toUpperCase()}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Holdings</div>
                  </div>
                </div>
                <div style={{
                  color: type.gain_loss >= 0 ? '#10b981' : '#ef4444',
                  fontWeight: '600',
                  fontFamily: 'monospace'
                }}>
                  ${type.current_value?.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settlement & Transactions */}
      <div style={{ display: 'flex', marginTop: '2rem', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Settlement Account */}
        <div style={{
          flex: 1,
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          color: '#000'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3><Wallet size={20} /> Settlement Account</h3>
            <button
              onClick={() => setShowSettlementModal(true)}
              style={{ background: '#3b82f6', color: '#fff', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }}
            >
              Manage
            </button>
          </div>
          <h2 style={{ fontSize: '2rem', marginTop: '1rem', fontFamily: 'monospace' }}>
            ${settlementBalance.toLocaleString()}
          </h2>
          <p>Available balance</p>
        </div>

        {/* Full Transactions List */}
        <div style={{
          flex: 1,
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          color: '#000'
        }}>
          <h3><History size={20} /> Transaction History</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '1rem' }}>
            {transactions.map(tx => (
              <div key={tx.id} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '0.75rem', background: '#f9fafb', marginBottom: '0.5rem',
                borderRadius: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    background: tx.type === 'deposit' ? '#10b981' : '#ef4444',
                    padding: '0.5rem', borderRadius: '50%'
                  }}>
                    {tx.type === 'deposit' ? <Plus size={16} color="#fff" /> : <Minus size={16} color="#fff" />}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600' }}>{tx.description}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{tx.date}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    color: tx.type === 'deposit' ? '#10b981' : '#ef4444',
                    fontWeight: '600',
                    fontFamily: 'monospace'
                  }}>
                    {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    Bal: ${tx.balance.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settlement Modal */}
      {showSettlementModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%',
            color: '#000',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
          }}>
            <h2 style={{ textAlign: 'center' }}>Settlement Account</h2>
            <p style={{ textAlign: 'center' }}>Current Balance: ${settlementBalance.toLocaleString()}</p>

            <div>
              <label>Transaction Type:</label>
              <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)} style={{ width: '100%' }}>
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
              </select>
            </div>

            <div>
              <label>Amount:</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <label>Description:</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button onClick={() => setShowSettlementModal(false)} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
              <button onClick={handleTransaction} style={{ background: '#3b82f6', color: 'white', padding: '0.5rem 1rem' }}>
                {transactionType === 'deposit' ? 'Deposit' : 'Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
