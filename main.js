// Main JavaScript for LangChain.md Agent Hub
class AgentStore {
    constructor() {
        this.init();
    }

    init() {
        this.setupTypewriter();
        this.setupScrollReveal();
        this.setupStatsCounters();
        this.setupAgentCards();
        this.setupSearch();
        this.setupNavigation();
        this.setupAnimations();
    }

    // Typewriter effect for hero section
    setupTypewriter() {
        const typed = new Typed('#typed-text', {
            strings: [
                'for LLM Agents',
                'for Open Source Builders',
                'for Autonomous Workflows',
                'for Agent SEO'
            ],
            typeSpeed: 80,
            backSpeed: 50,
            backDelay: 2000,
            loop: true,
            showCursor: true,
            cursorChar: '|'
        });
    }

    // Scroll reveal animations
    setupScrollReveal() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.scroll-reveal').forEach(el => {
            observer.observe(el);
        });
    }

    // Animated counters for statistics
    setupStatsCounters() {
        const counters = document.querySelectorAll('.stats-counter');
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString();
            }
        };

        updateCounter();
    }

    // Agent card interactions
    setupAgentCards() {
        const cards = document.querySelectorAll('.agent-card');
        
        cards.forEach(card => {
            // 3D tilt effect on hover
            card.addEventListener('mouseenter', (e) => {
                anime({
                    targets: e.currentTarget,
                    rotateX: -5,
                    rotateY: 5,
                    scale: 1.02,
                    duration: 300,
                    easing: 'easeOutCubic'
                });
            });

            card.addEventListener('mouseleave', (e) => {
                anime({
                    targets: e.currentTarget,
                    rotateX: 0,
                    rotateY: 0,
                    scale: 1,
                    duration: 300,
                    easing: 'easeOutCubic'
                });
            });

            // Mouse move tilt effect
            card.addEventListener('mousemove', (e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;

                e.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });

            // Button interactions
            const button = card.querySelector('.btn-primary');
            if (button) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showAgentDetails(card);
                });
            }
        });
    }

    // Search functionality
    setupSearch() {
        const searchInput = document.querySelector('input[type="text"]');
        if (!searchInput) return;

        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch(e.target.value);
            }, 300);
        });
    }

    performSearch(query) {
        if (query.length < 2) return;

        // Animate search results
        anime({
            targets: '.agent-card',
            opacity: [1, 0.3],
            duration: 200,
            complete: () => {
                // Simulate search results
                setTimeout(() => {
                    anime({
                        targets: '.agent-card',
                        opacity: [0.3, 1],
                        duration: 300
                    });
                }, 500);
            }
        });

        console.log(`Searching for: ${query}`);
    }

    // Navigation interactions
    setupNavigation() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Navigation background on scroll
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            const nav = document.querySelector('nav');
            if (window.scrollY > 100) {
                nav.classList.add('shadow-lg');
            } else {
                nav.classList.remove('shadow-lg');
            }
            lastScrollY = window.scrollY;
        });
    }

    // Additional animations
    setupAnimations() {
        // Stagger animation for agent cards on load
        anime({
            targets: '.agent-card',
            translateY: [50, 0],
            opacity: [0, 1],
            delay: anime.stagger(100),
            duration: 800,
            easing: 'easeOutCubic'
        });

        // Floating animation for hero image
        anime({
            targets: '.floating-element',
            translateY: [-10, 10],
            duration: 3000,
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutSine'
        });

        // Gradient text animation
        this.animateGradientText();
    }

    animateGradientText() {
        const gradientTexts = document.querySelectorAll('.gradient-text');
        
        gradientTexts.forEach(text => {
            text.addEventListener('mouseenter', () => {
                anime({
                    targets: text,
                    backgroundPosition: ['0% 50%', '100% 50%'],
                    duration: 1000,
                    easing: 'easeInOutQuad'
                });
            });
        });
    }

    // Show agent details modal
    showAgentDetails(card) {
        const agentName = card.querySelector('h3').textContent;
        const agentDescription = card.querySelector('p').textContent;
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 transform scale-95 opacity-0 transition-all duration-300">
                <div class="flex justify-between items-start mb-6">
                    <h2 class="text-3xl font-bold gradient-text">${agentName}</h2>
                    <button class="text-gray-400 hover:text-gray-600 text-2xl" onclick="this.closest('.fixed').remove()">&times;</button>
                </div>
                <p class="text-gray-600 mb-6">${agentDescription}</p>
                <div class="space-y-4">
                    <div>
                        <h3 class="font-semibold mb-2">Installation</h3>
                        <div class="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                            pip install ${agentName.toLowerCase().replace(/\s+/g, '-')}
                        </div>
                    </div>
                    <div>
                        <h3 class="font-semibold mb-2">Quick Start</h3>
                        <div class="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                            from ${agentName.toLowerCase().replace(/\s+/g, '_')} import Agent<br>
                            agent = Agent()<br>
                            agent.run()
                        </div>
                    </div>
                </div>
                <div class="flex space-x-4 mt-8">
                    <button class="btn-primary flex-1">View Full Documentation</button>
                    <button class="btn-secondary flex-1">Try in Playground</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Animate modal in
        setTimeout(() => {
            modal.querySelector('.bg-white').classList.remove('scale-95', 'opacity-0');
            modal.querySelector('.bg-white').classList.add('scale-100', 'opacity-100');
        }, 10);

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Utility method to show notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Enhanced button interactions
class ButtonEffects {
    static init() {
        document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
            button.addEventListener('mouseenter', ButtonEffects.createRipple);
            button.addEventListener('click', ButtonEffects.handleClick);
        });
    }

    static createRipple(e) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }

    static handleClick(e) {
        const button = e.currentTarget;
        
        // Create click animation
        anime({
            targets: button,
            scale: [1, 0.95, 1],
            duration: 200,
            easing: 'easeOutCubic'
        });

        // Handle different button actions
        const text = button.textContent.trim();
        if (text.includes('Explore Agents') || text.includes('View All Agents')) {
            window.location.href = 'agents.html';
        } else if (text.includes('View Details')) {
            e.preventDefault();
            agentStore.showNotification('Agent details coming soon!', 'info');
        } else if (text.includes('Watch Demo')) {
            e.preventDefault();
            agentStore.showNotification('Demo video coming soon!', 'info');
        } else if (text.includes('Submit Agent')) {
            e.preventDefault();
            agentStore.showNotification('Agent submission coming soon!', 'info');
        }
    }
}

