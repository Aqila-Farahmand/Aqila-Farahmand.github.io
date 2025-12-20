// Mobile Navigation Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.2)';
    } else {
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    }
});

// Active navigation link highlighting
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});


// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.project-card, .skill-category, .stat-item, .hobby-card, .blog-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add typing effect to hero title (optional enhancement)
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Uncomment to enable typing effect
// const heroTitle = document.querySelector('.hero-title');
// if (heroTitle) {
//     const originalText = heroTitle.textContent;
//     typeWriter(heroTitle, originalText, 50);
// }

// Obfuscate email to prevent bot scraping
document.addEventListener('DOMContentLoaded', function() {
    const emailLink = document.getElementById('email-link');
    if (emailLink) {
        // Construct email dynamically to prevent bot scraping
        const emailParts = ['aqila', '.', 'farahmand', '.', 'it', '@', 'gmail', '.', 'com'];
        const email = emailParts.join('');
        emailLink.href = 'mailto:' + email;
    }

    // Blog share functionality
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.dataset.platform;
            const blogCard = this.closest('.blog-card');
            const title = blogCard.querySelector('h3').textContent;
            const url = globalThis.location.href;
            const shareUrl = blogCard.querySelector('.blog-read-more')?.href || url;
            
            let shareLink = '';
            
            switch(platform) {
                case 'linkedin':
                    shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
                    break;
                case 'medium':
                    shareLink = `https://medium.com/m/global-identity?redirectUrl=${encodeURIComponent(shareUrl)}`;
                    break;
                case 'instagram': {
                    // Instagram doesn't support direct URL sharing, so we'll copy to clipboard
                    const instagramText = `${title}\n\n${shareUrl}`;
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(instagramText).then(() => {
                            alert('Blog post title and URL copied to clipboard! You can now paste it in your Instagram post.');
                        });
                    } else {
                        // Fallback: show the URL
                        prompt('Copy this to share on Instagram:', instagramText);
                    }
                    return; // Don't open a new window for Instagram
                }
                default:
                    break;
            }
            
            if (shareLink) {
                window.open(shareLink, '_blank', 'width=600,height=400');
            }
        });
    });
});

// Image Protection
// Disable right-click context menu
document.addEventListener('contextmenu', function(e) {
    if (e.target.classList.contains('profile-photo') || e.target.closest('.image-protection-wrapper')) {
        e.preventDefault();
        return false;
    }
});

// Disable drag and drop
document.addEventListener('dragstart', function(e) {
    if (e.target.classList.contains('profile-photo') || e.target.closest('.image-protection-wrapper')) {
        e.preventDefault();
        return false;
    }
});

// Disable text selection on image
document.addEventListener('selectstart', function(e) {
    if (e.target.classList.contains('profile-photo') || e.target.closest('.image-protection-wrapper')) {
        e.preventDefault();
        return false;
    }
});

// Disable keyboard shortcuts (Ctrl+S, Ctrl+U, etc.)
document.addEventListener('keydown', function(e) {
    // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's')) {
        if (e.target.closest('.image-protection-wrapper') || document.querySelector('.image-protection-wrapper')) {
            e.preventDefault();
            return false;
        }
    }
});

// Blur image when developer tools are detected (basic protection)
let devtoolsOpen = false;
const devtoolsDetector = new Image();
let devtoolsId = 0;
Object.defineProperty(devtoolsDetector, 'id', {
    get: function() {
        devtoolsOpen = true;
        document.querySelectorAll('.profile-photo').forEach(img => {
            img.style.filter = 'blur(10px)';
        });
        return devtoolsId;
    }
});
setInterval(function() {
    devtoolsOpen = false;
    console.log(devtoolsDetector);
    if (devtoolsOpen) {
        document.querySelectorAll('.profile-photo').forEach(img => {
            img.style.filter = 'blur(10px)';
        });
    }
}, 1000);

