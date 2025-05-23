// Add info button to navigation
function addInfoButton() {
    const navbarNav = document.querySelector('.navbar-nav');
    if (navbarNav) {
        // Check if info button already exists
        const existingInfoButton = navbarNav.querySelector('.info-button');
        if (existingInfoButton) {
            return; // Don't add if it already exists
        }

        const currentPath = window.location.pathname;
        const isInfoPage = currentPath.includes('info.html');
        
        const infoButton = document.createElement('li');
        infoButton.className = 'nav-item';
        infoButton.innerHTML = `
            <a class="nav-link info-button ${isInfoPage ? 'active' : ''}" href="info.html">
                <i class="fas fa-info-circle"></i>
            </a>
        `;
        navbarNav.appendChild(infoButton);

        // Add admin links if admin is logged in
        if (localStorage.getItem('adminLoggedIn')) {
            const adminLinks = document.createElement('li');
            adminLinks.className = 'nav-item dropdown';
            adminLinks.innerHTML = `
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    <i class="fas fa-cog"></i> Admin
                </a>
                <ul class="dropdown-menu dropdown-menu-dark">
                    <li><h6 class="dropdown-header">Store Management</h6></li>
                    <li><a class="dropdown-item" href="admin_info.html">
                        <i class="fas fa-store"></i> Store Information
                    </a></li>
                    <li><hr class="dropdown-divider"></li>
                    
                    <li><h6 class="dropdown-header">Product Management</h6></li>
                    <li><a class="dropdown-item" href="admin_accounts.html">
                        <i class="fas fa-user-circle"></i> Accounts
                    </a></li>
                    <li><a class="dropdown-item" href="admin_tools.html">
                        <i class="fas fa-tools"></i> Tools
                    </a></li>
                    <li><hr class="dropdown-divider"></li>
                    
                    <li><h6 class="dropdown-header">Transaction Management</h6></li>
                    <li><a class="dropdown-item" href="admin_history.html">
                        <i class="fas fa-history"></i> Order History
                    </a></li>
                </ul>
            `;
            navbarNav.appendChild(adminLinks);

            // Add logout button
            const logoutButton = document.createElement('li');
            logoutButton.className = 'nav-item';
            logoutButton.innerHTML = `
                <a class="nav-link" href="#" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            `;
            navbarNav.appendChild(logoutButton);
        }
    }
}

// Add shared styles for info button
function addInfoButtonStyles() {
    // Check if styles already exist
    if (document.querySelector('#info-button-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'info-button-styles';
    style.textContent = `
        .info-button {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex !important;
            align-items: center;
            justify-content: center;
            background: rgba(77, 166, 255, 0.1);
            border: 1px solid rgba(77, 166, 255, 0.2);
            margin-left: 10px;
            transition: all 0.3s ease;
        }

        .info-button:hover {
            background: #4da6ff;
            transform: translateY(-2px);
            box-shadow: 0 0 15px rgba(77, 166, 255, 0.5);
        }

        .info-button i {
            font-size: 1.2rem;
            color: #4da6ff;
            transition: all 0.3s ease;
        }

        .info-button:hover i {
            color: #ffffff;
        }

        .info-button.active {
            background: #4da6ff;
        }

        .info-button.active i {
            color: #ffffff;
        }
    `;
    document.head.appendChild(style);
}

// Logout function
function logout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

// Shared navigation functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation
    initializeNavigation();

    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Add click handler to each link
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Get the target page
            const href = link.getAttribute('href');
            
            // If it's the home page, make sure we preserve the data
            if (href === 'index.html') {
                // Make sure data is saved before navigation
                try {
                    const accounts = getItems(ACCOUNTS_KEY);
                    const tools = getItems(TOOLS_KEY);
                    const history = getItems(HISTORY_KEY);
                    
                    // Double check data is saved
                    if (accounts && tools && history) {
                        console.log('Data preserved before navigation:', {
                            accounts,
                            tools,
                            history
                        });
                    }
                } catch (error) {
                    console.error('Error preserving data:', error);
                    e.preventDefault();
                    alert('Please try again, ensuring your data is saved.');
                    return;
                }
            }
        });
    });
});

// Initialize navigation
function initializeNavigation() {
    const navbarNav = document.querySelector('#navbarNav .navbar-nav');
    
    // Clear existing navigation
    navbarNav.innerHTML = '';
    
    // Add main navigation items
    const navItems = [
        { href: 'index.html', icon: 'fas fa-home', text: 'HOME' },
        { href: 'accounts.html', icon: 'fas fa-gamepad', text: 'Modder Game' },
        { href: 'history.html', icon: 'fas fa-history', text: 'HISTORY' }
    ];

    navItems.forEach(item => {
        const li = document.createElement('li');
        li.className = 'nav-item';
        const currentPath = window.location.pathname;
        const isActive = currentPath.includes(item.href);
        
        li.innerHTML = `
            <a class="nav-link ${isActive ? 'active' : ''}" href="${item.href}">
                <i class="${item.icon}"></i> ${item.text}
            </a>
        `;
        navbarNav.appendChild(li);
    });
    
    // Only show admin panel if admin is logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        const adminLinks = document.createElement('li');
        adminLinks.className = 'nav-item dropdown';
        adminLinks.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                <i class="fas fa-cog"></i> Admin Panel
            </a>
            <ul class="dropdown-menu dropdown-menu-dark">
                <li><a class="dropdown-item" href="admin_profile.html">Profile</a></li>
                <li><a class="dropdown-item" href="admin_accounts.html">Manage Accounts</a></li>
                <li><a class="dropdown-item" href="admin_history.html">Manage History</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" onclick="logout()">Logout</a></li>
            </ul>
        `;
        navbarNav.appendChild(adminLinks);
    }
}

// Initialize info button
document.addEventListener('DOMContentLoaded', () => {
    addInfoButtonStyles();
    addInfoButton();
}); 