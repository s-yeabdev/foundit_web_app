// Create item page functionality

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!requireAuth()) return;

    
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');
    
    if (itemId) {
        loadItemForEdit(itemId);
    }

    const createForm = document.getElementById('createItemForm');
    if (createForm) {
        createForm.addEventListener('submit', handleCreateItem);
    }

    
    const imageInput = document.getElementById('image');
    if (imageInput) {
        imageInput.addEventListener('change', handleImagePreview);
    }
});


const loadItemForEdit = async (itemId) => {
    try {
        const response = await apiRequest(`/items/${itemId}`, 'GET');
        
        if (response.success && response.data) {
            const item = response.data;
            
            
            const userData = localStorage.getItem('user');
            const currentUser = userData ? JSON.parse(userData) : null;
            
            
            const isOwner = item.isOwner || (currentUser && (Number(item.user_id) === Number(currentUser.id)));
            const isAdmin = currentUser && (currentUser.is_admin === true || currentUser.role === 'admin');

            if (!isOwner && !isAdmin) {
                alert('You do not have permission to edit this item.');
                window.location.href = 'index.html';
                return;
            }
            
            
            document.getElementById('formTitle').textContent = 'Edit Item';
            document.getElementById('formSubtitle').textContent = 'Update your item information';
            document.getElementById('itemId').value = item.id;
            document.getElementById('type').value = item.type;
            document.getElementById('title').value = item.title;
            document.getElementById('description').value = item.description;
            document.getElementById('category').value = item.category;
            document.getElementById('location').value = item.location;
            
            
            if (item.date) {
                const dateObj = new Date(item.date);
                if (!isNaN(dateObj.getTime())) {
                    document.getElementById('date').value = dateObj.toISOString().split('T')[0];
                } else {
                    document.getElementById('date').value = item.date;
                }
            }
            
            document.getElementById('submitBtn').textContent = 'Update Item';
            
            
            if (item.image) {
                const previewContainer = document.getElementById('imagePreview');
                if (previewContainer) {
                    previewContainer.innerHTML = `
                        <div style="margin-top: 0.5rem;">
                            <p style="font-size: 0.85rem; opacity: 0.7; margin-bottom: 0.3rem;">Current Image:</p>
                            <img src="${getImageUrl(item.image)}" alt="Current image" style="max-width: 150px; border-radius: 8px;">
                            <p style="font-size: 0.8rem; opacity: 0.6; margin-top: 0.3rem;">Upload a new image to replace it</p>
                        </div>
                    `;
                }
            }
        }
    } catch (error) {
        console.error('Error loading item for edit:', error);
        alert('Failed to load item for editing.');
        window.location.href = 'index.html';
    }
};


const handleImagePreview = (e) => {
    const file = e.target.files[0];
    const previewContainer = document.getElementById('imagePreview');
    
    if (file && previewContainer) {
        const reader = new FileReader();
        reader.onload = (event) => {
            previewContainer.innerHTML = `
                <div style="margin-top: 0.5rem;">
                    <p style="font-size: 0.85rem; opacity: 0.7; margin-bottom: 0.3rem;">New Image Preview:</p>
                    <img src="${event.target.result}" alt="Preview" style="max-width: 200px; border-radius: 8px; border: 1px solid #D2D2D7;">
                </div>
            `;
        };
        reader.readAsDataURL(file);
    }
};


const handleCreateItem = async (e) => {
    e.preventDefault();

    const itemId = document.getElementById('itemId').value;
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const category = document.getElementById('category').value.trim();
    const location = document.getElementById('location').value.trim();
    const date = document.getElementById('date').value;
    const type = document.getElementById('type').value;
    const imageFile = document.getElementById('image').files[0];

    
    if (!title || title.length < 3) {
        showMessage('message', 'Title must be at least 3 characters long.', 'error');
        return;
    }

    if (!description || description.length < 10) {
        showMessage('message', 'Description must be at least 10 characters long.', 'error');
        return;
    }

    if (!category) {
        showMessage('message', 'Please enter a category.', 'error');
        return;
    }

    if (!location) {
        showMessage('message', 'Please enter a location.', 'error');
        return;
    }

    if (!date) {
        showMessage('message', 'Please select a date.', 'error');
        return;
    }

    if (!type) {
        showMessage('message', 'Please select Lost or Found.', 'error');
        return;
    }

    try {
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('location', location);
        formData.append('date', date);
        formData.append('type', type);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        
        const endpoint = itemId ? `/items/${itemId}` : '/items';
        const method = itemId ? 'PUT' : 'POST';

        
        const response = await apiUploadRequest(endpoint, method, formData);
        
        if (response.success) {
            const message = itemId ? 'Item updated successfully!' : 'Item posted successfully!';
            showMessage('message', `${message} Redirecting...`, 'success');
            
            
            setTimeout(() => {
                if (itemId) {
                    window.location.href = `item-details.html?id=${itemId}`;
                } else {
                    window.location.href = 'index.html';
                }
            }, 1500);
        } else {
            showMessage('message', response.message || 'Failed to save item. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Create/Update item error:', error);
        showMessage('message', error.message || 'An error occurred while saving the item.', 'error');
    }
};