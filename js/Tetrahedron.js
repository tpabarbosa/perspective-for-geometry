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

        const A = this.triangle.point3DA;
        const B = this.triangle.point3DB;
        const C = this.triangle.point3DC;

        // Calculate the centroid of triangle ABC
        const centroidX = (A.x + B.x + C.x) / 3;
        const centroidY = (A.y + B.y + C.y) / 3;
        const centroidZ = (A.z + B.z + C.z) / 3;

        // Calculate edge length (should be same for all edges in equilateral triangle)
        const edgeLength = Math.sqrt(
            Math.pow(B.x - A.x, 2) +
            Math.pow(B.y - A.y, 2) +
            Math.pow(B.z - A.z, 2)
        );

        // Height of tetrahedron from base to apex
        // For regular tetrahedron: h = edge_length * sqrt(2/3)
        const tetrahedronHeight = edgeLength * Math.sqrt(2/3);

        // Normal vector to the plane ABC (pointing up from ground plane)
        // Since ABC is on ground plane (y = 0), normal is simply (0, 1, 0)
        const normalX = 0;
        const normalY = this.side === 'above' ? 1 : -1;
        const normalZ = 0;

        // Calculate point D
        const point3DD = {
            x: centroidX + normalX * tetrahedronHeight,
            y: centroidY + normalY * tetrahedronHeight,
            z: centroidZ + normalZ * tetrahedronHeight
        };

        // Project D to screen coordinates
        const screenD = perspectiveCamera.groundPlaneToScreen(
            point3DD.x,
            point3DD.y,
            point3DD.z
        );

        if (!screenD) {
            console.warn("Point D is behind camera or cannot be projected");
            this.pointD = null;
            this.point3DD = null;
            return null;
        }

        // Check if projected point is within reasonable screen bounds
        if (screenD.x < -200 || screenD.x > canvasWidth + 200 ||
            screenD.y < -200 || screenD.y > canvasHeight + 200) {
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

        const ab = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2) + Math.pow(B.z - A.z, 2));
        const bc = Math.sqrt(Math.pow(C.x - B.x, 2) + Math.pow(C.y - B.y, 2) + Math.pow(C.z - B.z, 2));
        const ca = Math.sqrt(Math.pow(A.x - C.x, 2) + Math.pow(A.y - C.y, 2) + Math.pow(A.z - C.z, 2));
        const da = Math.sqrt(Math.pow(A.x - D.x, 2) + Math.pow(A.y - D.y, 2) + Math.pow(A.z - D.z, 2));
        const db = Math.sqrt(Math.pow(B.x - D.x, 2) + Math.pow(B.y - D.y, 2) + Math.pow(B.z - D.z, 2));
        const dc = Math.sqrt(Math.pow(C.x - D.x, 2) + Math.pow(C.y - D.y, 2) + Math.pow(C.z - D.z, 2));

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

        // Check distance to edges DA, DB, DC
        const edges = [
            { start: D, end: A },
            { start: D, end: B },
            { start: D, end: C }
        ];

        for (let edge of edges) {
            const distance = this.distanceToLineSegment(
                mouseX, mouseY,
                edge.start.absoluteX, edge.start.absoluteY,
                edge.end.absoluteX, edge.end.absoluteY
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
        if (!this.isPointInDragArea(mouseX, mouseY)) return false;

        this.isBeingDragged = true;

        // Calculate centroid of tetrahedron for drag reference
        const centroidX = (this.triangle.pointA.absoluteX + this.triangle.pointB.absoluteX +
                         this.triangle.pointC.absoluteX + this.pointD.absoluteX) / 4;
        const centroidY = (this.triangle.pointA.absoluteY + this.triangle.pointB.absoluteY +
                         this.triangle.pointC.absoluteY + this.pointD.absoluteY) / 4;

        this.dragOffset = {
            x: mouseX - centroidX,
            y: mouseY - centroidY
        };
        return true;
    }

    drag(mouseX, mouseY, canvasWidth, canvasHeight, grid) {
        if (!this.isBeingDragged || !this.pointD) return;

        // Calculate new centroid position
        const newCentroidX = mouseX - this.dragOffset.x;
        const newCentroidY = mouseY - this.dragOffset.y;

        // Calculate current centroid
        const currentCentroidX = (this.triangle.pointA.absoluteX + this.triangle.pointB.absoluteX +
                                this.triangle.pointC.absoluteX + this.pointD.absoluteX) / 4;
        const currentCentroidY = (this.triangle.pointA.absoluteY + this.triangle.pointB.absoluteY +
                                this.triangle.pointC.absoluteY + this.pointD.absoluteY) / 4;

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
