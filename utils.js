
const { IncomingForm } = require("formidable");
const { Calibre } = require("node-calibre");
const fs = require("fs");
const os = require("os");
const utils = require("util");
const nm = require('nodemailer');
const axios = require("axios");
const moment = require("moment");
const mailconf = require("./config/mail.conf.json");

const allowedExt = ["LIT", "MOBI", "AZW", "EPUB", "AZW3", "AZW4", "FB2", "FBZ", "DOCX", "HTML", "PRC", "ODT", "RTF", "PDB", "TXT"];
const booksAPI = {
    search: "https://www.googleapis.com/books/v1/volumes?printType=books&download=epub&filter=ebooks&maxResults=15&q={{term}}",
    cover: "https://books.google.com/books/content/images/frontcover/{{id}}?fife=w600-h900"
}

const library = new Calibre();
const transporter = nm.createTransport(mailconf);

class Book {
    constructor(){
        this.Key = undefined;
        this.Title = undefined;
        this.Author = undefined;
        this.Publisher = undefined;
        this.ReleasedAt = undefined;
        this.Description = undefined;
        this.ISBN = undefined;
        this.Keywords = undefined;
        this.Cover = undefined;
        this.Pages = undefined;
    }
}

function genBook(i) {
    const b = new Book();

    b.Key = i.id;
    b.Title = i.volumeInfo.title;
    b.Author = i.volumeInfo?.authors?.join(" & ")
    b.Publisher = i.volumeInfo.publisher;
    b.ReleasedAt = moment(i.volumeInfo.publishedDate);
    b.Description = i.volumeInfo.description;
    b.ISBN = findISBN(i.volumeInfo.industryIdentifiers);
    b.Keywords = findKeywords(i.volumeInfo.categories);
    b.Cover = booksAPI.cover.replace("{{id}}", i.id);
    b.Pages = i.volumeInfo.printedPageCount ?? i.volumeInfo.pageCount

    return b;
}

function findISBN(list){
    const ISBN13 = list?.find(item => item.type === "ISBN_13");
    const ISBN10 = list?.find(item => item.type === "ISBN_10");

    return ISBN13?.identifier || ISBN10?.identifier;
}

function findKeywords(list = []){
    const transformed = list?.map(item => item.split("/"))?.flat()?.map(item => item.trim()) ?? []
    return [ ...new Set(transformed) ].filter(item => item !== "General")
}

async function downloader(url) {
    const response = await axios.default({ url, method: "GET", responseType: 'stream' })
    const urlbasedfile = url.split("/").pop();
    const attachment = response.headers['content-disposition']
        ?.match(/\".{0,}\"$/)
        ?.shift()
        ?.replace(/\"/g, "");

    const ext = [ urlbasedfile, attachment ]
        .filter(f => allowedExt.includes(f
            ?.split(".")
            ?.pop()
            ?.toUpperCase()))
        .shift();

    if(!ext) throw new Error("File not found");
    const path = os.tmpdir() + `/${new Date().getTime()}-${ext}`;
    const writer = fs.createWriteStream(path)
    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(path))
        writer.on('error', reject)
    })
}

async function cover(url, book) {
    const file = book.split(".").slice(0, -1).concat("png").join(".")
    const writer = fs.createWriteStream(file)
    const response = await axios.default({ url, method: "GET", responseType: 'stream' })
  
    response.data.pipe(writer)
  
    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(file))
        writer.on('error', reject)
    })
}

function search(term){
    return axios.default.get(booksAPI.search.replace("{{term}}", term))
        .then(resp => resp?.data?.items)
        .then(items => items?.map(i => genBook(i)) ?? [])
}

function parse(request) {
    return new Promise((resolve, reject) => {
        const form = new IncomingForm({ 
            multiples: false,
            keepExtensions: true,
            allowEmptyFiles: false,
            maxFileSize: 30 * 1024 * 1024
        })
        
        form.parse(request, (err, fields, files) => {
            if(err) reject(err);

            for (const f in fields) {
                if (fields[f] === "null")
                    fields[f] = null;
            }

            resolve({ fields, files });
        })
    })
}

async function download(external, book) {
    if(!external) return book;
    return await downloader(external);
}

async function convert(input, format){
    if(!format || input.split(".").pop() === format) return input;
    return library.ebookConvert(input, format);
}

async function metadata(book, data){
    if(!data.Key) return book;

    const img = await cover(data.Cover, book);
    const options = {
        k: "by Digiture, with Calibre",
        isbn: data.ISBN,
        title: data.Title,
        authors: data.Author,
        publisher: data.Publisher,
        date: data.ReleasedAt,
        identifier: "isbn:" + data.ISBN,
        comments: data.Description,
        tags: data.Keywords,
        cover: img
    }

    return await library.run("ebook-meta", [ book ], options)
        .then(() => fs.unlinkSync(img));
}

async function mailer(book, dest, res, name = "book.ext") {
    if(!dest) return utils.promisify(res.sendFile.bind(res))(book);
    
    const ext = book.split(".").pop()
    const file = name.split(".").slice(0, -1).concat(ext).join(".")
    const opts = {
        from: { name: "Seu Conversor de eBooks", address: mailconf.auth.user },
        to: dest, subject: "Aqui está o livro que você pediu", text: "Em poucos minutos ele estará no seu Kindle",
        attachments: [{ filename: file, path: book }]
    }
    
    res.write("Enviando... ")
    return utils.promisify(transporter.sendMail.bind(transporter))(opts)
        .then(info => {
            res.write("Enviado!")
            res.end();
            return info;
        })
}

function remove(books = []){
    return [ ...new Set(books) ]
        .filter(e => !!e)
        .forEach(e => fs.unlinkSync(e))
}

function handler(func){
    return async function(req, res) {
        try {
            await func(req, res)
        } catch(e) {
            console.error(e);
            res.sendStatus(500);
        }
    }
}

module.exports = { search, parse, metadata, convert, mailer, remove, handler, download }