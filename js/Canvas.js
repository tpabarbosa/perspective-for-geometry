class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resizeTimeout = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Debounced resize handler
        const debouncedResize = () => {
            if (this.resizeTimeout) {
                clearTimeout(this.resizeTimeout);
            }

            this.resizeTimeout = setTimeout(() => {
                console.log('Executing debounced resize');
                this.resize();

                // Trigger app resize if available
                if (window.geometryApp && window.geometryApp.resize) {
                    window.geometryApp.resize();
                }
            }, 150); // 150ms delay
        };

        window.addEventListener('resize', debouncedResize);
        window.addEventListener('orientationchange', () => {
            // Orientation change needs longer delay
            setTimeout(debouncedResize, 300);
        });
    }

    resize() {
        const container = this.canvas.parentElement;
        const maxWidth = Math.min(window.innerWidth - 40, 1200);
        const maxHeight = window.innerHeight - 400;
        const minWidth = 400;
        const minHeight = 300;

        // Mobile canvas size limits
        const mobileMaxWidth = 4096;  // iOS Safari limit
        const mobileMaxHeight = 4096;

        let canvasWidth = Math.max(minWidth, Math.min(maxWidth, container.getBoundingClientRect().width - 40));
        let canvasHeight = Math.max(minHeight, Math.min(maxHeight, canvasWidth * 0.75));

        // Apply mobile limits
        canvasWidth = Math.min(canvasWidth, mobileMaxWidth);
        canvasHeight = Math.min(canvasHeight, mobileMaxHeight);

        if (canvasHeight === maxHeight) {
            canvasWidth = Math.min(canvasWidth, canvasHeight / 0.75);
        }

        // Validate canvas dimensions
        if (canvasWidth <= 0 || canvasHeight <= 0) {
            console.warn('Invalid canvas dimensions, using fallback');
            canvasWidth = 800;
            canvasHeight = 600;
        }

        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;

        // Force canvas to be visible
        this.canvas.style.display = 'block';
        this.canvas.style.visibility = 'visible';

        return { width: canvasWidth, height: canvasHeight };
    }


    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    getMousePosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
}
