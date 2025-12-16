import React, { useEffect, useState } from "react";
import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "../api/employeeApi";
import "./EmployeeManager.css";

export default function EmployeeManager() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    email: "",
    role: "",
    contactNumber: "",
    warehouseLocation: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data || []);
    } catch (error) {
      console.error('Failed to load employees:', error);
      alert('Failed to load employees. Please check if the server is running.');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!form.fullName || !form.email || !form.role) {
      alert("Please fill all required fields (Name, Email, Role).");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const employeeData = {
        fullName: form.fullName.trim(),
        companyName: form.companyName.trim(),
        email: form.email.trim(),
        role: form.role,
        contactNumber: form.contactNumber.trim(),
        warehouseLocation: form.warehouseLocation.trim()
      };

      if (editingId) {
        await updateEmployee(editingId, employeeData);
      } else {
        await addEmployee(employeeData);
      }

      await loadEmployees();
      resetForm();
      alert(editingId ? "Employee updated successfully!" : "Employee added successfully!");
    } catch (error) {
      console.error('Operation failed:', error);
      alert(`Operation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      fullName: "",
      companyName: "",
      email: "",
      role: "",
      contactNumber: "",
      warehouseLocation: ""
    });
    setEditingId(null);
  };

  const handleEdit = (emp) => {
    setForm({
      fullName: emp.fullName || "",
      companyName: emp.companyName || "",
      email: emp.email || "",
      role: emp.role || "",
      contactNumber: emp.contactNumber || "",
      warehouseLocation: emp.warehouseLocation || ""
    });
    setEditingId(emp.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteEmployee(id);
      await loadEmployees();
      alert("Employee deleted successfully!");
    } catch (error) {
      console.error('Delete failed:', error);
      alert(`Delete failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return '#e74c3c';
      case 'store manager': return '#3498db';
      case 'user': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return '👑';
      case 'store manager': return '💼';
      case 'user': return '👤';
      default: return '❓';
    }
  };

  return (
    <div className="employee-manager-page">
      <div className="employee-manager-container">
        <div className="employee-manager-header">
          <h2>👥 Employee Management</h2>
          <p>Manage your team members and their information</p>
        </div>

        <div className="employee-form-section">
          <form onSubmit={handleSubmit} className="employee-form">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                placeholder="Enter full name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label>Company Name</label>
              <input
                placeholder="Enter company name"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                placeholder="Enter email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label>Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                disabled={loading}
                required
              >
                <option value="">Select Role</option>
                <option value="User">User</option>
                <option value="Store Manager">Store Manager</option>
              </select>
            </div>

            <div className="form-group">
              <label>Contact Number</label>
              <input
                placeholder="Enter contact number"
                value={form.contactNumber}
                onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Warehouse Location</label>
              <input
                placeholder="Enter warehouse location"
                value={form.warehouseLocation}
                onChange={(e) => setForm({ ...form, warehouseLocation: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "⏳ Processing..." : editingId ? "🔄 Update Employee" : "➕ Add Employee"}
              </button>

              {editingId && (
                <button type="button" className="cancel-btn" onClick={resetForm} disabled={loading}>
                  ❌ Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="employees-section">
          <h3 className="section-title">
            📋 Employee Directory ({employees.length})
          </h3>

          {loading && (
            <div className="loading">
              ⏳ Loading employees...
            </div>
          )}

          <div className="employees-grid">
            {employees.map((employee) => (
              <div key={employee.id} className="employee-card">
                <div className="employee-header">
                  <div className="employee-avatar">
                    {employee.fullName ? employee.fullName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="employee-basic-info">
                    <h3 className="employee-name">{employee.fullName || 'Unknown'}</h3>
                    <div className="employee-role" style={{ backgroundColor: getRoleColor(employee.role) }}>
                      {getRoleIcon(employee.role)} {employee.role || 'No Role'}
                    </div>
                  </div>
                </div>

                <div className="employee-details">
                  <div className="detail-item">
                    <span className="detail-icon">🏢</span>
                    <div className="detail-content">
                      <span className="detail-label">Company</span>
                      <span className="detail-value">{employee.companyName || 'Not specified'}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon">📧</span>
                    <div className="detail-content">
                      <span className="detail-label">Email</span>
                      <span className="detail-value">{employee.email || 'No email'}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon">📞</span>
                    <div className="detail-content">
                      <span className="detail-label">Contact</span>
                      <span className="detail-value">{employee.contactNumber || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <span className="detail-icon">📍</span>
                    <div className="detail-content">
                      <span className="detail-label">Location</span>
                      <span className="detail-value">{employee.warehouseLocation || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                <div className="employee-actions">
                  <button
                    onClick={() => handleEdit(employee)}
                    className="edit-btn"
                    disabled={loading}
                    title="Edit employee"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(employee.id)}
                    className="delete-btn"
                    disabled={loading}
                    title="Delete employee"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {employees.length === 0 && !loading && (
            <div className="no-employees">
              <div className="no-employees-icon">👥</div>
              <h3>No Employees Found</h3>
              <p>Add your first employee using the form above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}