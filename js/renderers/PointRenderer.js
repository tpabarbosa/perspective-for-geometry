class PointRenderer extends BaseRenderer {
    render(point, options = {}) {
        const {
            showCoordinates = false,
            isCalculated = false,
            additionalLabel = ''
        } = options;

        // Draw the point circle
        this.setStyle('#000000', point.color, 2);
        this.drawCircle(point.absoluteX, point.absoluteY, point.radius);

        // Draw special border for calculated points
        if (isCalculated) {
            this.setLineDash([3, 3]);
            this.drawCircle(point.absoluteX, point.absoluteY, point.radius, false, true);
            this.resetLineDash();
        }

        // Draw label
        const labelText = point.label + (additionalLabel ? ` ${additionalLabel}` : '');
        this.drawText(
            labelText,
            point.absoluteX + 10,
            point.absoluteY - 10,
            '16px Arial',
            '#000000'
        );

        // Show coordinates when requested
        if (showCoordinates) {
            const coordText = `(${Math.round(point.absoluteX)}, ${Math.round(point.absoluteY)})`;
            this.drawText(
                coordText,
                point.absoluteX + 10,
                point.absoluteY + 20,
                '12px Arial',
                '#666666'
            );
        }
    }
}

class VanishingPointRenderer extends BaseRenderer {
    render(vanishingPoint, options = {}) {
        const { showCoordinates = false } = options;

        // Draw square instead of circle for vanishing point
        this.setStyle('#000000', vanishingPoint.color, 2);
        this.drawRect(
            vanishingPoint.absoluteX - vanishingPoint.radius,
            vanishingPoint.absoluteY - vanishingPoint.radius,
            vanishingPoint.radius * 2,
            vanishingPoint.radius * 2
        );

        // Draw label
        this.drawText(
            vanishingPoint.label,
            vanishingPoint.absoluteX + 12,
            vanishingPoint.absoluteY - 12,
            '16px Arial',
            '#000000'
        );

        // Show coordinates when requested
        if (showCoordinates) {
            const coordText = `(${Math.round(vanishingPoint.absoluteX)}, ${Math.round(vanishingPoint.absoluteY)})`;
            this.drawText(
                coordText,
                vanishingPoint.absoluteX + 12,
                vanishingPoint.absoluteY + 25,
                '12px Arial',
                '#666666'
            );
        }
    }
}
