class Server {
    constructor() {
        this.tanks_real = [];
        this.tanks = [];
        this.myTankIdx = undefined;
        this.sock = null;
        this.boardSize = null;
    }
    async connect(auth) {
        this.sock = new WebSocket(`ws://${location.hostname}:9090`);
        await new Promise((res, rej) => { this.sock.onopen = res; });
        this.sock.send(JSON.stringify({
            type: "auth",
            data: auth
        }));
        let data = JSON.parse((await new Promise((res, rej) => { this.sock.onmessage = res })).data);
        console.log(data);
        if (data.type == "auth-good") {
            localStorage.setItem("good-auth", auth);
            data.data.tanks.forEach(tnk => {
                this.tanks_real.push(new Tank(tnk[0], tnk[1], new Coords(tnk[2][0], tnk[2][1]), tnk[3]));
                this.tanks.push(new Proxy(this.tanks_real[this.tanks_real.length - 1], {
                    set: function(target, key, value) {
                        target[key] = value;
                        if (key != 'nonce' && key != "prevNonce") {
                            target.nonce++;
                        }
                        return true;
                    }
                }));
                this.myTankIdx = data.data.myTankIdx;
                this.boardSize = data.data.boardSize;
            });
        } else if (data.type == "auth-bad") {
            badAuth();
        }
        return;
    }
}