// Slide management
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const navDots = document.querySelectorAll('.nav-dot');
const progressBar = document.querySelector('.progress-bar');
const slideCounter = document.getElementById('current-slide');
const totalSlides = slides.length;

// Initialize
function init() {
    updateSlide(0);
    initializeAnimations();
    setupEventListeners();
    
    // Trigger animation for the first slide
    setTimeout(() => {
        animateSlideContent(slides[0]);
    }, 200);
}

// Update active slide
function updateSlide(index) {
    // Remove active class from all slides and dots
    slides.forEach(slide => slide.classList.remove('active'));
    navDots.forEach(dot => dot.classList.remove('active'));
    
    // Add active class to current slide and dot
    slides[index].classList.add('active');
    navDots[index].classList.add('active');
    
    // Update progress bar
    const progress = ((index + 1) / totalSlides) * 100;
    progressBar.style.width = progress + '%';
    
    // Update slide counter
    slideCounter.textContent = index + 1;
    
    currentSlide = index;
}

// Navigate to specific slide
function goToSlide(index) {
    if (index >= 0 && index < totalSlides) {
        updateSlide(index);
        slides[index].scrollIntoView({ behavior: 'smooth' });
        
        // Trigger animations after scroll
        setTimeout(() => {
            animateSlideContent(slides[index]);
        }, 300);
    }
}

// Navigate to next slide
function nextSlide() {
    if (currentSlide < totalSlides - 1) {
        goToSlide(currentSlide + 1);
    }
}

// Navigate to previous slide
function prevSlide() {
    if (currentSlide > 0) {
        goToSlide(currentSlide - 1);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation dots click
    navDots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            nextSlide();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            prevSlide();
        }
    });
    
    // Scroll detection
    let isScrolling = false;
    const slidesContainer = document.querySelector('.slides-container');
    
    slidesContainer.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                const scrollPosition = slidesContainer.scrollTop;
                const slideHeight = window.innerHeight;
                const newSlideIndex = Math.round(scrollPosition / slideHeight);
                
                if (newSlideIndex !== currentSlide && newSlideIndex >= 0 && newSlideIndex < totalSlides) {
                    updateSlide(newSlideIndex);
                }
                
                isScrolling = false;
            });
            isScrolling = true;
        }
    });
    
    // Share button
    const shareButton = document.querySelector('.share-button');
    shareButton.addEventListener('click', async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Chevrolet Uzbekistan 2025 Strategy',
                    text: 'Омниканальная стратегия с измеримыми результатами',
                    url: window.location.href + '#slide-' + currentSlide
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            // Fallback - copy link to clipboard
            const url = window.location.href + '#slide-' + currentSlide;
            navigator.clipboard.writeText(url).then(() => {
                alert('Ссылка скопирована в буфер обмена');
            });
        }
    });
    
    // Handle initial hash
    if (window.location.hash) {
        const slideId = window.location.hash.replace('#slide-', '');
        const slideIndex = parseInt(slideId);
        if (!isNaN(slideIndex) && slideIndex >= 0 && slideIndex < totalSlides) {
            setTimeout(() => goToSlide(slideIndex), 100);
        }
    }
}

// Initialize animations
function initializeAnimations() {
    // Set up intersection observer for slide animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };
    
    const slideObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const slideIndex = Array.from(slides).indexOf(entry.target);
                updateSlide(slideIndex);
                
                // Ensure animations run after slide is active
                setTimeout(() => {
                    animateSlideContent(entry.target);
                }, 100);
            }
        });
    }, observerOptions);
    
    slides.forEach(slide => slideObserver.observe(slide));
}

// Animate content within slide
function animateSlideContent(slide) {
    // Initialize Lucide icons for this slide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Animate numbers
    const metrics = slide.querySelectorAll('.metric-value[data-value]');
    metrics.forEach(metric => {
        const endValue = parseFloat(metric.getAttribute('data-value'));
        const duration = 1000; // 1 second
        const startTime = Date.now();
        const startValue = 0;
        
        function updateNumber() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = startValue + (endValue - startValue) * easeOutQuart;
            
            if (endValue % 1 === 0) {
                metric.textContent = Math.round(currentValue).toLocaleString();
            } else {
                metric.textContent = currentValue.toFixed(1);
            }
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        }
        
        updateNumber();
    });
    
    // Animate channel bars only if slide is active
    if (slide.classList.contains('active')) {
        const channelBars = slide.querySelectorAll('.channel-bar');
        channelBars.forEach((bar, index) => {
            // Store original width
            const originalWidth = bar.style.width || bar.getAttribute('data-width');
            if (!bar.getAttribute('data-width')) {
                bar.setAttribute('data-width', originalWidth);
            }
            
            // Reset for animation
            bar.style.transition = 'none';
            bar.style.width = '0';
            
            // Force browser to apply the change
            void bar.offsetWidth;
            
            // Animate to original width
            requestAnimationFrame(() => {
                setTimeout(() => {
                    bar.style.transition = 'width 1s ease-out';
                    bar.style.width = originalWidth;
                }, 100 + index * 150);
            });
        });
    }
    
    // Animate optimization bars
    const optBars = slide.querySelectorAll('.opt-bar');
    optBars.forEach((bar, index) => {
        const height = bar.style.height;
        bar.style.height = '0';
        bar.style.transition = 'none';
        
        // Force reflow
        bar.offsetHeight;
        
        setTimeout(() => {
            bar.style.transition = 'height 1s ease-out';
            bar.style.height = height;
        }, 400 + index * 150);
    });
    
    // Fade in elements with delay
    const elements = slide.querySelectorAll('h2, h3, p, ul, .info-card, .research-list-item');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
        el.style.transition = 'all 300ms ease-out';
        
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

// Touch support for mobile
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            nextSlide();
        } else {
            prevSlide();
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);