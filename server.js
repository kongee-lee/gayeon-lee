// 내 컴퓨터에서 화면 파일들을 보여 주는 작은 서버 (Node.js 기본 기능만 사용)
// 실행: node server.js  →  브라우저에서 http://localhost:3000
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// 보여 줄 수 있는 파일과 그 종류
const files = {
  '/index.html': 'text/html; charset=utf-8',
  '/style.css': 'text/css; charset=utf-8',
  '/script.js': 'text/javascript; charset=utf-8',
  '/photo.png': 'image/png',
};

const server = http.createServer(function (request, response) {
  // 주소 뒤의 ?... 는 떼고, 그냥 / 로 오면 index.html을 보여 준다
  let address = request.url.split('?')[0];
  if (address === '/') {
    address = '/index.html';
  }

  const type = files[address];
  if (!type) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('없는 페이지예요');
    console.log(`[요청] ${request.method} ${request.url}  →  [응답] 404 없음`);
    return;
  }

  const body = fs.readFileSync(path.join(__dirname, address));
  response.writeHead(200, { 'Content-Type': type });
  response.end(body);
  console.log(`[요청] ${request.method} ${request.url}  →  [응답] 200 ${type} (${body.length}바이트)`);
});

server.listen(PORT, function () {
  console.log(`서버가 켜졌어요: http://localhost:${PORT}`);
});
