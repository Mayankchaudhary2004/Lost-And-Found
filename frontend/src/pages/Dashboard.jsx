import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addItem, getAllItems, updateItem, deleteItem, searchItems } from '../api/api';
import './Dashboard.css';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Accessories', 'Documents', 'Keys', 'Wallet', 'Other'];

const EMPTY_FORM = {
  itemName: '', description: '', type: 'Lost',
  category: 'Other', location: '', date: '', contactInfo: '',
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'add'
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (searchName || filterType || filterCategory) {
        res = await searchItems({ name: searchName, type: filterType, category: filterCategory });
      } else {
        res = await getAllItems();
      }
      setItems(res.data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [searchName, filterType, filterCategory]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { itemName, description, type, location, contactInfo } = formData;
    if (!itemName || !description || !type || !location || !contactInfo) {
      return setFormError('Please fill in all required fields.');
    }
    setFormLoading(true);
    setFormError('');
    setFormSuccess('');
    try {
      if (editingId) {
        await updateItem(editingId, formData);
        setFormSuccess('✅ Item updated successfully!');
      } else {
        await addItem(formData);
        setFormSuccess('✅ Item reported successfully!');
      }
      setFormData(EMPTY_FORM);
      setEditingId(null);
      setTimeout(() => setFormSuccess(''), 3000);
      fetchItems();
      setActiveTab('all');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      itemName: item.itemName,
      description: item.description,
      type: item.type,
      category: item.category,
      location: item.location,
      date: item.date ? item.date.slice(0, 10) : '',
      contactInfo: item.contactInfo,
    });
    setFormError('');
    setFormSuccess('');
    setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setFormSuccess('');
    setActiveTab('all');
  };

  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      setDeleteConfirmId(null);
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  const stats = {
    total: items.length,
    lost: items.filter(i => i.type === 'Lost').length,
    found: items.filter(i => i.type === 'Found').length,
    mine: items.filter(i => i.reportedBy === user?.id || i.reporterName === user?.name).length,
  };

  return (
    <div className="dashboard">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="brand-icon">🔍</span>
          <span className="brand-text">Lost<span>&</span>Found</span>
        </div>
        <div className="navbar-center">
          <span className="nav-greeting">Hello, <strong>{user?.name}</strong> 👋</span>
        </div>
        <button id="logout-btn" onClick={handleLogout} className="btn btn-outline btn-sm">
          🚪 Logout
        </button>
      </nav>

      <div className="dashboard-body">
        {/* STATS ROW */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Items</div>
            </div>
          </div>
          <div className="stat-card lost">
            <div className="stat-icon">❗</div>
            <div className="stat-info">
              <div className="stat-value">{stats.lost}</div>
              <div className="stat-label">Lost Items</div>
            </div>
          </div>
          <div className="stat-card found">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <div className="stat-value">{stats.found}</div>
              <div className="stat-label">Found Items</div>
            </div>
          </div>
          <div className="stat-card mine">
            <div className="stat-icon">👤</div>
            <div className="stat-info">
              <div className="stat-value">{stats.mine}</div>
              <div className="stat-label">My Reports</div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="tab-bar">
          <button
            id="tab-all"
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => { setActiveTab('all'); handleCancelEdit(); }}
          >
            📋 All Items
          </button>
          <button
            id="tab-add"
            className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            {editingId ? '✏️ Edit Item' : '➕ Report Item'}
          </button>
        </div>

        {/* ADD / EDIT FORM */}
        {activeTab === 'add' && (
          <div className="form-card animate-fadeInUp">
            <div className="form-card-header">
              <h2>{editingId ? '✏️ Edit Item' : '➕ Report an Item'}</h2>
              <p>{editingId ? 'Update the item details below.' : 'Fill in the details to report a lost or found item.'}</p>
            </div>

            {formError && <div className="alert alert-error">{formError}</div>}
            {formSuccess && <div className="alert alert-success">{formSuccess}</div>}

            <form id="item-form" onSubmit={handleFormSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="itemName">Item Name *</label>
                  <input id="itemName" name="itemName" type="text" placeholder="e.g. Blue Backpack"
                    value={formData.itemName} onChange={handleFormChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="type">Type *</label>
                  <select id="type" name="type" value={formData.type} onChange={handleFormChange}>
                    <option value="Lost">Lost</option>
                    <option value="Found">Found</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select id="category" name="category" value={formData.category} onChange={handleFormChange}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="date">Date *</label>
                  <input id="date" name="date" type="date" value={formData.date} onChange={handleFormChange} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input id="location" name="location" type="text" placeholder="e.g. Library, Block A Canteen"
                  value={formData.location} onChange={handleFormChange} />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea id="description" name="description" placeholder="Describe the item in detail..."
                  value={formData.description} onChange={handleFormChange} />
              </div>

              <div className="form-group">
                <label htmlFor="contactInfo">Contact Info *</label>
                <input id="contactInfo" name="contactInfo" type="text"
                  placeholder="Phone number or email to contact"
                  value={formData.contactInfo} onChange={handleFormChange} />
              </div>

              <div className="form-actions">
                <button id="item-submit" type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? <><span className="spinner" /> Saving...</> : (editingId ? 'Update Item' : 'Submit Report')}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-outline" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* SEARCH & FILTER */}
        {activeTab === 'all' && (
          <>
            <div className="search-bar animate-fadeIn">
              <div className="search-input-wrap">
                <span className="search-icon">🔍</span>
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search by item name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <select id="filter-type" value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
                <option value="">All Types</option>
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
              </select>
              <select id="filter-category" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button className="btn btn-outline btn-sm" onClick={() => { setSearchName(''); setFilterType(''); setFilterCategory(''); }}>
                Clear
              </button>
            </div>

            {/* ITEMS GRID */}
            {loading ? (
              <div className="loading-state">
                <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
                <p>Loading items...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="empty-state animate-fadeIn">
                <div className="empty-icon">📭</div>
                <h3>No items found</h3>
                <p>Be the first to report a lost or found item!</p>
                <button className="btn btn-primary" onClick={() => setActiveTab('add')}>
                  ➕ Report an Item
                </button>
              </div>
            ) : (
              <div className="items-grid animate-fadeIn">
                {items.map((item) => {
                  const isOwner = item.reportedBy === user?.id || item.reporterName === user?.name;
                  return (
                    <div key={item._id} className={`item-card ${item.type.toLowerCase()}`}>
                      <div className="item-card-header">
                        <span className={`badge badge-${item.type.toLowerCase()}`}>{item.type}</span>
                        <span className="item-category">{item.category}</span>
                      </div>

                      <h3 className="item-name">{item.itemName}</h3>
                      <p className="item-description">{item.description}</p>

                      <div className="item-meta">
                        <div className="meta-row">
                          <span className="meta-icon">📍</span>
                          <span>{item.location}</span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-icon">📅</span>
                          <span>{new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-icon">📞</span>
                          <span>{item.contactInfo}</span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-icon">👤</span>
                          <span>{item.reporterName || 'Unknown'}</span>
                        </div>
                      </div>

                      {isOwner && (
                        <div className="item-actions">
                          <button
                            id={`edit-${item._id}`}
                            className="btn btn-outline btn-sm"
                            onClick={() => handleEdit(item)}
                          >
                            ✏️ Edit
                          </button>
                          {deleteConfirmId === item._id ? (
                            <div className="delete-confirm">
                              <span>Sure?</span>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)}>Yes</button>
                              <button className="btn btn-outline btn-sm" onClick={() => setDeleteConfirmId(null)}>No</button>
                            </div>
                          ) : (
                            <button
                              id={`delete-${item._id}`}
                              className="btn btn-danger btn-sm"
                              onClick={() => setDeleteConfirmId(item._id)}
                            >
                              🗑️ Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
