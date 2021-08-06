class Coords {
    constructor(x, y, parent = null) {
        this._x = x;
        this._y = y;
        this.parent = parent;
    }
    get x() { return this._x; }
    get y() { return this._y; }
    set x(value) {
        this._x = value;
        if (this.parent != null) {
            this.parent.nonce++;
        }
        return true;
    }
    set y(value) {
        this._y = value;
        if (this.parent != null) {
            this.parent.nonce++;
        }
        return true;
    }
    dist(other) {
        let dx = Math.abs(this.x - other.x);
        let dy = Math.abs(this.y - other.y);
        let d = min(dx, dy);
        let s = max(dx, dy) - d;
        return d + s;
    }
}