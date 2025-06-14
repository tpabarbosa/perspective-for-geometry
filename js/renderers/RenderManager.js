class RenderManager {
    constructor(ctx) {
        this.ctx = ctx;

        // Initialize all renderers
        this.pointRenderer = new PointRenderer(ctx);
        this.vanishingPointRenderer = new VanishingPointRenderer(ctx);
        this.gridRenderer = new GridRenderer(ctx);
        this.horizonLineRenderer = new HorizonLineRenderer(ctx);
        this.triangleRenderer = new TriangleRenderer(ctx);
        this.tetrahedronRenderer = new TetrahedronRenderer(ctx);
    }

    // Clear the canvas
    clear(canvasWidth, canvasHeight) {
        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    }

    // Render grid
    renderGrid(grid, canvasWidth, canvasHeight) {
        this.gridRenderer.render(grid, { canvasWidth, canvasHeight });
    }

    // Render horizon line
    renderHorizonLine(horizonLine, canvasWidth) {
        this.horizonLineRenderer.render(horizonLine, { canvasWidth });
    }

    // Render a regular point
    renderPoint(point, showCoordinates = false) {
        this.pointRenderer.render(point, { showCoordinates });
    }

    // Render a calculated point (like point C or D)
    renderCalculatedPoint(point, showCoordinates = false, additionalLabel = '(calc)') {
        this.pointRenderer.render(point, {
            showCoordinates,
            isCalculated: true,
            additionalLabel
        });
    }

    // Render vanishing point
    renderVanishingPoint(vanishingPoint, showCoordinates = false) {
        this.vanishingPointRenderer.render(vanishingPoint, { showCoordinates });
    }

    // Render triangle
    renderTriangle(triangle, showConstructionLines = false, showCircumcircle = false) {
        this.triangleRenderer.render(triangle, { showConstructionLines, showCircumcircle });
    }

    // Render tetrahedron
    renderTetrahedron(tetrahedron, showEdges = true) {
        this.tetrahedronRenderer.render(tetrahedron, { showEdges });
    }

    // Render perspective lines
    renderPerspectiveLines(points, vanishingPoint) {
        this.ctx.strokeStyle = '#cccccc';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);

        points.forEach(point => {
            this.ctx.beginPath();
            this.ctx.moveTo(point.absoluteX, point.absoluteY);
            this.ctx.lineTo(vanishingPoint.absoluteX, vanishingPoint.absoluteY);
            this.ctx.stroke();
        });

        this.ctx.setLineDash([]);
    }

    // Render drag instructions
    renderDragInstructions(instructions, canvasHeight) {
        this.ctx.fillStyle = '#666666';
        this.ctx.font = '12px Arial';

        instructions.forEach((instruction, index) => {
            this.ctx.fillText(instruction, 10, canvasHeight - 80 + (index * 15));
        });
    }
}


