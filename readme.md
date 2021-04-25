# Libry

#### Editor Online de eBooks

O Libry é um projeto desenvolvido em Node.JS que se utiliza do gerenciador de ebooks [Calibre](https://calibre-ebook.com/) para efetuar operações básicas de conversão e edição de metadados de livros digitais. Possui em essência três features:

- Conversão de livros para o formato .mobi
- Edição manual ou automática de metadados, com base nos dados disponíveis pela [Google Books API](https://developers.google.com/books/)
- Envio do arquivo modificado por email para dispositivos Kindle, através do [nodemailer](nodemailer.com)



A motivação para o desenvolvimento dessa ferramenta advém da dificuldade de enviar ao Kindle livros digitais encontrados fora da loja da Amazon. Uma versão de demonstração pode ser encontrada em http://libry.atenz.xyz. Os passos abaixo fornecem um passo-a-passo para a execução da ferramenta em ambiente próprio. 



#### Pré Requisitos

- Node.JS em versão igual ou superior a 14.10 LTS
- Calibre instalado localmente (versão 5.14 foi utilizada em desenvolvimento)
- Endereço de email disponível para enviar os arquivos (Gmail, Yahoo, Outlook, etc ou provedor próprio)

> OBS: Desenvolvido utilizando o Pop OS! 20.10, testado no Ubuntu 20.04 LTS



#### Passo-a-passo

1. No terminal, clone esse repositório e acesse a pasta criada

2. Assegure-se que o calibre pode ser encontrado pela linha de comando

   ```sh
   calibre --version
   ```

   Verifique se o resultado exibido é similar a `calibre (calibre 5.14)` e continue.
   

3. Instale as dependências desse projeto

   ```
   npm install
   ```

4. Renomeie o arquivo `mail.conf.ex.json` para `mail.conf.json` e edite-o incluindo seus dados para envio de emails. Confira a [documentação do nodemailer](https://nodemailer.com/smtp/well-known/) para mais detalhes sobre como utilizar com seu provedor.

5. Execute o projeto

   ```
   node index.js
   ```

6. Abra seu navegador e acesse o projeto: http://localhost:4000/

