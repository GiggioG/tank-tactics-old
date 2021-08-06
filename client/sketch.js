let srv, canvas;
let selectedTankIdx = null;
let xInc;
let yInc;
let mytank;

function setup() {
    let canvasDim = min(windowWidth, windowHeight);
    canvas = createCanvas(canvasDim, canvasDim);
    canvas.parent(select("div#canvas-container"));
    frameRate(30);
    srv = new Server();
    background(255);
    srv.connect(true).then(_ => {
        background(0);
        noLoop();
    });
    //     srv.getInfo()
    // }).then(_ => {
    //     xInc = width / srv.boardSize;
    //     yInc = height / srv.boardSize;
    //     mytank = srv.tanks[srv.myTankIdx];
    // }).catch(console.error);
}

function draw() {
    return;
    background("#272822");
    stroke(255);
    for (let i = 0; i <= width; i += xInc) {
        line(i, 0, i, height);
    }
    for (let i = 0; i <= height; i += yInc) {
        line(0, i, width, i);
    }

    fill(255, 255, 0, 100);
    rect((mytank.pos.x - mytank.range) * xInc, (mytank.pos.y - mytank.range) * yInc,
        (2 * mytank.range + 1) * xInc, (2 * mytank.range + 1) * yInc);
    srv.tanks.forEach(t => t.show());
    mytank.info(true);
    if (selectedTankIdx != null) {
        srv.tanks[selectedTankIdx].info();
    } else {
        select("div#othertank-info").html("");
    }
}

function mousePressed() {
    let x = Math.floor(mouseX / xInc);
    let y = Math.floor(mouseY / yInc);
    if (x < 0 || x >= srv.boardSize) { return; }
    if (y < 0 || y >= srv.boardSize) { return; }
    console.log(x, y);
    let hit = false;
    for (let i = 0; i < srv.tanks.length; i++) {
        if (srv.tanks[i].pos.x == x && srv.tanks[i].pos.y == y) {
            if (srv.myTankIdx == i) { break; }
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

function keyPressed(e) {
    switch (e.key) {
        case 'w':
            {
                mytank.pos.y--;
            }
            break;
        case 'a':
            {
                mytank.pos.x--;
            }
            break;
        case 's':
            {
                mytank.pos.y++;
            }
            break;
        case 'd':
            {
                mytank.pos.x++;
            }
            break;
    }
}