// Login page functionality

document.addEventListener('DOMContentLoaded', () => {
    
    if (isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});


const handleLogin = async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    
    if (!email || !password) {
        showMessage('message', 'Please fill in all fields.', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showMessage('message', 'Please enter a valid email address.', 'error');
        return;
    }

    try {
        
        const response = await apiRequest('/auth/login', 'POST', { email, password }, false);
        
        if (response.success && response.data) {
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            
            showMessage('message', 'Login successful! Redirecting...', 'success');
            
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showMessage('message', response.message || 'Login failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('message', error.message || 'An error occurred during login.', 'error');
    }
};