class Controls {
    constructor(grid, onUpdate) {
        this.grid = grid;
        this.onUpdate = onUpdate;
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

        this.elements.gridSizeValue.textContent = this.grid.size;
    }

    setupEventListeners() {
        this.elements.snapToGridX.addEventListener('change', (e) => {
            this.grid.snapX = e.target.checked;
            this.onUpdate();
        });

        this.elements.snapToGridY.addEventListener('change', (e) => {
            this.grid.snapY = e.target.checked;
            this.onUpdate();
        });

        this.elements.gridSize.addEventListener('input', (e) => {
            this.grid.setSize(parseInt(e.target.value));
            this.elements.gridSizeValue.textContent = this.grid.size;
            this.onUpdate();
        });

        this.elements.showGrid.addEventListener('change', (e) => {
            this.grid.show = e.target.checked;
            this.onUpdate();
        });

        this.elements.showCoordinates.addEventListener('change', (e) => {
            this.grid.showCoordinates = e.target.checked;
            this.onUpdate();
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            switch(event.key.toLowerCase()) {
                case 'x':
                    this.toggleCheckbox(this.elements.snapToGridX);
                    this.grid.snapX = this.elements.snapToGridX.checked;
                    break;
                case 'y':
                    this.toggleCheckbox(this.elements.snapToGridY);
                    this.grid.snapY = this.elements.snapToGridY.checked;
                    break;
                case 'g':
                    this.toggleCheckbox(this.elements.showGrid);
                    this.grid.show = this.elements.showGrid.checked;
                    break;
                case 'c':
                    this.toggleCheckbox(this.elements.showCoordinates);
                    this.grid.showCoordinates = this.elements.showCoordinates.checked;
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
        const newSize = this.grid.size + delta;
        this.grid.setSize(newSize);
        this.elements.gridSize.value = this.grid.size;
        this.elements.gridSizeValue.textContent = this.grid.size;
    }
}
