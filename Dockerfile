FROM node:14.17.6-buster
WORKDIR /app
EXPOSE 4000
ENV XDG_RUNTIME_DIR=/tmp
COPY . .
RUN apt update && \ 
    apt install -y calibre && \
    rm -rf /var/lib/apt/lists/* && \
    npm i

CMD ["node", "index"]