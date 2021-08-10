class Server {
    constructor() {
        this.tanks_real = [];
        this.tanks = [];
        this.myTankIdx = undefined;
        this.sock = null;
        this.boardSize = null;
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
        } else if (msg.type == "update-error") {
            alert(JSON.stringify(msg.data));
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
            localStorage.setItem("good-auth", auth);
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
            this.myTankIdx = data.data.myTankIdx;
            this.boardSize = data.data.boardSize;
        } else if (data.type == "auth-bad") {
            badAuth();
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
        } else {
            location.refresh();
        }
    }
}