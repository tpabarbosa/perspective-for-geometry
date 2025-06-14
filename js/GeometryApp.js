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

        // Initialize grid settings from state
        this.syncGridWithState();

        // Initialize triangle settings from state
        this.syncTriangleWithState();

        // Initialize tetrahedron settings from state
        this.syncTetrahedronWithState();

        this.controls = new Controls(this.grid, () => this.draw(), this.state);
        this.setupTriangleControls();
        this.setupTetrahedronControls();
        this.setupMouseEvents();
        this.setupTouchEvents();
        this.initialize();
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

    setupTriangleControls() {
        const showTriangleCheckbox = document.getElementById('showTriangle');
        const toggleSideButton = document.getElementById('toggleTriangleSide');
        const showConstructionLinesCheckbox = document.getElementById('showConstructionLines');
        const showCircumcircleCheckbox = document.getElementById('showCircumcircle');
        const triangleInfo = document.getElementById('triangleInfo');

        // Initialize UI from state
        const triangleSettings = this.state.getTriangleSettings();
        showTriangleCheckbox.checked = triangleSettings.show;
        showConstructionLinesCheckbox.checked = triangleSettings.showConstructionLines;
        showCircumcircleCheckbox.checked = triangleSettings.showCircumcircle;

        showTriangleCheckbox.addEventListener('change', (e) => {
            this.state.updateTriangleSetting('show', e.target.checked);
            triangleInfo.style.display = e.target.checked ? 'block' : 'none';

            // Enable/disable triangle-related controls
            toggleSideButton.disabled = !e.target.checked;
            showConstructionLinesCheckbox.disabled = !e.target.checked;
            showCircumcircleCheckbox.disabled = !e.target.checked;

            // Handle tetrahedron dependency
            this.handleTetrahedronDependency(!e.target.checked);

            // Clear checkboxes when triangle is hidden
            if (!e.target.checked) {
                showConstructionLinesCheckbox.checked = false;
                showCircumcircleCheckbox.checked = false;
                this.state.updateTriangleSetting('showConstructionLines', false);
                this.state.updateTriangleSetting('showCircumcircle', false);
            }

            this.syncTriangleWithState();
            this.updateTriangle();
            this.draw();
        });

        toggleSideButton.addEventListener('click', () => {
            const currentSettings = this.state.getTriangleSettings();
            const newSide = currentSettings.side === 'top' ? 'bottom' : 'top';
            this.state.updateTriangleSetting('side', newSide);
            this.syncTriangleWithState();
            this.updateTriangle();
            this.draw();
        });

        showConstructionLinesCheckbox.addEventListener('change', (e) => {
            this.state.updateTriangleSetting('showConstructionLines', e.target.checked);
            this.syncTriangleWithState();
            this.draw();
        });

        showCircumcircleCheckbox.addEventListener('change', (e) => {
            this.state.updateTriangleSetting('showCircumcircle', e.target.checked);
            this.syncTriangleWithState();
            this.draw();
        });

        // Initialize button states based on current state
        const isTriangleVisible = this.state.isTriangleVisible();
        toggleSideButton.disabled = !isTriangleVisible;
        showConstructionLinesCheckbox.disabled = !isTriangleVisible;
        showCircumcircleCheckbox.disabled = !isTriangleVisible;
        triangleInfo.style.display = isTriangleVisible ? 'block' : 'none';
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
            document.getElementById('sideLengths').innerHTML =
                '<span style="color: #ff6666;">Triangle cannot be calculated</span>';
            return;
        }

        const sideLengths = this.triangle.getSideLengths();
        const sideLengths3D = this.triangle.get3DSideLengths();

        if (sideLengths && sideLengths3D) {
            document.getElementById('sideLengths').innerHTML =
                `Screen: AB=${sideLengths.ab}, BC=${sideLengths.bc}, CA=${sideLengths.ca}<br>` +
                `3D: AB=${sideLengths3D.ab}, BC=${sideLengths3D.bc}, CA=${sideLengths3D.ca}`;
        }
    }

    setupTetrahedronControls() {
        const showTetrahedronCheckbox = document.getElementById('showTetrahedron');
        const toggleSideButton = document.getElementById('toggleTetrahedronSide');
        const showEdgesCheckbox = document.getElementById('showTetrahedronEdges');
        const tetrahedronInfo = document.getElementById('tetrahedronInfo');
        const enableTriangleDragCheckbox = document.getElementById('enableTriangleDrag');
        const enableTetrahedronDragCheckbox = document.getElementById('enableTetrahedronDrag');

        // Initialize UI from state
        const triangleSettings = this.state.getTriangleSettings();
        const tetrahedronSettings = this.state.getTetrahedronSettings();
        showTetrahedronCheckbox.checked = tetrahedronSettings.show;
        showEdgesCheckbox.checked = tetrahedronSettings.showEdges;
        enableTriangleDragCheckbox.checked = triangleSettings.isDraggable;
        enableTetrahedronDragCheckbox.checked = tetrahedronSettings.isDraggable;

        showTetrahedronCheckbox.addEventListener('change', (e) => {
            this.state.updateTetrahedronSetting('show', e.target.checked);
            tetrahedronInfo.style.display = e.target.checked ? 'block' : 'none';

            // Enable/disable tetrahedron-related controls
            toggleSideButton.disabled = !e.target.checked;
            showEdgesCheckbox.disabled = !e.target.checked;
            enableTetrahedronDragCheckbox.disabled = !e.target.checked;

            // Clear tetrahedron settings when hidden
            if (!e.target.checked) {
                showEdgesCheckbox.checked = true; // Reset to default
                this.state.updateTetrahedronSetting('showEdges', true);
            }

            this.syncTetrahedronWithState();
            this.updateTetrahedron();
            this.draw();
        });

        toggleSideButton.addEventListener('click', () => {
            const currentSettings = this.state.getTetrahedronSettings();
            const newSide = currentSettings.side === 'above' ? 'below' : 'above';
            this.state.updateTetrahedronSetting('side', newSide);
            this.syncTetrahedronWithState();
            this.updateTetrahedron();
            this.draw();
        });

        showEdgesCheckbox.addEventListener('change', (e) => {
            this.state.updateTetrahedronSetting('showEdges', e.target.checked);
            this.syncTetrahedronWithState();
            this.draw();
        });

        enableTriangleDragCheckbox.addEventListener('change', (e) => {
            this.state.updateTriangleSetting('isDraggable', e.target.checked);
            this.syncTriangleWithState();
        });

        enableTetrahedronDragCheckbox.addEventListener('change', (e) => {
            this.state.updateTetrahedronSetting('isDraggable', e.target.checked);
            this.syncTetrahedronWithState();
        });

        // Initialize button states based on current state
        const isTetrahedronVisible = this.state.isTetrahedronVisible();
        const isTriangleVisible = this.state.isTriangleVisible();

        toggleSideButton.disabled = !isTetrahedronVisible;
        showEdgesCheckbox.disabled = !isTetrahedronVisible;
        enableTetrahedronDragCheckbox.disabled = !isTetrahedronVisible;
        showTetrahedronCheckbox.disabled = !isTriangleVisible; // Initially disabled until triangle is shown
        tetrahedronInfo.style.display = isTetrahedronVisible ? 'block' : 'none';
    }

    handleTetrahedronDependency(disableTetrahedron) {
        const showTetrahedronCheckbox = document.getElementById('showTetrahedron');
        const toggleTetrahedronSideButton = document.getElementById('toggleTetrahedronSide');
        const showTetrahedronEdgesCheckbox = document.getElementById('showTetrahedronEdges');
        const enableTetrahedronDragCheckbox = document.getElementById('enableTetrahedronDrag');
        const tetrahedronInfo = document.getElementById('tetrahedronInfo');

        if (disableTetrahedron) {
            // Disable and clear tetrahedron when triangle is hidden
            showTetrahedronCheckbox.disabled = true;
            showTetrahedronCheckbox.checked = false;
            this.state.updateTetrahedronSetting('show', false);

            // Disable all tetrahedron controls
            toggleTetrahedronSideButton.disabled = true;
            showTetrahedronEdgesCheckbox.disabled = true;
            enableTetrahedronDragCheckbox.disabled = true;

            // Hide tetrahedron info
            tetrahedronInfo.style.display = 'none';

            // Reset tetrahedron settings
            showTetrahedronEdgesCheckbox.checked = true;
            this.state.updateTetrahedronSetting('showEdges', true);

            this.syncTetrahedronWithState();
        } else {
            // Enable tetrahedron checkbox when triangle is shown
            showTetrahedronCheckbox.disabled = false;
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
            document.getElementById('tetrahedronEdgeLengths').innerHTML =
                `AB=${edgeLengths.ab}, BC=${edgeLengths.bc}, CA=${edgeLengths.ca}<br>` +
                `DA=${edgeLengths.da}, DB=${edgeLengths.db}, DC=${edgeLengths.dc}`;
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
