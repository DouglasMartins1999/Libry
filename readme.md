# Libry

O **Libry** - trocadilho com as palavras *Livro* e *Libre* - é um aplicativo online minimalista para converter livros digitais a partir de diversos formatos (ex .epub, .azw, .fb2, .htmlz, entre outros) para a extensão .mobi, com o intuito de facilitar o envio de ebooks para o Kindle - leitor de ebooks da Amazon.

Não obstante, o aplicativo também possibilita:

- editar informações do livro, incluindo imagem da capa e outros metadados, inserindo-os manualmente ou consultando-os na base de dados do Google Books.
- enviar o ebook convertido diretamente ao Kindle, over-the-air, via email.



![Libry](https://i.imgur.com/8NHBBKl.jpg)



Tecnicamente, a aplicação web do Libry foi construída usando Node.JS, a qual invoca a linha de comando do Calibre para converter os ebooks. Ao final, você terá um livro convertido com a mesma qualidade do Calibre mesmo longe de um computador. 

Uma versão de demonstração pode ser encontrada em http://libry.dotins.eu.org. Os passos abaixo fornecem um passo-a-passo para a execução da ferramenta em ambiente próprio. 



# Para Instalar em seu ambiente:

Se estiver familiarizado com Docker, talvez a [imagem no DockerHub](https://hub.docker.com/r/martindoug/libry) lhe seja mais prático. Está disponível tanto para processadores AMD ou ARM64. Se desejar, pode seguir os passos abaixo para instalar sem Docker:



#### Pré Requisitos

- Node.JS em versão igual ou superior a 14.10 LTS
- Calibre instalado localmente (versão 5.14 foi utilizada em desenvolvimento)
- Endereço de email disponível para enviar os arquivos (Gmail, Yahoo, Outlook, etc ou provedor próprio)

> OBS: Desenvolvido utilizando o Pop OS! 20.10, executando em produção no Ubuntu 20.04 LTS



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


