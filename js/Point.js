class Point {
    constructor(x, y, label, color = '#ff0000', radius = 6) {
        this.x = x; // Relative position (0-1)
        this.y = y; // Relative position (0-1)
        this.label = label;
        this.color = color;
        this.radius = radius;
        this.absoluteX = 0;
        this.absoluteY = 0;
    }

    // Standardized draggable interface method
    isPointInDragArea(mouseX, mouseY) {
        return this.isPointInside(mouseX, mouseY);
    }

    startDrag(mouseX, mouseY) {
        if (this.isPointInDragArea(mouseX, mouseY)) {
            this.isBeingDragged = true;
            return true;
        }
        return false;
    }

    drag(mouseX, mouseY, canvasWidth, canvasHeight, gridSettings) {
        if (!this.isBeingDragged) return;
        this.setPosition(mouseX, mouseY, canvasWidth, canvasHeight, gridSettings);
    }

    stopDrag() {
        this.isBeingDragged = false;
    }

    updateAbsolutePosition(canvasWidth, canvasHeight) {
        this.absoluteX = this.x * canvasWidth;
        this.absoluteY = this.y * canvasHeight;
    }

    updateRelativePosition(canvasWidth, canvasHeight) {
        this.x = this.absoluteX / canvasWidth;
        this.y = this.absoluteY / canvasHeight;
    }

    isPointInside(x, y, tolerance = 5) {
        // Use GeometryUtils for distance calculation
        const distance = GeometryUtils.distance2D(
            { x: x, y: y },
            { x: this.absoluteX, y: this.absoluteY }
        );
        return distance <= this.radius + tolerance;
    }

    setPosition(x, y, canvasWidth, canvasHeight, gridSettings) {
        // Apply grid snapping
        if (gridSettings.snapX) {
            x = Math.round(x / gridSettings.size) * gridSettings.size;
        }
        if (gridSettings.snapY) {
            y = Math.round(y / gridSettings.size) * gridSettings.size;
        }

        // Keep within bounds using GeometryUtils.clamp
        this.absoluteX = GeometryUtils.clamp(x, this.radius, canvasWidth - this.radius);
        this.absoluteY = GeometryUtils.clamp(y, this.radius, canvasHeight - this.radius);

        this.updateRelativePosition(canvasWidth, canvasHeight);
    }
}

class VanishingPoint extends Point {
    constructor(x, y, label = 'VP', color = '#00ff00') {
        super(x, y, label, color, 8); // Slightly larger radius
        this.isVanishingPoint = true;
    }

    // Override drag to handle horizon line constraint
    drag(mouseX, mouseY, canvasWidth, canvasHeight, gridSettings) {
        if (!this.isBeingDragged) return;
        // Vanishing point can only move horizontally along the horizon line
        this.setPosition(mouseX, this.absoluteY, canvasWidth, canvasHeight, gridSettings);
    }



    setPosition(x, y, canvasWidth, canvasHeight, gridSettings) {
        // Vanishing point can only move horizontally along the horizon line
        // Keep the same Y position, only update X
        const currentY = this.absoluteY;

        // Apply grid snapping only to X
        if (gridSettings.snapX) {
            x = Math.round(x / gridSettings.size) * gridSettings.size;
        }

        // Keep within bounds using GeometryUtils.clamp
        this.absoluteX = GeometryUtils.clamp(x, this.radius, canvasWidth - this.radius);
        this.absoluteY = currentY; // Keep Y unchanged

        this.updateRelativePosition(canvasWidth, canvasHeight);
    }
}
