class HorizonLine {
    constructor(yPosition = 0.4) { // Default at 40% from top
        this.yRelative = yPosition;
        this.yAbsolute = 0;
        this.color = '#ff6600';
        this.lineWidth = 2;
        this.isDashed = true;
    }

    updateAbsolutePosition(canvasHeight) {
        this.yAbsolute = this.yRelative * canvasHeight;
    }

    draw(ctx, canvasWidth) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;

        if (this.isDashed) {
            ctx.setLineDash([10, 5]);
        } else {
            ctx.setLineDash([]);
        }

        ctx.beginPath();
        ctx.moveTo(0, this.yAbsolute);
        ctx.lineTo(canvasWidth, this.yAbsolute);
        ctx.stroke();

        // Reset line dash
        ctx.setLineDash([]);

        // Draw label
        ctx.fillStyle = this.color;
        ctx.font = '14px Arial';
        ctx.fillText('Horizon Line', 10, this.yAbsolute - 10);
    }

    setPosition(y, canvasHeight) {
        this.yAbsolute = Math.max(20, Math.min(canvasHeight - 20, y));
        this.yRelative = this.yAbsolute / canvasHeight;
    }

    isNearLine(mouseY, tolerance = 10) {
        return Math.abs(mouseY - this.yAbsolute) <= tolerance;
    }
}
