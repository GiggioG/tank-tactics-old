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
    if (localStorage.getItem("good-auth")) {
        await srv.connect(localStorage.getItem("good-auth"))
    } else {
        if (confirm("Spectate?")) {
            spectate();
        } else {
            let unm = prompt("Username?");
            let pwd = prompt("Password?");
            await srv.connect(`${unm}:${pwd}`);
        }
    }
    started = true;
    xInc = width / srv.boardSize;
    yInc = height / srv.boardSize;
    mytank = srv.tanks[srv.myTankIdx];
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

function logOut() {
    localStorage.removeItem("good-auth");
    location.reload();
}

function spectate() {
    location.href = "/spectate.html"
}

function badAuth() {
    alert("Bad auth, try again.");
    location.reload();
}

function removeModal() {
    document.querySelector("div.modalBkg").remove();
}

function _move() {
    let dir;
    document.querySelectorAll("input[type=radio]").forEach((e, i) => { if (e.checked) { dir = i; } });
    let amount = document.querySelector("div.modal-ipt-number input").value;
    srv.sock.send(JSON.stringify({
        type: "update",
        data: {
            type: "move",
            dir,
            amount
        }
    }));
    removeModal();
}

function move() {
    let bkgDiv = document.createElement("div");
    bkgDiv.className = "modalBkg";

    let modalDiv = document.createElement("div");
    modalDiv.className = "modal";
    modalDiv.innerHTML = `
    <div class="modal-ipt-radio">
        <div><input name="direction" type="radio" checked=""><label>Up</label></div>
        <div><input name="direction" type="radio"><label>Right</label></div>
        <div><input name="direction" type="radio"><label>Down</label></div>
        <div><input name="direction" type="radio"><label>Left</label></div>
    </div>
    <div class="modal-ipt-number">
        <input type="number" value="1" min="1" max="${mytank.ap}">
    </div>
    <div class="modal-buttons">
        <button class="modal-button" onclick="_move()">Move</button>
        <button class="modal-button" onclick="removeModal()">Cancel</button>
    </div>
    `;

    bkgDiv.appendChild(modalDiv);
    document.body.appendChild(bkgDiv);
}

function give() {

}

function attack() {

}

function upgrade() {

}