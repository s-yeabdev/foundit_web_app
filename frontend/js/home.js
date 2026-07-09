document.addEventListener('DOMContentLoaded', () => {
    loadItems();
    setupSearch();
    setupFilters();
});


const loadItems = async (filters = {}) => {
    const itemsGrid = document.getElementById('itemsGrid');
    const loading = document.getElementById('loading');
    const noItems = document.getElementById('noItems');

    try {
        
        if (itemsGrid) itemsGrid.innerHTML = '';
        if (loading) loading.style.display = 'block';
        if (noItems) noItems.style.display = 'none';

        
        let queryString = '';
        if (filters.search) {
            queryString += `search=${encodeURIComponent(filters.search)}`;
        }
        if (filters.type) {
            if (queryString) queryString += '&';
            queryString += `type=${encodeURIComponent(filters.type)}`;
        }
        const endpoint = `/items${queryString ? '?' + queryString : ''}`;

        
        const response = await apiRequest(endpoint, 'GET', null, false);
        
        
        if (loading) loading.style.display = 'none';

        if (response.data && response.data.length > 0) {
            renderItems(response.data, itemsGrid);
            if (noItems) noItems.style.display = 'none';
        } else {
            if (itemsGrid) itemsGrid.innerHTML = '';
            if (noItems) noItems.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading items:', error);
        if (loading) loading.style.display = 'none';
        if (itemsGrid) {
            itemsGrid.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 2rem; color: #FF3B30;">
                    <p>Failed to load items. Please try again.</p>
                </div>
            `;
        }
    }
};


const renderItems = (items, gridElement) => {
    if (!gridElement) return;

    gridElement.innerHTML = items.map(item => {
        const isLost = item.type === 'Lost';
        return `
            <div class="item-card" onclick="navigateToItem(${item.id})">
                <div class="item-image-container">
                    <img 
                        src="${getImageUrl(item.image)}" 
                        alt="${item.title}" 
                        class="item-image"
                        onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22 viewBox=%220 0 300 200%22%3E%3Crect width=%22300%22 height=%22200%22 fill=%22%23F5F5F7%22/%3E%3Ctext x=%2250%%22 y=%2250%%22 font-family=%22-apple-system%22 font-size=%2214%22 fill=%22%2386868B%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image Provided%3C/text%3E%3C/svg%3E'"
                    >
                    <span class="item-badge ${isLost ? 'badge-lost' : 'badge-found'}">
                        ${item.type}
                    </span>
                </div>
                <div class="item-info">
                    <h3 class="item-title">${escapeHtml(item.title)}</h3>
                    <p class="item-description">
                        ${escapeHtml(truncateText(item.description, 100))}
                    </p>
                    <div class="item-meta">
                        <div class="meta-row">
                            <span class="meta-label">📍 Location:</span>
                            <span>${escapeHtml(item.location)}</span>
                        </div>
                        <div class="meta-row">
                            <span class="meta-label">📅 Date:</span>
                            <span>${formatDate(item.date)}</span>
                        </div>
                        <div class="meta-row" style="margin-top: 0.25rem; font-size: 0.75rem;">
                            <span class="meta-label">👤 By:</span>
                            <span>${escapeHtml(item.posted_by || 'Unknown')}</span>
                        </div>
                    </div>
                    <a class="btn-view-details">View Details</a>
                </div>
            </div>
        `;
    }).join('');
};


const navigateToItem = (itemId) => {
    window.location.href = `item-details.html?id=${itemId}`;
};


const setupSearch = () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearBtn = document.getElementById('clearSearchBtn');

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            performSearch();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            const filterSelect = document.getElementById('filterType');
            if (filterSelect) filterSelect.value = '';
            performSearch();
        });
    }
};


const setupFilters = () => {
    const filterSelect = document.getElementById('filterType');
    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
            performSearch();
        });
    }
};


const performSearch = () => {
    const searchInput = document.getElementById('searchInput');
    const filterSelect = document.getElementById('filterType');
    
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    const type = filterSelect ? filterSelect.value : '';

    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (type) filters.type = type;

    loadItems(filters);
};


const escapeHtml = (text) => {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};