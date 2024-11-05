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
        floatingTimer.style.transition = 'all 1s ease-in-out';
        floatingTimer.style.color = '#22c55e'; // text-green-500
        
        // Get positions
        const timerRect = timer.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        
        // Set initial position
        floatingTimer.style.left = `${timerRect.left}px`;
        floatingTimer.style.top = `${timerRect.top}px`;
        
        // Add to DOM
        document.body.appendChild(floatingTimer);
        
        // Trigger animation after a small delay
        await new Promise(resolve => setTimeout(resolve, 50));
        
        floatingTimer.style.left = `${targetRect.left}px`;
        floatingTimer.style.top = `${targetRect.top}px`;
        floatingTimer.style.transform = 'scale(0.5)';
        floatingTimer.style.opacity = '0';

        // Play sound
        this.audio.play();
        
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
            totalElement.classList.add('animate-pulse');
            setTimeout(() => {
                totalElement.classList.remove('animate-pulse');
            }, 1000);
        }
    }
}