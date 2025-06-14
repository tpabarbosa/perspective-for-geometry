class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const container = this.canvas.parentElement;
        const maxWidth = Math.min(window.innerWidth - 40, 1200);
        const maxHeight = window.innerHeight - 400;
        const minWidth = 400;
        const minHeight = 300;

        let canvasWidth = Math.max(minWidth, Math.min(maxWidth, container.getBoundingClientRect().width - 40));
        let canvasHeight = Math.max(minHeight, Math.min(maxHeight, canvasWidth * 0.75));

        if (canvasHeight === maxHeight) {
            canvasWidth = Math.min(canvasWidth, canvasHeight / 0.75);
        }

        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;

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
