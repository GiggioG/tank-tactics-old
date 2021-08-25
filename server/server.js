const ws = require("ws");
const http = require("http");
const fs = require("fs");
const path = require("path");
let websrv = http.createServer((req, res) => {
    if (req.url == '/') { req.url = "/index.html" }
    if (!fs.existsSync('./client/' + path.posix.normalize(req.url))) {
        res.writeHead(404);
        res.end();
        return;
    }
    fs.createReadStream('./client/' + path.posix.normalize(req.url))
        .on("data", d => res.write(d))
        .on("end", _ => res.end());
});
websrv.listen(8080);

let wss = new ws.Server({
    port: 9090
});
let socks = [];
wss.on("connection", socket => {
    socket.on("message", async rawMsg => {
        let msg = JSON.parse(rawMsg);
        let db = JSON.parse(fs.readFileSync("server/db.json"));
        if (msg.type == "auth") {
            let userIdx = -1;
            for (let i = 0; i < db.tanks.length; i++) {
                if (db.tanks[i][0] == msg.data.split(':')[0] && db.tanks[i][1] == msg.data.split(':')[1]) {
                    userIdx = i;
                    break;
                }
            }
            if (userIdx >= 0) {
                socket.user = msg.data.split(':')[0];
                socks.push(socket);
                db.tanks = db.tanks.filter(e => ((e[4] > 0) || (e[0] == socket.user)));
                let message = {
                    data: {
                        tanks: db.tanks,
                        boardSize: db.boardSize,
                        myTankIdx: userIdx
                    },
                    type: "auth-good"
                };
                for (let i = 0; i < message.data.tanks.length; i++) {
                    message.data.tanks[i].splice(1, 1);
                }
                socket.send(JSON.stringify(message));
                return;
            }
            socket.send(JSON.stringify({
                type: "auth-bad",
                data: null
            }));
            return;
        } else if (msg.type == "spectate") {
            socks.push(socket);
            db.tanks = db.tanks.filter(e => e[4] > 0);
            let message = {
                data: {
                    tanks: db.tanks,
                    boardSize: db.boardSize,
                    myTankIdx: null
                },
                type: "spectate-good"
            };
            for (let i = 0; i < message.data.tanks.length; i++) {
                message.data.tanks[i].splice(1, 1);
            }
            socket.send(JSON.stringify(message));
            return;
        } else if (msg.type == "update") {
            if (socket.user == undefined) { return; }
            update(socket.user, msg.data, socket);
        }
    });
});

function getUserIdx(user) {
    const db = JSON.parse(fs.readFileSync("server/db.json"));
    for (let i = 0; i < db.tanks.length; i++) {
        if (db.tanks[i][0] == user) {
            return i;
        }
    }
}

function getUser(user) {
    const db = JSON.parse(fs.readFileSync("server/db.json"));
    return db.tanks[getUserIdx(user)];
}

function getUserSock(user) {
    for (let i = 0; i < socks.length; i++) {
        if (socks[i].user == user) {
            return socks[i];
        }
    }
    return null;
}

function updateError(sock, action, message) {
    sock.send(JSON.stringify({
        type: "update-error",
        data: {
            action,
            message
        }
    }));
}

function getUserAt(x, y) {
    const db = JSON.parse(fs.readFileSync("server/db.json"));
    for (let i = 0; i < db.tanks.length; i++) {
        if (db.tanks[i][3][0] == x && db.tanks[i][3][1] == y) {
            return db.tanks[i];
        }
    }
    return null;
}

function sendUpdate(user, hp, ap, x, y, range) {
    let msg = JSON.stringify({
        type: "update",
        data: {
            user,
            x,
            y,
            hp,
            ap,
            range
        }
    });
    socks.forEach(s => s.send(msg));

    let db = JSON.parse(fs.readFileSync("server/db.json"));
    let uidx = getUserIdx(user);
    db.tanks[uidx][3][0] = x;
    db.tanks[uidx][3][1] = y;
    db.tanks[uidx][4] = hp;
    db.tanks[uidx][5] = ap;
    db.tanks[uidx][6] = range;
    fs.writeFileSync("server/db.json", JSON.stringify(db));
}

function sendDeath(user) {
    let msg = JSON.stringify({
        type: "update-death",
        data: {
            user
        }
    });
    socks.forEach(s => s.send(msg));
}

