document.addEventListener('DOMContentLoaded', () => {
    
    if (isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});


const handleRegister = async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    
    if (!username || !email || !password || !confirmPassword) {
        showMessage('message', 'Please fill in all fields.', 'error');
        return;
    }

    if (!isValidUsername(username)) {
        showMessage('message', 'Username must be at least 3 characters long.', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showMessage('message', 'Please enter a valid email address.', 'error');
        return;
    }

    if (!isValidPassword(password)) {
        showMessage('message', 'Password must be at least 6 characters long.', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showMessage('message', 'Passwords do not match.', 'error');
        return;
    }

    try {
        
        const response = await apiRequest('/auth/register', 'POST', { 
            username, 
            email, 
            password 
        }, false);
        
        if (response.success) {
            
            showMessage('message', 'Registration successful! Redirecting to login...', 'success');
            
            document.getElementById('registerForm').reset();
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            showMessage('message', response.message || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('message', error.message || 'An error occurred during registration.', 'error');
    }
};