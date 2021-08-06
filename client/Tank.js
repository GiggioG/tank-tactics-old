class Tank {
    constructor(name, color, pos, bio) {
        this.name = name;
        this.color = color;
        this.pos = pos;
        this.pos.parent = this;
        this.bio = bio;
        this.hp = 3;
        this.ap = 1;
        this.range = 2;
        this.nonce = 0;
        this.prevNonce = -1;
        this.selected = false;
    }
    show() {
        fill(this.color);
        stroke(255);
        let xInc = width / srv.boardSize;
        let yInc = height / srv.boardSize;
        let x = this.pos.x * xInc;
        let y = this.pos.y * yInc;
        strokeWeight(1);
        if (this.selected) { strokeWeight(5); }
        rect(x + 5, y + 5, xInc - 10, yInc - 10);
        strokeWeight(1);
        stroke(0);
        textSize(10);
        fill("#19e787");
        text(`${this.ap}`, x + 5, y + 5 + textAscent());
        fill("#ff0064");
        text(`${this.hp}`, x + 5 + xInc - 10 - textWidth(`${this.hp}`) - 1, y + 5 + textAscent());
        fill("#7c7c15");
        text(`${this.range}`, x + 5 + (xInc - 10) / 2 - textWidth(`${this.range}`) / 2, y + 5 + yInc - 10 - 2);
    }
    info(mytank = false) {
        if (this.nonce == this.prevNonce) { return; }
        this.prevNonce = this.nonce;
        let selector = (mytank ? "div#mytank-info" : "div#othertank-info");
        this.show();
        select(selector).elt.innerHTML = (`
        <div class="playerName" style="color: ${this.color}">${this.name}</div>
        <br>
        <div class="statIconContainer">
        ${"<i class=\"stat-icon fas fa-bolt\"></i>".repeat(this.ap)}
        </div>
        <br>
        <div class="statIconContainer">
        ${"<i class=\"stat-icon fas fa-heart\"></i>".repeat(this.hp)}
        </div>
        <br>
        <div class="playerStatTableContainer">
        <table class="playerStatTable"><tb>
            <tr>
                <td> <i class="stat-icon fas fa-crosshairs"></i> </td>
                <td> <span class="playerStat">${this.pos.x}, ${this.pos.y}</span> </td>
            </tr>
            <tr>
                <td> <i class="stat-icon fas fa-bullseye"></i> </td>
                <td> <span class="playerStat">${this.range}</span> </td>
            </tr>
        </tb></table>
        </div>
        <br>
        <div class="playerBioContainer"><p class="playerBio">
        ${this.bio}
        </p></div>
        `);
    }
}