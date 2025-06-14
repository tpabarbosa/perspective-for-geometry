class GeometryApp {
    constructor() {
        this.canvasManager = new CanvasManager('geometryCanvas');
        this.grid = new Grid();
        this.horizonLine = new HorizonLine(0.4);

        this.points = [
            new Point(0.25, 0.25, 'A', '#ff0000'),
            new Point(0.75, 0.67, 'B', '#0000ff')
        ];

        this.triangle = new EquilateralTriangle(this.points[0], this.points[1], 'bottom');
        this.showTriangle = false;
        this.showConstruction = true;

        this.tetrahedron = new EquilateralTetrahedron(this.triangle);
        this.showTetrahedron = false;

        this.vanishingPoint = new VanishingPoint(0.5, 0.4, 'VP', '#00ff00');

        this.perspectiveCamera = new PerspectiveCamera(
            800, 600, this.horizonLine, this.vanishingPoint
        );

        this.isDragging = false;
        this.draggedPoint = null;
        this.draggedHorizon = false;

        this.draggedTriangle = false;
        this.draggedTetrahedron = false;

        this.mouseOffset = { x: 0, y: 0 };

        this.controls = new Controls(this.grid, () => this.draw());
        this.setupTriangleControls();
        this.setupTetrahedronControls();
        this.setupMouseEvents();
        this.setupTouchEvents();
        this.initialize();
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

        // Draw triangle if enabled
        if (this.showTriangle) {
            this.triangle.draw(this.canvasManager.ctx);

            // Only draw point C if it exists
            if (this.triangle.pointC) {
                const showCoords = this.grid.snapX || this.grid.snapY;
                this.triangle.drawPointC(this.canvasManager.ctx, showCoords);
            }
        }

        // Draw tetrahedron if enabled
        if (this.showTetrahedron && this.showTriangle) {
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

        showTriangleCheckbox.addEventListener('change', (e) => {
            this.showTriangle = e.target.checked;
            triangleInfo.style.display = this.showTriangle ? 'block' : 'none';

            // Enable/disable triangle-related controls
            toggleSideButton.disabled = !this.showTriangle;
            showConstructionLinesCheckbox.disabled = !this.showTriangle;
            showCircumcircleCheckbox.disabled = !this.showTriangle;

            // Handle tetrahedron dependency
            this.handleTetrahedronDependency(!this.showTriangle);

            // Clear checkboxes when triangle is hidden
            if (!this.showTriangle) {
                showConstructionLinesCheckbox.checked = false;
                showCircumcircleCheckbox.checked = false;
                this.triangle.showConstructionLines = false;
                this.triangle.showCircumcircle = false;
            }

            this.updateTriangle();
            this.draw();
        });

        toggleSideButton.addEventListener('click', () => {
            this.triangle.side = this.triangle.side === 'top' ? 'bottom' : 'top';
            this.updateTriangle();
            this.draw();
        });

        showConstructionLinesCheckbox.addEventListener('change', (e) => {
            this.triangle.showConstructionLines = e.target.checked;
            this.draw();
        });

        showCircumcircleCheckbox.addEventListener('change', (e) => {
            this.triangle.showCircumcircle = e.target.checked;
            this.draw();
        });

        // Initialize button states
        toggleSideButton.disabled = true;
        showConstructionLinesCheckbox.disabled = true;
        showCircumcircleCheckbox.disabled = true;
    }


    updateTriangle() {
        if (this.showTriangle) {
            this.triangle.calculateVertexC(
                this.canvasManager.canvas.width,
                this.canvasManager.canvas.height,
                this.vanishingPoint,
                this.perspectiveCamera
            );
            this.updateTriangleInfo();

            // Update tetrahedron when triangle changes
            if (this.showTetrahedron) {
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

        showTetrahedronCheckbox.addEventListener('change', (e) => {
            this.showTetrahedron = e.target.checked;
            tetrahedronInfo.style.display = this.showTetrahedron ? 'block' : 'none';

            // Enable/disable tetrahedron-related controls
            toggleSideButton.disabled = !this.showTetrahedron;
            showEdgesCheckbox.disabled = !this.showTetrahedron;
            enableTetrahedronDragCheckbox.disabled = !this.showTetrahedron;

            // Clear tetrahedron settings when hidden
            if (!this.showTetrahedron) {
                showEdgesCheckbox.checked = true; // Reset to default
                this.tetrahedron.showEdges = true;
            }

            this.updateTetrahedron();
            this.draw();
        });

        toggleSideButton.addEventListener('click', () => {
            this.tetrahedron.toggleSide();
            this.updateTetrahedron();
            this.draw();
        });

        showEdgesCheckbox.addEventListener('change', (e) => {
            this.tetrahedron.showEdges = e.target.checked;
            this.draw();
        });

        enableTriangleDragCheckbox.addEventListener('change', (e) => {
            this.triangle.isDraggable = e.target.checked;
        });

        enableTetrahedronDragCheckbox.addEventListener('change', (e) => {
            this.tetrahedron.isDraggable = e.target.checked;
        });

        // Initialize button states - tetrahedron starts disabled
        toggleSideButton.disabled = true;
        showEdgesCheckbox.disabled = true;
        enableTetrahedronDragCheckbox.disabled = true;
        showTetrahedronCheckbox.disabled = true; // Initially disabled until triangle is shown
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
            this.showTetrahedron = false;

            // Disable all tetrahedron controls
            toggleTetrahedronSideButton.disabled = true;
            showTetrahedronEdgesCheckbox.disabled = true;
            enableTetrahedronDragCheckbox.disabled = true;

            // Hide tetrahedron info
            tetrahedronInfo.style.display = 'none';

            // Reset tetrahedron settings
            showTetrahedronEdgesCheckbox.checked = true;
            this.tetrahedron.showEdges = true;
        } else {
            // Enable tetrahedron checkbox when triangle is shown
            showTetrahedronCheckbox.disabled = false;
        }
    }

    updateTetrahedron() {
        if (this.showTetrahedron && this.showTriangle) {
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
        if (this.showTetrahedron && this.tetrahedron.startDrag(mousePos.x, mousePos.y)) {
            this.draggedTetrahedron = true;
            this.canvasManager.canvas.style.cursor = 'grabbing';
            return;
        }

        // Check for triangle drag
        if (this.showTriangle && this.triangle.startDrag(mousePos.x, mousePos.y)) {
            this.draggedTriangle = true;
            this.canvasManager.canvas.style.cursor = 'grabbing';
            return;
        }

        // Check for individual point drag
        const pointUnderMouse = this.getPointUnderMouse(mousePos);
        if (pointUnderMouse) {
            this.isDragging = true;
            this.draggedPoint = pointUnderMouse;
            this.mouseOffset = {
                x: mousePos.x - pointUnderMouse.absoluteX,
                y: mousePos.y - pointUnderMouse.absoluteY
            };
            this.canvasManager.canvas.style.cursor = 'grabbing';
        } else if (this.horizonLine.isNearLine(mousePos.y)) {
            this.draggedHorizon = true;
            this.mouseOffset = {
                x: 0,
                y: mousePos.y - this.horizonLine.yAbsolute
            };
            this.canvasManager.canvas.style.cursor = 'grabbing';
        }
    }

    handleMouseMove(event) {
        const mousePos = this.canvasManager.getMousePosition(event);

        if (this.draggedTetrahedron) {
            this.tetrahedron.drag(
                mousePos.x, mousePos.y,
                this.canvasManager.canvas.width,
                this.canvasManager.canvas.height,
                this.grid
            );
            this.updateTriangle(); // This will also update tetrahedron
            this.draw();
        } else if (this.draggedTriangle) {
            this.triangle.drag(
                mousePos.x, mousePos.y,
                this.canvasManager.canvas.width,
                this.canvasManager.canvas.height,
                this.grid
            );
            this.updateTriangle(); // This will also update tetrahedron if shown
            this.draw();
        } else if (this.isDragging && this.draggedPoint) {
            const newX = mousePos.x - this.mouseOffset.x;
            const newY = mousePos.y - this.mouseOffset.y;

            this.draggedPoint.setPosition(
                newX, newY,
                this.canvasManager.canvas.width,
                this.canvasManager.canvas.height,
                this.grid
            );

            // If dragging vanishing point, keep it on horizon line
            if (this.draggedPoint.isVanishingPoint) {
                this.draggedPoint.absoluteY = this.horizonLine.yAbsolute;
                this.draggedPoint.updateRelativePosition(
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
            if (this.showTriangle) {
                this.updateTriangle();
            }

            this.draw();
        } else if (this.draggedHorizon) {
            const newY = mousePos.y - this.mouseOffset.y;
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
            if (this.showTriangle) {
                this.updateTriangle();
            }

            this.draw();
        } else {
            // Update cursor based on what's under mouse
            this.updateCursor(mousePos);
        }
    }

    updateCursor(mousePos) {
        // Check for tetrahedron drag area first (highest priority)
        if (this.showTetrahedron && this.tetrahedron.isPointNearTetrahedron(mousePos.x, mousePos.y)) {
            this.canvasManager.canvas.style.cursor = 'grab';
            return;
        }

        // Check for triangle drag area
        if (this.showTriangle && this.triangle.isPointInsideTriangle(mousePos.x, mousePos.y)) {
            this.canvasManager.canvas.style.cursor = 'grab';
            return;
        }

        // Check for individual points
        const pointUnderMouse = this.getPointUnderMouse(mousePos);

        // Special cursor for point C (not draggable individually)
        if (this.showTriangle && this.triangle.pointC &&
            this.triangle.pointC.isPointInside(mousePos.x, mousePos.y)) {
            this.canvasManager.canvas.style.cursor = 'not-allowed';
        }
        // Special cursor for point D (not draggable individually)
        else if (this.showTetrahedron && this.tetrahedron.pointD &&
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
        if (this.draggedTetrahedron) {
            this.tetrahedron.stopDrag();
            this.draggedTetrahedron = false;
        }

        if (this.draggedTriangle) {
            this.triangle.stopDrag();
            this.draggedTriangle = false;
        }

        this.isDragging = false;
        this.draggedPoint = null;
        this.draggedHorizon = false;
        this.canvasManager.canvas.style.cursor = 'default';
    }

    handleMouseLeave(event) {
        if (this.isDragging) {
            this.isDragging = false;
            this.draggedPoint = null;
        }
        if (this.draggedHorizon) {
            this.draggedHorizon = false;
        }
        this.canvasManager.canvas.style.cursor = 'default';
    }
}
