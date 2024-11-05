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
    
    /**
     * Animate time value from total to usage timer
     * @param {HTMLElement} fromElement - Element to animate from
     * @param {HTMLElement} toElement - Element to animate to
     * @param {string} timeValue - Time value to display
     * @returns {Promise<void>}
     */
    async animateTimeToUsage(fromElement, toElement, timeValue) {
        const floatingTime = document.createElement('div');
        floatingTime.className = 'text-2xl font-bold fixed transition-all duration-1000';
        floatingTime.textContent = timeValue;
        
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        
        // Position at start
        floatingTime.style.left = `${fromRect.left}px`;
        floatingTime.style.top = `${fromRect.top}px`;
        
        document.body.appendChild(floatingTime);

        // Start animation
        await new Promise(resolve => setTimeout(resolve, 50));
        
        floatingTime.style.left = `${toRect.left}px`;
        floatingTime.style.top = `${toRect.top}px`;
        floatingTime.style.transform = 'scale(2)'; // Scale up for the larger timer
        
        // Remove after animation
        setTimeout(() => {
            floatingTime.remove();
            toElement.textContent = timeValue;
        }, 1000);
    }

    /**
     * Animate time value from usage timer back to total
     * @param {HTMLElement} fromElement - Element to animate from
     * @param {HTMLElement} toElement - Element to animate to
     * @param {string} timeValue - Time value to display
     * @returns {Promise<void>}
     */
    async animateTimeToTotal(fromElement, toElement, timeValue) {
        const floatingTime = document.createElement('div');
        floatingTime.className = 'text-6xl font-bold fixed transition-all duration-1000';
        floatingTime.textContent = timeValue;
        
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        
        // Position at start
        floatingTime.style.left = `${fromRect.left}px`;
        floatingTime.style.top = `${fromRect.top}px`;
        
        document.body.appendChild(floatingTime);

        // Start animation
        await new Promise(resolve => setTimeout(resolve, 50));
        
        floatingTime.style.left = `${toRect.left}px`;
        floatingTime.style.top = `${toRect.top}px`;
        floatingTime.style.transform = 'scale(0.5)'; // Scale down for the smaller total
        
        // Remove after animation
        setTimeout(() => {
            floatingTime.remove();
            toElement.textContent = timeValue;
        }, 1000);
    }
}