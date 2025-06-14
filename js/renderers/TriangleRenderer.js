class TriangleRenderer extends BaseRenderer {
    render(triangle, options = {}) {
        if (!triangle.pointC) return;

        const {
            showConstructionLines = false,
            showCircumcircle = false
        } = options;

        // Draw drag indicator first (behind triangle) when being dragged
        if (triangle.isBeingDragged) {
            this.renderDragIndicator(triangle);
        }

        // Draw circumcircle independently if enabled
        if (showCircumcircle) {
            this.renderCircumcircle(triangle);
        }

        // Draw triangle sides
        this.setStyle(triangle.color, null, triangle.lineWidth);
        this.resetLineDash();

        this.ctx.beginPath();
        // Side AB
        this.ctx.moveTo(triangle.pointA.absoluteX, triangle.pointA.absoluteY);
        this.ctx.lineTo(triangle.pointB.absoluteX, triangle.pointB.absoluteY);
        // Side BC
        this.ctx.lineTo(triangle.pointC.absoluteX, triangle.pointC.absoluteY);
        // Side CA
        this.ctx.lineTo(triangle.pointA.absoluteX, triangle.pointA.absoluteY);
        this.ctx.stroke();

        // Draw construction lines if enabled (separate from circumcircle)
        if (showConstructionLines) {
            this.renderConstructionLines(triangle);
        }
    }

    renderDragIndicator(triangle) {
        if (!triangle.pointC || !triangle.isDraggable) return;

        // Draw a subtle fill to indicate draggable area
        this.ctx.fillStyle = 'rgba(153, 50, 204, 0.15)'; // Semi-transparent purple, slightly more visible when dragging
        this.ctx.beginPath();
        this.ctx.moveTo(triangle.pointA.absoluteX, triangle.pointA.absoluteY);
        this.ctx.lineTo(triangle.pointB.absoluteX, triangle.pointB.absoluteY);
        this.ctx.lineTo(triangle.pointC.absoluteX, triangle.pointC.absoluteY);
        this.ctx.closePath();
        this.ctx.fill();

        // Draw dashed outline to show it's being dragged
        this.setStyle('rgba(153, 50, 204, 0.8)', null, triangle.lineWidth + 1);
        this.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(triangle.pointA.absoluteX, triangle.pointA.absoluteY);
        this.ctx.lineTo(triangle.pointB.absoluteX, triangle.pointB.absoluteY);
        this.ctx.lineTo(triangle.pointC.absoluteX, triangle.pointC.absoluteY);
        this.ctx.closePath();
        this.ctx.stroke();
        this.resetLineDash();
    }

    renderConstructionLines(triangle) {
        this.ctx.save(); // Save current context state

        // Draw different types of construction lines
        this.renderPerpendicularBisectorConstruction(triangle);
        this.renderAltitudeConstruction(triangle);

        this.ctx.restore(); // Restore context state
    }

    renderPerpendicularBisectorConstruction(triangle) {
        // Use GeometryUtils for midpoint calculation
        const midpoint = GeometryUtils.midpoint2D(
            { x: triangle.pointA.absoluteX, y: triangle.pointA.absoluteY },
            { x: triangle.pointB.absoluteX, y: triangle.pointB.absoluteY }
        );

        // Draw midpoint
        this.setStyle(null, '#888888');
        this.drawCircle(midpoint.x, midpoint.y, 3);

        // Label midpoint
        this.drawText('M', midpoint.x + 8, midpoint.y - 8, '12px Arial', '#666666');

        // Draw line from midpoint to point C (perpendicular bisector)
        this.setStyle('#888888', null, 1);
        this.drawLine(midpoint.x, midpoint.y, triangle.pointC.absoluteX, triangle.pointC.absoluteY);

        // Show the perpendicular symbol at midpoint
        this.renderPerpendicularSymbol(midpoint.x, midpoint.y,
            triangle.pointB.absoluteX - triangle.pointA.absoluteX,
            triangle.pointB.absoluteY - triangle.pointA.absoluteY);
    }

    renderPerpendicularSymbol(x, y, dirX, dirY, size = 8) {
        // Normalize direction vector
        const length = Math.sqrt(dirX * dirX + dirY * dirY);
        if (length === 0) return;

        const normX = dirX / length;
        const normY = dirY / length;

        // Perpendicular vector
        const perpX = -normY;
        const perpY = normX;

        // Draw small perpendicular symbol
        this.setStyle('#888888', null, 1);
        this.ctx.beginPath();

        // Small square indicating perpendicular
        const halfSize = size / 2;
        this.ctx.moveTo(x + normX * halfSize, y + normY * halfSize);
        this.ctx.lineTo(x + normX * halfSize + perpX * halfSize, y + normY * halfSize + perpY * halfSize);
        this.ctx.lineTo(x + perpX * halfSize, y + perpY * halfSize);
        this.ctx.stroke();
    }

    renderAltitudeConstruction(triangle) {
        if (!triangle.pointC) return;

        // Use GeometryUtils for perpendicular foot calculation
        const foot = GeometryUtils.perpendicularFoot(
            { x: triangle.pointC.absoluteX, y: triangle.pointC.absoluteY },
            { x: triangle.pointA.absoluteX, y: triangle.pointA.absoluteY },
            { x: triangle.pointB.absoluteX, y: triangle.pointB.absoluteY }
        );

        if (foot) {
            // Draw altitude line
            this.setStyle('#999999', null, 1);
            this.setLineDash([2, 4]);
            this.drawLine(triangle.pointC.absoluteX, triangle.pointC.absoluteY, foot.x, foot.y);
            this.resetLineDash();

            // Draw foot point
            this.setStyle(null, '#999999');
            this.drawCircle(foot.x, foot.y, 2);

            // Show perpendicular symbol at foot
            this.renderPerpendicularSymbol(foot.x, foot.y,
                triangle.pointB.absoluteX - triangle.pointA.absoluteX,
                triangle.pointB.absoluteY - triangle.pointA.absoluteY, 6);
        }
    }

    renderCircumcircle(triangle) {
        if (!triangle.pointC) return;

        this.ctx.save(); // Save context state

        // Use GeometryUtils for circumcenter calculation
        const circumcenter = GeometryUtils.calculateCircumcenter(
            { x: triangle.pointA.absoluteX, y: triangle.pointA.absoluteY },
            { x: triangle.pointB.absoluteX, y: triangle.pointB.absoluteY },
            { x: triangle.pointC.absoluteX, y: triangle.pointC.absoluteY }
        );

        if (!circumcenter) {
            this.ctx.restore();
            return;
        }

        // Draw circumcircle (dashed)
        this.setStyle('#4CAF50', null, 1.5); // Green color for better visibility
        this.setLineDash([8, 4]); // Longer dashes for better visibility
        this.drawCircle(circumcenter.x, circumcenter.y, circumcenter.radius, false, true);

        // Draw circumcenter
        this.setStyle('#2E7D32', '#4CAF50', 1); // Darker green border
        this.resetLineDash();
        this.drawCircle(circumcenter.x, circumcenter.y, 3);

        // Label circumcenter
        this.drawText('O', circumcenter.x + 8, circumcenter.y - 8, '14px Arial', '#2E7D32');

        // Show radius measurement
        this.drawText(`r = ${circumcenter.radius.toFixed(1)}px`,
                     circumcenter.x + 8, circumcenter.y + 20, '11px Arial', '#666666');

        this.ctx.restore(); // Restore context state
    }

    getPerpendicularFoot(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = dx * dx + dy * dy;

        if (length === 0) return null;

        const t = ((px - x1) * dx + (py - y1) * dy) / length;

        return {
            x: x1 + t * dx,
            y: y1 + t * dy
        };
    }

    calculateCircumcenter(triangle) {
        if (!triangle.pointC) return null;

        const ax = triangle.pointA.absoluteX;
        const ay = triangle.pointA.absoluteY;
        const bx = triangle.pointB.absoluteX;
        const by = triangle.pointB.absoluteY;
        const cx = triangle.pointC.absoluteX;
        const cy = triangle.pointC.absoluteY;

        const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
        if (Math.abs(d) < 0.001) return null; // Points are collinear

        const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
        const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;

        const radius = Math.sqrt((ux - ax) * (ux - ax) + (uy - ay) * (uy - ay));

        return { x: ux, y: uy, radius: radius };
    }
}
