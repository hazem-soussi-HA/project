// Quantum Goose Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌊 Quantum Goose Navigator loaded successfully!');
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add quantum animation to cards
    const cards = document.querySelectorAll('.quantum-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'h':
                case 'H':
                    e.preventDefault();
                    window.location.href = '/';
                    break;
                case 'r':
                case 'R':
                    e.preventDefault();
                    window.location.href = '/quantum-goose-app/';
                    break;
                case 's':
                case 'S':
                    e.preventDefault();
                    window.location.href = '/quantum-goose-app/services/';
                    break;
                case '/':
                    e.preventDefault();
                    toggleSidebar();
                    break;
            }
        }
    });
    
    // Sidebar toggle function
    function toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('active');
        }
    }
});
