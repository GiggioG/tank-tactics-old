const http = require("http");
const fs = require("fs");
const path = require("path");
let server = http.createServer((req, res) => {
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
server.listen(8080);