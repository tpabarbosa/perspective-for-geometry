class GeometryUtils {
    // 2D distance between two points
    static distance2D(point1, point2) {
        return Math.sqrt(
            Math.pow(point2.x - point1.x, 2) +
            Math.pow(point2.y - point1.y, 2)
        );
    }

    // 3D distance between two points
    static distance3D(point1, point2) {
        return Math.sqrt(
            Math.pow(point2.x - point1.x, 2) +
            Math.pow(point2.y - point1.y, 2) +
            Math.pow(point2.z - point1.z, 2)
        );
    }

    // Calculate midpoint between two 2D points
    static midpoint2D(point1, point2) {
        return {
            x: (point1.x + point2.x) / 2,
            y: (point1.y + point2.y) / 2
        };
    }

    // Calculate midpoint between two 3D points
    static midpoint3D(point1, point2) {
        return {
            x: (point1.x + point2.x) / 2,
            y: (point1.y + point2.y) / 2,
            z: (point1.z + point2.z) / 2
        };
    }

    // Calculate centroid of three points
    static centroid3Points(point1, point2, point3) {
        return {
            x: (point1.x + point2.x + point3.x) / 3,
            y: (point1.y + point2.y + point3.y) / 3,
            z: (point1.z + point2.z + point3.z) / 3
        };
    }

    // Find perpendicular foot from point to line segment
    static perpendicularFoot(point, lineStart, lineEnd) {
        const dx = lineEnd.x - lineStart.x;
        const dy = lineEnd.y - lineStart.y;
        const length = dx * dx + dy * dy;

        if (length === 0) return null;

        const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / length;

        return {
            x: lineStart.x + t * dx,
            y: lineStart.y + t * dy
        };
    }

    // Distance from point to line segment
    static distanceToLineSegment(point, lineStart, lineEnd) {
        const dx = lineEnd.x - lineStart.x;
        const dy = lineEnd.y - lineStart.y;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length === 0) {
            return this.distance2D(point, lineStart);
        }

        const t = Math.max(0, Math.min(1,
            ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (length * length)
        ));

        const projX = lineStart.x + t * dx;
        const projY = lineStart.y + t * dy;

        return Math.sqrt((point.x - projX) * (point.x - projX) + (point.y - projY) * (point.y - projY));
    }

    // Check if point is inside triangle using barycentric coordinates
    static isPointInsideTriangle(point, triangleA, triangleB, triangleC) {
        const denom = (triangleB.y - triangleC.y) * (triangleA.x - triangleC.x) +
                     (triangleC.x - triangleB.x) * (triangleA.y - triangleC.y);

        if (Math.abs(denom) < 0.001) return false; // Degenerate triangle

        const a = ((triangleB.y - triangleC.y) * (point.x - triangleC.x) +
                  (triangleC.x - triangleB.x) * (point.y - triangleC.y)) / denom;
        const b = ((triangleC.y - triangleA.y) * (point.x - triangleC.x) +
                  (triangleA.x - triangleC.x) * (point.y - triangleC.y)) / denom;
        const c = 1 - a - b;

        return a >= 0 && b >= 0 && c >= 0;
    }

    // Calculate circumcenter of triangle
    static calculateCircumcenter(pointA, pointB, pointC) {
        const ax = pointA.x, ay = pointA.y;
        const bx = pointB.x, by = pointB.y;
        const cx = pointC.x, cy = pointC.y;

        const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
        if (Math.abs(d) < 0.001) return null; // Points are collinear

        const ux = ((ax * ax + ay * ay) * (by - cy) +
                   (bx * bx + by * by) * (cy - ay) +
                   (cx * cx + cy * cy) * (ay - by)) / d;
        const uy = ((ax * ax + ay * ay) * (cx - bx) +
                   (bx * bx + by * by) * (ax - cx) +
                   (cx * cx + cy * cy) * (bx - ax)) / d;

        const radius = this.distance2D({ x: ux, y: uy }, pointA);

        return { x: ux, y: uy, radius: radius };
    }

    // Calculate equilateral triangle third vertex in 2D
    static calculateEquilateralTriangle2D(pointA, pointB, side = 'front') {
        // Vector from A to B
        const abX = pointB.x - pointA.x;
        const abY = pointB.y - pointA.y;

        // Midpoint of AB
        const midX = (pointA.x + pointB.x) / 2;
        const midY = (pointA.y + pointB.y) / 2;

        // Perpendicular vector to AB (rotate 90 degrees)
        let perpX = -abY;
        let perpY = abX;

        // Normalize perpendicular vector
        const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
        if (perpLength === 0) return null;

        perpX /= perpLength;
        perpY /= perpLength;

        // Height of equilateral triangle
        const abLength = Math.sqrt(abX * abX + abY * abY);
        const height = (Math.sqrt(3) / 2) * abLength;

        // Choose side
        if (side === 'back') {
            perpX = -perpX;
            perpY = -perpY;
        }

        // Calculate point C
        return {
            x: midX + perpX * height,
            y: midY + perpY * height
        };
    }

    // Normalize angle to 0-2π range
    static normalizeAngle(angle) {
        while (angle < 0) angle += 2 * Math.PI;
        while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
        return angle;
    }

    // Convert degrees to radians
    static degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    // Convert radians to degrees
    static radiansToDegrees(radians) {
        return radians * 180 / Math.PI;
    }

    // Linear interpolation between two values
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }

    // Clamp value between min and max
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    // Check if two numbers are approximately equal
    static approximately(a, b, tolerance = 0.0001) {
        return Math.abs(a - b) < tolerance;
    }
}
