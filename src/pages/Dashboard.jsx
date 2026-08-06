import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ThemePicker from '../theme/ThemePicker';
import Logo from '../components/Logo';

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
    <div className="cm-shell">
      {/* Top Header */}
      <div className="cm-topbar">
        <div className="cm-topbar-title">
          <Logo />
          <span>ChequeMate</span>
        </div>
        <div className="cm-topbar-user">
          <span>
            Welcome, <strong>{user?.name || 'User'}</strong>{' '}
            {user?.userCode ? `(${user.userCode})` : activeUserId ? `(A${String(activeUserId).padStart(5, '0')})` : ''}
          </span>
          <ThemePicker />
          <button
            onClick={logout}
            className="cm-btn"
            style={{ background: 'rgba(217, 83, 79, 0.16)', border: '1.5px solid rgba(217, 83, 79, 0.5)', color: '#ffb4b0' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="cm-toprow">
        <h3>Your groups</h3>
        <button onClick={() => setShowCreateModal(true)} className="cm-btn cm-btn--primary">
          + Create new group
        </button>
      </div>

      {safeGroups.length === 0 ? (
        <div className="cm-empty-state">You are not part of any groups yet. Create one to get started!</div>
      ) : (
        <div className="cm-group-grid cm-stagger">
          {safeGroups.map((group, index) => (
            <div
              key={group.id || `group-${index}`}
              className="cm-group-card"
              onClick={() => navigate(`/groups/${group.id}`)}
            >
              <div className="cm-group-card-head">
                <h4>{group.name}</h4>
                <div className="cm-group-actions">
                  <button onClick={(e) => handleOpenEditModal(e, group)} className="cm-icon-btn cm-icon-btn--edit">
                    Edit
                  </button>
                  <button onClick={(e) => handleDeleteGroup(e, group)} className="cm-icon-btn cm-icon-btn--delete">
                    Delete
                  </button>
                </div>
              </div>

              <div className="cm-badge-row">
                <span className="cm-badge cm-badge--gold">
                  👥 {group.mode === 'ADMIN_ONLY' ? 'Admin Ledger' : 'Shared'}
                </span>
                <span className="cm-badge cm-badge--neutral">
                  {group.members ? (Array.isArray(group.members) ? group.members.length : 1) : 1}{' '}
                  {group.members?.length === 1 ? 'member' : 'members'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="cm-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="cm-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 18 }}>Create new group</h3>
            <form onSubmit={handleCreateGroup} className="cm-auth-form">
              <div className="cm-field">
                <label className="cm-label">Group name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Goa Trip, Flat 302"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="cm-input"
                />
              </div>

              <div className="cm-field">
                <label className="cm-label">Group mode</label>
                <select value={groupMode} onChange={(e) => setGroupMode(e.target.value)} className="cm-select">
                  <option value="MULTI_USER">Shared / Multi-User Mode</option>
                  <option value="ADMIN_ONLY">Single-User / Admin Ledger Mode</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="cm-btn cm-btn--ghost">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="cm-btn cm-btn--primary">
                  {loading ? 'Creating…' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingGroup && (
        <div className="cm-modal-overlay" onClick={() => setEditingGroup(null)}>
          <div className="cm-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 18 }}>Edit group</h3>
            <form onSubmit={handleUpdateGroup} className="cm-auth-form">
              <div className="cm-field">
                <label className="cm-label">Group name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="cm-input"
                />
              </div>

              <div className="cm-field">
                <label className="cm-label">Group mode</label>
                <select value={editMode} onChange={(e) => setEditMode(e.target.value)} className="cm-select">
                  <option value="MULTI_USER">Shared / Multi-User Mode</option>
                  <option value="ADMIN_ONLY">Single-User / Admin Ledger Mode</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                <button type="button" onClick={() => setEditingGroup(null)} className="cm-btn cm-btn--ghost">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="cm-btn cm-btn--primary">
                  {loading ? 'Updating…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
