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

    updateAbsolutePosition(canvasWidth, canvasHeight) {
        this.absoluteX = this.x * canvasWidth;
        this.absoluteY = this.y * canvasHeight;
    }

    updateRelativePosition(canvasWidth, canvasHeight) {
        this.x = this.absoluteX / canvasWidth;
        this.y = this.absoluteY / canvasHeight;
    }

    draw(ctx, showCoordinates = false) {
        ctx.beginPath();
        ctx.arc(this.absoluteX, this.absoluteY, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw label
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        ctx.fillText(this.label, this.absoluteX + 10, this.absoluteY - 10);

        // Show coordinates when requested
        if (showCoordinates) {
            ctx.fillStyle = '#666666';
            ctx.font = '12px Arial';
            ctx.fillText(
                `(${Math.round(this.absoluteX)}, ${Math.round(this.absoluteY)})`,
                this.absoluteX + 10,
                this.absoluteY + 20
            );
        }
    }

    isPointInside(x, y, tolerance = 5) {
        const distance = Math.sqrt(
            Math.pow(x - this.absoluteX, 2) +
            Math.pow(y - this.absoluteY, 2)
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

    draw(ctx, showCoordinates = false) {
        // Draw a square instead of circle for vanishing point
        ctx.fillStyle = this.color;
        ctx.fillRect(this.absoluteX - this.radius, this.absoluteY - this.radius,
                     this.radius * 2, this.radius * 2);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.absoluteX - this.radius, this.absoluteY - this.radius,
                       this.radius * 2, this.radius * 2);

        // Draw label
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        ctx.fillText(this.label, this.absoluteX + 12, this.absoluteY - 12);

        // Show coordinates when requested
        if (showCoordinates) {
            ctx.fillStyle = '#666666';
            ctx.font = '12px Arial';
            ctx.fillText(
                `(${Math.round(this.absoluteX)}, ${Math.round(this.absoluteY)})`,
                this.absoluteX + 12,
                this.absoluteY + 25
            );
        }
    }

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
