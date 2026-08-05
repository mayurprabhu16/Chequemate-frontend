import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const GroupDetails = () => {
  const params = useParams();
  // Safe fallback to handle route paths "/groups/:id" or "/groups/:groupId"
  const groupId = params.groupId || params.id;

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const pendingDeletes = useRef({});

  useEffect(() => {
    // If we navigate away mid-undo-window, let the deletion go through
    // rather than leaving it stuck in limbo.
    return () => {
      Object.values(pendingDeletes.current).forEach((entry) => clearTimeout(entry.timeoutId));
    };
  }, []);

  // Core Entity States
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [members, setMembers] = useState([]);

  // Accordion UI State
  const [showMembersDropdown, setShowMembersDropdown] = useState(false);

  // Form States
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState('EQUAL'); // EQUAL, EXACT, PERCENTAGE
  const [memberSplits, setMemberSplits] = useState({}); // { userId: amountOrPercent }
  const [emailOrCode, setEmailOrCode] = useState('');

  // Loading States
  const [loadingExpense, setLoadingExpense] = useState(false);
  const [loadingMember, setLoadingMember] = useState(false);

  useEffect(() => {
    // Guard against executing API calls when groupId is undefined or invalid
    if (groupId && groupId !== 'undefined') {
      fetchGroupDetails();
      fetchExpenses();
      fetchBalances();
    }
  }, [groupId]);

  // Initialize custom splits map when group members load or change
  const initMemberSplits = (memberList) => {
    const initialMap = {};
    (memberList || []).forEach((m) => {
      initialMap[m.id] = '';
    });
    setMemberSplits(initialMap);
  };

  // Fetch Group Details & Members List
  const fetchGroupDetails = async () => {
    if (!groupId || groupId === 'undefined') return;
    try {
      const res = await api.get(`/groups/${groupId}`);
      setGroup(res.data);

      const groupMembers = res.data.members || [];
      setMembers(groupMembers);
      initMemberSplits(groupMembers);
    } catch (err) {
      console.error('Failed to fetch group details:', err);
    }
  };

  // Fetch Group Expenses
  const fetchExpenses = async () => {
    if (!groupId || groupId === 'undefined') return;
    try {
      const res = await api.get(`/groups/${groupId}/expenses`);
      if (Array.isArray(res.data)) {
        setExpenses(res.data);
      } else {
        setExpenses([]);
      }
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
      setExpenses([]);
    }
  };

  // Fetch Simplified Balances (Who Owes Whom)
  const fetchBalances = async () => {
    if (!groupId || groupId === 'undefined') return;
    try {
      const res = await api.get(`/groups/${groupId}/balances`);
      if (Array.isArray(res.data)) {
        setBalances(res.data);
      } else {
        setBalances([]);
      }
    } catch (err) {
      console.error('Failed to fetch balances:', err);
      setBalances([]);
    }
  };

  const handleMemberSplitChange = (userId, value) => {
    setMemberSplits((prev) => ({
      ...prev,
      [userId]: value
    }));
  };

  // Submit New Expense
  const handleAddExpense = async (e) => {
    e.preventDefault();

    if (!groupId || groupId === 'undefined') {
      showToast('Group ID is invalid or missing.', 'error');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      showToast('Please enter a valid total amount', 'error');
      return;
    }

    // Validation for EXACT and PERCENTAGE splits
    if (splitType === 'EXACT') {
      const totalSplit = Object.values(memberSplits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
      if (Math.abs(totalSplit - parsedAmount) > 0.01) {
        showToast(`The sum of exact amounts (₹${totalSplit.toFixed(2)}) must equal the total amount (₹${parsedAmount.toFixed(2)})`, 'error');
        return;
      }
    } else if (splitType === 'PERCENTAGE') {
      const totalPct = Object.values(memberSplits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
      if (Math.abs(totalPct - 100) > 0.01) {
        showToast(`The sum of percentages (${totalPct}%) must equal 100%`, 'error');
        return;
      }
    }

    const activeUserId = user?.userId || user?.id;

    setLoadingExpense(true);
    try {
      const payload = {
        description,
        totalAmount: parsedAmount,
        amount: parsedAmount,
        splitType,
        paidByUserId: activeUserId,
        memberSplits: splitType !== 'EQUAL' ? memberSplits : null
      };

      await api.post(`/groups/${groupId}/expenses`, payload);

      setDescription('');
      setAmount('');
      setSplitType('EQUAL');
      initMemberSplits(members);

      fetchExpenses();
      fetchBalances();
      showToast('Expense added successfully!');
    } catch (err) {
      console.error('Failed to add expense:', err);
      showToast(err.response?.data?.message || 'Failed to add expense', 'error');
    } finally {
      setLoadingExpense(false);
    }
  };

  // Add Member by Email or User Code
  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!groupId || groupId === 'undefined') {
      showToast('Group ID is invalid or missing.', 'error');
      return;
    }

    const inputVal = emailOrCode.trim();
    if (!inputVal) return;

    setLoadingMember(true);
    try {
      await api.post(`/groups/${groupId}/members`, {
        userCode: inputVal,
        email: inputVal
      });

      setEmailOrCode('');
      showToast('Member added successfully!');

      fetchGroupDetails();
      fetchExpenses();
      fetchBalances();
    } catch (err) {
      console.error('Failed to add member:', err);
      showToast(err.response?.data?.message || 'Failed to add member', 'error');
    } finally {
      setLoadingMember(false);
    }
  };

  // Delete Expense — removed instantly, with a 3-second undo window
  // instead of a browser confirm() dialog.
  const handleDeleteExpense = (expense) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expense.id));

    const timeoutId = setTimeout(async () => {
      try {
        await api.delete(`/groups/${groupId}/expenses/${expense.id}`);
        fetchBalances();
      } catch (err) {
        console.error('Failed to delete expense:', err);
        showToast(err.response?.data?.message || 'Failed to delete expense', 'error');
        setExpenses((prev) => [...prev, expense]);
      } finally {
        delete pendingDeletes.current[expense.id];
      }
    }, 3000);

    pendingDeletes.current[expense.id] = { timeoutId, expense };

    showToast(`Deleted "${expense.description}"`, {
      type: 'undo',
      duration: 3000,
      actionLabel: 'Undo',
      onAction: () => {
        const pending = pendingDeletes.current[expense.id];
        if (pending) {
          clearTimeout(pending.timeoutId);
          delete pendingDeletes.current[expense.id];
        }
        setExpenses((prev) => [...prev, expense]);
      },
    });
  };

  const activeUserId = user?.userId || user?.id;

  return (
    <div className="cm-shell">
      {/* Top Bar Navigation */}
      <div className="cm-topbar">
        <button onClick={() => navigate('/dashboard')} className="cm-back-link" style={{ color: 'var(--gold-soft)', cursor: 'pointer' }}>
          &larr; Back to dashboard
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {group && (
            <div className="cm-mode-pill">
              <span>Group mode:</span>
              <strong>
                {group.mode === 'ADMIN_ONLY' ? 'Admin only (ledger)' : 'Multi-user (shared)'}
              </strong>
            </div>
          )}
        </div>
      </div>

      <h1 className="cm-page-title">{group ? group.name : 'Group Details'}</h1>

      {/* Main Grid Layout */}
      <div className="cm-detail-grid">

        {/* Left Column */}
        <div className="cm-col">

          {/* Group Members Accordion Dropdown */}
          <div className="cm-card">
            <div
              className="cm-accordion-head"
              onClick={() => setShowMembersDropdown(!showMembersDropdown)}
              style={{ cursor: 'pointer' }}
            >
              <h3 className="cm-card-title" style={{ marginBottom: 0 }}>
                Group members ({members.length})
              </h3>
              <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                {showMembersDropdown ? '▲' : '▼'}
              </span>
            </div>

            {showMembersDropdown && (
              <div className="cm-accordion-body">
                {members.length === 0 ? (
                  <p className="cm-muted">No members found.</p>
                ) : (
                  <ul className="cm-member-list">
                    {members.map((m, idx) => (
                      <li key={m.id || `member-${idx}`} className="cm-member-item">
                        <div>
                          <strong>{m.name}</strong> {m.id === activeUserId && <span className="cm-you-badge">(You)</span>}
                          <div className="cm-member-email">{m.email} {m.userCode ? `(${m.userCode})` : ''}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Simplified Balances Card */}
          <div className="cm-card">
            <h3 className="cm-card-title">Simplified balances</h3>
            {balances.length === 0 ? (
              <p className="cm-muted">All settled up! No active debts in this group.</p>
            ) : (
              <ul className="cm-balance-list">
                {balances.map((b, idx) => (
                  <li key={idx} className="cm-balance-item">
                    <span>
                      <strong>{b.fromUserId === activeUserId ? 'You' : b.fromUserName}</strong> owes{' '}
                      <strong>{b.toUserId === activeUserId ? 'You' : b.toUserName}</strong>
                    </span>
                    <strong className="cm-figure cm-figure--owe">₹{parseFloat(b.amount || 0).toFixed(2)}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add Member Card */}
          <div className="cm-card">
            <h3 className="cm-card-title">Add member by Email or User Code</h3>
            <form onSubmit={handleAddMember} className="cm-inline-form">
              <input
                type="text"
                required
                placeholder="user@example.com or A00001"
                value={emailOrCode}
                onChange={(e) => setEmailOrCode(e.target.value)}
                className="cm-input"
              />
              <button type="submit" disabled={loadingMember} className="cm-btn cm-btn--primary">
                {loadingMember ? 'Adding…' : 'Add'}
              </button>
            </form>
          </div>

        </div>

        {/* Right Column */}
        <div className="cm-col">

          {/* Add Expense Card */}
          <div className="cm-card">
            <h3 className="cm-card-title">Add new expense</h3>
            <form onSubmit={handleAddExpense} className="cm-auth-form">

              <div className="cm-field">
                <label className="cm-label">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dinner, Hotel, Cab"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="cm-input"
                />
              </div>

              <div className="cm-field">
                <label className="cm-label">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="cm-input"
                />
              </div>

              <div className="cm-field">
                <label className="cm-label">Split type</label>
                <select
                  value={splitType}
                  onChange={(e) => setSplitType(e.target.value)}
                  className="cm-select"
                >
                  <option value="EQUAL">Split equally</option>
                  <option value="EXACT">Split by exact amounts</option>
                  <option value="PERCENTAGE">Split by percentages (%)</option>
                </select>
              </div>

              {/* Dynamic Inputs for non-equal splits */}
              {splitType !== 'EQUAL' && (
                <div className="cm-split-box">
                  <label className="cm-split-box-label">
                    {splitType === 'EXACT' ? 'Enter exact amount per member' : 'Enter percentage (%) per member'}
                  </label>
                  {members.map((m, idx) => (
                    <div key={m.id || `split-${idx}`} className="cm-split-row">
                      <span className="cm-split-name">{m.name}</span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder={splitType === 'EXACT' ? '₹0.00' : '0%'}
                        value={memberSplits[m.id] || ''}
                        onChange={(e) => handleMemberSplitChange(m.id, e.target.value)}
                        className="cm-split-input"
                      />
                    </div>
                  ))}
                </div>
              )}

              <button type="submit" disabled={loadingExpense} className="cm-btn cm-btn--primary cm-btn--full">
                {loadingExpense ? 'Adding…' : 'Submit expense'}
              </button>
            </form>
          </div>

          {/* Group Expenses Feed Card */}
          <div className="cm-card">
            <h3 className="cm-card-title">Group expenses feed</h3>
            {expenses.length === 0 ? (
              <p className="cm-muted">No expenses logged yet.</p>
            ) : (
              <div className="cm-expense-list">
                {expenses.map((expense, idx) => {
                  const paidById = expense.paidByUserId || expense.paidBy?.id;
                  const payerName = expense.paidByName || expense.paidBy?.name || 'Group member';

                  return (
                    <div key={expense.id || `exp-${idx}`} className="cm-expense-card">
                      <div className="cm-expense-main">
                        <div>
                          <h4 className="cm-expense-desc">{expense.description}</h4>
                          <span className="cm-expense-payer">
                            Paid by <strong>{paidById === activeUserId ? 'You' : payerName}</strong>
                          </span>
                        </div>
                        <div className="cm-figure cm-figure--settled">
                          ₹{parseFloat(expense.totalAmount || expense.amount || 0).toFixed(2)}
                        </div>
                      </div>

                      <div className="cm-expense-actions">
                        <button
                          onClick={() => handleDeleteExpense(expense)}
                          className="cm-btn--danger-text"
                          style={{ cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default GroupDetails;