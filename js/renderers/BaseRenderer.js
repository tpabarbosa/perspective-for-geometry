// Base renderer interface that all renderers should implement
class BaseRenderer {
    constructor(ctx) {
        this.ctx = ctx;
    }

    // Main render method - must be implemented by subclasses
    render(object, options = {}) {
        throw new Error('render() method must be implemented by subclass');
    }

    // Helper methods for common drawing operations
    setStyle(strokeColor, fillColor, lineWidth = 1) {
        if (strokeColor) {
            this.ctx.strokeStyle = strokeColor;
        }
        if (fillColor) {
            this.ctx.fillStyle = fillColor;
        }
        this.ctx.lineWidth = lineWidth;
    }

    setLineDash(dashArray = []) {
        this.ctx.setLineDash(dashArray);
    }

    resetLineDash() {
        this.ctx.setLineDash([]);
    }

    drawText(text, x, y, font = '12px Arial', color = '#000000') {
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.fillText(text, x, y);
    }

    drawCircle(x, y, radius, fill = true, stroke = true) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        if (fill) this.ctx.fill();
        if (stroke) this.ctx.stroke();
    }

    drawRect(x, y, width, height, fill = true, stroke = true) {
        if (fill) this.ctx.fillRect(x, y, width, height);
        if (stroke) this.ctx.strokeRect(x, y, width, height);
    }

    drawLine(x1, y1, x2, y2) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }
}
