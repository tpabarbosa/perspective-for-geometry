class UIController {
    constructor(appState, geometryApp) {
        this.appState = appState;
        this.geometryApp = geometryApp;
        this.elements = {};

        this.initializeElements();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.initializeUIFromState();
    }

    initializeElements() {
        // Grid controls
        this.elements.grid = {
            snapToGridX: document.getElementById('snapToGridX'),
            snapToGridY: document.getElementById('snapToGridY'),
            gridSize: document.getElementById('gridSize'),
            gridSizeValue: document.getElementById('gridSizeValue'),
            showGrid: document.getElementById('showGrid'),
            showCoordinates: document.getElementById('showCoordinates')
        };

        // Triangle controls
        this.elements.triangle = {
            showTriangle: document.getElementById('showTriangle'),
            toggleSide: document.getElementById('toggleTriangleSide'),
            showConstructionLines: document.getElementById('showConstructionLines'),
            showCircumcircle: document.getElementById('showCircumcircle'),
            info: document.getElementById('triangleInfo'),
            sideLengths: document.getElementById('sideLengths')
        };

        // Tetrahedron controls
        this.elements.tetrahedron = {
            showTetrahedron: document.getElementById('showTetrahedron'),
            toggleSide: document.getElementById('toggleTetrahedronSide'),
            showEdges: document.getElementById('showTetrahedronEdges'),
            info: document.getElementById('tetrahedronInfo'),
            edgeLengths: document.getElementById('tetrahedronEdgeLengths'),
            enableTriangleDrag: document.getElementById('enableTriangleDrag'),
            enableTetrahedronDrag: document.getElementById('enableTetrahedronDrag')
        };
    }

    initializeUIFromState() {
        // Initialize grid UI
        const gridSettings = this.appState.getGridSettings();
        this.elements.grid.snapToGridX.checked = gridSettings.snapX;
        this.elements.grid.snapToGridY.checked = gridSettings.snapY;
        this.elements.grid.showGrid.checked = gridSettings.show;
        this.elements.grid.showCoordinates.checked = gridSettings.showCoordinates;
        this.elements.grid.gridSize.value = gridSettings.size;
        this.elements.grid.gridSizeValue.textContent = gridSettings.size;

        // Initialize triangle UI
        const triangleSettings = this.appState.getTriangleSettings();
        this.elements.triangle.showTriangle.checked = triangleSettings.show;
        this.elements.triangle.showConstructionLines.checked = triangleSettings.showConstructionLines;
        this.elements.triangle.showCircumcircle.checked = triangleSettings.showCircumcircle;
        this.elements.tetrahedron.enableTriangleDrag.checked = triangleSettings.isDraggable;

        // Initialize tetrahedron UI
        const tetrahedronSettings = this.appState.getTetrahedronSettings();
        this.elements.tetrahedron.showTetrahedron.checked = tetrahedronSettings.show;
        this.elements.tetrahedron.showEdges.checked = tetrahedronSettings.showEdges;
        this.elements.tetrahedron.enableTetrahedronDrag.checked = tetrahedronSettings.isDraggable;

        // Set initial control states
        this.updateControlStates();
    }

    setupEventListeners() {
        this.setupGridEventListeners();
        this.setupTriangleEventListeners();
        this.setupTetrahedronEventListeners();
    }

    setupGridEventListeners() {
        this.elements.grid.snapToGridX.addEventListener('change', (e) => {
            this.appState.updateGridSetting('snapX', e.target.checked);
            this.geometryApp.onGridSettingChanged();
        });

        this.elements.grid.snapToGridY.addEventListener('change', (e) => {
            this.appState.updateGridSetting('snapY', e.target.checked);
            this.geometryApp.onGridSettingChanged();
        });

        this.elements.grid.gridSize.addEventListener('input', (e) => {
            const newSize = parseInt(e.target.value);
            this.appState.updateGridSetting('size', newSize);
            this.elements.grid.gridSizeValue.textContent = newSize;
            this.geometryApp.onGridSettingChanged();
        });

        this.elements.grid.showGrid.addEventListener('change', (e) => {
            this.appState.updateGridSetting('show', e.target.checked);
            this.geometryApp.onGridSettingChanged();
        });

        this.elements.grid.showCoordinates.addEventListener('change', (e) => {
            this.appState.updateGridSetting('showCoordinates', e.target.checked);
            this.geometryApp.onGridSettingChanged();
        });
    }

    setupTriangleEventListeners() {
        this.elements.triangle.showTriangle.addEventListener('change', (e) => {
            this.appState.updateTriangleSetting('show', e.target.checked);
            this.updateControlStates();
            this.geometryApp.onTriangleSettingChanged();
        });

        this.elements.triangle.toggleSide.addEventListener('click', () => {
            const currentSettings = this.appState.getTriangleSettings();
            const newSide = currentSettings.side === 'top' ? 'bottom' : 'top';
            this.appState.updateTriangleSetting('side', newSide);
            this.geometryApp.onTriangleSettingChanged();
        });

        this.elements.triangle.showConstructionLines.addEventListener('change', (e) => {
            this.appState.updateTriangleSetting('showConstructionLines', e.target.checked);
            this.geometryApp.onTriangleSettingChanged();
        });

        this.elements.triangle.showCircumcircle.addEventListener('change', (e) => {
            this.appState.updateTriangleSetting('showCircumcircle', e.target.checked);
            this.geometryApp.onTriangleSettingChanged();
        });

        this.elements.tetrahedron.enableTriangleDrag.addEventListener('change', (e) => {
            this.appState.updateTriangleSetting('isDraggable', e.target.checked);
            this.geometryApp.onTriangleSettingChanged();
        });
    }

    setupTetrahedronEventListeners() {
        this.elements.tetrahedron.showTetrahedron.addEventListener('change', (e) => {
            this.appState.updateTetrahedronSetting('show', e.target.checked);
            this.updateControlStates();
            this.geometryApp.onTetrahedronSettingChanged();
        });

        this.elements.tetrahedron.toggleSide.addEventListener('click', () => {
            const currentSettings = this.appState.getTetrahedronSettings();
            const newSide = currentSettings.side === 'above' ? 'below' : 'above';
            this.appState.updateTetrahedronSetting('side', newSide);
            this.geometryApp.onTetrahedronSettingChanged();
        });

        this.elements.tetrahedron.showEdges.addEventListener('change', (e) => {
            this.appState.updateTetrahedronSetting('showEdges', e.target.checked);
            this.geometryApp.onTetrahedronSettingChanged();
        });

        this.elements.tetrahedron.enableTetrahedronDrag.addEventListener('change', (e) => {
            this.appState.updateTetrahedronSetting('isDraggable', e.target.checked);
            this.geometryApp.onTetrahedronSettingChanged();
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            const gridSettings = this.appState.getGridSettings();

            switch(event.key.toLowerCase()) {
                case 'x':
                    const newSnapX = !gridSettings.snapX;
                    this.elements.grid.snapToGridX.checked = newSnapX;
                    this.appState.updateGridSetting('snapX', newSnapX);
                    this.geometryApp.onGridSettingChanged();
                    break;
                case 'y':
                    const newSnapY = !gridSettings.snapY;
                    this.elements.grid.snapToGridY.checked = newSnapY;
                    this.appState.updateGridSetting('snapY', newSnapY);
                    this.geometryApp.onGridSettingChanged();
                    break;
                case 'g':
                    const newShow = !gridSettings.show;
                    this.elements.grid.showGrid.checked = newShow;
                    this.appState.updateGridSetting('show', newShow);
                    this.geometryApp.onGridSettingChanged();
                    break;
                case 'c':
                    const newShowCoords = !gridSettings.showCoordinates;
                    this.elements.grid.showCoordinates.checked = newShowCoords;
                    this.appState.updateGridSetting('showCoordinates', newShowCoords);
                    this.geometryApp.onGridSettingChanged();
                    break;
                case '+':
                case '=':
                    this.adjustGridSize(5);
                    event.preventDefault();
                    break;
                case '-':
                    this.adjustGridSize(-5);
                    event.preventDefault();
                    break;
            }
        });
    }

    adjustGridSize(delta) {
        const currentSettings = this.appState.getGridSettings();
        const newSize = Math.max(10, Math.min(100, currentSettings.size + delta));

        this.appState.updateGridSetting('size', newSize);
        this.elements.grid.gridSize.value = newSize;
        this.elements.grid.gridSizeValue.textContent = newSize;
        this.geometryApp.onGridSettingChanged();
    }

    updateControlStates() {
        const isTriangleVisible = this.appState.isTriangleVisible();
        const isTetrahedronVisible = this.appState.isTetrahedronVisible();

        // Triangle control states
        this.elements.triangle.toggleSide.disabled = !isTriangleVisible;
        this.elements.triangle.showConstructionLines.disabled = !isTriangleVisible;
        this.elements.triangle.showCircumcircle.disabled = !isTriangleVisible;
        this.elements.triangle.info.style.display = isTriangleVisible ? 'block' : 'none';

        // Clear triangle settings when hidden
        if (!isTriangleVisible) {
            this.elements.triangle.showConstructionLines.checked = false;
            this.elements.triangle.showCircumcircle.checked = false;
            this.appState.updateTriangleSetting('showConstructionLines', false);
            this.appState.updateTriangleSetting('showCircumcircle', false);
        }

        // Tetrahedron control states
        this.elements.tetrahedron.showTetrahedron.disabled = !isTriangleVisible;
        this.elements.tetrahedron.toggleSide.disabled = !isTetrahedronVisible;
        this.elements.tetrahedron.showEdges.disabled = !isTetrahedronVisible;
        this.elements.tetrahedron.enableTetrahedronDrag.disabled = !isTetrahedronVisible;
        this.elements.tetrahedron.info.style.display = isTetrahedronVisible ? 'block' : 'none';

        // Handle tetrahedron dependency on triangle
        if (!isTriangleVisible && isTetrahedronVisible) {
            this.elements.tetrahedron.showTetrahedron.checked = false;
            this.appState.updateTetrahedronSetting('show', false);
            this.elements.tetrahedron.showEdges.checked = true;
            this.appState.updateTetrahedronSetting('showEdges', true);
        }
    }

    // Methods for GeometryApp to update UI displays
    updateTriangleInfo(sideLengths) {
        if (sideLengths) {
            this.elements.triangle.sideLengths.innerHTML = sideLengths;
        } else {
            this.elements.triangle.sideLengths.innerHTML =
                '<span style="color: #ff6666;">Triangle cannot be calculated</span>';
        }
    }

    updateTetrahedronInfo(edgeLengths) {
        if (edgeLengths) {
            this.elements.tetrahedron.edgeLengths.innerHTML = edgeLengths;
        }
    }
}
