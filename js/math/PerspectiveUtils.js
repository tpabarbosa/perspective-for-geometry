class PerspectiveUtils {
    // Convert screen coordinates to 3D ground plane coordinates
    static screenToGroundPlane(screenX, screenY, camera) {
        // Ray from camera through screen point
        const rayDirX = screenX - camera.cameraX;
        const rayDirY = camera.eyeLevel - screenY; // Flip Y axis
        const rayDirZ = -camera.focalLength;

        // Find intersection with ground plane (y = groundPlaneY)
        // Camera ray: camera + t * rayDir
        // Ground plane: y = groundPlaneY
        // Solve: cameraY + t * rayDirY = groundPlaneY

        if (Math.abs(rayDirY) < 0.001) {
            // Ray is parallel to ground plane
            return null;
        }

        const t = (camera.groundPlaneY - camera.cameraY) / rayDirY;

        if (t <= 0) {
            // Intersection is behind camera
            return null;
        }

        const worldX = camera.cameraX + t * rayDirX;
        const worldZ = camera.cameraZ + t * rayDirZ;

        return {
            x: worldX,
            y: camera.groundPlaneY,
            z: worldZ
        };
    }

    // Convert 3D ground plane coordinates to screen coordinates
    static groundPlaneToScreen(worldX, worldY, worldZ, camera) {
        // Vector from camera to world point
        const dx = worldX - camera.cameraX;
        const dy = worldY - camera.cameraY;
        const dz = worldZ - camera.cameraZ;

        if (dz >= 0) {
            // Point is behind or at camera
            return null;
        }

        // Perspective projection
        const screenX = camera.cameraX + (dx * camera.focalLength) / (-dz);
        const screenY = camera.eyeLevel - (dy * camera.focalLength) / (-dz);

        return {
            x: screenX,
            y: screenY
        };
    }

    // Calculate 3D equilateral triangle on ground plane
    static calculateEquilateralTriangle3D(point3DA, point3DB, side = 'front') {
        // Vector from A to B in 3D
        const abVector = Vector3D.fromPoints(point3DA, point3DB);

        // Length of AB (only considering X and Z for ground plane)
        const abLength = Math.sqrt(abVector.x * abVector.x + abVector.z * abVector.z);

        // Midpoint of AB
        const midpoint = GeometryUtils.midpoint3D(point3DA, point3DB);

        // Perpendicular vector to AB in the XZ plane (ground plane)
        let perpX = -abVector.z; // Rotate 90 degrees in XZ plane
        let perpZ = abVector.x;

        // Normalize perpendicular vector
        const perpLength = Math.sqrt(perpX * perpX + perpZ * perpZ);
        if (perpLength === 0) return null;

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
        return {
            x: midpoint.x + perpX * height,
            y: point3DA.y, // Same Y as ground plane
            z: midpoint.z + perpZ * height
        };
    }

    // Calculate 3D equilateral tetrahedron vertex above/below triangle base
    static calculateTetrahedronVertex3D(point3DA, point3DB, point3DC, side = 'above') {
        // Calculate the centroid of triangle ABC
        const centroid = GeometryUtils.centroid3Points(point3DA, point3DB, point3DC);

        // Calculate edge length (should be same for all edges in equilateral triangle)
        const edgeLength = GeometryUtils.distance3D(point3DA, point3DB);

        // Height of tetrahedron from base to apex
        // For regular tetrahedron: h = edge_length * sqrt(2/3)
        const tetrahedronHeight = edgeLength * Math.sqrt(2/3);

        // Normal vector to the plane ABC (pointing up from ground plane)
        // Since ABC is on ground plane (y = 0), normal is simply (0, 1, 0)
        const normalY = side === 'above' ? 1 : -1;

        // Calculate point D
        return {
            x: centroid.x,
            y: centroid.y + normalY * tetrahedronHeight,
            z: centroid.z
        };
    }

    // Check if a 3D point projects to reasonable screen bounds
    static isProjectionReasonable(worldPoint, camera, canvasWidth, canvasHeight, margin = 200) {
        const screenPoint = this.groundPlaneToScreen(
            worldPoint.x, worldPoint.y, worldPoint.z, camera
        );

        if (!screenPoint) return false;

        return screenPoint.x >= -margin &&
               screenPoint.x <= canvasWidth + margin &&
               screenPoint.y >= -margin &&
               screenPoint.y <= canvasHeight + margin;
    }

    // Calculate camera parameters from horizon line and vanishing point
    static calculateCameraParameters(horizonLine, vanishingPoint, focalLength = 500, eyeHeight = 100) {
        return {
            cameraX: vanishingPoint.absoluteX,
            cameraY: eyeHeight,
            cameraZ: focalLength,
            eyeLevel: horizonLine.yAbsolute,
            groundPlaneY: 0,
            focalLength: focalLength
        };
    }

    // Project multiple 3D points to screen coordinates
    static projectPointsToScreen(points3D, camera) {
        return points3D.map(point => {
            const screenPoint = this.groundPlaneToScreen(point.x, point.y, point.z, camera);
            return screenPoint ? {
                ...point,
                screenX: screenPoint.x,
                screenY: screenPoint.y,
                isVisible: true
            } : {
                ...point,
                screenX: null,
                screenY: null,
                isVisible: false
            };
        });
    }

    // Calculate perspective distortion factor at a given depth
    static getPerspectiveScale(worldZ, camera) {
        const dz = worldZ - camera.cameraZ;
        if (dz >= 0) return 0; // Behind camera
        return camera.focalLength / (-dz);
    }

    // Convert world distance to screen distance at given depth
    static worldToScreenDistance(worldDistance, worldZ, camera) {
        const scale = this.getPerspectiveScale(worldZ, camera);
        return worldDistance * scale;
    }

    // Convert screen distance to world distance at given depth
    static screenToWorldDistance(screenDistance, worldZ, camera) {
        const scale = this.getPerspectiveScale(worldZ, camera);
        if (scale === 0) return 0;
        return screenDistance / scale;
    }
}
