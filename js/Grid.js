class Grid {
    constructor() {
        this.size = 50;
        this.snapX = false;
        this.snapY = false;
        this.show = true;
        this.showCoordinates = false;
    }

    draw(ctx, canvasWidth, canvasHeight) {
        if (!this.show) return;

        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;

        // Vertical lines
        for (let x = 0; x <= canvasWidth; x += this.size) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasHeight);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= canvasHeight; y += this.size) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvasWidth, y);
            ctx.stroke();
        }

        // Draw grid coordinates at intersections
        if (this.size >= 40 && this.showCoordinates) {
            ctx.fillStyle = '#cccccc';
            ctx.font = '10px Arial';
            for (let x = this.size; x < canvasWidth; x += this.size) {
                for (let y = this.size; y < canvasHeight; y += this.size) {
                    ctx.fillText(`${x},${y}`, x + 2, y - 2);
                }
            }
        }
    }

    setSize(size) {
        this.size = Math.max(10, Math.min(100, size));
    }
}
