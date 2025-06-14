class Controls {
    constructor(grid, onUpdate, appState) {  // Add appState parameter
        this.grid = grid;
        this.onUpdate = onUpdate;
        this.appState = appState;  // Store reference to app state
        this.initializeElements();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
    }

    initializeElements() {
        this.elements = {
            snapToGridX: document.getElementById('snapToGridX'),
            snapToGridY: document.getElementById('snapToGridY'),
            gridSize: document.getElementById('gridSize'),
            gridSizeValue: document.getElementById('gridSizeValue'),
            showGrid: document.getElementById('showGrid'),
            showCoordinates: document.getElementById('showCoordinates')
        };

        // Initialize UI from state instead of grid object
        const gridSettings = this.appState.getGridSettings();
        this.elements.gridSizeValue.textContent = gridSettings.size;
        this.elements.snapToGridX.checked = gridSettings.snapX;
        this.elements.snapToGridY.checked = gridSettings.snapY;
        this.elements.showGrid.checked = gridSettings.show;
        this.elements.showCoordinates.checked = gridSettings.showCoordinates;
        this.elements.gridSize.value = gridSettings.size;
    }

    setupEventListeners() {
        this.elements.snapToGridX.addEventListener('change', (e) => {
            this.appState.updateGridSetting('snapX', e.target.checked);
            this.syncGridFromState();
            this.onUpdate();
        });

        this.elements.snapToGridY.addEventListener('change', (e) => {
            this.appState.updateGridSetting('snapY', e.target.checked);
            this.syncGridFromState();
            this.onUpdate();
        });

        this.elements.gridSize.addEventListener('input', (e) => {
            const newSize = parseInt(e.target.value);
            this.appState.updateGridSetting('size', newSize);
            this.elements.gridSizeValue.textContent = newSize;
            this.syncGridFromState();
            this.onUpdate();
        });

        this.elements.showGrid.addEventListener('change', (e) => {
            this.appState.updateGridSetting('show', e.target.checked);
            this.syncGridFromState();
            this.onUpdate();
        });

        this.elements.showCoordinates.addEventListener('change', (e) => {
            this.appState.updateGridSetting('showCoordinates', e.target.checked);
            this.syncGridFromState();
            this.onUpdate();
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            const gridSettings = this.appState.getGridSettings();

            switch(event.key.toLowerCase()) {
                case 'x':
                    const newSnapX = !gridSettings.snapX;
                    this.toggleCheckbox(this.elements.snapToGridX);
                    this.appState.updateGridSetting('snapX', newSnapX);
                    this.syncGridFromState();
                    break;
                case 'y':
                    const newSnapY = !gridSettings.snapY;
                    this.toggleCheckbox(this.elements.snapToGridY);
                    this.appState.updateGridSetting('snapY', newSnapY);
                    this.syncGridFromState();
                    break;
                case 'g':
                    const newShow = !gridSettings.show;
                    this.toggleCheckbox(this.elements.showGrid);
                    this.appState.updateGridSetting('show', newShow);
                    this.syncGridFromState();
                    break;
                case 'c':
                    const newShowCoords = !gridSettings.showCoordinates;
                    this.toggleCheckbox(this.elements.showCoordinates);
                    this.appState.updateGridSetting('showCoordinates', newShowCoords);
                    this.syncGridFromState();
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
            this.onUpdate();
        });
    }

    toggleCheckbox(checkbox) {
        checkbox.checked = !checkbox.checked;
    }

    adjustGridSize(delta) {
        const currentSettings = this.appState.getGridSettings();
        const newSize = Math.max(10, Math.min(100, currentSettings.size + delta));

        this.appState.updateGridSetting('size', newSize);
        this.elements.gridSize.value = newSize;
        this.elements.gridSizeValue.textContent = newSize;
        this.syncGridFromState();
    }

    // Sync the grid object with current state
    syncGridFromState() {
        const gridSettings = this.appState.getGridSettings();
        this.grid.snapX = gridSettings.snapX;
        this.grid.snapY = gridSettings.snapY;
        this.grid.size = gridSettings.size;
        this.grid.show = gridSettings.show;
        this.grid.showCoordinates = gridSettings.showCoordinates;
    }
}

