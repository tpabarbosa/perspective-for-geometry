class HorizonLine {
    constructor(yPosition = 0.4) { // Default at 40% from top
        this.yRelative = yPosition;
        this.yAbsolute = 0;
        this.color = '#ff6600';
        this.lineWidth = 2;
        this.isDashed = true;

        // Drag state
        this.isBeingDragged = false;
        this.dragOffset = { x: 0, y: 0 };
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

    // Legacy method - keep for backward compatibility but mark as deprecated
    isNearLine(mouseY, tolerance = 10) {
        return this.isPointInDragArea(0, mouseY, tolerance);
    }

    // Standard Draggable Interface Implementation
    isPointInDragArea(mouseX, mouseY, tolerance = 10) {
        // For horizon line, we only care about Y distance (it's a horizontal line)
        return Math.abs(mouseY - this.yAbsolute) <= tolerance;
    }

    startDrag(mouseX, mouseY) {
        if (this.isPointInDragArea(mouseX, mouseY)) {
            this.isBeingDragged = true;
            this.dragOffset = {
                x: 0, // X offset not needed for horizontal line
                y: mouseY - this.yAbsolute
            };
            return true;
        }
        return false;
    }

    drag(mouseX, mouseY, canvasWidth, canvasHeight, grid) {
        if (!this.isBeingDragged) return;

        const newY = mouseY - this.dragOffset.y;
        this.setPosition(newY, canvasHeight, grid);
    }

    stopDrag() {
        this.isBeingDragged = false;
        this.dragOffset = { x: 0, y: 0 };
    }

    isDragging() {
        return this.isBeingDragged;
    }

    // Enhanced setPosition method to handle grid snapping
    setPosition(y, canvasHeight, grid = null) {
        // Apply grid snapping if grid is provided and Y snapping is enabled
        if (grid && grid.snapY) {
            y = Math.round(y / grid.size) * grid.size;
        }

        // Keep within bounds with some margin
        this.yAbsolute = Math.max(20, Math.min(canvasHeight - 20, y));
        this.yRelative = this.yAbsolute / canvasHeight;
    }

    // Convenience method to get cursor type for this draggable
    getCursorType() {
        return 'ns-resize'; // North-south resize cursor for horizontal line
    }
}
