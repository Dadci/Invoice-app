// Animation variants for Framer Motion
export const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.4 }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.2 }
    }
};

export const slideUp = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
            duration: 0.3
        }
    },
    exit: {
        y: 20,
        opacity: 0,
        transition: { duration: 0.2 }
    }
};

export const slideIn = {
    hidden: { x: -20, opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 30
        }
    },
    exit: {
        x: -20,
        opacity: 0,
        transition: { duration: 0.2 }
    }
};

export const scaleIn = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 30
        }
    },
    exit: {
        scale: 0.95,
        opacity: 0,
        transition: { duration: 0.2 }
    }
};

export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.07,
            delayChildren: 0.1
        }
    },
    exit: {
        opacity: 0,
        transition: {
            staggerChildren: 0.05,
            staggerDirection: -1
        }
    }
};

export const listItem = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 25
        }
    },
    exit: {
        y: 20,
        opacity: 0,
        transition: { duration: 0.15 }
    }
};

// Animation classes for CSS transitions
export const transitionClasses = {
    fadeIn: 'transition-opacity duration-300 ease-in-out',
    slideUp: 'transition-transform duration-300 ease-out transform hover:-translate-y-1',
    scale: 'transition-transform duration-200 ease-out transform hover:scale-105',
    pulse: 'transition-all duration-300 hover:shadow-md hover:brightness-105',
    glow: 'transition-all duration-300 hover:shadow-glow',
};

// Custom keyframe animations
export const keyframes = {
    shimmer: `@keyframes shimmer {
    0% {
      background-position: -468px 0;
    }
    100% {
      background-position: 468px 0;
    }
  }`,
    float: `@keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0px);
    }
  }`,
    bounce: `@keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }`,
    fadeInUp: `@keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }`,
};

// Add these keyframes to the document style
export const injectKeyframes = () => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = Object.values(keyframes).join('\n');
    document.getElementsByTagName('head')[0].appendChild(style);
};

// Apply animation to element
export const applyAnimation = (element, animationName, duration = '1s', delay = '0s', iterations = '1', fillMode = 'forwards') => {
    if (element) {
        element.style.animation = `${animationName} ${duration} ${delay} ${iterations} ${fillMode}`;
    }
};

// Utility function to add hover animations to elements
export const addHoverAnimations = () => {
    // Apply hover effects to invoice items
    const invoiceItems = document.querySelectorAll('.invoice-item');
    invoiceItems.forEach(item => {
        item.classList.add('transition-all', 'duration-300');
        item.addEventListener('mouseenter', () => {
            item.classList.add('transform', 'translate-x-1', 'shadow-md');
        });
        item.addEventListener('mouseleave', () => {
            item.classList.remove('transform', 'translate-x-1', 'shadow-md');
        });
    });

    // Apply hover effects to buttons
    const buttons = document.querySelectorAll('button:not(.no-hover)');
    buttons.forEach(button => {
        button.classList.add('transition-all', 'duration-200');
    });
}; 