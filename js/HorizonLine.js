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

    // Remove the draw() method - rendering is now handled by HorizonLineRenderer

    // ... keep all the dragging methods (isPointInDragArea, startDrag, etc.)

    // Legacy method - keep for backward compatibility but mark as deprecated
    isNearLine(mouseY, tolerance = 10) {
        return this.isPointInDragArea(0, mouseY, tolerance);
    }

    // Standard Draggable Interface Implementation
    isPointInDragArea(mouseX, mouseY, tolerance = 10) {
        return Math.abs(mouseY - this.yAbsolute) <= tolerance;
    }

    startDrag(mouseX, mouseY) {
        if (this.isPointInDragArea(mouseX, mouseY)) {
            this.isBeingDragged = true;
            this.dragOffset = {
                x: 0,
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

    getCursorType() {
        return 'ns-resize';
    }

    setPosition(y, canvasHeight, grid = null) {
        // Apply grid snapping if grid is provided and Y snapping is enabled
        if (grid && grid.snapY) {
            y = Math.round(y / grid.size) * grid.size;
        }

        // Keep within bounds with some margin
        this.yAbsolute = Math.max(20, Math.min(canvasHeight - 20, y));
        this.yRelative = this.yAbsolute / canvasHeight;
    }
}

