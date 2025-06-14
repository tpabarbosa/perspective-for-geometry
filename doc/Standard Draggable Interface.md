// Standard Draggable Interface (documentation)
// All draggable objects should implement these methods:

// isPointInDragArea(mouseX, mouseY) -> boolean
//   - Returns true if the mouse position is in a draggable area of this object
//   - Used for cursor changes and determining what can be dragged

// startDrag(mouseX, mouseY) -> boolean
//   - Attempts to start dragging this object
//   - Returns true if drag started successfully, false otherwise
//   - Should store any necessary drag state (like offset)

// drag(mouseX, mouseY, canvasWidth, canvasHeight, grid) -> void
//   - Updates object position during drag
//   - Only called if startDrag() returned true
//   - Should handle grid snapping and boundary constraints

// stopDrag() -> void
//   - Cleans up drag state
//   - Called when drag operation ends

// isDragging() -> boolean
//   - Returns true if this object is currently being dragged
//   - Used to determine drag state and visual feedback
