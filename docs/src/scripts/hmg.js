  // Get all required elements
  const hamburgerMenu = document.querySelector('.hamburger-menu');
  const sidebar = document.querySelector('.sidebar');
  const closeBtn = document.querySelector('.close-btn');
  const overlay = document.querySelector('.sidebar-overlay');
  
  // Toggle sidebar when hamburger menu is clicked
  hamburgerMenu.addEventListener('click', function() {
    sidebar.style.left = '0';
    overlay.style.display = 'block';
    this.classList.add('active');
  });
  
  // Close sidebar when X button is clicked
  closeBtn.addEventListener('click', function() {
    sidebar.style.left = '-300px';
    overlay.style.display = 'none';
    hamburgerMenu.classList.remove('active');
  });
  
  // Close sidebar when clicking on the overlay
  overlay.addEventListener('click', function() {
    sidebar.style.left = '-300px';
    this.style.display = 'none';
    hamburgerMenu.classList.remove('active');
  });
  
  // Close sidebar when clicking on any menu link (optional)
  const sidebarLinks = document.querySelectorAll('.sidebar-content a');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', function() {
      sidebar.style.left = '-300px';
      overlay.style.display = 'none';
      hamburgerMenu.classList.remove('active');
    });
  });
