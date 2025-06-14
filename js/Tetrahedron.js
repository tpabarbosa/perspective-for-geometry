class EquilateralTetrahedron {
    constructor(triangle) {
        this.triangle = triangle;
        this.pointD = null;
        this.side = 'above'; // 'above' or 'below' the ground plane
        this.color = '#ff6600';
        this.lineWidth = 2;
        this.showEdges = true;
        this.isDraggable = true;
        this.isBeingDragged = false;
        this.dragOffset = { x: 0, y: 0 };
    }

    // Standard Draggable Interface Implementation
    isPointInDragArea(mouseX, mouseY, threshold = 15) {
        if (!this.isDraggable || !this.pointD || !this.triangle.pointC) return false;
        return this.isPointNearTetrahedron(mouseX, mouseY, threshold);
    }

    calculateVertexD(canvasWidth, canvasHeight, perspectiveCamera) {
        // Need the 3D coordinates of A, B, C
        if (!this.triangle.point3DA || !this.triangle.point3DB || !this.triangle.point3DC) {
            this.pointD = null;
            this.point3DD = null;
            return null;
        }

        // Calculate point D using PerspectiveUtils
        const point3DD = PerspectiveUtils.calculateTetrahedronVertex3D(
            this.triangle.point3DA,
            this.triangle.point3DB,
            this.triangle.point3DC,
            this.side
        );

        if (!point3DD) {
            this.pointD = null;
            this.point3DD = null;
            return null;
        }

        // Project D to screen coordinates
        const screenD = PerspectiveUtils.groundPlaneToScreen(
            point3DD.x,
            point3DD.y,
            point3DD.z,
            perspectiveCamera
        );

        if (!screenD) {
            console.warn("Point D is behind camera or cannot be projected");
            this.pointD = null;
            this.point3DD = null;
            return null;
        }

        // Check if projected point is within reasonable screen bounds
        if (!PerspectiveUtils.isProjectionReasonable(point3DD, perspectiveCamera, canvasWidth, canvasHeight)) {
            console.warn("Point D projects outside reasonable screen bounds");
            this.pointD = null;
            this.point3DD = null;
            return null;
        }

        // Create or update point D
        if (!this.pointD) {
            this.pointD = new Point(0, 0, 'D', '#ff6600', 6);
        }

        this.pointD.absoluteX = Math.max(6, Math.min(canvasWidth - 6, screenD.x));
        this.pointD.absoluteY = Math.max(6, Math.min(canvasHeight - 6, screenD.y));
        this.pointD.updateRelativePosition(canvasWidth, canvasHeight);

        // Store 3D coordinates
        this.point3DD = point3DD;

        return this.pointD;
    }

    get3DEdgeLengths() {
        if (!this.triangle.point3DA || !this.triangle.point3DB ||
            !this.triangle.point3DC || !this.point3DD) return null;

        const A = this.triangle.point3DA;
        const B = this.triangle.point3DB;
        const C = this.triangle.point3DC;
        const D = this.point3DD;

        const ab = GeometryUtils.distance3D(A, B);
        const bc = GeometryUtils.distance3D(B, C);
        const ca = GeometryUtils.distance3D(C, A);
        const da = GeometryUtils.distance3D(D, A);
        const db = GeometryUtils.distance3D(D, B);
        const dc = GeometryUtils.distance3D(D, C);

        return {
            ab: ab.toFixed(1),
            bc: bc.toFixed(1),
            ca: ca.toFixed(1),
            da: da.toFixed(1),
            db: db.toFixed(1),
            dc: dc.toFixed(1)
        };
    }

    toggleSide() {
        this.side = this.side === 'above' ? 'below' : 'above';
    }

    toggleEdges() {
        this.showEdges = !this.showEdges;
    }

    // Check if mouse is near tetrahedron edges for dragging
    isPointNearTetrahedron(mouseX, mouseY, threshold = 15) {
        if (!this.pointD || !this.triangle.pointC) return false;

        const A = this.triangle.pointA;
        const B = this.triangle.pointB;
        const C = this.triangle.pointC;
        const D = this.pointD;

        // Check distance to edges DA, DB, DC using GeometryUtils
        const edges = [
            { start: D, end: A },
            { start: D, end: B },
            { start: D, end: C }
        ];

        for (let edge of edges) {
            const distance = GeometryUtils.distanceToLineSegment(
                { x: mouseX, y: mouseY },
                { x: edge.start.absoluteX, y: edge.start.absoluteY },
                { x: edge.end.absoluteX, y: edge.end.absoluteY }
            );
            if (distance <= threshold) {
                return true;
            }
        }

        return false;
    }

    distanceToLineSegment(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length === 0) return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));

        const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)));
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;

        return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
    }

    startDrag(mouseX, mouseY) {
        if (!this.isDraggable || !this.pointD) return false;

        if (this.isPointNearTetrahedron(mouseX, mouseY)) {
            this.isBeingDragged = true;

            // Calculate centroid of tetrahedron for drag reference using GeometryUtils
            const centroid = GeometryUtils.centroid3Points(
                { x: this.triangle.pointA.absoluteX, y: this.triangle.pointA.absoluteY },
                { x: this.triangle.pointB.absoluteX, y: this.triangle.pointB.absoluteY },
                { x: this.triangle.pointC.absoluteX, y: this.triangle.pointC.absoluteY }
            );

            // Include point D in centroid calculation (4 points)
            const centroidX = (centroid.x * 3 + this.pointD.absoluteX) / 4;
            const centroidY = (centroid.y * 3 + this.pointD.absoluteY) / 4;

            this.dragOffset = {
                x: mouseX - centroidX,
                y: mouseY - centroidY
            };
            return true;
        }
        return false;
    }

    drag(mouseX, mouseY, canvasWidth, canvasHeight, grid) {
        if (!this.isBeingDragged || !this.pointD) return;

        // Calculate new centroid position
        const newCentroidX = mouseX - this.dragOffset.x;
        const newCentroidY = mouseY - this.dragOffset.y;

        // Calculate current centroid using GeometryUtils
        const currentCentroid = GeometryUtils.centroid3Points(
            { x: this.triangle.pointA.absoluteX, y: this.triangle.pointA.absoluteY },
            { x: this.triangle.pointB.absoluteX, y: this.triangle.pointB.absoluteY },
            { x: this.triangle.pointC.absoluteX, y: this.triangle.pointC.absoluteY }
        );

        const currentCentroidX = (currentCentroid.x * 3 + this.pointD.absoluteX) / 4;
        const currentCentroidY = (currentCentroid.y * 3 + this.pointD.absoluteY) / 4;

        // Calculate offset to apply to base triangle points
        const deltaX = newCentroidX - currentCentroidX;
        const deltaY = newCentroidY - currentCentroidY;

        // Move base triangle points
        this.triangle.pointA.setPosition(
            this.triangle.pointA.absoluteX + deltaX,
            this.triangle.pointA.absoluteY + deltaY,
            canvasWidth, canvasHeight, grid
        );

        this.triangle.pointB.setPosition(
            this.triangle.pointB.absoluteX + deltaX,
            this.triangle.pointB.absoluteY + deltaY,
            canvasWidth, canvasHeight, grid
        );

        // Points C and D will be recalculated automatically
    }

    stopDrag() {
        this.isBeingDragged = false;
        this.dragOffset = { x: 0, y: 0 };
    }

    isDragging() {
        return this.isBeingDragged;
    }

    // Convenience method to get cursor type for this draggable
    getCursorType() {
        return this.isDraggable ? 'grab' : 'not-allowed';
    }




}
