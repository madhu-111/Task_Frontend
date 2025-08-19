import React, { useState } from 'react';
import axios from 'axios';

// const API_URL = 'https://task-backend-3s37.onrender.com';

const TaskCard = ({ task, onEdit, onDelete, onUpdate, token }) => {
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#fbbf24';
      case 'in-progress': return '#3b82f6';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'in-progress': return '🔄';
      case 'completed': return '✅';
      default: return '📝';
    }
  };

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/api/tasks/${task._id}`,
        { ...task, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate(response.data.task);
    } catch (err) {
      console.error('Failed to update task status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${import.meta.env.REACT_APP_API_URL}/api/tasks/${task._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onDelete(task._id);
    } catch (err) {
      console.error('Failed to delete task:', err);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`task-card ${task.status}`}>
      <div className="task-card-header">
        <div className="task-status">
          <span className="status-icon">{getStatusIcon(task.status)}</span>
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="status-select"
            disabled={loading}
            style={{ color: getStatusColor(task.status) }}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="task-actions">
          <button
            className="action-btn edit-btn"
            onClick={() => onEdit(task)}
            disabled={loading}
            title="Edit task"
          >
            ✏️
          </button>
          <button
            className="action-btn delete-btn"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading}
            title="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="task-content">
        <h3 className="task-title">{task.title}</h3>
        <p className="task-description">{task.description}</p>
      </div>

      <div className="task-footer">
        <div className="task-dates">
          <small className="created-date">
            Created: {formatDate(task.createdAt)}
          </small>
          {task.updatedAt !== task.createdAt && (
            <small className="updated-date">
              Updated: {formatDate(task.updatedAt)}
            </small>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <div className="delete-confirm-content">
              <h4>Delete Task</h4>
              <p>Are you sure you want to delete "{task.title}"? This action cannot be undone.</p>
              <div className="delete-confirm-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="delete-confirm-btn"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? <span className="loading-spinner"></span> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="task-card-loading">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;