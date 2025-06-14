# Perspective Study - Geometry

An interactive web application for studying perspective geometry through hands-on manipulation of equilateral triangles and tetrahedra in 3D space.

## Overview

This tool demonstrates the mathematical relationship between 2D screen coordinates and 3D world space using perspective projection. Users can drag points to create and manipulate equilateral triangles and tetrahedra while observing how they maintain their geometric properties in perspective view.

## Features

### Core Geometry
- **Interactive Points**: Drag points A and B to define triangle base
- **Equilateral Triangles**: Automatically calculated third vertex (C) maintains equilateral properties in 3D space
- **Tetrahedra**: Fourth vertex (D) creates regular tetrahedron above/below triangle base
- **Real-time 3D Calculations**: All coordinates computed in true 3D space and projected to screen

### Perspective System
- **Horizon Line**: Adjustable horizon with vanishing point
- **Perspective Camera**: Simulates realistic perspective projection
- **Grid System**: Optional grid with snapping for precise positioning
- **Coordinate Display**: Shows both screen and 3D world coordinates

### Visual Aids
- **Construction Lines**: Perpendicular bisectors, altitudes, and midpoints
- **Circumcircle**: Shows circumscribed circle of triangles
- **Edge Highlighting**: Visual feedback during dragging operations
- **Measurement Display**: Real-time side lengths and edge measurements

### Interactive Controls
- **Draggable Objects**: Points, triangles, tetrahedra, and horizon line
- **Keyboard Shortcuts**: Quick access to common functions
- **Toggle Options**: Show/hide various geometric elements
- **Responsive Design**: Works on desktop and touch devices

## Usage

### Basic Operation
1. **Move Points**: Drag points A, B, or the vanishing point (VP)
2. **Enable Triangle**: Check "Show Triangle" to see equilateral triangle
3. **Enable Tetrahedron**: Check "Show Tetrahedron" to add fourth vertex
4. **Adjust View**: Drag horizon line up/down to change perspective

### Advanced Features
- **Grid Snapping**: Enable X/Y grid snapping for precise positioning
- **Construction Lines**: View geometric construction details
- **Side Toggle**: Switch triangle/tetrahedron orientation
- **Drag Shapes**: Enable dragging entire shapes vs. individual points

### Keyboard Shortcuts
- `G` - Toggle grid visibility
- `X` - Toggle X-axis grid snapping
- `Y` - Toggle Y-axis grid snapping
- `C` - Toggle coordinate display
- `+/-` - Adjust grid size

## Technical Implementation

### Architecture
- **Modular Design**: Separate classes for geometry, rendering, and UI
- **State Management**: Centralized application state with change notifications
- **Renderer System**: Specialized renderers for different geometric elements
- **Math Utilities**: Vector operations, perspective calculations, and geometric algorithms

### Key Classes
- `GeometryApp` - Main application controller
- `PerspectiveCamera` - 3D perspective projection system
- `EquilateralTriangle` - Triangle geometry and calculations
- `EquilateralTetrahedron` - Tetrahedron geometry and calculations
- `RenderManager` - Coordinates all rendering operations

### Mathematical Foundation
- **Perspective Projection**: Screen ↔ 3D world coordinate conversion
- **Equilateral Geometry**: Maintains equal side lengths in 3D space
- **Vector Mathematics**: 3D vector operations and transformations
- **Geometric Algorithms**: Distance calculations, point-in-triangle tests, circumcenter computation

## File Structure

```
js/
├── GeometryApp.js          # Main application class
├── AppState.js             # State management
├── Canvas.js               # Canvas management
├── UIController.js         # User interface controller
├── Point.js                # Point and VanishingPoint classes
├── Triangle.js             # EquilateralTriangle class
├── Tetrahedron.js          # EquilateralTetrahedron class
├── HorizonLine.js          # Horizon line implementation
├── PerspectiveCamera.js    # 3D perspective system
├── Grid.js                 # Grid system
├── math/
│   ├── Vector3D.js         # 3D vector operations
│   ├── GeometryUtils.js    # Geometric utility functions
│   └── PerspectiveUtils.js # Perspective projection utilities
└── renderers/
    ├── BaseRenderer.js     # Base renderer class
    ├── RenderManager.js    # Rendering coordinator
    ├── PointRenderer.js    # Point rendering
    ├── TriangleRenderer.js # Triangle rendering
    ├── TetrahedronRenderer.js # Tetrahedron rendering
    ├── GridRenderer.js     # Grid rendering
    └── HorizonLineRenderer.js # Horizon line rendering
```

## Getting Started

1. **Clone or Download**: Get the project files
2. **Open HTML**: Open `index.html` in a modern web browser
3. **Start Exploring**: Drag points and enable geometric shapes
4. **Experiment**: Try different perspective settings and view options

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Canvas Support**: Requires HTML5 Canvas API
- **Touch Support**: Works on tablets and touch devices
- **Responsive**: Adapts to different screen sizes

## Educational Applications

### Geometry Students
- Understand equilateral triangle properties
- Visualize 3D geometric relationships
- Explore perspective drawing concepts

### Art Students
- Learn perspective drawing fundamentals
- Practice vanishing point techniques
- Understand horizon line placement

### Mathematics
- Study coordinate transformations
- Explore 3D to 2D projection
- Investigate geometric algorithms

## Development

### Adding Features
1. Create new classes following the established patterns
2. Implement the draggable interface for interactive objects
3. Add corresponding renderers for visual elements
4. Update the state management system as needed

### Testing
- Math utilities include built-in test functions
- Console logging provides debugging information
- Visual feedback helps verify geometric calculations

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

---

**Note**: This is an educational tool designed to help understand perspective geometry concepts. While mathematically accurate, it's intended for learning rather than professional drafting applications.
