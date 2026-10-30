// FocusDock API Client

const API_BASE = '/api';

function getAuthHeaders(isFormData = false) {
  const token = localStorage.getItem('focusdock_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

export const api = {
  // Auth
  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async signup(userData) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch user session');
    return res.json();
  },

  async logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (e) {
      // ignore
    }
  },

  // Preferences
  async getPreferences() {
    const res = await fetch(`${API_BASE}/user/preferences`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch preferences');
    return res.json();
  },

  async updatePreferences(preferences) {
    const res = await fetch(`${API_BASE}/user/preferences`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(preferences),
    });
    if (!res.ok) throw new Error('Failed to update preferences');
    return res.json();
  },

  // Background Image Upload (Amazon S3)
  async uploadBackground(file) {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE}/user/background`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload image');
    return data;
  },

  // Widgets Catalog
  async getAvailableWidgets() {
    const res = await fetch(`${API_BASE}/widgets/available`);
    return res.json();
  },

  // Todos
  async getTodos() {
    const res = await fetch(`${API_BASE}/widgets/todos`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createTodo(text, priority = 'normal') {
    const res = await fetch(`${API_BASE}/widgets/todos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text, priority }),
    });
    return res.json();
  },

  async toggleTodo(id, done) {
    const res = await fetch(`${API_BASE}/widgets/todos/${id}/toggle`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ done }),
    });
    return res.json();
  },

  async deleteTodo(id) {
    const res = await fetch(`${API_BASE}/widgets/todos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Notes
  async getNotes() {
    const res = await fetch(`${API_BASE}/widgets/notes`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async updateNotes(content, color) {
    const res = await fetch(`${API_BASE}/widgets/notes`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, color }),
    });
    return res.json();
  },

  // Reminders
  async getReminders() {
    const res = await fetch(`${API_BASE}/widgets/reminders`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async createReminder(reminder_time, text) {
    const res = await fetch(`${API_BASE}/widgets/reminders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reminder_time, text }),
    });
    return res.json();
  },

  async deleteReminder(id) {
    const res = await fetch(`${API_BASE}/widgets/reminders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // System Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },
};

export default api;
