class Point {
    constructor(x, y, label, color = '#ff0000', radius = 6) {
        this.x = x; // Relative position (0-1)
        this.y = y; // Relative position (0-1)
        this.label = label;
        this.color = color;
        this.radius = radius;
        this.absoluteX = 0;
        this.absoluteY = 0;

        // Drag state
        this.isBeingDragged = false;
        this.dragOffset = { x: 0, y: 0 };
    }

    updateAbsolutePosition(canvasWidth, canvasHeight) {
        this.absoluteX = this.x * canvasWidth;
        this.absoluteY = this.y * canvasHeight;
    }

    updateRelativePosition(canvasWidth, canvasHeight) {
        this.x = this.absoluteX / canvasWidth;
        this.y = this.absoluteY / canvasHeight;
    }

    // Remove the draw() method - rendering is now handled by PointRenderer

    // Legacy method - keep for backward compatibility but mark as deprecated
    isPointInside(x, y, tolerance = 5) {
        return this.isPointInDragArea(x, y, tolerance);
    }

    // Standard Draggable Interface Implementation
    isPointInDragArea(mouseX, mouseY, tolerance = 5) {
        const distance = Math.sqrt(
            Math.pow(mouseX - this.absoluteX, 2) +
            Math.pow(mouseY - this.absoluteY, 2)
        );
        return distance <= this.radius + tolerance;
    }

    startDrag(mouseX, mouseY) {
        if (this.isPointInDragArea(mouseX, mouseY)) {
            this.isBeingDragged = true;
            this.dragOffset = {
                x: mouseX - this.absoluteX,
                y: mouseY - this.absoluteY
            };
            return true;
        }
        return false;
    }

    drag(mouseX, mouseY, canvasWidth, canvasHeight, grid) {
        if (!this.isBeingDragged) return;

        const newX = mouseX - this.dragOffset.x;
        const newY = mouseY - this.dragOffset.y;

        this.setPosition(newX, newY, canvasWidth, canvasHeight, grid);
    }

    stopDrag() {
        this.isBeingDragged = false;
        this.dragOffset = { x: 0, y: 0 };
    }

    isDragging() {
        return this.isBeingDragged;
    }

    getCursorType() {
        return 'grab';
    }

    setPosition(x, y, canvasWidth, canvasHeight, gridSettings) {
        // Apply grid snapping
        if (gridSettings.snapX) {
            x = Math.round(x / gridSettings.size) * gridSettings.size;
        }
        if (gridSettings.snapY) {
            y = Math.round(y / gridSettings.size) * gridSettings.size;
        }

        // Keep within bounds
        this.absoluteX = Math.max(this.radius,
            Math.min(canvasWidth - this.radius, x));
        this.absoluteY = Math.max(this.radius,
            Math.min(canvasHeight - this.radius, y));

        this.updateRelativePosition(canvasWidth, canvasHeight);
    }
}

class VanishingPoint extends Point {
    constructor(x, y, label = 'VP', color = '#00ff00') {
        super(x, y, label, color, 8); // Slightly larger radius
        this.isVanishingPoint = true;
    }

    // Remove the draw() method - rendering is now handled by VanishingPointRenderer

    // Override drag method to handle vanishing point constraints
    drag(mouseX, mouseY, canvasWidth, canvasHeight, grid) {
        if (!this.isBeingDragged) return;

        const newX = mouseX - this.dragOffset.x;
        // Keep the same Y position for vanishing point (it moves along horizon)
        const currentY = this.absoluteY;

        this.setPosition(newX, currentY, canvasWidth, canvasHeight, grid);
    }

    // Override setPosition to handle vanishing point constraints
    setPosition(x, y, canvasWidth, canvasHeight, gridSettings) {
        // Vanishing point can only move horizontally along the horizon line
        // Keep the same Y position, only update X
        const currentY = this.absoluteY;

        // Apply grid snapping only to X
        if (gridSettings.snapX) {
            x = Math.round(x / gridSettings.size) * gridSettings.size;
        }

        // Keep within bounds
        this.absoluteX = Math.max(this.radius,
            Math.min(canvasWidth - this.radius, x));
        this.absoluteY = currentY; // Keep Y unchanged

        this.updateRelativePosition(canvasWidth, canvasHeight);
    }
}


