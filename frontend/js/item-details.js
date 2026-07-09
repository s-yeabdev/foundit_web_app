let currentItem = null;
let isOwner = false;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');
    
    if (!itemId) {
        window.location.href = 'index.html';
        return;
    }

    loadItemDetails(itemId);
});


const loadItemDetails = async (itemId) => {
    try {
        const response = await apiRequest(`/items/${itemId}`, 'GET', null, false);
        
        
        if (response && response.data) {
            currentItem = response.data;
            isOwner = response.data.isOwner || false;
            renderItemDetails(response.data);
            setupActionButtons(response.data);
        } else {
            showError('Item not found.');
        }
    } catch (error) {
        console.error('Error loading item details:', error);
        showError('Failed to load item details. Please try again.');
    }
};


const renderItemDetails = (item) => {
    const container = document.getElementById('itemDetails');
    if (!container) return;

    const lowerType = item.type ? item.type.toLowerCase() : 'lost';

    container.innerHTML = `
        <div class="item-details-card">
            <img 
                src="${getImageUrl(item.image)}" 
                alt="${escapeHtml(item.title)}" 
                class="item-details-image"
                onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22500%22 viewBox=%220 0 800 500%22%3E%3Crect width=%22800%22 height=%22500%22 fill=%22%23F5F5F7%22/%3E%3Ctext x=%2250%%22 y=%2250%%22 font-family=%22-apple-system%22 font-size=%2224%22 fill=%22%2386868B%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image Provided%3C/text%3E%3C/svg%3E'"
            >
            <div class="item-details-content">
                <div class="item-details-header">
                    <h1 class="item-details-title">${escapeHtml(item.title)}</h1>
                    <span class="item-details-type ${lowerType}">
                        ${item.type}
                    </span>
                </div>
                
                <div class="item-details-meta">
                    <div class="meta-item">
                        <span class="meta-label">Category</span>
                        <span class="meta-value">${escapeHtml(item.category || 'General')}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Location</span>
                        <span class="meta-value">📍 ${escapeHtml(item.location)}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Date</span>
                        <span class="meta-value">📅 ${formatDate(item.date)}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Posted</span>
                        <span class="meta-value">⏱️ ${formatDate(item.created_at)}</span>
                    </div>
                </div>
                
                <div class="item-details-description">
                    ${escapeHtml(item.description)}
                </div>
                
                <div class="item-details-user">
                    <span class="posted-by">Posted by: <strong>${escapeHtml(item.posted_by || 'Unknown User')}</strong></span>
                </div>
                
                <div id="actionButtons" class="item-details-actions">
                </div>
            </div>
        </div>
    `;
};


const setupActionButtons = (item) => {
    const actionContainer = document.getElementById('actionButtons');
    if (!actionContainer) return;

    
    const userData = localStorage.getItem('user');
    const currentUser = userData ? JSON.parse(userData) : null;
    const isAdmin = currentUser && (currentUser.is_admin === true || currentUser.role === 'admin');

    if (isOwner) {
        
        actionContainer.innerHTML = `
            <a href="create-item.html?id=${item.id}" class="btn-primary" id="editItemBtn">Edit Item</a>
            <button id="deleteItemBtn" class="btn-danger">Delete Item</button>
        `;
        setupDeleteButton();
        setupEditButton();
    } else if (isAdmin) {
        
        actionContainer.innerHTML = `
            <button id="deleteItemBtn" class="btn-danger" style="background-color: #FF453A; width: 100%; max-width: 200px;">Delete Post (Admin)</button>
            <a href="index.html" class="btn-secondary" style="text-align: center; width: 100%; max-width: 200px;">Back to Home</a>
        `;
        setupDeleteButton();
    } else {
        
        actionContainer.innerHTML = `
            <a href="index.html" class="btn-secondary" style="text-align: center; width: 100%; max-width: 200px;">Back to Home</a>
        `;
    }
};


const setupDeleteButton = () => {
    const deleteBtn = document.getElementById('deleteItemBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleDeleteItem);
    }
};


const setupEditButton = () => {
    const editBtn = document.getElementById('editItemBtn');
    if (editBtn && currentItem) {
        editBtn.href = `create-item.html?id=${currentItem.id}`;
    }
};


const handleDeleteItem = async () => {
    if (!currentItem) return;
    
    const confirmDelete = confirm(`Are you sure you want to delete "${currentItem.title}"?`);
    if (!confirmDelete) return;

    try {
        const response = await apiRequest(`/items/${currentItem.id}`, 'DELETE');
        
        if (response && (response.success || !response.error)) {
            showMessage('message', 'Item removed successfully! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showMessage('message', response.message || 'Failed to delete item.', 'error');
        }
    } catch (error) {
        console.error('Delete item error:', error);
        showMessage('message', error.message || 'An error occurred while deleting the item.', 'error');
    }
};


const showError = (message) => {
    const container = document.getElementById('itemDetails');
    if (container) {
        container.innerHTML = `
            <div class="error-container" style="text-align:center; padding:4rem 2rem;">
                <p style="font-size:1.2rem; color:#FF3B30; margin-bottom: 1.5rem;">${escapeHtml(message)}</p>
                <a href="index.html" class="btn-primary">Back to Home</a>
            </div>
        `;
    }
};


const escapeHtml = (text) => {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};