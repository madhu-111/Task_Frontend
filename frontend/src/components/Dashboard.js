import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TaskForm from './TaskForm';
import TaskCard from './TaskCard';

const API_URL = 'https://task-backend-3s37.onrender.com';

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTasks = async (page = 1, status = filter) => {
    try {
      const response = await axios.get(`${API_URL}/api/tasks`, {
        params: { page, status },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (page === 1) {
        setTasks(response.data.tasks);
      } else {
        setTasks(prev => [...prev, ...response.data.tasks]);
      }
      
      setTotalPages(response.data.totalPages);
      setCurrentPage(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const handleTaskCreated = (newTask) => {
    setTasks(prev => [newTask, ...prev]);
    setShowForm(false);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(prev => prev.map(task => 
      task._id === updatedTask._id ? updatedTask : task
    ));
    setEditingTask(null);
  };

  const handleTaskDeleted = (taskId) => {
    setTasks(prev => prev.filter(task => task._id !== taskId));
  };

  const loadMore = () => {
    if (currentPage < totalPages) {
      fetchTasks(currentPage + 1);
    }
  };

  const getTaskStats = () => {
    return {
      total: tasks.length,
      pending: tasks.filter(task => task.status === 'pending').length,
      inProgress: tasks.filter(task => task.status === 'in-progress').length,
      completed: tasks.filter(task => task.status === 'completed').length
    };
  };

  const stats = getTaskStats();

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner large"></div>
          <p>Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Task Manager</h1>
            <p>Welcome back, {user?.username}!</p>
          </div>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card in-progress">
            <div className="stat-number">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card completed">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        <div className="tasks-section">
          <div className="tasks-header">
            <h2>Your Tasks</h2>
            <div className="tasks-controls">
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <button 
                className="add-task-btn"
                onClick={() => setShowForm(true)}
              >
                + Add Task
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {showForm && (
            <TaskForm
              onTaskCreated={handleTaskCreated}
              onCancel={() => setShowForm(false)}
              token={token}
            />
          )}

          {editingTask && (
            <TaskForm
              task={editingTask}
              onTaskUpdated={handleTaskUpdated}
              onCancel={() => setEditingTask(null)}
              token={token}
              isEditing
            />
          )}

          <div className="tasks-grid">
            {tasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={setEditingTask}
                onDelete={handleTaskDeleted}
                onUpdate={handleTaskUpdated}
                token={token}
              />
            ))}
          </div>

          {tasks.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No tasks yet</h3>
              <p>Create your first task to get started!</p>
            </div>
          )}

          {currentPage < totalPages && (
            <div className="load-more-container">
              <button className="load-more-btn" onClick={loadMore}>
                Load More Tasks
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;