const info = document.querySelector("#info");
const list = document.querySelector(".book-grid");
const awaiter = document.querySelector("#awaiter");
const downloader = document.querySelector("#downloader");
const notfound = document.querySelector("#notfound");
const mailer = document.querySelector("#mailer");
const status = document.querySelector(".process");
const progress = document.querySelector(".progress > div");
const dateFormatter = new Intl.DateTimeFormat("pt-BR");

const pages = {
    error: document.querySelector("#error"),
    start: document.querySelector("#start"),
    search: document.querySelector("#search"),
    detail: document.querySelector("#detail"),
    editor: document.querySelector("#editor"),
    picker: document.querySelector("#picker"),
    external: document.querySelector("#external"),
    awaiting: document.querySelector("#awaiting"),
    converted: document.querySelector("#converted"),
    sendmail: document.querySelector("#sendmail"),
    mailed: document.querySelector("#mailed")
}

async function convert(dest = "converted") {
    const req = new XMLHttpRequest();
    const loader = setInterval(awaitPad, 1000);
    localStorage.setItem("mail", mailer.value);

    req.open("POST", "./convert");
    req.responseType = "blob";
    
    req.upload.onprogress = e => {
        const percent = Math.round(e.loaded / e.total * 100);
        progress.style.width = (percent * 0.4) + '%';
        status.textContent = percent === 100 ? "Convertendo e Editando..." : `Enviando Livro... (${percent}%)`;
    }
    
    req.onprogress = e => {
        const percent = Math.round(e.loaded / (e.total || 20) * 100);
        progress.style.width = (percent * 0.4 + 60) + '%';
        status.textContent = dest === "mailed" ? "Enviando ao Kindle..." : `Baixando Resultado... (${percent}%)`;
    };
    
    req.onloadend = () => req.statusText === "OK" ? download(req.response, dest, loader) : navigate("error");
    req.onerror = () => { navigate("error"); clearInterval(loader) };
    req.send(new FormData(info));
    
    navigate("awaiting");
}

async function download(result, dest, loader) {
    const content = new Blob([ result ]);
    const url = URL.createObjectURL(content);

    downloader.href = url;
    downloader.download = (info.children[1].files[0]?.name ?? "book.ext")
        .split(".").slice(0, -1)
        .concat(info.children[2].value)
        .join(".")
    
    clearInterval(loader);
    navigate(dest)
}

function reseter(rm){
    selected();
    resetList();
    navigate("start")
    info.reset();

    if(rm) {
        location.search = "";
    }
}

async function sync(keyword){
    if(keyword === "") return resetList();

    const req = new XMLHttpRequest();
    req.responseType = "json";
    req.open("GET", "./search?q=" + keyword)
    req.onload = () => resetList(req.response || []);
    req.send();
}

function resetList(data = []) {
    list.innerHTML = "";
    notfound.style.display = (data.length ? "none" : "block");

    for(let d of data) {
        const elem = document.createElement("img");
    
        elem.src = d.Cover;
        elem.onclick = () => renderInfo(d);
        list.appendChild(elem);
    }
}

function renderInfo(data){
    info.children[0].value = JSON.stringify(data || "{}");

    document.querySelector("#title").textContent = data.Title || "[ Não encontrado ]";
    document.querySelector("#author").textContent = data.Author || "[ Não encontrado ]";
    document.querySelector("#publisher").textContent = data.Publisher || "[ Não divulgada ]";
    document.querySelector("#released").textContent = dateFormatter.format(new Date(data.ReleasedAt || new Date().toISOString()))
    document.querySelector("#ISBN").textContent = data.ISBN || "[ Não divulgado ]";
    document.querySelector("#pages").textContent = data.Pages || "[ Não informado ]";
    document.querySelector("#description").textContent = data.Description || "[ Não informada ]";
    document.querySelector("#cover").src = data.Cover;

    document.querySelector("#titleEdit").value = data.Title;
    document.querySelector("#authorEdit").value = data.Author
    document.querySelector("#publisherEdit").value = data.Publisher;
    document.querySelector("#releasedEdit").value = new Date(data.ReleasedAt || Date.now()).toISOString()
    document.querySelector("#ISBNEdit").value = data.ISBN;
    document.querySelector("#pagesEdit").value = data.Pages;
    document.querySelector("#descriptionEdit").value = data.Description;
    document.querySelector("#coverEdit").value = data.Cover;

    navigate('detail');
}

function editor(){
    const data = JSON.parse(info.children[0].value || "{}");

    data.Title = document.querySelector("#titleEdit").value;
    data.Author = document.querySelector("#authorEdit").value;
    data.Publisher = document.querySelector("#publisherEdit").value;
    data.ReleasedAt = document.querySelector("#releasedEdit").value;
    data.ISBN = document.querySelector("#ISBNEdit").value;
    data.Pages = document.querySelector("#pagesEdit").value;
    data.Description = document.querySelector("#descriptionEdit").value;
    data.Cover = document.querySelector("#coverEdit").value;

    renderInfo(data);
}

function routeConversion(){
    info.children[3].value = new URLSearchParams(location.search).get("uri");
    document.querySelector("#uri").textContent = info.children[3].value;
    navigate(info.children[3].value ? 'external' : 'picker');
}

function selected(name) {
    const selector = document.querySelector("#selectedfile");
    const actioners = document.querySelectorAll(".actioners");

    selector.textContent = name || "";
    actioners.forEach(a => a.disabled = !name);
}

function navigate(page){
    location.hash = page;
}

function awaitPad(){
    const text = "Aguarde";
    const pad = text.length + new Date().getSeconds() % 5;
    return awaiter.textContent = text.padEnd(pad, ".");
}

function sendMail(){
    mailer.value = localStorage.getItem("mail");
    navigate('sendmail')
}

document.querySelector("#searcher").addEventListener("change", e => sync(e.target.value));
document.querySelector("#book").addEventListener("change", e => selected(e.target.files[0].name))

info.addEventListener("submit", e => e.preventDefault());
window.addEventListener("hashchange", () => {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    pages[location.hash.replace("#", "")].classList.add("active");
})

reseter();