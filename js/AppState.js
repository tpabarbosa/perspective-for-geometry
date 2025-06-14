class AppState {
    constructor() {
        // UI/Display settings
        this.ui = {
            grid: {
                snapX: false,
                snapY: false,
                size: 50,
                show: true,
                showCoordinates: false
            }
        };

        // Triangle settings
        this.triangle = {
            show: true,
            showConstructionLines: false,
            showCircumcircle: false,
            isDraggable: true,
            side: 'bottom' // 'top' or 'bottom'
        };

        // Tetrahedron settings
        this.tetrahedron = {
            show: true,
            showEdges: true,
            isDraggable: true,
            side: 'above' // 'above' or 'below'
        };

        // Current interaction state
        this.interaction = {
            isDragging: false,
            draggedPoint: null,
            draggedHorizon: false,
            draggedTriangle: false,
            draggedTetrahedron: false,
            mouseOffset: { x: 0, y: 0 }
        };

        // Change listeners
        this.listeners = [];
    }

    // Subscription system for change notifications
    subscribe(callback) {
        this.listeners.push(callback);
    }

    unsubscribe(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    // Notify all listeners of state changes
    notify(category, key, value) {
        this.listeners.forEach(listener => {
            listener({ category, key, value, state: this });
        });
    }

    // Grid settings getters/setters
    getGridSettings() {
        return { ...this.ui.grid };
    }

    updateGridSetting(key, value) {
        if (this.ui.grid.hasOwnProperty(key)) {
            this.ui.grid[key] = value;
            this.notify('grid', key, value);
        }
    }

    // Triangle settings getters/setters
    getTriangleSettings() {
        return { ...this.triangle };
    }

    updateTriangleSetting(key, value) {
        if (this.triangle.hasOwnProperty(key)) {
            this.triangle[key] = value;
            this.notify('triangle', key, value);
        }
    }

    // Tetrahedron settings getters/setters
    getTetrahedronSettings() {
        return { ...this.tetrahedron };
    }

    updateTetrahedronSetting(key, value) {
        if (this.tetrahedron.hasOwnProperty(key)) {
            this.tetrahedron[key] = value;
            this.notify('tetrahedron', key, value);
        }
    }

    // Interaction state getters/setters
    getInteractionState() {
        return { ...this.interaction };
    }

    updateInteractionState(key, value) {
        if (this.interaction.hasOwnProperty(key)) {
            this.interaction[key] = value;
            this.notify('interaction', key, value);
        }
    }

    // Convenience methods for common operations
    isTriangleVisible() {
        return this.triangle.show;
    }

    isTetrahedronVisible() {
        return this.tetrahedron.show;
    }

    isGridVisible() {
        return this.ui.grid.show;
    }

    isDraggingAny() {
        return this.interaction.isDragging ||
               this.interaction.draggedHorizon ||
               this.interaction.draggedTriangle ||
               this.interaction.draggedTetrahedron;
    }

    // Reset all drag states
    clearDragState() {
        this.interaction.isDragging = false;
        this.interaction.draggedPoint = null;
        this.interaction.draggedHorizon = false;
        this.interaction.draggedTriangle = false;
        this.interaction.draggedTetrahedron = false;
        this.interaction.mouseOffset = { x: 0, y: 0 };
        this.notify('interaction', 'dragCleared', true);
    }
}
