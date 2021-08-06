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
let socks = {
    "authed": [],
    "spectators": []
};
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
                socks.authed.push(socket);
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
        }
    });
});