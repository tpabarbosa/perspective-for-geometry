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
        const point3DA = PerspectiveUtils.screenToGroundPlane(
            this.pointA.absoluteX,
            this.pointA.absoluteY,
            perspectiveCamera
        );

        const point3DB = PerspectiveUtils.screenToGroundPlane(
            this.pointB.absoluteX,
            this.pointB.absoluteY,
            perspectiveCamera
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
        const distance3D = GeometryUtils.distance3D(point3DA, point3DB);

        if (distance3D < 1) { // Minimum distance threshold
            console.warn("Points A and B are too close in 3D space");
            this.pointC = null;
            return null;
        }

        // Calculate equilateral triangle in 3D space
        const point3DC = PerspectiveUtils.calculateEquilateralTriangle3D(
            point3DA,
            point3DB,
            this.side === 'top' ? 'front' : 'back'
        );

        if (!point3DC) {
            this.pointC = null;
            return null;
        }

        // Project 3D point C back to screen coordinates
        const screenC = PerspectiveUtils.groundPlaneToScreen(
            point3DC.x,
            point3DC.y,
            point3DC.z,
            perspectiveCamera
        );

        if (!screenC) {
            console.warn("Point C is behind camera or cannot be projected");
            this.pointC = null;
            return null;
        }

        // Check if projected point is within reasonable screen bounds
        if (!PerspectiveUtils.isProjectionReasonable(point3DC, perspectiveCamera, canvasWidth, canvasHeight)) {
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

        // Store 3D coordinates
        this.point3DA = point3DA;
        this.point3DB = point3DB;
        this.point3DC = point3DC;

        return this.pointC;
    }

    // Add method to get 3D side lengths for verification
    get3DSideLengths() {
        if (!this.point3DA || !this.point3DB || !this.point3DC) return null;

        const ab = GeometryUtils.distance3D(this.point3DA, this.point3DB);
        const bc = GeometryUtils.distance3D(this.point3DB, this.point3DC);
        const ca = GeometryUtils.distance3D(this.point3DC, this.point3DA);

        return {
            ab: ab.toFixed(1),
            bc: bc.toFixed(1),
            ca: ca.toFixed(1)
        };
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

        const ab = GeometryUtils.distance2D(
            { x: this.pointA.absoluteX, y: this.pointA.absoluteY },
            { x: this.pointB.absoluteX, y: this.pointB.absoluteY }
        );

        const bc = GeometryUtils.distance2D(
            { x: this.pointB.absoluteX, y: this.pointB.absoluteY },
            { x: this.pointC.absoluteX, y: this.pointC.absoluteY }
        );

        const ca = GeometryUtils.distance2D(
            { x: this.pointC.absoluteX, y: this.pointC.absoluteY },
            { x: this.pointA.absoluteX, y: this.pointA.absoluteY }
        );

        return {
            ab: ab.toFixed(1),
            bc: bc.toFixed(1),
            ca: ca.toFixed(1)
        };
    }

    toggleSide() {
        this.side = this.side === 'top' ? 'bottom' : 'top';
    }



    // Check if mouse is inside triangle area for dragging
    isPointInsideTriangle(mouseX, mouseY) {
        if (!this.pointC) return false;

        return GeometryUtils.isPointInsideTriangle(
            { x: mouseX, y: mouseY },
            { x: this.pointA.absoluteX, y: this.pointA.absoluteY },
            { x: this.pointB.absoluteX, y: this.pointB.absoluteY },
            { x: this.pointC.absoluteX, y: this.pointC.absoluteY }
        );
    }

    startDrag(mouseX, mouseY) {
        if (!this.isDraggable || !this.pointC) return false;

        if (this.isPointInsideTriangle(mouseX, mouseY)) {
            this.isBeingDragged = true;

            // Calculate centroid of triangle for drag reference using GeometryUtils
            const centroid = GeometryUtils.centroid3Points(
                { x: this.pointA.absoluteX, y: this.pointA.absoluteY },
                { x: this.pointB.absoluteX, y: this.pointB.absoluteY },
                { x: this.pointC.absoluteX, y: this.pointC.absoluteY }
            );

            this.dragOffset = {
                x: mouseX - centroid.x,
                y: mouseY - centroid.y
            };
            return true;
        }
        return false;
    }

    drag(mouseX, mouseY, canvasWidth, canvasHeight, grid) {
        if (!this.isBeingDragged || !this.pointC) return;

        // Calculate new centroid position
        const newCentroidX = mouseX - this.dragOffset.x;
        const newCentroidY = mouseY - this.dragOffset.y;

        // Calculate current centroid using GeometryUtils
        const currentCentroid = GeometryUtils.centroid3Points(
            { x: this.pointA.absoluteX, y: this.pointA.absoluteY },
            { x: this.pointB.absoluteX, y: this.pointB.absoluteY },
            { x: this.pointC.absoluteX, y: this.pointC.absoluteY }
        );

        // Calculate offset to apply to all points
        const deltaX = newCentroidX - currentCentroid.x;
        const deltaY = newCentroidY - currentCentroid.y;

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
    }

    isDragging() {
        return this.isBeingDragged;
    }

    getCursorType() {
        return this.isDraggable ? 'grab' : 'not-allowed';
    }

}
