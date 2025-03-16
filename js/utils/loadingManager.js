/**
 * ORGANIX Neural Interface - Loading Manager
 * 
 * Manages the loading screen and progress display during application initialization.
 * Provides a smooth, user-friendly loading experience with progress updates.
 */

export class LoadingManager {
    constructor(loadingScreenSelector) {
        // Get loading screen element
        this.loadingScreen = document.querySelector(loadingScreenSelector);
        
        // Get progress elements
        this.progressBar = this.loadingScreen.querySelector('.progress-fill');
        this.progressText = this.loadingScreen.querySelector('.progress-text');
        
        // Set initial state
        this.isVisible = true;
        this.currentProgress = 0;
        
        // Animation frame ID for smooth progress transitions
        this.animationFrameId = null;
        
        console.log('Loading Manager initialized');
    }
    
    /**
     * Show the loading screen with an optional message
     * @param {string} [message] - Message to display
     */
    show(message) {
        // Set visibility
        this.isVisible = true;
        
        // Reset progress
        this.currentProgress = 0;
        this.updateProgressBar(0);
        
        // Set message if provided
        if (message) {
            this.progressText.textContent = message;
        }
        
        // Show the loading screen
        this.loadingScreen.style.opacity = '1';
        this.loadingScreen.style.pointerEvents = 'auto';
    }
    
    /**
     * Hide the loading screen with a smooth fade-out
     */
    hide() {
        // Set visibility
        this.isVisible = false;
        
        // Cancel any ongoing progress animation
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Fade out the loading screen
        this.loadingScreen.style.opacity = '0';
        
        // Disable pointer events after fade-out
        setTimeout(() => {
            if (!this.isVisible) {
                this.loadingScreen.style.pointerEvents = 'none';
            }
        }, 500); // Match the transition duration in CSS
    }
    
    /**
     * Update the loading progress
     * @param {number} progress - Progress value (0-100)
     * @param {string} [message] - Optional message to display
     */
    updateProgress(progress, message) {
        // Validate progress value
        progress = Math.max(0, Math.min(100, progress));
        
        // Set target progress value
        const targetProgress = progress;
        
        // Cancel any ongoing animation
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Animate progress from current to target
        this.animateProgress(this.currentProgress, targetProgress);
        
        // Update current progress
        this.currentProgress = targetProgress;
        
        // Update message if provided
        if (message) {
            this.progressText.textContent = message;
        }
    }
    
    /**
     * Animate progress bar from start to end value
     * @param {number} start - Start progress value
     * @param {number} end - End progress value
     */
    animateProgress(start, end) {
        // Animation parameters
        const duration = 500; // ms
        const startTime = performance.now();
        
        // Animation function
        const animate = (currentTime) => {
            // Calculate elapsed time
            const elapsed = currentTime - startTime;
            
            // Calculate progress (0-1)
            let t = Math.min(elapsed / duration, 1);
            
            // Apply easing function (ease-out cubic)
            t = 1 - Math.pow(1 - t, 3);
            
            // Calculate current progress value
            const currentProgress = start + (end - start) * t;
            
            // Update progress bar
            this.updateProgressBar(currentProgress);
            
            // Continue animation if not complete
            if (t < 1) {
                this.animationFrameId = requestAnimationFrame(animate);
            } else {
                this.animationFrameId = null;
            }
        };
        
        // Start animation
        this.animationFrameId = requestAnimationFrame(animate);
    }
    
    /**
     * Update the progress bar width
     * @param {number} progress - Progress value (0-100)
     */
    updateProgressBar(progress) {
        this.progressBar.style.width = `${progress}%`;
    }
    
    /**
     * Show an error message on the loading screen
     * @param {string} errorMessage - Error message to display
     */
    showError(errorMessage) {
        // Show loading screen if not already visible
        if (!this.isVisible) {
            this.show();
        }
        
        // Set progress to 100%
        this.updateProgressBar(100);
        
        // Add error class to progress bar
        this.progressBar.classList.add('error');
        
        // Set error message
        this.progressText.textContent = errorMessage;
        this.progressText.classList.add('error');
        
        // Add retry button if not already present
        if (!this.loadingScreen.querySelector('.retry-button')) {
            const retryButton = document.createElement('button');
            retryButton.className = 'retry-button';
            retryButton.textContent = 'Retry';
            retryButton.addEventListener('click', () => {
                // Reload the page
                window.location.reload();
            });
            
            // Add to loading content
            this.loadingScreen.querySelector('.loading-content').appendChild(retryButton);
        }
    }
    
    /**
     * Show a warning message without stopping the loading process
     * @param {string} warningMessage - Warning message to display
     * @param {number} [duration=3000] - Duration to show the warning (ms)
     */
    showWarning(warningMessage, duration = 3000) {
        // Store current message
        const currentMessage = this.progressText.textContent;
        
        // Create warning element
        const warningElement = document.createElement('div');
        warningElement.className = 'loading-warning';
        warningElement.textContent = warningMessage;
        
        // Add to loading screen
        this.loadingScreen.querySelector('.loading-content').appendChild(warningElement);
        
        // Show warning
        setTimeout(() => {
            warningElement.style.opacity = '1';
        }, 10);
        
        // Remove after duration
        setTimeout(() => {
            warningElement.style.opacity = '0';
            
            // Remove element after fade-out
            setTimeout(() => {
                warningElement.remove();
            }, 300);
        }, duration);
    }
}
