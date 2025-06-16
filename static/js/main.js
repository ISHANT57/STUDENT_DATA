// Main JavaScript file for Student Status Tracking System

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    console.log('Student Status Tracker initialized');
    
    // Initialize all interactive components
    initializeTooltips();
    initializeAlerts();
    initializeFormValidation();
    initializeTableSorting();
    
    // Add loading states to buttons
    initializeLoadingStates();
});

/**
 * Initialize Bootstrap tooltips
 */
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Auto-dismiss alerts after 5 seconds
 */
function initializeAlerts() {
    const alerts = document.querySelectorAll('.alert:not(.alert-info)');
    alerts.forEach(function(alert) {
        setTimeout(function() {
            const alertInstance = new bootstrap.Alert(alert);
            alertInstance.close();
        }, 5000);
    });
}

/**
 * Enhanced form validation
 */
function initializeFormValidation() {
    const forms = document.querySelectorAll('form[novalidate]');
    
    forms.forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                
                // Focus on first invalid field
                const firstInvalidField = form.querySelector(':invalid');
                if (firstInvalidField) {
                    firstInvalidField.focus();
                    
                    // Scroll to the field
                    firstInvalidField.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }
            
            form.classList.add('was-validated');
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(function(input) {
            input.addEventListener('blur', function(event) {
                if (form.classList.contains('was-validated')) {
                    event.target.classList.toggle('is-valid', event.target.checkValidity());
                    event.target.classList.toggle('is-invalid', !event.target.checkValidity());
                }
            });
        });
    });
}

/**
 * Add basic table sorting functionality
 */
function initializeTableSorting() {
    const tables = document.querySelectorAll('table.table');
    
    tables.forEach(function(table) {
        const headers = table.querySelectorAll('th');
        
        headers.forEach(function(header, index) {
            // Skip action columns
            if (header.textContent.toLowerCase().includes('action')) {
                return;
            }
            
            header.style.cursor = 'pointer';
            header.title = 'Click to sort';
            
            header.addEventListener('click', function() {
                sortTable(table, index);
            });
        });
    });
}

/**
 * Sort table by column
 * @param {HTMLTableElement} table - The table to sort
 * @param {number} columnIndex - Index of the column to sort by
 */
function sortTable(table, columnIndex) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // Determine sort direction
    const header = table.querySelectorAll('th')[columnIndex];
    const isAscending = !header.classList.contains('sort-desc');
    
    // Clear previous sort indicators
    table.querySelectorAll('th').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });
    
    // Add sort indicator
    header.classList.add(isAscending ? 'sort-asc' : 'sort-desc');
    
    // Sort rows
    rows.sort(function(a, b) {
        const aText = a.cells[columnIndex].textContent.trim();
        const bText = b.cells[columnIndex].textContent.trim();
        
        // Try to parse as numbers
        const aNum = parseFloat(aText);
        const bNum = parseFloat(bText);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return isAscending ? aNum - bNum : bNum - aNum;
        }
        
        // String comparison
        return isAscending ? 
            aText.localeCompare(bText) : 
            bText.localeCompare(aText);
    });
    
    // Reorder table rows
    rows.forEach(function(row) {
        tbody.appendChild(row);
    });
    
    // Add visual feedback
    showToast('Table sorted successfully', 'success');
}

/**
 * Add loading states to buttons
 */
function initializeLoadingStates() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(function(form) {
        form.addEventListener('submit', function(event) {
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton && form.checkValidity()) {
                // Add loading state
                const originalText = submitButton.innerHTML;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Processing...';
                submitButton.disabled = true;
                
                // Reset button if form submission fails
                setTimeout(function() {
                    if (submitButton.disabled) {
                        submitButton.innerHTML = originalText;
                        submitButton.disabled = false;
                    }
                }, 10000);
            }
        });
    });
}

/**
 * Show toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type of toast (success, error, info, warning)
 */
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <i class="fas fa-${getToastIcon(type)} text-${type} me-2"></i>
                <strong class="me-auto">Notification</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    // Show toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 3000
    });
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

/**
 * Get appropriate icon for toast type
 * @param {string} type - Toast type
 * @returns {string} Font Awesome icon class
 */
function getToastIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

/**
 * Confirm delete action (used in templates)
 * @param {number} studentId - ID of the student to delete
 * @param {string} studentName - Name of the student to delete
 */
function confirmDelete(studentId, studentName) {
    const modal = document.getElementById('deleteModal');
    if (modal) {
        document.getElementById('deleteStudentName').textContent = studentName;
        document.getElementById('deleteForm').action = `/delete_student/${studentId}`;
        
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }
}

/**
 * Handle export button click
 */
function handleExportClick() {
    const exportButton = document.querySelector('a[href*="export_excel"]');
    if (exportButton) {
        exportButton.addEventListener('click', function(event) {
            // Add loading state
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Generating Excel...';
            this.classList.add('disabled');
            
            // Reset button after download
            setTimeout(function() {
                exportButton.innerHTML = originalText;
                exportButton.classList.remove('disabled');
            }, 3000);
        });
    }
}

// Initialize export button handler
document.addEventListener('DOMContentLoaded', handleExportClick);

/**
 * Initialize search functionality with real-time search
 */
function initializeSearch() {
    const searchInput = document.getElementById('search');
    const statusSelect = document.getElementById('status');
    
    if (searchInput || statusSelect) {
        let searchTimeout;
        
        // Real-time search with debounce
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    performSearch();
                }, 500);
            });
        }
        
        // Instant filter on status change
        if (statusSelect) {
            statusSelect.addEventListener('change', function() {
                performSearch();
            });
        }
    }
}

/**
 * Perform search with current parameters
 */
function performSearch() {
    const searchInput = document.getElementById('search');
    const statusSelect = document.getElementById('status');
    
    const searchQuery = searchInput ? searchInput.value.trim() : '';
    const statusFilter = statusSelect ? statusSelect.value : '';
    
    // Build URL with search parameters
    const url = new URL(window.location.origin + '/');
    if (searchQuery) url.searchParams.set('search', searchQuery);
    if (statusFilter) url.searchParams.set('status', statusFilter);
    
    // Navigate to filtered results
    window.location.href = url.toString();
}

/**
 * Clear all filters and search
 */
function clearFilters() {
    window.location.href = '/';
}

// Initialize search functionality
document.addEventListener('DOMContentLoaded', initializeSearch);

/**
 * Keyboard shortcuts
 */
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + N to add new student
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        const addButton = document.querySelector('a[href*="add_student"]');
        if (addButton) {
            window.location.href = addButton.href;
        }
    }
    
    // Escape to go back
    if (event.key === 'Escape') {
        const backButton = document.querySelector('a[href*="index"]');
        if (backButton && window.location.pathname !== '/') {
            window.location.href = backButton.href;
        }
    }
});

/**
 * Print functionality
 */
function printTable() {
    window.print();
}

// Add print button functionality if needed
document.addEventListener('DOMContentLoaded', function() {
    const printButtons = document.querySelectorAll('[data-action="print"]');
    printButtons.forEach(function(button) {
        button.addEventListener('click', printTable);
    });
});

// Performance monitoring
console.log('Student Status Tracker JS loaded successfully');
