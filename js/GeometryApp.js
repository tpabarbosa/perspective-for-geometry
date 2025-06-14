class GeometryApp {
    constructor() {
        // Initialize state management first
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
        this.vanishingPoint = new VanishingPoint(0.5, 0.4, 'VP', '#00ff00');

        this.perspectiveCamera = new PerspectiveCamera(
            800, 600, this.horizonLine, this.vanishingPoint
        );

        // Initialize object settings from state
        this.syncAllObjectsWithState();

        // Create UIController instead of Controls - UIController handles all DOM manipulation
        this.uiController = new UIController(this.state, this);

        this.setupMouseEvents();
        this.setupTouchEvents();
        this.initialize();
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
        this.updateTriangle();
        this.draw();
    }

    onTetrahedronSettingChanged() {
        this.syncTetrahedronWithState();
        this.updateTetrahedron();
        this.draw();
    }


    initialize() {
        this.resize();
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
        this.canvasManager.clear();
        this.grid.draw(this.canvasManager.ctx, this.canvasManager.canvas.width, this.canvasManager.canvas.height);

        // Draw horizon line
        this.horizonLine.draw(this.canvasManager.ctx, this.canvasManager.canvas.width);

        // Draw perspective lines from points to vanishing point
        this.drawPerspectiveLines();

        // Draw triangle if enabled - use state instead of direct property
        if (this.state.isTriangleVisible()) {
            this.triangle.draw(this.canvasManager.ctx);

            // Only draw point C if it exists
            if (this.triangle.pointC) {
                const showCoords = this.grid.snapX || this.grid.snapY;
                this.triangle.drawPointC(this.canvasManager.ctx, showCoords);
            }
        }

        // Draw tetrahedron if enabled - use state instead of direct property
        if (this.state.isTetrahedronVisible() && this.state.isTriangleVisible()) {
            this.tetrahedron.draw(this.canvasManager.ctx);

            // Draw point D if it exists
            if (this.tetrahedron.pointD) {
                const showCoords = this.grid.snapX || this.grid.snapY;
                this.tetrahedron.drawPointD(this.canvasManager.ctx, showCoords);
            }
        }

        const showCoords = this.grid.snapX || this.grid.snapY;
        this.points.forEach(point => {
            point.draw(this.canvasManager.ctx, showCoords);
        });

        // Draw vanishing point
        this.vanishingPoint.draw(this.canvasManager.ctx, showCoords);

        // Draw drag instructions
        this.drawDragInstructions();
    }

    drawDragInstructions() {
        const ctx = this.canvasManager.ctx;
        ctx.fillStyle = '#666666';
        ctx.font = '12px Arial';

        let instructions = [];
        if (this.showTriangle) {
            instructions.push('• Click inside triangle to drag it');
        }
        if (this.showTetrahedron) {
            instructions.push('• Click near tetrahedron edges to drag it');
        }
        instructions.push('• Drag points A, B, VP individually');
        instructions.push('• Drag horizon line up/down');

        instructions.forEach((instruction, index) => {
            ctx.fillText(instruction, 10, this.canvasManager.canvas.height - 80 + (index * 15));
        });
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
        this.canvasManager.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvasManager.canvas.dispatchEvent(mouseEvent);
        });

        this.canvasManager.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvasManager.canvas.dispatchEvent(mouseEvent);
        });

        this.canvasManager.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvasManager.canvas.dispatchEvent(mouseEvent);
        });
    }

    handleMouseDown(event) {
        const mousePos = this.canvasManager.getMousePosition(event);

        // Check for tetrahedron drag first (higher priority)
        if (this.state.isTetrahedronVisible() && this.tetrahedron.startDrag(mousePos.x, mousePos.y)) {
            this.state.updateInteractionState('draggedTetrahedron', true);
            this.canvasManager.canvas.style.cursor = 'grabbing';
            return;
        }

        // Check for triangle drag
        if (this.state.isTriangleVisible() && this.triangle.startDrag(mousePos.x, mousePos.y)) {
            this.state.updateInteractionState('draggedTriangle', true);
            this.canvasManager.canvas.style.cursor = 'grabbing';
            return;
        }

        // Check for individual point drag
        const pointUnderMouse = this.getPointUnderMouse(mousePos);
        if (pointUnderMouse) {
            this.state.updateInteractionState('isDragging', true);
            this.state.updateInteractionState('draggedPoint', pointUnderMouse);
            this.state.updateInteractionState('mouseOffset', {
                x: mousePos.x - pointUnderMouse.absoluteX,
                y: mousePos.y - pointUnderMouse.absoluteY
            });
            this.canvasManager.canvas.style.cursor = 'grabbing';
        } else if (this.horizonLine.isNearLine(mousePos.y)) {
            this.state.updateInteractionState('draggedHorizon', true);
            this.state.updateInteractionState('mouseOffset', {
                x: 0,
                y: mousePos.y - this.horizonLine.yAbsolute
            });
            this.canvasManager.canvas.style.cursor = 'grabbing';
        }
    }

    handleMouseMove(event) {
        const mousePos = this.canvasManager.getMousePosition(event);
        const interactionState = this.state.getInteractionState();

        if (interactionState.draggedTetrahedron) {
            this.tetrahedron.drag(
                mousePos.x, mousePos.y,
                this.canvasManager.canvas.width,
                this.canvasManager.canvas.height,
                this.grid
            );
            this.updateTriangle(); // This will also update tetrahedron
            this.draw();
        } else if (interactionState.draggedTriangle) {
            this.triangle.drag(
                mousePos.x, mousePos.y,
                this.canvasManager.canvas.width,
                this.canvasManager.canvas.height,
                this.grid
            );
            this.updateTriangle(); // This will also update tetrahedron if shown
            this.draw();
        } else if (interactionState.isDragging && interactionState.draggedPoint) {
            const newX = mousePos.x - interactionState.mouseOffset.x;
            const newY = mousePos.y - interactionState.mouseOffset.y;

            interactionState.draggedPoint.setPosition(
                newX, newY,
                this.canvasManager.canvas.width,
                this.canvasManager.canvas.height,
                this.grid
            );

            // If dragging vanishing point, keep it on horizon line
            if (interactionState.draggedPoint.isVanishingPoint) {
                interactionState.draggedPoint.absoluteY = this.horizonLine.yAbsolute;
                interactionState.draggedPoint.updateRelativePosition(
                    this.canvasManager.canvas.width,
                    this.canvasManager.canvas.height
                );
                // Update perspective camera when vanishing point moves
                this.perspectiveCamera.update(
                    this.canvasManager.canvas.width,
                    this.canvasManager.canvas.height,
                    this.horizonLine,
                    this.vanishingPoint
                );
            }

            // Update triangle when ANY point is moved (A, B, or vanishing point)
            if (this.state.isTriangleVisible()) {
                this.updateTriangle();
            }

            this.draw();
        } else if (interactionState.draggedHorizon) {
            const newY = mousePos.y - interactionState.mouseOffset.y;
            this.horizonLine.setPosition(newY, this.canvasManager.canvas.height);

            // Move vanishing point with horizon line
            this.vanishingPoint.absoluteY = this.horizonLine.yAbsolute;
            this.vanishingPoint.updateRelativePosition(
                this.canvasManager.canvas.width,
                this.canvasManager.canvas.height
            );

            // Update perspective camera when horizon moves
            this.perspectiveCamera.update(
                this.canvasManager.canvas.width,
                this.canvasManager.canvas.height,
                this.horizonLine,
                this.vanishingPoint
            );

            // Update triangle when horizon moves
            if (this.state.isTriangleVisible()) {
                this.updateTriangle();
            }

            this.draw();
        } else {
            // Update cursor based on what's under mouse
            this.updateCursor(mousePos);
        }
    }

    updateCursor(mousePos) {
        const interactionState = this.state.getInteractionState();

        // Check for tetrahedron drag area first (highest priority)
        if (this.state.isTetrahedronVisible() && this.tetrahedron.isPointNearTetrahedron(mousePos.x, mousePos.y)) {
            this.canvasManager.canvas.style.cursor = 'grab';
            return;
        }

        // Check for triangle drag area
        if (this.state.isTriangleVisible() && this.triangle.isPointInsideTriangle(mousePos.x, mousePos.y)) {
            this.canvasManager.canvas.style.cursor = 'grab';
            return;
        }

        // Check for individual points
        const pointUnderMouse = this.getPointUnderMouse(mousePos);

        // Special cursor for point C (not draggable individually)
        if (this.state.isTriangleVisible() && this.triangle.pointC &&
            this.triangle.pointC.isPointInside(mousePos.x, mousePos.y)) {
            this.canvasManager.canvas.style.cursor = 'not-allowed';
        }
        // Special cursor for point D (not draggable individually)
        else if (this.state.isTetrahedronVisible() && this.tetrahedron.pointD &&
                 this.tetrahedron.pointD.isPointInside(mousePos.x, mousePos.y)) {
            this.canvasManager.canvas.style.cursor = 'not-allowed';
        }
        // Draggable individual points
        else if (pointUnderMouse) {
            this.canvasManager.canvas.style.cursor = 'grab';
        }
        // Horizon line
        else if (this.horizonLine.isNearLine(mousePos.y)) {
            this.canvasManager.canvas.style.cursor = 'ns-resize';
        }
        // Default cursor
        else {
            this.canvasManager.canvas.style.cursor = 'default';
        }
    }

    handleMouseUp(event) {
        const interactionState = this.state.getInteractionState();

        if (interactionState.draggedTetrahedron) {
            this.tetrahedron.stopDrag();
            this.state.updateInteractionState('draggedTetrahedron', false);
        }

        if (interactionState.draggedTriangle) {
            this.triangle.stopDrag();
            this.state.updateInteractionState('draggedTriangle', false);
        }

        // Clear all drag state
        this.state.clearDragState();
        this.canvasManager.canvas.style.cursor = 'default';
    }

    handleMouseLeave(event) {
        const interactionState = this.state.getInteractionState();

        if (interactionState.isDragging) {
            this.state.updateInteractionState('isDragging', false);
            this.state.updateInteractionState('draggedPoint', null);
        }
        if (interactionState.draggedHorizon) {
            this.state.updateInteractionState('draggedHorizon', false);
        }
        this.canvasManager.canvas.style.cursor = 'default';
    }
}
