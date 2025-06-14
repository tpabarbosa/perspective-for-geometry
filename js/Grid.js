class Grid {
    constructor() {
        this.size = 50;
        this.snapX = false;
        this.snapY = false;
        this.show = true;
        this.showCoordinates = false;
    }

    // Remove the draw() method - rendering is now handled by GridRenderer

    setSize(size) {
        this.size = Math.max(10, Math.min(100, size));
    }
}

