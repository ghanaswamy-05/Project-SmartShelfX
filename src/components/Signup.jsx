// src/components/Signup.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
    contactNumber: '',
    warehouseLocation: '',
    assignedWarehouse: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value || '' // Ensure no null values
    }));
  };

  const validateForm = () => {
    const requiredFields = ['fullName', 'companyName', 'email', 'password', 'confirmPassword', 'role', 'contactNumber', 'warehouseLocation'];

    for (let field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      alert('Please enter a valid email address.');
      return false;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Prepare data for backend - ensure no null values
      const submitData = {
        fullName: formData.fullName.trim(),
        companyName: formData.companyName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        contactNumber: formData.contactNumber.trim(),
        warehouseLocation: formData.warehouseLocation.trim(),
        assignedWarehouse: formData.warehouseLocation.trim() // Use warehouseLocation for assignedWarehouse
      };

      console.log("Sending data to backend:", submitData);

      const response = await axios.post(
        'http://localhost:8080/api/auth/signup',
        submitData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      console.log("Signup response:", response);

      let successMessage = 'Signup successful!';
      if (response.data && typeof response.data === 'object') {
        successMessage = response.data.message || successMessage;
      } else if (typeof response.data === 'string') {
        successMessage = response.data;
      }

      alert(successMessage);

      // Reset form on success
      resetForm();

    } catch (error) {
      console.error("Signup error details:", error);

      let errorMessage = 'Signup failed';

      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Signup failed: Request timeout. Please try again.';
      } else if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          errorMessage = errorData.message || JSON.stringify(errorData);
        } else {
          errorMessage = errorData || 'Signup failed';
        }
      } else if (error.request) {
        errorMessage = 'Signup failed: No response from server. Please check if the backend is running on http://localhost:8080';
      } else {
        errorMessage = `Signup failed: ${error.message}`;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      companyName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'USER',
      contactNumber: '',
      warehouseLocation: '',
      assignedWarehouse: ''
    });
  };

  const handleCancel = () => {
    resetForm();
  };

  return (
    <div className="signup-container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} className="signup-form">
        <div className="form-group">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name *"
            value={formData.fullName}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="companyName"
            placeholder="Company Name *"
            value={formData.companyName}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Official Email ID *"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Password * (min. 6 characters)"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            minLength="6"
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password *"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="USER">User</option>
            <option value="STORE_MANAGER">Store Manager</option>
            <option value="ADMIN">Admin</option>
            <option value="BUYER">Buyer</option>
          </select>
        </div>

        <div className="form-group">
          <input
            type="text"
            name="contactNumber"
            placeholder="Contact Number *"
            value={formData.contactNumber}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="warehouseLocation"
            placeholder="Warehouse Location *"
            value={formData.warehouseLocation}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "⏳ Creating Account..." : "Register"}
          </button>
          <button type="button" onClick={handleCancel} disabled={loading} className="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default Signup;