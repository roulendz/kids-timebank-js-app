/**
 * @file src/js/services/TimerAnimationService.js
 * Service for handling timer animations and sound effects
 */

export class TimerAnimationService {
    /**
     * Initialize the animation service
     */
    constructor() {
        this.audio = new Audio('/src/audio/cha-ching-7053.mp3');
    }

    /**
     * Animate timer value floating to wallet total
     * @param {string} fromValue - Starting time value
     * @param {string} targetValue - End time value
     * @returns {Promise<void>}
     */
    async animateTimerToWallet() {
        const timer = document.getElementById('timer');
        const targetElement = document.getElementById('todayTotalTimeLeft');
        
        if (!timer || !targetElement) return;

        // Create floating element
        const floatingTimer = timer.cloneNode(true);
        floatingTimer.style.position = 'fixed';
        floatingTimer.style.zIndex = '1000';
        floatingTimer.classList.add('timer-float');
        floatingTimer.style.color = '#22c55e'; // Green color
        
        // Get positions
        const timerRect = timer.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        
        // Set initial position
        floatingTimer.style.left = `${timerRect.left}px`;
        floatingTimer.style.top = `${timerRect.top}px`;
        floatingTimer.style.fontSize = window.getComputedStyle(timer).fontSize;
        
        // Add to DOM
        document.body.appendChild(floatingTimer);
        
        // Trigger animation after a small delay
        await new Promise(resolve => setTimeout(resolve, 50));
        
        floatingTimer.style.left = `${targetRect.left}px`;
        floatingTimer.style.top = `${targetRect.top}px`;
        floatingTimer.style.transform = 'scale(0.5)';
        floatingTimer.style.opacity = '0';

        // Play sound
        try {
            await this.audio.play();
        } catch (error) {
            console.warn('Could not play sound:', error);
        }
        
        // Remove element after animation
        setTimeout(() => {
            floatingTimer.remove();
        }, 1000);
    }

    /**
     * Update the today's total time with new amount
     * @param {string} totalTime - New total time to display
     */
    updateTotalTime(totalTime) {
        const totalElement = document.getElementById('todayTotalTimeLeft');
        if (totalElement) {
            totalElement.textContent = totalTime;
            totalElement.classList.remove('animate-pulse');
            // Force reflow
            void totalElement.offsetWidth;
            totalElement.classList.add('animate-pulse');
        }
    }

    /**
     * Toggle element visibility with animation
     * @param {HTMLElement} element - Element to toggle
     * @param {boolean} show - Whether to show the element
     */
    toggleVisibility(element, show) {
        if (!element) return;
        
        if (show) {
            element.classList.remove('hidden');
            element.classList.remove('fade-out');
            element.classList.add('fade-in');
        } else {
            element.classList.add('fade-out');
            element.classList.remove('fade-in');
            setTimeout(() => {
                element.classList.add('hidden');
            }, 300); // Match the CSS transition duration
        }
    }
}