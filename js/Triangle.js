class EquilateralTriangle {
    constructor(pointA, pointB, side = 'top') {
        this.pointA = pointA;
        this.pointB = pointB;
        this.side = side;
        this.pointC = null;
        this.color = '#9932cc';
        this.lineWidth = 2;
        this.showConstructionLines = false;
        this.showCircumcircle = false;
        this.isDraggable = true;
        this.isBeingDragged = false;
        this.dragOffset = { x: 0, y: 0 };

        // Store 3D coordinates
        this.point3DA = null;
        this.point3DB = null;
        this.point3DC = null;
    }

    // Standard Draggable Interface Implementation
    isPointInDragArea(mouseX, mouseY) {
        if (!this.isDraggable || !this.pointC) return false;
        return this.isPointInsideTriangle(mouseX, mouseY);
    }

    calculateVertexC(canvasWidth, canvasHeight, vanishingPoint, perspectiveCamera) {
        // Convert screen points A and B to 3D ground plane coordinates
        const point3DA = perspectiveCamera.screenToGroundPlane(
            this.pointA.absoluteX,
            this.pointA.absoluteY
        );

        const point3DB = perspectiveCamera.screenToGroundPlane(
            this.pointB.absoluteX,
            this.pointB.absoluteY
        );

        if (!point3DA || !point3DB) {
            // Clear point C if projection fails
            this.pointC = null;
            this.point3DA = null;
            this.point3DB = null;
            this.point3DC = null;
            return null;
        }

        // Check if points are too close (would create degenerate triangle)
        const distance3D = Math.sqrt(
            Math.pow(point3DB.x - point3DA.x, 2) +
            Math.pow(point3DB.z - point3DA.z, 2)
        );

        if (distance3D < 1) { // Minimum distance threshold
            console.warn("Points A and B are too close in 3D space");
            this.pointC = null;
            return null;
        }

        // Calculate equilateral triangle in 3D space
        const point3DC = perspectiveCamera.calculateEquilateralTriangle3D(
            point3DA,
            point3DB,
            this.side === 'top' ? 'front' : 'back'
        );

        // Project 3D point C back to screen coordinates
        const screenC = perspectiveCamera.groundPlaneToScreen(
            point3DC.x,
            point3DC.y,
            point3DC.z
        );

        if (!screenC) {
            console.warn("Point C is behind camera or cannot be projected");
            this.pointC = null;
            return null;
        }

        // Check if projected point is within reasonable screen bounds
        if (screenC.x < -100 || screenC.x > canvasWidth + 100 ||
            screenC.y < -100 || screenC.y > canvasHeight + 100) {
            console.warn("Point C projects outside reasonable screen bounds");
            this.pointC = null;
            return null;
        }

        // Create or update point C
        if (!this.pointC) {
            this.pointC = new Point(0, 0, 'C', '#9932cc', 6);
        }

        this.pointC.absoluteX = Math.max(6, Math.min(canvasWidth - 6, screenC.x));
        this.pointC.absoluteY = Math.max(6, Math.min(canvasHeight - 6, screenC.y));
        this.pointC.updateRelativePosition(canvasWidth, canvasHeight);

        // Store 3D coordinates for debugging
        this.point3DA = point3DA;
        this.point3DB = point3DB;
        this.point3DC = point3DC;

        return this.pointC;
    }

    // Add method to get 3D side lengths for verification
    get3DSideLengths() {
        if (!this.point3DA || !this.point3DB || !this.point3DC) return null;

        const ab = Math.sqrt(
            Math.pow(this.point3DB.x - this.point3DA.x, 2) +
            Math.pow(this.point3DB.z - this.point3DA.z, 2)
        );

        const bc = Math.sqrt(
            Math.pow(this.point3DC.x - this.point3DB.x, 2) +
            Math.pow(this.point3DC.z - this.point3DB.z, 2)
        );

        const ca = Math.sqrt(
            Math.pow(this.point3DA.x - this.point3DC.x, 2) +
            Math.pow(this.point3DA.z - this.point3DC.z, 2)
        );

        return {
            ab: ab.toFixed(1),
            bc: bc.toFixed(1),
            ca: ca.toFixed(1)
        };
    }


    // Enhanced draw method with drag indicator
    draw(ctx) {
        if (!this.pointC) return;

        // Draw drag indicator first (behind triangle) when being dragged
        if (this.isBeingDragged) {
            this.drawDragIndicator(ctx);
        }

        // Draw circumcircle independently if enabled
        if (this.showCircumcircle) {
            this.drawCircleConstruction(ctx);
        }

        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.setLineDash([]);

        // Draw triangle sides
        ctx.beginPath();

        // Side AB
        ctx.moveTo(this.pointA.absoluteX, this.pointA.absoluteY);
        ctx.lineTo(this.pointB.absoluteX, this.pointB.absoluteY);

        // Side BC
        ctx.lineTo(this.pointC.absoluteX, this.pointC.absoluteY);

        // Side CA
        ctx.lineTo(this.pointA.absoluteX, this.pointA.absoluteY);

        ctx.stroke();

        // Draw construction lines if enabled (separate from circumcircle)
        if (this.showConstructionLines) {
            this.drawConstructionLines(ctx);
        }
    }

    // Update drawConstructionLines to NOT include circumcircle
    drawConstructionLines(ctx) {
        if (!this.showConstructionLines || !this.pointC) return;

        ctx.save(); // Save current context state

        // Draw different types of construction lines (but NOT circumcircle)
        this.drawPerpendicularBisectorConstruction(ctx);
        this.drawAltitudeConstruction(ctx);

        ctx.restore(); // Restore context state
    }

    // Keep drawCircleConstruction as a separate method
    drawCircleConstruction(ctx) {
        if (!this.pointC) return;

        ctx.save(); // Save context state

        // Calculate the circumcenter and circumradius
        const circumcenter = this.calculateCircumcenter();
        if (!circumcenter) {
            ctx.restore();
            return;
        }

        // Draw circumcircle (dashed)
        ctx.strokeStyle = '#4CAF50'; // Green color for better visibility
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 4]); // Longer dashes for better visibility
        ctx.beginPath();
        ctx.arc(circumcenter.x, circumcenter.y, circumcenter.radius, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw circumcenter
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(circumcenter.x, circumcenter.y, 3, 0, 2 * Math.PI); // Slightly larger
        ctx.fill();

        // Add border to circumcenter
        ctx.strokeStyle = '#2E7D32'; // Darker green
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(circumcenter.x, circumcenter.y, 3, 0, 2 * Math.PI);
        ctx.stroke();

        // Label circumcenter
        ctx.fillStyle = '#2E7D32';
        ctx.font = '14px Arial';
        ctx.fontWeight = 'bold';
        ctx.fillText('O', circumcenter.x + 8, circumcenter.y - 8);

        // Show radius measurement
        ctx.fillStyle = '#666666';
        ctx.font = '11px Arial';
        ctx.fontWeight = 'normal';
        ctx.fillText(`r = ${circumcenter.radius.toFixed(1)}px`, circumcenter.x + 8, circumcenter.y + 20);

        ctx.restore(); // Restore context state
    }



    drawConstructionLines(ctx) {
        if (!this.showConstructionLines || !this.pointC) return;

        ctx.save(); // Save current context state

        // Draw different types of construction lines
        this.drawPerpendicularBisectorConstruction(ctx);
        this.drawAltitudeConstruction(ctx);

        // Optionally show circumcircle
        if (this.showCircumcircle) {
            this.drawCircleConstruction(ctx);
        }

        ctx.restore(); // Restore context state
    }

    drawPerpendicularBisectorConstruction(ctx) {
        // Show the midpoint of AB
        const midpointX = (this.pointA.absoluteX + this.pointB.absoluteX) / 2;
        const midpointY = (this.pointA.absoluteY + this.pointB.absoluteY) / 2;

        // Draw midpoint
        ctx.fillStyle = '#888888';
        ctx.beginPath();
        ctx.arc(midpointX, midpointY, 3, 0, 2 * Math.PI);
        ctx.fill();

        // Label midpoint
        ctx.fillStyle = '#666666';
        ctx.font = '12px Arial';
        ctx.fillText('M', midpointX + 8, midpointY - 8);

        // Draw line from midpoint to point C (perpendicular bisector)
        ctx.strokeStyle = '#888888';
        ctx.beginPath();
        ctx.moveTo(midpointX, midpointY);
        ctx.lineTo(this.pointC.absoluteX, this.pointC.absoluteY);
        ctx.stroke();

        // Show the perpendicular symbol at midpoint
        this.drawPerpendicularSymbol(ctx, midpointX, midpointY,
            this.pointB.absoluteX - this.pointA.absoluteX,
            this.pointB.absoluteY - this.pointA.absoluteY);
    }

    drawPerpendicularSymbol(ctx, x, y, dirX, dirY, size = 8) {
        // Normalize direction vector
        const length = Math.sqrt(dirX * dirX + dirY * dirY);
        if (length === 0) return;

        const normX = dirX / length;
        const normY = dirY / length;

        // Perpendicular vector
        const perpX = -normY;
        const perpY = normX;

        // Draw small perpendicular symbol
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 1;
        ctx.beginPath();

        // Small square indicating perpendicular
        const halfSize = size / 2;
        ctx.moveTo(x + normX * halfSize, y + normY * halfSize);
        ctx.lineTo(x + normX * halfSize + perpX * halfSize, y + normY * halfSize + perpY * halfSize);
        ctx.lineTo(x + perpX * halfSize, y + perpY * halfSize);
        ctx.stroke();
    }

    drawVanishingPointConstruction(ctx) {
        // This shows how the triangle relates to the vanishing point
        // Draw construction lines that would be used in perspective construction

        // Get vanishing point from the app (we'll need to pass this in)
        // For now, we'll add this as a parameter to the draw method
    }

    drawCircleConstruction(ctx) {
        if (!this.pointC) return;

        // Calculate the circumcenter and circumradius
        const circumcenter = this.calculateCircumcenter();
        if (!circumcenter) return;

        // Draw circumcircle (dashed)
        ctx.strokeStyle = '#aaaaaa';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(circumcenter.x, circumcenter.y, circumcenter.radius, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw circumcenter
        ctx.fillStyle = '#aaaaaa';
        ctx.beginPath();
        ctx.arc(circumcenter.x, circumcenter.y, 2, 0, 2 * Math.PI);
        ctx.fill();

        // Label circumcenter
        ctx.fillStyle = '#666666';
        ctx.font = '12px Arial';
        ctx.fillText('O', circumcenter.x + 8, circumcenter.y - 8);
    }

    drawAltitudeConstruction(ctx) {
        if (!this.pointC) return;

        // Draw altitude from C to AB
        const foot = this.getPerpendicularFoot(
            this.pointC.absoluteX, this.pointC.absoluteY,
            this.pointA.absoluteX, this.pointA.absoluteY,
            this.pointB.absoluteX, this.pointB.absoluteY
        );

        if (foot) {
            // Draw altitude line
            ctx.strokeStyle = '#999999';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 4]);
            ctx.beginPath();
            ctx.moveTo(this.pointC.absoluteX, this.pointC.absoluteY);
            ctx.lineTo(foot.x, foot.y);
            ctx.stroke();

            // Draw foot point
            ctx.fillStyle = '#999999';
            ctx.beginPath();
            ctx.arc(foot.x, foot.y, 2, 0, 2 * Math.PI);
            ctx.fill();

            // Show perpendicular symbol at foot
            this.drawPerpendicularSymbol(ctx, foot.x, foot.y,
                this.pointB.absoluteX - this.pointA.absoluteX,
                this.pointB.absoluteY - this.pointA.absoluteY, 6);
        }
    }

    calculateCircumcenter() {
        if (!this.pointC) return null;

        const ax = this.pointA.absoluteX;
        const ay = this.pointA.absoluteY;
        const bx = this.pointB.absoluteX;
        const by = this.pointB.absoluteY;
        const cx = this.pointC.absoluteX;
        const cy = this.pointC.absoluteY;

        const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
        if (Math.abs(d) < 0.001) return null; // Points are collinear

        const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
        const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;

        const radius = Math.sqrt((ux - ax) * (ux - ax) + (uy - ay) * (uy - ay));

        return { x: ux, y: uy, radius: radius };
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

    getSideLengths() {
        if (!this.pointC) return null;

        const ab = Math.sqrt(
            Math.pow(this.pointB.absoluteX - this.pointA.absoluteX, 2) +
            Math.pow(this.pointB.absoluteY - this.pointA.absoluteY, 2)
        );

        const bc = Math.sqrt(
            Math.pow(this.pointC.absoluteX - this.pointB.absoluteX, 2) +
            Math.pow(this.pointC.absoluteY - this.pointB.absoluteY, 2)
        );

        const ca = Math.sqrt(
            Math.pow(this.pointA.absoluteX - this.pointC.absoluteX, 2) +
            Math.pow(this.pointA.absoluteY - this.pointC.absoluteY, 2)
        );

        return { ab: ab.toFixed(1), bc: bc.toFixed(1), ca: ca.toFixed(1) };
    }

    toggleSide() {
        this.side = this.side === 'top' ? 'bottom' : 'top';
    }

    // Override point C drawing to show it's calculated/fixed
    drawPointC(ctx, showCoordinates = false) {
        if (!this.pointC) return;

        // Draw point C with a different style to indicate it's not draggable
        ctx.beginPath();
        ctx.arc(this.pointC.absoluteX, this.pointC.absoluteY, this.pointC.radius, 0, 2 * Math.PI);

        // Use a pattern or different fill to show it's calculated
        ctx.fillStyle = this.pointC.color;
        ctx.fill();

        // Add a border pattern to indicate it's not draggable
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]); // Dashed border
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw label with indication it's calculated
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        ctx.fillText(this.pointC.label + ' (calc)', this.pointC.absoluteX + 10, this.pointC.absoluteY - 10);

        // Show coordinates when requested
        if (showCoordinates) {
            ctx.fillStyle = '#666666';
            ctx.font = '12px Arial';
            ctx.fillText(
                `(${Math.round(this.pointC.absoluteX)}, ${Math.round(this.pointC.absoluteY)})`,
                this.pointC.absoluteX + 10,
                this.pointC.absoluteY + 20
            );
        }
    }

    // Check if mouse is inside triangle area for dragging
    isPointInsideTriangle(mouseX, mouseY) {
        if (!this.pointC) return false;

        // Use barycentric coordinates to check if point is inside triangle
        const A = this.pointA;
        const B = this.pointB;
        const C = this.pointC;

        const denom = (B.absoluteY - C.absoluteY) * (A.absoluteX - C.absoluteX) +
                     (C.absoluteX - B.absoluteX) * (A.absoluteY - C.absoluteY);

        if (Math.abs(denom) < 0.001) return false; // Degenerate triangle

        const a = ((B.absoluteY - C.absoluteY) * (mouseX - C.absoluteX) +
                  (C.absoluteX - B.absoluteX) * (mouseY - C.absoluteY)) / denom;
        const b = ((C.absoluteY - A.absoluteY) * (mouseX - C.absoluteX) +
                  (A.absoluteX - C.absoluteX) * (mouseY - C.absoluteY)) / denom;
        const c = 1 - a - b;

        return a >= 0 && b >= 0 && c >= 0;
    }

    startDrag(mouseX, mouseY) {
        if (!this.isPointInDragArea(mouseX, mouseY)) return false;

        this.isBeingDragged = true;

        // Calculate centroid of triangle for drag reference
        const centroidX = (this.pointA.absoluteX + this.pointB.absoluteX + this.pointC.absoluteX) / 3;
        const centroidY = (this.pointA.absoluteY + this.pointB.absoluteY + this.pointC.absoluteY) / 3;

        this.dragOffset = {
            x: mouseX - centroidX,
            y: mouseY - centroidY
        };
        return true;
    }

    drag(mouseX, mouseY, canvasWidth, canvasHeight, grid) {
        if (!this.isBeingDragged || !this.pointC) return;

        // Calculate new centroid position
        const newCentroidX = mouseX - this.dragOffset.x;
        const newCentroidY = mouseY - this.dragOffset.y;

        // Calculate current centroid
        const currentCentroidX = (this.pointA.absoluteX + this.pointB.absoluteX + this.pointC.absoluteX) / 3;
        const currentCentroidY = (this.pointA.absoluteY + this.pointB.absoluteY + this.pointC.absoluteY) / 3;

        // Calculate offset to apply to all points
        const deltaX = newCentroidX - currentCentroidX;
        const deltaY = newCentroidY - currentCentroidY;

        // Move all points by the same offset
        this.pointA.setPosition(
            this.pointA.absoluteX + deltaX,
            this.pointA.absoluteY + deltaY,
            canvasWidth, canvasHeight, grid
        );

        this.pointB.setPosition(
            this.pointB.absoluteX + deltaX,
            this.pointB.absoluteY + deltaY,
            canvasWidth, canvasHeight, grid
        );

        // Point C will be recalculated automatically
    }

    stopDrag() {
        this.isBeingDragged = false;
        this.dragOffset = { x: 0, y: 0 };
    }

    isDragging() {
        return this.isBeingDragged;
    }

    getCursorType() {
        return this.isDraggable ? 'grab' : 'not-allowed';
    }

    // Add visual feedback when triangle is draggable
    drawDragIndicator(ctx) {
        if (!this.pointC || !this.isDraggable) return;

        // Draw a subtle fill to indicate draggable area
        ctx.fillStyle = 'rgba(153, 50, 204, 0.15)'; // Semi-transparent purple, slightly more visible when dragging
        ctx.beginPath();
        ctx.moveTo(this.pointA.absoluteX, this.pointA.absoluteY);
        ctx.lineTo(this.pointB.absoluteX, this.pointB.absoluteY);
        ctx.lineTo(this.pointC.absoluteX, this.pointC.absoluteY);
        ctx.closePath();
        ctx.fill();

        // Draw dashed outline to show it's being dragged
        ctx.strokeStyle = 'rgba(153, 50, 204, 0.8)';
        ctx.lineWidth = this.lineWidth + 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(this.pointA.absoluteX, this.pointA.absoluteY);
        ctx.lineTo(this.pointB.absoluteX, this.pointB.absoluteY);
        ctx.lineTo(this.pointC.absoluteX, this.pointC.absoluteY);
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
    }
}