// Search enhancement
class SearchEnhancement {
    constructor() {
        this.setupSearchSuggestions();
    }

    setupSearchSuggestions() {
        const searchInput = document.querySelector('input[type="text"]');
        if (!searchInput) return;

        const suggestions = [
            'ReAct Agent', 'Multi-Agent System', 'Code Analysis', 'Data Science',
            'Social Media', 'Email Assistant', 'Research Agent', 'Automation'
        ];

        let suggestionIndex = 0;
        let isDeleting = false;

        const animatePlaceholder = () => {
            const currentSuggestion = suggestions[suggestionIndex];
            
            if (isDeleting) {
                searchInput.placeholder = currentSuggestion.substring(0, searchInput.placeholder.length - 1);
            } else {
                searchInput.placeholder = currentSuggestion.substring(0, searchInput.placeholder.length + 1);
            }

            if (!isDeleting && searchInput.placeholder === currentSuggestion) {
                setTimeout(() => isDeleting = true, 2000);
            } else if (isDeleting && searchInput.placeholder === '') {
                isDeleting = false;
                suggestionIndex = (suggestionIndex + 1) % suggestions.length;
            }

            setTimeout(animatePlaceholder, isDeleting ? 50 : 100);
        };

        // Start animation after a delay
        setTimeout(animatePlaceholder, 2000);

        // Focus effects
        searchInput.addEventListener('focus', () => {
            anime({
                targets: searchInput,
                scale: [1, 1.02],
                duration: 200,
                easing: 'easeOutCubic'
            });
        });

        searchInput.addEventListener('blur', () => {
            anime({
                targets: searchInput,
                scale: [1.02, 1],
                duration: 200,
                easing: 'easeOutCubic'
            });
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Initialize main application
    window.agentStore = new AgentStore();
    ButtonEffects.init();
    new SearchEnhancement();

    // Add smooth page transitions
    document.body.style.opacity = '0';
    anime({
        targets: document.body,
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutCubic'
    });
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AgentStore, ButtonEffects, SearchEnhancement };
}
