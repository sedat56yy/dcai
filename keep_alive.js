const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot çalışıyor!");
});

server.listen(3000, () => {
  console.log("Keep-alive server 3000 portunda çalışıyor");
});
