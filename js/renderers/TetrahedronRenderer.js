class TetrahedronRenderer extends BaseRenderer {
    render(tetrahedron, options = {}) {
        if (!tetrahedron.pointD || !tetrahedron.triangle.pointC) return;

        const { showEdges = true } = options;

        // Draw drag indicator when being dragged (behind edges)
        if (tetrahedron.isBeingDragged) {
            this.renderDragIndicator(tetrahedron);
        }

        if (showEdges) {
            this.renderTetrahedronEdges(tetrahedron);
        }
    }

    renderTetrahedronEdges(tetrahedron) {
        this.setStyle(tetrahedron.color, null, tetrahedron.lineWidth);
        this.resetLineDash();

        const A = tetrahedron.triangle.pointA;
        const B = tetrahedron.triangle.pointB;
        const C = tetrahedron.triangle.pointC;
        const D = tetrahedron.pointD;

        // Draw edges from D to A, B, C
        this.ctx.beginPath();

        // Edge DA
        this.ctx.moveTo(D.absoluteX, D.absoluteY);
        this.ctx.lineTo(A.absoluteX, A.absoluteY);

        // Edge DB
        this.ctx.moveTo(D.absoluteX, D.absoluteY);
        this.ctx.lineTo(B.absoluteX, B.absoluteY);

        // Edge DC
        this.ctx.moveTo(D.absoluteX, D.absoluteY);
        this.ctx.lineTo(C.absoluteX, C.absoluteY);

        this.ctx.stroke();
    }

    renderDragIndicator(tetrahedron) {
        if (!tetrahedron.pointD) return;

        // Highlight the tetrahedron edges when dragging
        this.setStyle('rgba(255, 102, 0, 0.6)', null, tetrahedron.lineWidth + 2); // More visible when dragging
        this.setLineDash([8, 4]); // Longer dashes for better visibility

        const A = tetrahedron.triangle.pointA;
        const B = tetrahedron.triangle.pointB;
        const C = tetrahedron.triangle.pointC;
        const D = tetrahedron.pointD;

        this.ctx.beginPath();
        this.ctx.moveTo(D.absoluteX, D.absoluteY);
        this.ctx.lineTo(A.absoluteX, A.absoluteY);
        this.ctx.moveTo(D.absoluteX, D.absoluteY);
        this.ctx.lineTo(B.absoluteX, B.absoluteY);
        this.ctx.moveTo(D.absoluteX, D.absoluteY);
        this.ctx.lineTo(C.absoluteX, C.absoluteY);
        this.ctx.stroke();

        this.resetLineDash();

        // Draw a subtle highlight around point D
        this.setStyle(null, 'rgba(255, 102, 0, 0.2)');
        this.drawCircle(D.absoluteX, D.absoluteY, tetrahedron.pointD.radius + 5);
    }
}
