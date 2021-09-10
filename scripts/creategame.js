const fs = require("fs");

if (fs.existsSync("server/db.json") || fs.existsSync("server/db_initial.json")) {
    console.error("To create a game you must not have an already created game.");
    process.exit(0);
}

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});


const ask = (question, validator = (ans => true)) => new Promise(async(res, rej) => {
    while (true) {
        let answer = await new Promise((result, reject) => {
            readline.question(question, answer => {
                result(answer);
            });
        });
        if (validator(answer)) {
            res(answer);
            return;
        }
    }
});

const generateCoords = (size, n) => {
    let square = Math.ceil(Math.sqrt(n));
    let possibleCoords = [];
    for (let i = 1; i <= square; i++) {
        for (let j = 1; j <= square; j++) {
            possibleCoords.push([
                Math.round((size - square) / (square + 1)) * j + (j - 1),
                Math.round((size - square) / (square + 1)) * i + (i - 1)
            ]);
        }
    }
    for (let i = 0; i < (square * square) - n; i++) {
        possibleCoords.splice(Math.floor(Math.random() * possibleCoords.length), 1);
    }
    return possibleCoords;
}

const validators = {
    NAME: ans => {
        function allowed() {
            console.log(`\tPlayer names must be between 3 and 32 characters long.`);
            console.log(`\tThe allowed characters are between ascii values 33 and 126.`);
            console.log(`\thttps://www.asciitable.com/`);
        }
        if (ans.length > 32) { allowed(); return false; }
        if (ans.length < 3) { allowed(); return false; }
        if (ans.includes(' ')) { allowed(); return false; }
        for (chr of ans) {
            let charCode = chr.charCodeAt(0);
            if (charCode <= 32) { allowed(); return false; }
            if (charCode >= 127) { allowed(); return false; }
        }
        return true;
    },
    PWD: ans => {
        function allowed() {
            console.log(`\tPlayer passwords must be shorter than 65 characters.`);
        }
        if (ans.length > 64) { allowed(); return false; }
        return true;
    },
    NUMBER: ans => {
        function allowed() {
            console.log(`\tYou must enter a positive whole number.`);
        }
        if (Number(ans) == NaN) { allowed(); return false; }
        if (Number(ans) <= 0) { allowed(); return false; }
        if (Number(ans) != Math.floor(Number(ans))) { allowed(); return false; }
        return true;
    },
    COLOR: ans => {
        function allowed() {
            console.log(`\tPlayer color must be a hex color.`);
            console.log(`\tIt must start with a '#' and end with 6 hexadecimal digits.`);
            console.log(`\tA hexadecimal digit is one of these characters: '01234567890abcdef'`);
            console.log(`\thttps://giggiog.github.io/misc/colorpicker.html`);
            console.log(`\tChoose a color on this site, copy it and paste it here.`);
        }
        if (ans.length != 7) { allowed(); return false; }
        if (ans[0] != '#') { allowed(); return false; }
        let hexDigits = "0123456789ABCDEFabcdef";
        for (let i = 1; i < ans.length; i++) {
            let chr = ans[i];
            if (!hexDigits.includes(chr)) { allowed(); return false; }
        }
        return true;
    },
    BIO: ans => {
        function allowed() {
            console.log(`\tPlayer names must be shorter than 513 characters.`);
            console.log(`\tThe allowed characters are between ascii values 32 and 254 with the exception of ascii 127.`);
            console.log(`\thttps://www.asciitable.com/`);
        }
        if (ans.length > 512) { allowed(); return false; }
        for (chr of ans) {
            let charCode = chr.charCodeAt(0);
            if (charCode < 32) { allowed(); return false; }
            if (charCode >= 255) { allowed(); return false; }
            if (charCode == 127) { allowed(); return false; }
        }
        return true;
    }
}

const main = async() => {
    let boardSize = Number(await ask("How high and wide will the board be? (X by X) ", validators.NUMBER));
    let people = Number(await ask("How many players will there be? ", validators.NUMBER));
    let gameDayMillis = Number(await ask("How many seconds will an in-game day be? ", validators.NUMBER)) * 1000;
    let gameStartedDatetimeMillis = Date.now();
    let availableCoords = generateCoords(boardSize, people);

    let db = {
        "tanks": [],
        votes: {},
        boardSize,
        gameDayMillis,
        gameStartedDatetimeMillis
    }
    for (let i = 0; i < people; i++) {
        let coords = availableCoords.splice(Math.floor(Math.random() * availableCoords.length), 1)[0];
        console.log(`-v-v-v-v-v- Player ${i+1} -v-v-v-v-v-`);
        let name = await ask("Player username? ", validators.NAME);
        let pwd = await ask("Player password? ", validators.PWD);
        let color = await ask("Player color? ", validators.COLOR);
        let bio = await ask("Player bio? ", validators.BIO);
        let hp = 3;
        let ap = 1;
        let range = 2;
        db.tanks.push([
            name, pwd, color, coords, hp, ap, range, bio
        ]);
        console.log(`-^-^-^-^-^- Player ${i+1} -^-^-^-^-^-`);
    }

    fs.writeFileSync("server/db_initial.json", JSON.stringify(db));
    fs.writeFileSync("server/db.json", JSON.stringify(db));

    console.log("Game successfully created.");
    readline.close();
}
main();