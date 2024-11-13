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