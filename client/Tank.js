const bolt = `<svg class="fa-bolt stat-icon" viewBox="0 0 320 512"><path fill="currentColor" d="M296 160H180.6l42.6-129.8C227.2 15 215.7 0 200 0H56C44 0 33.8 8.9 32.2 20.8l-32 240C-1.7 275.2 9.5 288 24 288h118.7L96.6 482.5c-3.6 15.2 8 29.5 23.3 29.5 8.4 0 16.4-4.4 20.8-12l176-304c9.3-15.9-2.2-36-20.7-36z"></path></svg>`;
const heart = `<svg class="fa-heart stat-icon" viewBox="0 0 512 512"><path fill="currentColor" d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"></path></svg>`;
const crosshair = `<svg class="fa-crosshairs stat-icon" viewBox="0 0 512 512"><path fill="currentColor" d="M500 224h-30.364C455.724 130.325 381.675 56.276 288 42.364V12c0-6.627-5.373-12-12-12h-40c-6.627 0-12 5.373-12 12v30.364C130.325 56.276 56.276 130.325 42.364 224H12c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12h30.364C56.276 381.675 130.325 455.724 224 469.636V500c0 6.627 5.373 12 12 12h40c6.627 0 12-5.373 12-12v-30.364C381.675 455.724 455.724 381.675 469.636 288H500c6.627 0 12-5.373 12-12v-40c0-6.627-5.373-12-12-12zM288 404.634V364c0-6.627-5.373-12-12-12h-40c-6.627 0-12 5.373-12 12v40.634C165.826 392.232 119.783 346.243 107.366 288H148c6.627 0 12-5.373 12-12v-40c0-6.627-5.373-12-12-12h-40.634C119.768 165.826 165.757 119.783 224 107.366V148c0 6.627 5.373 12 12 12h40c6.627 0 12-5.373 12-12v-40.634C346.174 119.768 392.217 165.757 404.634 224H364c-6.627 0-12 5.373-12 12v40c0 6.627 5.373 12 12 12h40.634C392.232 346.174 346.243 392.217 288 404.634zM288 256c0 17.673-14.327 32-32 32s-32-14.327-32-32c0-17.673 14.327-32 32-32s32 14.327 32 32z"></path></svg>`;
const bullseye = `<svg class="fa-bullseye stat-icon" viewBox="0 0 512 512"><path fill="currentColor" d="M248 8C111.03 8 0 119.03 0 256s111.03 248 248 248 248-111.03 248-248S384.97 8 248 8zm0 432c-101.69 0-184-82.29-184-184 0-101.69 82.29-184 184-184 101.69 0 184 82.29 184 184 0 101.69-82.29 184-184 184zm0-312c-70.69 0-128 57.31-128 128s57.31 128 128 128 128-57.31 128-128-57.31-128-128-128zm0 192c-35.29 0-64-28.71-64-64s28.71-64 64-64 64 28.71 64 64-28.71 64-64 64z"></path></svg>`;

class Tank {
    constructor(name, color, pos, hp, ap, range, bio) {
        this.name = name;
        this.color = color;
        this.pos = pos;
        this.pos.parent = this;
        this.bio = bio;
        this.hp = hp;
        this.ap = ap;
        this.range = range;
        this.nonce = 0;
        this.prevNonce = -1;
        this.selected = false;
    }
    show() {
        if (this.hp <= 0) { return; }
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
        textSize(12);
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
        let html = "";
        html += `<div class="playerName" style="color: ${this.color}">${this.name}</div>`;
        if (mytank && srv.myTankDead && (!srv.winner)) {
            html += `
                <div class="player-vote-div">
                    <span class="player-vote${srv.myVote==null?" player-vote-noone":""}">You voted for: ${srv.myVote!=null?srv.myVote:""}</span>
                </div>
                <div>
                    <button ${srv.myVote==null?"class=\"vote-button-noone\"":""}onclick="vote()" title="Vote in the Jury">🗳 Vote</button>
                </div>
            `;
        }

        if (this.hp > 0) {
            html += `
                <br>
                <div class="statIconContainer">
                    ${bolt.repeat(this.ap)}
                </div>
                <br>
                <div class="statIconContainer">
                    ${heart.repeat(this.hp)}
                </div>
                <br>
                <div class="playerStatTableContainer">
                    <table class="playerStatTable"><tb>
                    <tr>
                        <td> ${crosshair} </td>
                        <td> <span class="playerStat">${this.pos.x}, ${this.pos.y}</span> </td>
                    </tr>
                    <tr>
                        <td> ${bullseye} </td>
                        <td> <span class="playerStat">${this.range}</span> </td>
                    </tr>
                    </tb></table>
                </div>
            `;
        }

        if (mytank && (!srv.myTankDead) && (!srv.winner)) {
            html += `
                <div>
                    <button onclick="move()" title="Move">🡆</button>
                    <button onclick="give()" title="Give AP">✋</button>
                    <button onclick="attack()" title="Attack">⚔️</button>
                    <button onclick="upgrade()" title="Upgrade range">◎</button>
                </div>
            `;
        }
        if (srv.winner && this.name == srv.winner) {
            html += `
                <div class="winner-div">
                    <h1 class="modal-h blinkColor">${mytank?"YOU":srv.winner} ${mytank?"HAVE":"HAS"} WON!!!</h1>
                </div>
            `;
        }
        html += `<div class="playerBioContainer"><p class="playerBio">${this.bio}</p></div>`;
        select(selector).elt.innerHTML = html;
    }
}