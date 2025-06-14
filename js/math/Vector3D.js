class Vector3D {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    // Create vector from two points
    static fromPoints(point1, point2) {
        return new Vector3D(
            point2.x - point1.x,
            point2.y - point1.y,
            point2.z - point1.z
        );
    }

    // Vector operations
    add(other) {
        return new Vector3D(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    subtract(other) {
        return new Vector3D(this.x - other.x, this.y - other.y, this.z - other.z);
    }

    multiply(scalar) {
        return new Vector3D(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    divide(scalar) {
        if (scalar === 0) throw new Error('Division by zero');
        return new Vector3D(this.x / scalar, this.y / scalar, this.z / scalar);
    }

    // Dot product
    dot(other) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    // Cross product
    cross(other) {
        return new Vector3D(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x
        );
    }

    // Vector magnitude (length)
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    // Squared magnitude (faster when you don't need the actual distance)
    magnitudeSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    // Normalize vector (make it unit length)
    normalize() {
        const mag = this.magnitude();
        if (mag === 0) return new Vector3D(0, 0, 0);
        return this.divide(mag);
    }

    // Distance to another point
    distanceTo(other) {
        return Math.sqrt(
            Math.pow(other.x - this.x, 2) +
            Math.pow(other.y - this.y, 2) +
            Math.pow(other.z - this.z, 2)
        );
    }

    // Check if vectors are approximately equal (for floating point comparison)
    equals(other, tolerance = 0.0001) {
        return Math.abs(this.x - other.x) < tolerance &&
               Math.abs(this.y - other.y) < tolerance &&
               Math.abs(this.z - other.z) < tolerance;
    }

    // Convert to string for debugging
    toString() {
        return `Vector3D(${this.x.toFixed(3)}, ${this.y.toFixed(3)}, ${this.z.toFixed(3)})`;
    }

    // Create a copy
    clone() {
        return new Vector3D(this.x, this.y, this.z);
    }
}
