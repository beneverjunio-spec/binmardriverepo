import React, { useState } from 'react';
import { UserPlus, Trash2, Shield, X, Check, Lock, Eye, EyeOff } from 'lucide-react';
import { GCC_COUNTRIES } from '../../constants';

export default function AdminsTab({ admins, onAddAdmin, onRemoveAdmin, onToggleAdminStatus }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('Listing Moderator');
  const [department, setDepartment] = useState('Vehicle Moderation');
  const [country, setCountry] = useState('United Arab Emirates');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('Please provide both full name and email address.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Please set a password with at least 6 characters.');
      return;
    }

    const newAdmin = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      role,
      department,
      country,
      status: 'Active',
      created_at: new Date().toISOString().split('T')[0]
    };

    onAddAdmin(newAdmin);
    setName('');
    setEmail('');
    setPassword('');
    setShowAddModal(false);
  };

  const filteredAdmins = admins.filter(
    a =>
      !search ||
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>Staff & Admin Management</h2>
          <p>Authorize team members, assign moderation roles, and manage system access.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            className="search"
            placeholder="Search staff & admins..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            className="btn-gold"
            onClick={() => setShowAddModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <UserPlus size={16} />
            Add New Admin
          </button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Administrator</th>
            <th>Role & Department</th>
            <th>Region</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAdmins.length > 0 ? (
            filteredAdmins.map(admin => (
              <tr key={admin.id}>
                <td>
                  <div className="cell-main" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--deep)',
                        color: 'var(--gold-bright)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.8rem'
                      }}
                    >
                      {admin.name.charAt(0)}
                    </div>
                    <div>
                      <div>{admin.name}</div>
                      <div className="cell-sub">{admin.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div>
                    <span
                      className="badge"
                      style={{
                        background:
                          admin.role === 'Super Admin'
                            ? 'var(--gold-bright)'
                            : admin.role === 'Listing Moderator'
                            ? '#EAF3E2'
                            : '#E6F0FA',
                        color:
                          admin.role === 'Super Admin'
                            ? 'var(--ink)'
                            : admin.role === 'Listing Moderator'
                            ? '#386A46'
                            : '#1A5F9E',
                        fontWeight: 700
                      }}
                    >
                      {admin.role}
                    </span>
                    <div className="cell-sub" style={{ marginTop: '3px' }}>{admin.department}</div>
                  </div>
                </td>
                <td>{admin.country}</td>
                <td>
                  <span
                    className="badge"
                    style={{
                      background: admin.status === 'Active' ? '#EAF3E2' : '#FCE8E6',
                      color: admin.status === 'Active' ? '#386A46' : '#C53030'
                    }}
                  >
                    {admin.status}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      className="act-btn"
                      style={{ padding: '5px 10px' }}
                      title="Toggle Active/Suspended Status"
                      onClick={() => onToggleAdminStatus(admin.id)}
                    >
                      {admin.status === 'Active' ? 'Suspend' : 'Activate'}
                    </button>
                    {admin.role !== 'Super Admin' && (
                      <button
                        className="act-btn reject"
                        style={{ padding: '5px 10px' }}
                        title="Remove Admin"
                        onClick={() => onRemoveAdmin(admin.id)}
                      >
                        <Trash2 size={13} style={{ display: 'inline', marginRight: 3 }} />
                        Remove
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr className="empty-row">
              <td colSpan="5">No administrators found matching your search.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div
          className="modal-overlay"
          onClick={e => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div className="modal" style={{ maxWidth: '520px', padding: '2rem' }}>
            <button
              className="modal-close"
              onClick={() => setShowAddModal(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.2rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'var(--deep)',
                  color: 'var(--gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Shield size={22} />
              </div>
              <div>
                <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.4rem', margin: 0 }}>
                  Add Staff Administrator
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--ink-2)', margin: '2px 0 0' }}>
                  Assign administrative credentials and set a secure login password.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreate}>
              <label>Full Name</label>
              <input
                type="text"
                placeholder="e.g. Salim Al Zaabi"
                required
                value={name}
                onChange={e => setName(e.target.value)}
              />

              <label>Staff Email Address</label>
              <input
                type="email"
                placeholder="e.g. salim@binmardrive.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              <label>Login Password</label>
              <div style={{ position: 'relative', marginBottom: '1.1rem' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Set minimum 6 characters password"
                  required
                  minLength={6}
                  style={{ marginBottom: 0, paddingRight: '42px' }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--ink-2)'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="row-2">
                <div>
                  <label>Role</label>
                  <select
                    value={role}
                    onChange={e => {
                      setRole(e.target.value);
                      if (e.target.value === 'Listing Moderator') setDepartment('Vehicle Moderation');
                      else if (e.target.value === 'Dealer Auditor') setDepartment('Compliance');
                      else if (e.target.value === 'Super Admin') setDepartment('Executive Operations');
                      else setDepartment('Support Services');
                    }}
                  >
                    <option>Listing Moderator</option>
                    <option>Dealer Auditor</option>
                    <option>Super Admin</option>
                    <option>Support Specialist</option>
                  </select>
                </div>

                <div>
                  <label>Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                  />
                </div>
              </div>

              <label>Regional Assignment</label>
              <select value={country} onChange={e => setCountry(e.target.value)}>
                {GCC_COUNTRIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {error && <p className="err" role="alert">{error}</p>}

              <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  <Check size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  Create Admin Account
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
