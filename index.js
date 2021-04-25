const express = require("express");
const utils = require("./utils");
const server = express();

server.post("/convert", utils.handler(async (req, res) => {
    const form = await utils.parse(req);

    const ext = form.fields.external;
    const mail = form.fields.mail;
    const format = form.fields.dest;
    const data = JSON.parse(form.fields.id || "{}");
    const book = form.files?.book?.path;
    const name = form.files?.book?.name || undefined;

    const input = await utils.download(ext, book);
    const output = await utils.convert(input, format);
    const editor = await utils.metadata(output, data);
    const sended = await utils.mailer(output, mail, res, name);

    await utils.remove([ book, output ]);
}))

server.get("/search", utils.handler(async (req, res) => {
    const term = req.query.q;
    const result = await utils.search(term);
    res.json(result);
}))

server.use(express.static("public"))
server.listen(4000, () => console.log("listen on 4000"));