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
    if (localStorage.getItem("tank_tactics_good-auth")) {
        await srv.connect(localStorage.getItem("tank_tactics_good-auth"))
    } else {
        await srv.connect(await logIn());
    }
    xInc = width / srv.boardSize;
    yInc = height / srv.boardSize;
    mytank = srv.tanks[srv.myTankIdx];
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

    if (!srv.myTankDead) {
        fill(255, 255, 0, 100);
        rect((mytank.pos.x - mytank.range) * xInc, (mytank.pos.y - mytank.range) * yInc,
            (2 * mytank.range + 1) * xInc, (2 * mytank.range + 1) * yInc);
    }
    srv.tanks.forEach(t => t.show());
    mytank.info(true);
    if (selectedTankIdx != null) {
        srv.tanks[selectedTankIdx].info();
    } else {
        select("div#othertank-info").html("");
    }
}

function mousePressed(event) {
    if (srv.winner) { return; }
    if (event.target != canvas.canvas) { return; }
    let x = Math.floor(mouseX / xInc);
    let y = Math.floor(mouseY / yInc);
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

let logInResolve;

function _logIn() {
    let unm = document.querySelector("div.modal-ipt-text input[type=\"text\"]").value;
    let pwd = document.querySelector("div.modal-ipt-text input[type=\"password\"]").value;
    logInResolve(`${unm}:${pwd}`);
    removeModal();
    logInResolve = null;
}
const logIn = _ => new Promise(async(res, rej) => {
    let { modalDiv, bkgDiv } = makeModal();
    modalDiv.innerHTML = `
        <div class="modal-ipt-text">
            <label>Username</label><input id="loginUname" type="text">
            <label>Password</label><input id="loginPwd" type="password">
        </div>
        <div class="modal-buttons">
            <button class="modal-button" onclick="_logIn()">Log In</button>
            <button class="modal-button" onclick="spectate()">Spectate</button>
        </div>
    `;
    logInResolve = res;
})

function logOut() {
    localStorage.removeItem("tank_tactics_good-auth");
    location.reload();
}

function spectate() {
    location.href = "/spectate.html"
}

function badAuth(auth) {
    if (localStorage.getItem("tank_tactics_good-auth") == auth) {
        localStorage.removeItem("tank_tactics_good-auth");
        location.reload();
        return 0;
    }
    localStorage.removeItem("tank_tactics_good-auth");
    let { modalDiv, bkgDiv } = makeModal();
    modalDiv.innerHTML = `
        <h1 class="modal-h">Wrong username or password.</h1>
        <h3 class="modal-h">Try again!</h3>
        <div class="modal-buttons">
            <button class="modal-button" onclick="location.reload();">OK</button>
        </div>
    `;
}

function makeModal() {
    let bkgDiv = document.createElement("div");
    bkgDiv.className = "modalBkg";

    let modalDiv = document.createElement("div");
    modalDiv.className = "modal";

    bkgDiv.appendChild(modalDiv);
    document.body.appendChild(bkgDiv);

    return { modalDiv, bkgDiv };
}

function removeModal() {
    if (!document.querySelector("div.modalBkg")) { return; }
    document.querySelector("div.modalBkg").remove();
}

function _move() {
    let dir;
    document.querySelectorAll("input[type=radio]").forEach((e, i) => { if (e.checked) { dir = i; } });
    let amount = document.querySelector("div.modal-ipt-number input").value;
    dir = Number(dir);
    amount = Number(amount);
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
    if (srv.winner) { return; }
    if (mytank.ap == 0) {
        okTextModal("Not enough AP.", "You need at least 1 AP to move.");
        return;
    }
    let { modalDiv, bkgDiv } = makeModal();
    modalDiv.innerHTML = `
    <div class="modal-ipt-radio">
        <div><input name="radioOption" type="radio" checked=""><label>Up</label></div>
        <div><input name="radioOption" type="radio"><label>Right</label></div>
        <div><input name="radioOption" type="radio"><label>Down</label></div>
        <div><input name="radioOption" type="radio"><label>Left</label></div>
    </div>
    <div class="modal-ipt-number">
        <input type="number" value="1" min="1" max="${mytank.ap}">
    </div>
    <div class="modal-buttons">
        <button class="modal-button" onclick="_move()">Move</button>
        <button class="modal-button" onclick="removeModal()">Cancel</button>
    </div>
    `;
}

function distance(x1, y1, x2, y2) {
    let dx = Math.abs(x1 - x2);
    let dy = Math.abs(y1 - y2);
    return (dx >= dy ? dx : dy);
}

function _give() {
    let name;
    document.querySelectorAll("input[type=radio]").forEach(e => { if (e.checked) { name = e.nextElementSibling.innerText; } });
    if (name == undefined) { return; }
    let amount = document.querySelector("div.modal-ipt-number input").value;
    amount = Number(amount);
    srv.sock.send(JSON.stringify({
        type: "update",
        data: {
            type: "give",
            name,
            amount
        }
    }));
    removeModal();
}

function give() {
    if (srv.winner) { return; }
    let possibleT = srv.tanks.filter(t => (!(t.name == mytank.name || distance(mytank.pos.x, mytank.pos.y, t.pos.x, t.pos.y) > mytank.range)));
    if (possibleT.length == 0) {
        okTextModal("No players.", "There are no players in your range.");
        return;
    }
    if (mytank.ap == 0) {
        okTextModal("Not enough AP.", "You need at least 1 AP to give AP.");
        return;
    }
    let { modalDiv, bkgDiv } = makeModal();
    let possibleHTML = possibleT.map(t => `<div><input name="radioOption" type="radio"><label>${t.name}</label></div>`).join("\n");
    modalDiv.innerHTML = `
    <div class="modal-ipt-radio">
    ${possibleHTML}
    </div>
    <div class="modal-ipt-number">
    <input type="number" value="1" min="1" max="${mytank.ap}">
    </div>
    <div class="modal-buttons">
    <button class="modal-button" onclick="_give()">Give</button>
    <button class="modal-button" onclick="removeModal()">Cancel</button>
    </div>
    `;
    modalDiv.querySelector("input[name=radioOption]").checked = true;
}

function _attack() {
    let name;
    document.querySelectorAll("input[type=radio]").forEach(e => { if (e.checked) { name = e.nextElementSibling.innerText; } });
    if (name == undefined) { return; }
    let amount = document.querySelector("div.modal-ipt-number input").value;
    amount = Number(amount);
    srv.sock.send(JSON.stringify({
        type: "update",
        data: {
            type: "attack",
            name,
            amount
        }
    }));
    removeModal();
}

function attack() {
    if (srv.winner) { return; }
    let possibleT = srv.tanks.filter(t => (!(t.name == mytank.name || distance(mytank.pos.x, mytank.pos.y, t.pos.x, t.pos.y) > mytank.range)));
    if (possibleT.length == 0) {
        okTextModal("No players.", "There are no players in your range.");
        return;
    }
    if (mytank.ap == 0) {
        okTextModal("Not enough AP.", "You need at least 1 AP to attack.");
        return;
    }
    let { modalDiv, bkgDiv } = makeModal();
    let possibleHTML = possibleT.map(t => `<div><input name="radioOption" type="radio"><label>${t.name}</label></div>`).join("\n");
    modalDiv.innerHTML = `
    <div class="modal-ipt-radio">
    ${possibleHTML}
    </div>
    <div class="modal-ipt-number">
    <input type="number" value="1" min="1" max="${mytank.ap}">
    </div>
    <div class="modal-buttons">
    <button class="modal-button" onclick="_attack()">Attack</button>
    <button class="modal-button" onclick="removeModal()">Cancel</button>
    </div>
    `;
    modalDiv.querySelector("input[name=radioOption]").checked = true;
}

function _upgrade() {
    let amount = document.querySelector("div.modal-ipt-number input").value;
    amount = Number(amount);
    srv.sock.send(JSON.stringify({
        type: "update",
        data: {
            type: "upgrade",
            amount
        }
    }));
    removeModal();
}

function upgrade() {
    if (srv.winner) { return; }
    if (mytank.ap < 2) {
        okTextModal("Not enough AP.", "You need at least 2 AP to upgrade your range.");
        return;
    }
    let { modalDiv, bkgDiv } = makeModal();
    modalDiv.innerHTML = `
    <div class="modal-ipt-number">
    <input type="number" value="1" min="1" max="${Math.floor(mytank.ap/2)}">
    </div>
    <div class="modal-buttons">
        <button class="modal-button" onclick="_upgrade()">Upgrade range</button>
        <button class="modal-button" onclick="removeModal()">Cancel</button>
    </div>
    `;
}

function _vote() {
    let name;
    document.querySelectorAll("input[type=radio]").forEach(e => { if (e.checked) { name = e.nextElementSibling.innerText; } });
    if (name == undefined) { return; }
    srv.sock.send(JSON.stringify({
        type: "update",
        data: {
            type: "vote",
            name
        }
    }));
    removeModal();
}

function vote() {
    if (srv.winner) { return; }
    let possibleT = srv.tanks.filter(t => (!(t.name == mytank.name)));
    if (possibleT.length == 0) {
        okTextModal("No players found.", "There are none alive players left.");
        return;
    }
    let possibleHTML = possibleT.map(t => `<div><input name="radioOption" type="radio"><label>${t.name}</label></div>`).join("\n");
    let { modalDiv, bkgDiv } = makeModal();
    modalDiv.innerHTML = `
    <div class="modal-ipt-radio">
    ${possibleHTML}
    </div>
    <div class="modal-buttons">
    <button class="modal-button" onclick="_vote()">Vote</button>
    <button class="modal-button" onclick="removeModal()">Cancel</button>
    </div>
    `;
    modalDiv.querySelector("input[name=radioOption]").checked = true;
}

function okTextModal(title, text) {
    let { modalDiv, bkgDiv } = makeModal();
    modalDiv.innerHTML = `
        <h1 class="modal-h">${title}</h1>
        <h3 class="modal-h">${text}</h3>
        <div class="modal-buttons">
            <button class="modal-button" onclick="removeModal()">OK</button>
        </div>
    `;
}