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
        if (mytank && (!srv.winner)) {
            if (srv.myTankDead) {
                html += `
                    <div class="player-vote-div">
                        <span class="player-vote${srv.myVote==null?" player-vote-noone":""}">You voted for: ${srv.myVote!=null?srv.myVote:""}</span>
                    </div>
                    <div>
                        <button ${srv.myVote==null?"class=\"vote-button-noone\"":""}onclick="vote()" title="Vote in the Jury">🗳 Vote</button>
                    </div>
                    `;
            } else {
                html += `
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
                `;
                html += `
                    <div>
                        <button onclick="move()" title="Move">🡆</button>
                        <button onclick="give()" title="Give AP">✋</button>
                        <button onclick="attack()" title="Attack">⚔️</button>
                        <button onclick="upgrade()" title="Upgrade range">◎</button>
                    </div>
                `;
            }
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
        // select(selector).elt.innerHTML = (`
        //     <div class="playerName" style="color: ${this.color}">${this.name}</div>
        //     ${((srv.myTankDead && (this.name == srv.myUsername)) || (srv.winner))?"":`
        //     <br>
        //     <div class="statIconContainer">
        //     ${"<i class=\"stat-icon fas fa-bolt\"></i>".repeat(this.ap)}
        //     </div>
        //     <br>
        //     <div class="statIconContainer">
        //     ${"<i class=\"stat-icon fas fa-heart\"></i>".repeat(this.hp)}
        //     </div>
        //     <br>
        //     <div class="playerStatTableContainer">
        //     <table class="playerStatTable"><tb>
        //         <tr>
        //             <td> <i class="stat-icon fas fa-crosshairs"></i> </td>
        //             <td> <span class="playerStat">${this.pos.x}, ${this.pos.y}</span> </td>
        //         </tr>
        //         <tr>
        //             <td> <i class="stat-icon fas fa-bullseye"></i> </td>
        //             <td> <span class="playerStat">${this.range}</span> </td>
        //         </tr>
        //     </tb></table>
        //     </div>
        //     `}
        //     ${mytank?(srv.myTankDead?( (!srv.winner)?`
        //     <div class="player-vote-div">
        //         <span class="player-vote${srv.myVote==null?" player-vote-noone":""}">You voted for: ${srv.myVote!=null?srv.myVote:""}</span>
        //     </div>
        //     <div>
        //         <button ${srv.myVote==null?"class=\"vote-button-noone\"":""}onclick="vote()" title="Vote in the Jury">🗳 Vote</button>
        //     </div>
        //     `:""):((!srv.winner)?`
        //     <div>
        //         <button onclick="move()" title="Move">🡆</button>
        //         <button onclick="give()" title="Give AP">✋</button>
        //         <button onclick="attack()" title="Attack">⚔️</button>
        //         <button onclick="upgrade()" title="Upgrade range">◎</button>
        //     </div>
        //     `:"")):""}
        //     <div class="playerBioContainer"><p class="playerBio">${this.bio}</p></div>
        // `);
    }
}