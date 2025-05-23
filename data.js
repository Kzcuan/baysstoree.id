// Local Storage Keys
const ACCOUNTS_KEY = 'accounts';
const TOOLS_KEY = 'tools';
const HISTORY_KEY = 'history';
const ADMIN_ACCOUNTS_KEY = 'adminAccounts';

// Initialize empty arrays for storage
const initialAccounts = [];
const initialTools = [];
const initialHistory = [];

// Initialize data structure if not exists
function initializeData() {
    try {
        // Only initialize if the keys don't exist at all
        if (localStorage.getItem(ACCOUNTS_KEY) === null) {
            localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(initialAccounts));
        }
        if (localStorage.getItem(TOOLS_KEY) === null) {
            localStorage.setItem(TOOLS_KEY, JSON.stringify(initialTools));
        }
        if (localStorage.getItem(HISTORY_KEY) === null) {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(initialHistory));
        }
        if (localStorage.getItem(ADMIN_ACCOUNTS_KEY) === null) {
            localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify([]));
        }
    } catch (error) {
        console.error('Error initializing data:', error);
    }
}

// Get items from localStorage
function getItems(key) {
    try {
        const data = localStorage.getItem(key);
        console.log(`Getting ${key}:`, data);
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error(`Error getting ${key}:`, error);
        return [];
    }
}

// Save items to localStorage
function saveItems(key, items) {
    try {
        console.log(`Saving ${key}:`, items);
        localStorage.setItem(key, JSON.stringify(items));
        return true;
    } catch (error) {
        console.error(`Error saving ${key}:`, error);
        return false;
    }
}

// Function to generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Function to save or update item
function saveItem(key, item) {
    try {
        const items = getItems(key);
        const index = items.findIndex(i => i.id === item.id);
        
        if (index !== -1) {
            // Update existing item
            items[index] = {
                ...items[index],
                ...item,
                lastModified: new Date().toISOString()
            };
        } else {
            // Add new item
            items.push({
                ...item,
                id: item.id || generateId(),
                date: new Date().toISOString()
            });
        }
        
        console.log(`Saving item to ${key}:`, items);
        return saveItems(key, items);
    } catch (error) {
        console.error(`Error saving item to ${key}:`, error);
        return false;
    }
}

// Function to add new item
function addItem(key, item) {
    try {
        const items = getItems(key) || [];
        const newItem = {
            ...item,
            id: generateId(),
            date: new Date().toISOString(),
            features: item.features || []
        };
        items.push(newItem);
        return saveItems(key, items);
    } catch (error) {
        console.error(`Error adding item to ${key}:`, error);
        return false;
    }
}

// Function to update item
function updateItem(key, id, updates) {
    try {
        const items = getItems(key) || [];
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = {
                ...items[index],
                ...updates,
                lastModified: new Date().toISOString(),
                features: updates.features || items[index].features || []
            };
            return saveItems(key, items);
        }
        return false;
    } catch (error) {
        console.error(`Error updating item in ${key}:`, error);
        return false;
    }
}

// Delete item by id
function deleteItem(key, id) {
    try {
        const items = getItems(key);
        const updatedItems = items.filter(item => item.id !== id);
        return saveItems(key, updatedItems);
    } catch (error) {
        console.error(`Error deleting item from ${key}:`, error);
        return false;
    }
}

// Clear all data (only when explicitly called)
function clearAllData() {
    try {
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([]));
        localStorage.setItem(TOOLS_KEY, JSON.stringify([]));
        localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
        localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify([]));
        return true;
    } catch (error) {
        console.error('Error clearing data:', error);
        return false;
    }
}

// Initialize data when the script loads
document.addEventListener('DOMContentLoaded', initializeData);

// Handle file upload
function handleFileUpload(file, callback) {
    if (!file) {
        callback(null);
        return;
    }

    try {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('File size exceeds 5MB limit');
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed');
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            callback(e.target.result);
        };
        reader.onerror = function() {
            console.error('Error reading file');
            callback(null);
        };
        reader.readAsDataURL(file);
    } catch (error) {
        console.error('Error handling file upload:', error);
        callback(null);
    }
}

// Search items
function searchItems(type, query) {
    const items = getItems(type);
    query = query.toLowerCase();
    return items.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
}

// Get latest items
function getLatestItems(type, limit = 3) {
    const items = getItems(type);
    return items
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
}

// Clean up old data
function cleanupOldData() {
    try {
        let data = getItems(HISTORY_KEY);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Remove completed/cancelled history items older than 30 days
        const filteredData = data.filter(item => {
            if (item.status === 'pending') return true;
            const itemDate = new Date(item.date);
            return itemDate >= thirtyDaysAgo;
        });

        if (filteredData.length !== data.length) {
            saveItems(HISTORY_KEY, filteredData);
        }
    } catch (error) {
        console.error('Error cleaning up data:', error);
    }
}

// Admin Account Management
function createAdminAccount(username, email, password, image = '') {
    const adminAccounts = getAdminAccounts();
    
    // Check if username already exists
    if (adminAccounts.some(account => account.username === username)) {
        throw new Error('Username already exists');
    }

    const newAdmin = {
        id: generateId(),
        username,
        email,
        password,
        image,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        isActive: true
    };

    adminAccounts.push(newAdmin);
    saveAdminAccounts(adminAccounts);
    return newAdmin;
}

function updateAdminAccount(id, updates) {
    const adminAccounts = getAdminAccounts();
    const index = adminAccounts.findIndex(account => account.id === id);
    
    if (index === -1) {
        throw new Error('Admin account not found');
    }

    // Update account
    adminAccounts[index] = {
        ...adminAccounts[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    saveAdminAccounts(adminAccounts);
    return adminAccounts[index];
}

function getAdminAccount(id) {
    const adminAccounts = getAdminAccounts();
    return adminAccounts.find(account => account.id === id);
}

function getAdminByUsername(username) {
    const adminAccounts = getAdminAccounts();
    return adminAccounts.find(account => account.username === username);
}

function deleteAdminAccount(id) {
    const adminAccounts = getAdminAccounts();
    const filteredAccounts = adminAccounts.filter(account => account.id !== id);
    saveAdminAccounts(filteredAccounts);
}

function updateLastLogin(id) {
    const adminAccounts = getAdminAccounts();
    const index = adminAccounts.findIndex(account => account.id === id);
    
    if (index !== -1) {
        adminAccounts[index].lastLogin = new Date().toISOString();
        saveAdminAccounts(adminAccounts);
    }
}

// Helper functions
function getAdminAccounts() {
    return JSON.parse(localStorage.getItem(ADMIN_ACCOUNTS_KEY) || '[]');
}

function saveAdminAccounts(accounts) {
    localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// Export functions
window.adminManager = {
    createAdminAccount,
    updateAdminAccount,
    getAdminAccount,
    getAdminByUsername,
    deleteAdminAccount,
    updateLastLogin,
    validateEmail,
    validatePassword
};

// Get latest games for HOME (limited to 5)
function getLatestGamesForHome() {
    const accounts = getItems(ACCOUNTS_KEY);
    return accounts
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
} 