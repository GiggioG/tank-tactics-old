let srv, canvas;
let selectedTankIdx = null;
let xInc;
let yInc;
let mytank;
let started = false;

async function setup() {
    let canvasDim = min(windowWidth, windowHeight);
    canvas = createCanvas(canvasDim, canvasDim);
    canvas.parent(select("div#canvas-container"));
    frameRate(30);
    srv = new Server();
    background(255);
    await srv.spectate();
    started = true;
    xInc = width / srv.boardSize;
    yInc = height / srv.boardSize;
    if (srv.winner) { selectedTankIdx = srv.winnerIdx; }
    srv.tanks[selectedTankIdx].selected = true;
    return;
}

function draw() {
    if (!started) { return; }
    background(0);
    background("#272822");
    stroke(255);
    for (let i = 0; i <= width; i += xInc) {
        line(i, 0, i, height);
    }
    for (let i = 0; i <= height; i += yInc) {
        line(0, i, width, i);
    }

    fill(255, 255, 0, 100);
    srv.tanks.forEach(t => t.show());
    if (selectedTankIdx != null) {
        srv.tanks[selectedTankIdx].info();
    } else {
        select("div#othertank-info").html("");
    }
}

function mousePressed() {
    if (srv.winner) { return; }
    let x = Math.floor(mouseX / xInc);
    let y = Math.floor(mouseY / yInc);
    if (x < 0 || x >= srv.boardSize) { return; }
    if (y < 0 || y >= srv.boardSize) { return; }
    let hit = false;
    for (let i = 0; i < srv.tanks.length; i++) {
        if (srv.tanks[i].pos.x == x && srv.tanks[i].pos.y == y) {
            if (i == selectedTankIdx) {
                selectedTankIdx = null;
                srv.tanks[i].selected = false;
                break;
            }
            if (selectedTankIdx != null) {
                srv.tanks[selectedTankIdx].selected = false;
            }
            selectedTankIdx = i;
            srv.tanks[i].selected = true;
            hit = true;
            break;
        }
    }
    if (!hit) {
        if (selectedTankIdx != null) {
            srv.tanks[selectedTankIdx].selected = false;
        }
        selectedTankIdx = null;
    }
}

function logIn() {
    location.href = "/";
}

function badAuth() {
    alert("Bad auth, try again.");
    location.reload();
}