
const API_BASE_URL = 'http://localhost:5000/api';


const getToken = () => {
    return localStorage.getItem('token');
};


const isLoggedIn = () => {
    const token = getToken();
    return token !== null && token !== undefined && token !== '';
};


const getUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    }
    return null;
};


const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};


const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};


const getImageUrl = (filename) => {
    if (!filename) {
        return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%23F5F5F7"/%3E%3Ctext x="50%" y="50%" font-family="Arial" font-size="16" fill="%23D2D2D7" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
    }
    return `http://localhost:5000/uploads/${filename}`;
};


const apiRequest = async (endpoint, method = 'GET', data = null, requiresAuth = true) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
    };

    if (requiresAuth) {
        const token = getToken();
        if (!token) {
            throw new Error('Authentication required');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'An error occurred');
    }

    return result;
};


const apiUploadRequest = async (endpoint, method = 'POST', formData, requiresAuth = true) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {};

    if (requiresAuth) {
        const token = getToken();
        if (!token) {
            throw new Error('Authentication required');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
        body: formData,
    };

    const response = await fetch(url, config);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'An error occurred');
    }

    return result;
};


const showMessage = (elementId, message, type = 'error') => {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = `message ${type}`;
        element.style.display = 'block';
    }
};


const hideMessage = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
};


const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};


const isValidPassword = (password) => {
    return password && password.length >= 6;
};


const isValidUsername = (username) => {
    return username && username.length >= 3;
};


const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};