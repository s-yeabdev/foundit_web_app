function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


document.addEventListener('DOMContentLoaded', () => {
    
    if (!requireAuth()) return;

    loadMyItems();
});


const loadMyItems = async () => {
    const itemsGrid = document.getElementById('myItemsGrid');
    const loading = document.getElementById('loading');
    const noItems = document.getElementById('noItems');

    try {
        
        if (itemsGrid) itemsGrid.innerHTML = '';
        if (loading) loading.style.display = 'block';
        if (noItems) noItems.style.display = 'none';

        
        const response = await apiRequest('/items/my-items', 'GET');
        
        
        if (loading) loading.style.display = 'none';

        if (response.data && response.data.length > 0) {
            renderMyItems(response.data, itemsGrid);
            if (noItems) noItems.style.display = 'none';
        } else {
            if (itemsGrid) itemsGrid.innerHTML = '';
            if (noItems) noItems.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading my items:', error);
        if (loading) loading.style.display = 'none';
        if (itemsGrid) {
            itemsGrid.innerHTML = `
                <div class="error-message" style="text-align:center;padding:2rem;">
                    <p>Failed to load your items. Please try again.</p>
                </div>
            `;
        }
    }
};


const renderMyItems = (items, gridElement) => {
    if (!gridElement) return;

    gridElement.innerHTML = items.map(item => `
        <div class="item-card">
            <img 
                src="${getImageUrl(item.image)}" 
                alt="${item.title}" 
                class="item-card-image"
                onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22 viewBox=%220 0 300 200%22%3E%3Crect width=%22300%22 height=%22200%22 fill=%22%23F5F5F7%22/%3E%3Ctext x=%2250%%22 y=%2250%%22 font-family=%22Arial%22 font-size=%2216%22 fill=%22%23D2D2D7%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E'"
            >
            <div class="item-card-content">
                <div class="item-card-header">
                    <h3 class="item-card-title">${escapeHtml(item.title)}</h3>
                    <span class="item-card-type ${item.type === 'Lost' ? 'type-lost' : 'type-found'}">
                        ${item.type}
                    </span>
                </div>
                <div class="item-card-meta">
                    <span>📍 ${escapeHtml(item.location)}</span>
                    <span>📅 ${formatDate(item.date)}</span>
                </div>
                <div class="item-card-description">
                    ${escapeHtml(truncateText(item.description, 80))}
                </div>
                <div class="item-card-actions">
                    <a href="create-item.html?id=${item.id}" class="btn-edit">Edit</a>
                    <button class="btn-delete" onclick="deleteItem(${item.id}, '${escapeHtml(item.title)}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
};


const deleteItem = async (itemId, itemTitle) => {
    const confirmDelete = confirm(`Are you sure you want to delete "${itemTitle}"?`);
    if (!confirmDelete) return;

    try {
        const response = await apiRequest(`/items/${itemId}`, 'DELETE');
        
        if (response.success) {
            
            loadMyItems();
            
            const messageDiv = document.getElementById('message');
            if (messageDiv) {
                showMessage('message', 'Item deleted successfully!', 'success');
                setTimeout(() => {
                    hideMessage('message');
                }, 3000);
            }
        } else {
            alert(response.message || 'Failed to delete item.');
        }
    } catch (error) {
        console.error('Delete item error:', error);
        alert('An error occurred while deleting the item.');
    }
};