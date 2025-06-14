class PerspectiveCamera {
    constructor(canvasWidth, canvasHeight, horizonLine, vanishingPoint) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.horizonLine = horizonLine;
        this.vanishingPoint = vanishingPoint;

        // Camera parameters
        this.eyeHeight = 100; // Height of camera above ground plane
        this.groundPlaneY = 0; // Y coordinate of ground plane in 3D space
        this.focalLength = 500; // Controls field of view

        this.updateCameraParameters();
    }

    updateCameraParameters() {
        // Camera position in 3D space
        this.cameraX = this.vanishingPoint.absoluteX;
        this.cameraY = this.eyeHeight;
        this.cameraZ = this.focalLength;

        // The horizon line represents the eye level
        this.eyeLevel = this.horizonLine.yAbsolute;
    }

    // Convert screen coordinates to 3D ground plane coordinates
    screenToGroundPlane(screenX, screenY) {
        // Ray from camera through screen point
        const rayDirX = screenX - this.cameraX;
        const rayDirY = this.eyeLevel - screenY; // Flip Y axis
        const rayDirZ = -this.focalLength;

        // Find intersection with ground plane (y = groundPlaneY)
        // Camera ray: camera + t * rayDir
        // Ground plane: y = groundPlaneY
        // Solve: cameraY + t * rayDirY = groundPlaneY

        if (Math.abs(rayDirY) < 0.001) {
            // Ray is parallel to ground plane
            return null;
        }

        const t = (this.groundPlaneY - this.cameraY) / rayDirY;

        if (t <= 0) {
            // Intersection is behind camera
            return null;
        }

        const worldX = this.cameraX + t * rayDirX;
        const worldZ = this.cameraZ + t * rayDirZ;

        return {
            x: worldX,
            y: this.groundPlaneY,
            z: worldZ
        };
    }

    // Convert 3D ground plane coordinates to screen coordinates
    groundPlaneToScreen(worldX, worldY, worldZ) {
        // Vector from camera to world point
        const dx = worldX - this.cameraX;
        const dy = worldY - this.cameraY;
        const dz = worldZ - this.cameraZ;

        if (dz >= 0) {
            // Point is behind or at camera
            return null;
        }

        // Perspective projection
        const screenX = this.cameraX + (dx * this.focalLength) / (-dz);
        const screenY = this.eyeLevel - (dy * this.focalLength) / (-dz);

        return {
            x: screenX,
            y: screenY
        };
    }

    // Calculate 3D equilateral triangle on ground plane
    calculateEquilateralTriangle3D(point3DA, point3DB, side = 'front') {
        // Vector from A to B in 3D
        const abX = point3DB.x - point3DA.x;
        const abZ = point3DB.z - point3DA.z;

        // Length of AB
        const abLength = Math.sqrt(abX * abX + abZ * abZ);

        // Midpoint of AB
        const midX = (point3DA.x + point3DB.x) / 2;
        const midZ = (point3DA.z + point3DB.z) / 2;

        // Perpendicular vector to AB in the XZ plane (ground plane)
        let perpX = -abZ; // Rotate 90 degrees in XZ plane
        let perpZ = abX;

        // Normalize perpendicular vector
        const perpLength = Math.sqrt(perpX * perpX + perpZ * perpZ);
        perpX /= perpLength;
        perpZ /= perpLength;

        // Height of equilateral triangle
        const height = (Math.sqrt(3) / 2) * abLength;

        // Choose side (front/back relative to camera)
        if (side === 'back') {
            perpX = -perpX;
            perpZ = -perpZ;
        }

        // Calculate point C in 3D
        const point3DC = {
            x: midX + perpX * height,
            y: this.groundPlaneY,
            z: midZ + perpZ * height
        };

        return point3DC;
    }

    update(canvasWidth, canvasHeight, horizonLine, vanishingPoint) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.horizonLine = horizonLine;
        this.vanishingPoint = vanishingPoint;
        this.updateCameraParameters();
    }
}
