class GridRenderer extends BaseRenderer {
    render(grid, options = {}) {
        const { canvasWidth, canvasHeight } = options;

        if (!grid.show) return;

        this.setStyle('#e0e0e0', null, 1);

        // Draw vertical lines
        for (let x = 0; x <= canvasWidth; x += grid.size) {
            this.drawLine(x, 0, x, canvasHeight);
        }

        // Draw horizontal lines
        for (let y = 0; y <= canvasHeight; y += grid.size) {
            this.drawLine(0, y, canvasWidth, y);
        }

        // Draw grid coordinates at intersections
        if (grid.size >= 40 && grid.showCoordinates) {
            for (let x = grid.size; x < canvasWidth; x += grid.size) {
                for (let y = grid.size; y < canvasHeight; y += grid.size) {
                    this.drawText(`${x},${y}`, x + 2, y - 2, '10px Arial', '#cccccc');
                }
            }
        }
    }
}
