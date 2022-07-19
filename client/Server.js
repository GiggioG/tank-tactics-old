class Server {
    constructor() {
        this.tanks_real = [];
        this.tanks = [];
        this.myTankIdx = null;
        this.myUsername = null;
        this.sock = null;
        this.boardSize = null;
        this.myTankDead = false;
    }
    update(data) {
        let thetank;
        this.tanks.forEach(t => {
            if (t.name == data.user) {
                thetank = t;
            }
        });
        thetank.pos.x = data.x;
        thetank.pos.y = data.y;
        thetank.hp = data.hp;
        thetank.ap = data.ap;
        thetank.range = data.range;
    }
    parseMsg(msg) {
        console.log(msg);
        if (msg.type == "update") {
            this.update(msg.data);
        } else if (msg.type == "update-death") {
            if (msg.data.user == this.myUsername) { location.reload(); }
            removeModal();
            if (selectedTankIdx != null) {
                let idx = this.tanks.findIndex(t => t.name == msg.data.user);
                if (idx < selectedTankIdx) {
                    selectedTankIdx--;
                } else if (idx == selectedTankIdx) {
                    selectedTankIdx = null;
                }
            }
            this.tanks = this.tanks.filter(t => t.name != msg.data.user);
        } else if (msg.type == "vote-confirm") {
            this.myVote = msg.data.candidate;
            if (!this.tanks[this.myTankIdx].nonce2) { this.tanks[this.myTankIdx].nonce2 = 0; }
            this.tanks[this.myTankIdx].nonce2++;
            let { modalDiv, bkgDiv } = makeModal();
            modalDiv.innerHTML = `
                <h1 class="modal-h">Vote confirmed!</h1>
                <h3 class="modal-h">Confirmed vote for ${msg.data.candidate}.</h3>
                <div class="modal-buttons">
                    <button class="modal-button" onclick="removeModal()">OK</button>
                </div>
            `;
        } else if (msg.type == "someone-won") {
            location.reload();
        } else if (msg.type == "update-error") {
            let { modalDiv, bkgDiv } = makeModal();
            modalDiv.innerHTML = `
                <h1 class="modal-h">Error while ${msg.data.action}:</h1>
                <h3 class="modal-h">${msg.data.message}</h3>
                <div class="modal-buttons">
                    <button class="modal-button" onclick="removeModal()">OK</button>
                </div>
            `;
        }
    }
    async connect(auth) {
        this.sock = new WebSocket(`ws://${location.hostname}:9090`);
        await new Promise((res, rej) => { this.sock.onopen = res; });
        this.sock.onclose = _ => location.reload();
        this.sock.send(JSON.stringify({
            type: "auth",
            data: auth
        }));
        let data = JSON.parse((await new Promise((res, rej) => { this.sock.onmessage = res })).data);
        this.sock.onmessage = d => { this.parseMsg(JSON.parse(d.data)) };
        console.log(data);
        if (data.type == "auth-good") {
            localStorage.setItem("tank_tactics_good-auth", auth);
            data.data.tanks.forEach(tnk => {
                this.tanks_real.push(new Tank(tnk[0], tnk[1], new Coords(tnk[2][0], tnk[2][1]), tnk[3], tnk[4], tnk[5], tnk[6]));
                this.tanks.push(new Proxy(this.tanks_real[this.tanks_real.length - 1], {
                    set: function(target, key, value) {
                        target[key] = value;
                        if (key != 'nonce' && key != "prevNonce") {
                            target.nonce++;
                        }
                        return true;
                    }
                }));
            });
            this.myUsername = auth.split(':')[0];
            this.myTankIdx = data.data.tanks.findIndex(t => t[0] == this.myUsername);
            this.myTankDead = this.tanks[this.myTankIdx].hp <= 0;
            this.boardSize = data.data.boardSize;
            if (this.myTankDead) {
                this.myVote = data.data.vote;
            }
            this.winner = data.data.winner;
            if (this.winner != null) {
                this.winnerIdx = this.tanks.findIndex(t => t.name == this.winner);
            }
            started = true;
        } else if (data.type == "auth-bad") {
            badAuth(auth);
        }
        return;
    }
    async spectate() {
        this.sock = new WebSocket(`ws://${location.hostname}:9090`);
        await new Promise((res, rej) => { this.sock.onopen = res; });
        this.sock.onclose = _ => location.reload();
        this.sock.send(JSON.stringify({
            type: "spectate",
            data: null
        }));
        let data = JSON.parse((await new Promise((res, rej) => { this.sock.onmessage = res })).data);
        this.sock.onmessage = d => { this.parseMsg(JSON.parse(d.data)) };
        console.log(data);
        if (data.type == "spectate-good") {
            data.data.tanks.forEach(tnk => {
                this.tanks_real.push(new Tank(tnk[0], tnk[1], new Coords(tnk[2][0], tnk[2][1]), tnk[3], tnk[4], tnk[5], tnk[6]));
                this.tanks.push(new Proxy(this.tanks_real[this.tanks_real.length - 1], {
                    set: function(target, key, value) {
                        target[key] = value;
                        if (key != 'nonce' && key != "prevNonce") {
                            target.nonce++;
                        }
                        return true;
                    }
                }));
            });
            this.myTankIdx = null;
            this.boardSize = data.data.boardSize;
            this.winner = data.data.winner;
            if (this.winner != null) {
                this.winnerIdx = this.tanks.findIndex(t => t.name == this.winner);
            }
        } else {
            location.refresh();
        }
    }
}