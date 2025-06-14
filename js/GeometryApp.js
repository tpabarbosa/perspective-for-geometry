class GeometryApp {
    constructor() {
        this.state = new AppState();

        this.canvasManager = new CanvasManager('geometryCanvas');
        this.grid = new Grid();
        this.horizonLine = new HorizonLine(0.4);

        this.points = [
            new Point(0.25, 0.67, 'A', '#ff0000'),
            new Point(0.75, 0.67, 'B', '#0000ff')
        ];

        this.triangle = new EquilateralTriangle(this.points[0], this.points[1], 'bottom');
        this.tetrahedron = new EquilateralTetrahedron(this.triangle);
        this.vanishingPoint = new VanishingPoint(0.8, 0.4, 'VP', '#00ff00');

        this.perspectiveCamera = new PerspectiveCamera(
            800, 600, this.horizonLine, this.vanishingPoint
        );

        this.draggableObjects = [];
        this.currentDraggedObject = null;

        this.renderManager = new RenderManager(this.canvasManager.ctx);


        this.syncAllObjectsWithState();


        this.uiController = new UIController(this.state, this);

        this.setupMouseEvents();
        this.setupTouchEvents();
        this.initialize();

        this.updateTriangle();
        this.draw();
    }

    // Combine all sync methods into one
    syncAllObjectsWithState() {
        this.syncGridWithState();
        this.syncTriangleWithState();
        this.syncTetrahedronWithState();
    }

    // Sync grid object with state
    syncGridWithState() {
        const gridSettings = this.state.getGridSettings();
        this.grid.snapX = gridSettings.snapX;
        this.grid.snapY = gridSettings.snapY;
        this.grid.size = gridSettings.size;
        this.grid.show = gridSettings.show;
        this.grid.showCoordinates = gridSettings.showCoordinates;
    }

    // Sync triangle object with state
    syncTriangleWithState() {
        const triangleSettings = this.state.getTriangleSettings();
        this.triangle.showConstructionLines = triangleSettings.showConstructionLines;
        this.triangle.showCircumcircle = triangleSettings.showCircumcircle;
        this.triangle.isDraggable = triangleSettings.isDraggable;
        this.triangle.side = triangleSettings.side;
    }

    // Sync tetrahedron object with state
    syncTetrahedronWithState() {
        const tetrahedronSettings = this.state.getTetrahedronSettings();
        this.tetrahedron.showEdges = tetrahedronSettings.showEdges;
        this.tetrahedron.isDraggable = tetrahedronSettings.isDraggable;
        this.tetrahedron.side = tetrahedronSettings.side;
    }

    // Callback methods for UIController to notify GeometryApp of changes
    onGridSettingChanged() {
        this.syncGridWithState();
        this.draw();
    }

    onTriangleSettingChanged() {
        this.syncTriangleWithState();
        this.updateDraggableObjects();
        this.updateTriangle();
        this.draw();
    }

    onTetrahedronSettingChanged() {
        this.syncTetrahedronWithState();
        this.updateDraggableObjects();
        this.updateTetrahedron();
        this.draw();
    }


    initialize() {
        this.resize();
        this.updateDraggableObjects();

        // Force initial triangle calculation if triangle should be visible
        if (this.state.isTriangleVisible()) {
            // Small delay to ensure canvas is fully ready
            setTimeout(() => {
                this.updateTriangle();
                this.draw();
            }, 100);
        }
    }

    updateDraggableObjects() {
        // Clear and rebuild draggable objects list in priority order
        this.draggableObjects = [];

        // Priority order: points > triangle > tetrahedron > horizon
        // Individual points first (highest priority - most precise targets)
        this.draggableObjects.push(...this.points);
        this.draggableObjects.push(this.vanishingPoint);

        // Triangle (medium-high priority)
        if (this.state.isTriangleVisible() && this.triangle.isDraggable) {
            this.draggableObjects.push(this.triangle);
        }

        // Tetrahedron (medium priority)
        if (this.state.isTetrahedronVisible() && this.tetrahedron.isDraggable) {
            this.draggableObjects.push(this.tetrahedron);
        }

        // Horizon line (lowest priority - largest target area)
        this.draggableObjects.push(this.horizonLine);
    }

    resize() {
        const dimensions = this.canvasManager.resize();
        this.points.forEach(point => {
            point.updateAbsolutePosition(dimensions.width, dimensions.height);
        });
        this.horizonLine.updateAbsolutePosition(dimensions.height);
        this.vanishingPoint.updateAbsolutePosition(dimensions.width, dimensions.height);
        this.vanishingPoint.absoluteY = this.horizonLine.yAbsolute;
        this.vanishingPoint.updateRelativePosition(dimensions.width, dimensions.height);

        // Update perspective camera
        this.perspectiveCamera.update(
            dimensions.width,
            dimensions.height,
            this.horizonLine,
            this.vanishingPoint
        );

        this.draw();
    }

    draw() {
        // Clear canvas
        this.renderManager.clear(this.canvasManager.canvas.width, this.canvasManager.canvas.height);

        // Render grid
        this.renderManager.renderGrid(this.grid, this.canvasManager.canvas.width, this.canvasManager.canvas.height);

        // Render horizon line
        this.renderManager.renderHorizonLine(this.horizonLine, this.canvasManager.canvas.width);

        // Render perspective lines from points to vanishing point
        this.renderManager.renderPerspectiveLines(this.points, this.vanishingPoint);

        // Render triangle if enabled
        if (this.state.isTriangleVisible()) {
            const triangleSettings = this.state.getTriangleSettings();
            this.renderManager.renderTriangle(
                this.triangle,
                triangleSettings.showConstructionLines,
                triangleSettings.showCircumcircle
            );

            // Only draw point C if it exists
            if (this.triangle.pointC) {
                const showCoords = this.grid.snapX || this.grid.snapY;
                this.renderManager.renderCalculatedPoint(this.triangle.pointC, showCoords);
            }
        }

        // Render tetrahedron if enabled
        if (this.state.isTetrahedronVisible() && this.state.isTriangleVisible()) {
            const tetrahedronSettings = this.state.getTetrahedronSettings();
            this.renderManager.renderTetrahedron(this.tetrahedron, tetrahedronSettings.showEdges);

            // Draw point D if it exists
            if (this.tetrahedron.pointD) {
                const showCoords = this.grid.snapX || this.grid.snapY;
                this.renderManager.renderCalculatedPoint(this.tetrahedron.pointD, showCoords);
            }
        }

        // Render points A and B
        const showCoords = this.grid.snapX || this.grid.snapY;
        this.points.forEach(point => {
            this.renderManager.renderPoint(point, showCoords);
        });

        // Render vanishing point
        this.renderManager.renderVanishingPoint(this.vanishingPoint, showCoords);

        // Render drag instructions
        this.renderDragInstructions();
    }


    renderDragInstructions() {
        let instructions = [];
        if (this.state.isTriangleVisible()) {
            instructions.push('• Click inside triangle to drag it');
        }
        if (this.state.isTetrahedronVisible()) {
            instructions.push('• Click near tetrahedron edges to drag it');
        }
        instructions.push('• Drag points A, B, VP individually');
        instructions.push('• Drag horizon line up/down');

        this.renderManager.renderDragInstructions(instructions, this.canvasManager.canvas.height);
    }


    getPointUnderMouse(mousePos) {
        // Don't allow selecting triangle point C or tetrahedron point D individually
        // They can only be moved by dragging the entire shape

        // Check vanishing point
        if (this.vanishingPoint.isPointInside(mousePos.x, mousePos.y)) {
            return this.vanishingPoint;
        }

        // Check points A and B
        return this.points.find(point => point.isPointInside(mousePos.x, mousePos.y));
    }



    drawPerspectiveLines() {
        const ctx = this.canvasManager.ctx;
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);

        this.points.forEach(point => {
            ctx.beginPath();
            ctx.moveTo(point.absoluteX, point.absoluteY);
            ctx.lineTo(this.vanishingPoint.absoluteX, this.vanishingPoint.absoluteY);
            ctx.stroke();
        });

        ctx.setLineDash([]);
    }


    updateTriangle() {
        if (this.state.isTriangleVisible()) {
            this.triangle.calculateVertexC(
                this.canvasManager.canvas.width,
                this.canvasManager.canvas.height,
                this.vanishingPoint,
                this.perspectiveCamera
            );
            this.updateTriangleInfo();

            // Update tetrahedron when triangle changes
            if (this.state.isTetrahedronVisible()) {
                this.updateTetrahedron();
            }
        }
    }

    updateTriangleInfo() {
        if (!this.triangle.pointC) {
            this.uiController.updateTriangleInfo(null);
            return;
        }

        const sideLengths = this.triangle.getSideLengths();
        const sideLengths3D = this.triangle.get3DSideLengths();

        if (sideLengths && sideLengths3D) {
            const infoHTML =
                `Screen: AB=${sideLengths.ab}, BC=${sideLengths.bc}, CA=${sideLengths.ca}<br>` +
                `3D: AB=${sideLengths3D.ab}, BC=${sideLengths3D.bc}, CA=${sideLengths3D.ca}`;
            this.uiController.updateTriangleInfo(infoHTML);
        }
    }


    updateTetrahedron() {
        if (this.state.isTetrahedronVisible() && this.state.isTriangleVisible()) {
            this.tetrahedron.calculateVertexD(
                this.canvasManager.canvas.width,
                this.canvasManager.canvas.height,
                this.perspectiveCamera
            );
            this.updateTetrahedronInfo();
        }
    }

    updateTetrahedronInfo() {
        const edgeLengths = this.tetrahedron.get3DEdgeLengths();
        if (edgeLengths) {
            const infoHTML =
                `AB=${edgeLengths.ab}, BC=${edgeLengths.bc}, CA=${edgeLengths.ca}<br>` +
                `DA=${edgeLengths.da}, DB=${edgeLengths.db}, DC=${edgeLengths.dc}`;
            this.uiController.updateTetrahedronInfo(infoHTML);
        }
    }

    setupMouseEvents() {
        this.canvasManager.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvasManager.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvasManager.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvasManager.canvas.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));
    }

    setupTouchEvents() {
        // Prevent default touch behaviors that can cause canvas to disappear
        this.canvasManager.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvasManager.canvas.dispatchEvent(mouseEvent);
        }, { passive: false });

        this.canvasManager.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvasManager.canvas.dispatchEvent(mouseEvent);
        }, { passive: false });

        this.canvasManager.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvasManager.canvas.dispatchEvent(mouseEvent);
        }, { passive: false });

        // Prevent context menu on long press
        this.canvasManager.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    handleMouseDown(event) {
        const mousePos = this.canvasManager.getMousePosition(event);

        // Try to start drag on each object in priority order
        for (const obj of this.draggableObjects) {
            if (obj.startDrag(mousePos.x, mousePos.y)) {
                this.currentDraggedObject = obj;
                this.canvasManager.canvas.style.cursor = 'grabbing';
                return;
            }
        }

        this.currentDraggedObject = null;
    }


    handleMouseMove(event) {
        const mousePos = this.canvasManager.getMousePosition(event);

        if (this.currentDraggedObject) {
            // Handle dragging
            this.currentDraggedObject.drag(
                mousePos.x, mousePos.y,
                this.canvasManager.canvas.width,
                this.canvasManager.canvas.height,
                this.state.getGridSettings()
            );

            // Handle special cases for objects that affect others
            this.handleDragEffects(this.currentDraggedObject);

            this.draw();
        } else {
            // Update cursor based on what's under mouse
            this.updateCursor(mousePos);
        }
    }

    handleDragEffects(draggedObject) {
        // Handle special effects when certain objects are dragged
        if (draggedObject === this.vanishingPoint) {
            // Keep vanishing point on horizon line
            this.vanishingPoint.absoluteY = this.horizonLine.yAbsolute;
            this.vanishingPoint.updateRelativePosition(
                this.canvasManager.canvas.width,
                this.canvasManager.canvas.height
            );
            // Update perspective camera
            this.perspectiveCamera.update(
                this.canvasManager.canvas.width,
                this.canvasManager.canvas.height,
                this.horizonLine,
                this.vanishingPoint
            );
        } else if (draggedObject === this.horizonLine) {
            // Move vanishing point with horizon line
            this.vanishingPoint.absoluteY = this.horizonLine.yAbsolute;
            this.vanishingPoint.updateRelativePosition(
                this.canvasManager.canvas.width,
                this.canvasManager.canvas.height
            );
            // Update perspective camera
            this.perspectiveCamera.update(
                this.canvasManager.canvas.width,
                this.canvasManager.canvas.height,
                this.horizonLine,
                this.vanishingPoint
            );
        }

        // Update triangle when ANY point is moved (A, B, or vanishing point)
        if (this.state.isTriangleVisible() &&
        (this.points.includes(draggedObject) ||
         draggedObject === this.vanishingPoint ||
         draggedObject === this.horizonLine ||
         draggedObject === this.triangle ||
         draggedObject === this.tetrahedron)) {
        this.updateTriangle();
    }
    }

    updateCursor(mousePos) {
        // Check each draggable object for cursor type
        for (const obj of this.draggableObjects) {
            if (obj.isPointInDragArea(mousePos.x, mousePos.y)) {
                this.canvasManager.canvas.style.cursor = obj.getCursorType ? obj.getCursorType() : 'grab';
                return;
            }
        }

        // Special case for calculated points (not draggable individually)
        if (this.state.isTriangleVisible() && this.triangle.pointC &&
            this.triangle.pointC.isPointInside(mousePos.x, mousePos.y)) {
            this.canvasManager.canvas.style.cursor = 'not-allowed';
            return;
        }

        if (this.state.isTetrahedronVisible() && this.tetrahedron.pointD &&
            this.tetrahedron.pointD.isPointInside(mousePos.x, mousePos.y)) {
            this.canvasManager.canvas.style.cursor = 'not-allowed';
            return;
        }

        this.canvasManager.canvas.style.cursor = 'default';
    }


    handleMouseUp(event) {
        if (this.currentDraggedObject) {
            this.currentDraggedObject.stopDrag();
            this.currentDraggedObject = null;
        }
        this.canvasManager.canvas.style.cursor = 'default';
    }

    handleMouseLeave(event) {
        if (this.currentDraggedObject) {
            this.currentDraggedObject.stopDrag();
            this.currentDraggedObject = null;
        }
        this.canvasManager.canvas.style.cursor = 'default';
    }
}
