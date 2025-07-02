// Variables for cursor position and the circle
 let cursor = document.getElementById('cursor');
 let cursorX = 0, cursorY = 0;
 let targetX = 0, targetY = 0;
 let easing = 0.1; // Determines how slow the cursor effect is

 // Function to update the cursor position
 function updateCursor() {
     // Apply easing to the cursor movement
     cursorX += (targetX - cursorX) * easing;
     cursorY += (targetY - cursorY) * easing;

     // Update the cursor circle position
     cursor.style.left = `${cursorX}px`;
     cursor.style.top = `${cursorY}px`;

     // Request the next animation frame
     requestAnimationFrame(updateCursor);
 }

 // Listen for mouse movements
 document.addEventListener('mousemove', (e) => {
     targetX = e.clientX;
     targetY = e.clientY;
 });

 // Initialize the cursor movement
 updateCursor();

 // Hide the cursor when mouse leaves and show it when mouse enters
 document.addEventListener('mouseleave', () => {
     document.body.classList.add('no-cursor');
 });

 document.addEventListener('mouseenter', () => {
     document.body.classList.remove('no-cursor');
 });

// ===== Notice Modal Functions =====

// In maintenance mode, the notice is always shown
function showNotice() {
    const overlay = document.getElementById('notice-overlay');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Disable closing in maintenance mode
function closeNotice() {
    // In maintenance mode, prevent closing the notice
    if (document.body.classList.contains('maintenance-mode')) {
        return;
    }
    
    const overlay = document.getElementById('notice-overlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Maintenance mode initialization
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're in maintenance mode
    if (document.body.classList.contains('maintenance-mode')) {
        // Ensure notice is always visible
        const overlay = document.getElementById('notice-overlay');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Disable escape key and click outside functionality
        return;
    }
    
    // Normal mode functionality (when not in maintenance)
    const overlay = document.getElementById('notice-overlay');
    const card = document.querySelector('.notice-card');
    
    // Close modal when clicking outside the card
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeNotice();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeNotice();
        }
    });
    
    // Close button functionality
    const closeButton = document.querySelector('.notice-close');
    if (closeButton) {
        closeButton.addEventListener('click', closeNotice);
    }
});