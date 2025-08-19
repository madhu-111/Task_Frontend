import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://task-backend-3s37.onrender.com';

const TaskForm = ({ task, onTaskCreated, onTaskUpdated, onCancel, token, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task && isEditing) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status
      });
    }
  }, [task, isEditing]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditing) {
        const response = await axios.put(
          `${API_URL}/api/tasks/${task._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        onTaskUpdated(response.data.task);
      } else {
        const response = await axios.post(
          `${API_URL}/api/tasks`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        onTaskCreated(response.data.task);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-form-overlay">
      <div className="task-form-modal">
        <div className="task-form-header">
          <h3>{isEditing ? 'Edit Task' : 'Create New Task'}</h3>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="title">Task Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter task title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Enter task description"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                isEditing ? 'Update Task' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;