import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ThemePicker from '../theme/ThemePicker';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupMode, setGroupMode] = useState('MULTI_USER');

  const [editingGroup, setEditingGroup] = useState(null);
  const [editName, setEditName] = useState('');
  const [editMode, setEditMode] = useState('MULTI_USER');

  const [loading, setLoading] = useState(false);

  const getActiveUserId = () => {
    if (user?.userId) return user.userId;
    if (user?.id) return user.id;
    if (user?._id) return user._id;

    try {
      const stored = localStorage.getItem('chequemate_user') || localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.userId || parsed.id || parsed._id;
      }
    } catch (e) {
      console.error('Failed to parse user from localStorage:', e);
    }
    return null;
  };

  const activeUserId = getActiveUserId();

  useEffect(() => {
    if (activeUserId) {
      fetchUserGroups();
    }
  }, [activeUserId]);

  const fetchUserGroups = async () => {
    const currentId = getActiveUserId();
    if (!currentId) return;
    try {
      const res = await api.get(`/groups/user/${currentId}`);
      if (Array.isArray(res.data)) {
        setGroups(res.data);
      } else {
        setGroups([]);
      }
    } catch (err) {
      console.error('Failed to fetch user groups:', err);
      setGroups([]);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const currentId = getActiveUserId();

    if (!currentId) {
      showToast('User session not found. Please log out and log in again.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/groups', {
        name: groupName,
        mode: groupMode,
        createdByUserId: currentId
      });

      setGroupName('');
      setGroupMode('MULTI_USER');
      setShowCreateModal(false);

      if (res.data && res.data.id) {
        setGroups((prev) => [...prev.filter((g) => g.id !== res.data.id), res.data]);
      }

      fetchUserGroups();
      showToast('Group created successfully!');
    } catch (err) {
      console.error('Failed to create group:', err);
      showToast(err.response?.data?.message || 'Failed to create group', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (e, group) => {
    e.stopPropagation();
    setEditingGroup(group);
    setEditName(group.name);
    setEditMode(group.mode || 'MULTI_USER');
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    if (!editingGroup) return;

    setLoading(true);
    try {
      await api.put(`/groups/${editingGroup.id}`, {
        name: editName,
        mode: editMode
      });

      setEditingGroup(null);
      fetchUserGroups();
      showToast('Group updated successfully!');
    } catch (err) {
      console.error('Failed to update group:', err);
      showToast(err.response?.data?.message || 'Failed to update group', 'error');
    } finally {
      setLoading(false);
    }
  };

  const pendingDeletes = useRef({});

  useEffect(() => {
    // If the component unmounts with an undo window still open, let the
    // deletion go through rather than leaving it in limbo.
    return () => {
      Object.values(pendingDeletes.current).forEach((entry) => clearTimeout(entry.timeoutId));
    };
  }, []);

  const handleDeleteGroup = (e, group) => {
    e.stopPropagation();

    // Optimistically remove it right away…
    setGroups((prev) => prev.filter((g) => g.id !== group.id));

    const timeoutId = setTimeout(async () => {
      try {
        await api.delete(`/groups/${group.id}`);
      } catch (err) {
        console.error('Failed to delete group:', err);
        showToast(err.response?.data?.message || 'Failed to delete group.', 'error');
        setGroups((prev) => [...prev, group]);
      } finally {
        delete pendingDeletes.current[group.id];
      }
    }, 3000);

    pendingDeletes.current[group.id] = { timeoutId, group };

    // …but give a 3-second window to undo before it's actually deleted.
    showToast(`Deleted "${group.name}"`, {
      type: 'undo',
      duration: 3000,
      actionLabel: 'Undo',
      onAction: () => {
        const pending = pendingDeletes.current[group.id];
        if (pending) {
          clearTimeout(pending.timeoutId);
          delete pendingDeletes.current[group.id];
        }
        setGroups((prev) => [...prev, group]);
      },
    });
  };

  const safeGroups = Array.isArray(groups) ? groups : [];

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <div style={styles.header}>
        <h2 style={styles.logoTitle}>ChequeMate</h2>
        <div style={styles.userInfo}>
          <span style={styles.welcomeText}>
            Welcome, <strong>{user?.name || 'User'}</strong> {user?.userCode ? `(${user.userCode})` : activeUserId ? `(A${String(activeUserId).padStart(5, '0')})` : ''}
          </span>
          <ThemePicker />
          <button onClick={logout} style={styles.logoutBtn}>LOGOUT</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        <div style={styles.topRow}>
          <h3 style={styles.sectionTitle}>Your groups</h3>
          <button onClick={() => setShowCreateModal(true)} style={styles.primaryBtn}>
            + CREATE NEW GROUP
          </button>
        </div>

        {safeGroups.length === 0 ? (
          <p style={styles.muted}>You are not part of any groups yet. Create one to get started!</p>
        ) : (
          <div style={styles.groupGrid}>
            {safeGroups.map((group, index) => {
              return (
                <div
                  key={group.id || `group-${index}`}
                  style={styles.groupCard}
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <div style={styles.groupHeader}>
                    <h4 style={styles.groupTitle}>{group.name}</h4>
                    <div style={styles.cardActions}>
                      <button
                        onClick={(e) => handleOpenEditModal(e, group)}
                        style={styles.editBtn}
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleDeleteGroup(e, group)}
                        style={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div style={styles.badgeRow}>
                    <span style={styles.badge}>
                      👥 {group.mode === 'ADMIN_ONLY' ? 'Admin Ledger' : 'Shared'}
                    </span>
                    <span style={styles.memberCountBadge}>
                      {group.members ? (Array.isArray(group.members) ? group.members.length : 1) : 1} {group.members?.length === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Create New Group</h3>
            <form onSubmit={handleCreateGroup} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Goa Trip, Flat 302"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Group Mode</label>
                <select
                  value={groupMode}
                  onChange={(e) => setGroupMode(e.target.value)}
                  style={styles.select}
                >
                  <option value="MULTI_USER" style={styles.selectOption}>Shared / Multi-User Mode</option>
                  <option value="ADMIN_ONLY" style={styles.selectOption}>Single-User / Admin Ledger Mode</option>
                </select>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.primaryBtn,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingGroup && (
        <div style={styles.modalOverlay} onClick={() => setEditingGroup(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Edit Group</h3>
            <form onSubmit={handleUpdateGroup} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Group Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Group Mode</label>
                <select
                  value={editMode}
                  onChange={(e) => setEditMode(e.target.value)}
                  style={styles.select}
                >
                  <option value="MULTI_USER" style={styles.selectOption}>Shared / Multi-User Mode</option>
                  <option value="ADMIN_ONLY" style={styles.selectOption}>Single-User / Admin Ledger Mode</option>
                </select>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setEditingGroup(null)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.primaryBtn,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '24px', fontFamily: 'sans-serif' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: '#2b1a14',
    borderRadius: '16px',
    color: '#ffffff',
    position: 'relative',
    zIndex: 100
  },
  logoTitle: { margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#ffffff' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '16px' },
  welcomeText: { color: '#ffffff', fontSize: '14px' },
  logoutBtn: { backgroundColor: '#d9534f', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
  content: { marginTop: '32px', position: 'relative', zIndex: 1 },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  sectionTitle: { margin: 0, fontSize: '20px', fontWeight: 'bold' },
  muted: { color: '#6b7280' },
  groupGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' },
  groupCard: { padding: '20px', border: '1px solid #e5e7eb', borderRadius: '16px', backgroundColor: '#ffffff', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  groupHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  groupTitle: { margin: 0, color: '#111827', fontSize: '18px', fontWeight: 'bold' },
  cardActions: { display: 'flex', gap: '8px' },
  editBtn: { backgroundColor: 'transparent', color: '#111827', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  deleteBtn: { backgroundColor: 'transparent', color: '#b91c1c', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  badgeRow: { display: 'flex', gap: '8px', alignItems: 'center' },
  badge: { fontSize: '12px', color: '#374151', backgroundColor: '#feefc3', padding: '6px 12px', borderRadius: '12px', fontWeight: '600' },
  memberCountBadge: { fontSize: '12px', color: '#065f46', backgroundColor: '#d1fae5', padding: '6px 12px', borderRadius: '12px', fontWeight: '600' },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999999,
    pointerEvents: 'auto'
  },
  modal: {
    backgroundColor: '#ffffff',
    color: '#111827',
    padding: '24px',
    borderRadius: '12px',
    width: '380px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1000000,
    position: 'relative'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  input: { padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px', backgroundColor: '#ffffff', color: '#111827' },
  select: { padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px', backgroundColor: '#ffffff', color: '#111827', cursor: 'pointer', width: '100%', appearance: 'auto' },
  selectOption: { backgroundColor: '#ffffff', color: '#111827', padding: '8px' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' },
  primaryBtn: { padding: '10px 18px', backgroundColor: '#2b1a14', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', position: 'relative', zIndex: 1000001 },
  cancelBtn: { padding: '10px 16px', backgroundColor: '#9ca3af', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', position: 'relative', zIndex: 1000001 }
};

export default Dashboard;