function update(username, update, sock) {
    const db = JSON.parse(fs.readFileSync("server/db.json"));
    const user = getUser(username);
    if (update.type == "move") {
        if (user[4] <= 0) { updateError(sock, "moving", "You can't move when you're dead."); return; }
        const { dir, amount } = update;

        if (user[5] < amount) { updateError(sock, "moving", "You do not have enough AP move that far."); return; }

        if (dir == 0 && ((user[3][1] - amount) < 0)) { updateError(sock, "moving", "You can not go outside of the map."); return; }
        if (dir == 1 && ((user[3][0] + amount) >= db.boardSize)) { updateError(sock, "moving", "You can not go outside of the map."); return; }
        if (dir == 2 && ((user[3][1] + amount) >= db.boardSize)) { updateError(sock, "moving", "You can not go outside of the map."); return; }
        if (dir == 3 && ((user[3][0] - amount) < 0)) { updateError(sock, "moving", "You can not go outside of the map."); return; }

        let [x, y] = user[3];
        let [xoff, yoff] = [
            [0, -1],
            [1, 0],
            [0, 1],
            [-1, 0],
        ][dir];
        for (let i = 0; i < amount; i++) {
            x += xoff;
            y += yoff;
            const obstruser = getUserAt(x, y);
            if (obstruser != null && obstruser[4] > 0) { updateError(sock, "moving", "You can't move through other players."); return; }
        }

        sendUpdate(username, user[4], user[5] - amount, x, y, user[6]);
    } else if (update.type == "give") {
        if (user[4] <= 0) { updateError(sock, "giving AP", "You can't give AP when you're dead."); return; }

        function dist(x1, y1, x2, y2) {
            let dx = Math.abs(x1 - x2);
            let dy = Math.abs(y1 - y2);
            let d = (dx <= dy ? dx : dy);
            let s = (dx >= dy ? dx : dy) - d;
            return d + s;
        }

        const { name, amount } = update;

        if (user[5] < amount) { updateError(sock, "giving AP", "You do not have enough AP to give that much AP."); return; }
        if (user[0] == name) { updateError(sock, "giving AP", "You can't give yourself AP."); return; }

        let other = getUser(name);
        if (!other) { updateError(sock, "giving AP", `Player ${name} does not exist.`); return; }
        if (other[4] <= 0) { updateError(sock, "giving AP", "You can't give AP to a dead player."); return; }
        let [ux, uy] = user[3];
        let [dx, dy] = other[3];
        if (dist(ux, uy, dx, dy) > user[6]) { updateError(sock, "giving AP", `Player ${name} is out of you range.`); return; }

        sendUpdate(username, user[4], user[5] - amount, ux, uy, user[6]);
        sendUpdate(name, other[4], other[5] + amount, dx, dy, other[6]);
    } else if (update.type == "attack") {
        if (user[4] <= 0) { updateError(sock, "attacking", "You can't attack when you're dead."); return; }

        function dist(x1, y1, x2, y2) {
            let dx = Math.abs(x1 - x2);
            let dy = Math.abs(y1 - y2);
            let d = (dx <= dy ? dx : dy);
            let s = (dx >= dy ? dx : dy) - d;
            return d + s;
        }

        const { name, amount } = update;

        if (user[5] < amount) { updateError(sock, "attacking", "You do not have enough AP to attack that much."); return; }
        if (user[0] == name) { updateError(sock, "attacking", "You can't attack yourself."); return; }

        let other = getUser(name);
        if (!other) { updateError(sock, "attacking", `Player ${name} does not exist.`); return; }
        if (other[4] <= 0) { updateError(sock, "attacking", "You can't attack an already dead player."); return; }
        let [ux, uy] = user[3];
        let [dx, dy] = other[3];
        if (dist(ux, uy, dx, dy) > user[6]) { updateError(sock, "attacking", `Player ${name} is out of you range.`); return; }

        sendUpdate(username, user[4], user[5] - amount, ux, uy, user[6]);
        sendUpdate(name, other[4] - amount, other[5], dx, dy, other[6]);
        if (other[4] - amount <= 0) {
            sendDeath(name);
        }
    } else if (update.type == "upgrade") {
        if (user[4] <= 0) { updateError(sock, "upgrading your range", "You can't upgrade your range when you're dead."); return; }
        const { amount } = update;
        if (user[5] < amount * 2) { updateError(sock, "upgrading your range", "You do not have enough AP to upgrade your range that much."); return; }

        sendUpdate(username, user[4], user[5] - amount * 2, user[3][0], user[3][1], user[6] + amount);
    } else if (update.type == "vote") {
        if (user[4] > 0) { updateError(sock, "voting", "You can't vote when you're alive."); return; }

    }
}

console.log("Server running.");