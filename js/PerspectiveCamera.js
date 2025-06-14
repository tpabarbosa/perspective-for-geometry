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
        // Use PerspectiveUtils to calculate camera parameters
        const params = PerspectiveUtils.calculateCameraParameters(
            this.horizonLine,
            this.vanishingPoint,
            this.focalLength,
            this.eyeHeight
        );

        // Apply calculated parameters
        this.cameraX = params.cameraX;
        this.cameraY = params.cameraY;
        this.cameraZ = params.cameraZ;
        this.eyeLevel = params.eyeLevel;
        this.groundPlaneY = params.groundPlaneY;
    }

    // Convert screen coordinates to 3D ground plane coordinates
    screenToGroundPlane(screenX, screenY) {
        return PerspectiveUtils.screenToGroundPlane(screenX, screenY, this);
    }

    // Convert 3D ground plane coordinates to screen coordinates
    groundPlaneToScreen(worldX, worldY, worldZ) {
        return PerspectiveUtils.groundPlaneToScreen(worldX, worldY, worldZ, this);
    }

    // Calculate 3D equilateral triangle on ground plane
    calculateEquilateralTriangle3D(point3DA, point3DB, side = 'front') {
        return PerspectiveUtils.calculateEquilateralTriangle3D(point3DA, point3DB, side);
    }

    // Get perspective scale at given depth
    getPerspectiveScale(worldZ) {
        return PerspectiveUtils.getPerspectiveScale(worldZ, this);
    }

    // Convert world distance to screen distance at given depth
    worldToScreenDistance(worldDistance, worldZ) {
        return PerspectiveUtils.worldToScreenDistance(worldDistance, worldZ, this);
    }

    // Convert screen distance to world distance at given depth
    screenToWorldDistance(screenDistance, worldZ) {
        return PerspectiveUtils.screenToWorldDistance(screenDistance, worldZ, this);
    }

    // Check if projection is reasonable
    isProjectionReasonable(worldPoint) {
        return PerspectiveUtils.isProjectionReasonable(
            worldPoint, this, this.canvasWidth, this.canvasHeight
        );
    }

    update(canvasWidth, canvasHeight, horizonLine, vanishingPoint) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.horizonLine = horizonLine;
        this.vanishingPoint = vanishingPoint;
        this.updateCameraParameters();
    }
}
