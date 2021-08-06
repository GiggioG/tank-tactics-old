class Server {
    constructor() {
        this.tanks_real = [];
        this.tanks = [];
        this.myTankIdx = undefined;
        this.sock = null;
    }
    async connect(auth) {
        this.sock = new WebSocket(`ws://${location.hostname}:9090`);
        await new Promise((res, rej) => { this.sock.onopen(res); });
        this.sock.send(`${auth}`);
        return await new Promise((res, rej) => { this.sock.onmessage(res); });
    }
    async getInfo() {
        this.tanks_real.push(new Tank("msh", "#0000ff", new Coords(0, 0), "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tempore quam numquam fugiat? Suscipit, id autem dicta nobis eligendi hic quae. Aperiam quasi ea voluptatibus iste laboriosam alias eos maiores modi, saepe aliquam dolorum iure accusamus, culpa vitae provident omnis enim quaerat sequi, molestias quos labore! Blanditiis quod nemo eos sint harum, incidunt, veritatis quo nisi libero ut omnis accusantium dicta quisquam reiciendis perferendis obcaecati sequi, ipsa itaque. Magnam asperiores delectus impedit, nobis eos facere pariatur, sapiente consequuntur sequi vitae esse, error inventore possimus aliquid quaerat placeat architecto? Dolores enim optio adipisci quis deserunt officiis, velit provident accusamus ea expedita? Esse!"));
        this.tanks_real.push(new Tank("bej", "#ff00ff", new Coords(1, 0), "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tempore quam numquam fugiat? Suscipit, id autem dicta nobis eligendi hic quae. Aperiam quasi ea voluptatibus iste laboriosam alias eos maiores modi, saepe aliquam dolorum iure accusamus, culpa vitae provident omnis enim quaerat sequi, molestias quos labore! Blanditiis quod nemo eos sint harum, incidunt, veritatis quo nisi libero ut omnis accusantium dicta quisquam reiciendis perferendis obcaecati sequi, ipsa itaque. Magnam asperiores delectus impedit, nobis eos facere pariatur, sapiente consequuntur sequi vitae esse, error inventore possimus aliquid quaerat placeat architecto? Dolores enim optio adipisci quis deserunt officiis, velit provident accusamus ea expedita? Esse!"));
        this.tanks_real.push(new Tank("gig", "#00ffff", new Coords(2, 2), "Lorem ipsum, dolor sit amet consectetur adipisicing elit.Tempore quam numquam fugiat ? Suscipit, id autem dicta nobis eligendi hic quae.Aperiam quasi ea voluptatibus iste laboriosam alias eos maiores modi, saepe aliquam dolorum iure accusamus, culpa vitae provident omnis enim quaerat sequi, molestias quos labore!Blanditiis quod nemo eos sint harum, incidunt, veritatis quo nisi libero ut omnis accusantium dicta quisquam reiciendis perferendis obcaecati sequi, ipsa itaque.Magnam asperiores delectus impedit, nobis eos facere pariatur, sapiente consequuntur sequi vitae esse, error inventore possimus aliquid quaerat placeat architecto ? Dolores enim optio adipisci quis deserunt officiis, velit provident accusamus ea expedita ? Esse!"));
        this.tanks_real.forEach(t => this.tanks.push(new Proxy(t, {
            set: function(target, key, value) {
                target[key] = value;
                if ((key != "prevNonce") && !((key == "nonce") && (value == target.nonce))) {
                    target.nonce++;
                    target.nonce %= 100;
                }
                return true;
            }
        })))
        this.myTankIdx = 2;
        this.boardSize = 20;
    }
}