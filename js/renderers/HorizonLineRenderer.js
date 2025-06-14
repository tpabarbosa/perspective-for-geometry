class HorizonLineRenderer extends BaseRenderer {
    render(horizonLine, options = {}) {
        const { canvasWidth } = options;

        this.setStyle(horizonLine.color, null, horizonLine.lineWidth);

        if (horizonLine.isDashed) {
            this.setLineDash([10, 5]);
        }

        this.drawLine(0, horizonLine.yAbsolute, canvasWidth, horizonLine.yAbsolute);
        this.resetLineDash();

        // Draw label
        this.drawText(
            'Horizon Line',
            10,
            horizonLine.yAbsolute - 10,
            '14px Arial',
            horizonLine.color
        );
    }
}
