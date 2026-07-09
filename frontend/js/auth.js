
const checkAuth = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        try {
            const userData = JSON.parse(user);
            
            updateUIForLoggedInUser(userData);
            return true;
        } catch (e) {
            return false;
        }
    }
    return false;
};


const updateUIForLoggedInUser = (user) => {
    const authLinks = document.getElementById('authLinks');
    const userInfo = document.getElementById('userInfo');
    const usernameDisplay = document.getElementById('usernameDisplay');
    
    if (authLinks) authLinks.style.display = 'none';
    if (userInfo) {
        userInfo.style.display = 'flex';
        if (usernameDisplay) {
            usernameDisplay.textContent = `👤 ${user.username}`;
        }
    }
};


const updateUIForLoggedOutUser = () => {
    const authLinks = document.getElementById('authLinks');
    const userInfo = document.getElementById('userInfo');
    
    if (authLinks) authLinks.style.display = 'flex';
    if (userInfo) userInfo.style.display = 'none';
};


const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateUIForLoggedOutUser();
    
    
    if (window.location.pathname !== '/index.html' && 
        window.location.pathname !== '/') {
        window.location.href = 'index.html';
    } else {
        window.location.reload();
    }
};


const setupLogout = () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
};


const initNav = () => {
    
    const isLoggedIn = checkAuth();
    
    
    setupLogout();
    
    
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
};


document.addEventListener('DOMContentLoaded', initNav);


const requireAuth = () => {
    if (!isLoggedIn()) {
        
        window.location.href = 'login.html';
        return false;
    }
    return true;
};


const requireGuest = () => {
    if (isLoggedIn()) {
        // Redirect to home page
        window.location.href = 'index.html';
        return false;
    }
    return true;
};