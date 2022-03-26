const { read } = require('fs');
const http = require('http'); // 引入 node.js 的 http
const { v4: uuidv4 } = require('uuid'); // 外部套件 uuid
const errorHandle = require('./errorHandle') // 自己寫的模組

const todos = [];

const requestListener = (req, res) => {
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*', // 跨網域設置
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
       'Content-Type': 'application/json' // JSON 格式
    }

    let body = ''
    req.on('data', chunk => {
      console.log(chunk)
      body += chunk
    })

    if (req.url == "/todos" && req.method == "GET") {
        res.writeHead(200, headers); // 寫入表頭
        res.write(JSON.stringify({ // 先把 JSON 轉成字串傳送，之後會自己還原成 JSON
            'status': 'success',
            'data': todos
        }));
        res.end(); // 結束
    } else if (req.url == "/todos" && req.method == "POST") {
      req.on('end', () => {
        try {
          const title = JSON.parse(body).title
          if (title !== undefined) { // 判斷有沒有 title 屬性
            const todo = {
              "title": title,
              "id": uuidv4()
            }
            todos.push(todo)
            res.writeHead(200, headers); 
            res.write(JSON.stringify({ 
                'status': 'success',
                'data': todos
            }))
            res.end();
          } else {　
              errorHandle(res)
            }
        } catch(error) {
          errorHandle(res)
        }
      })
    } else if (req.url == "/todos" && req.method == "DELETE") {
      todos.length = 0;
      res.writeHead(200, headers); 
      res.write(JSON.stringify({ 
          'status': 'success',
          'data': todos,
      }))
      res.end();
    } else if (req.url.startsWith('/todos/') && req.method == "DELETE") {
      const id = req.url.split('/').pop()
      const index = todos.findIndex(element => element.id == id)
      if (index !== -1) {　// 如果索引值不是 -1 (表示陣列有該筆資料)
        todos.splice(index, 1) // 刪除
        res.writeHead(200, headers); 
        res.write(JSON.stringify({ 
            'status': 'success',
            'data': todos,
            'id': 1
        }))
        res.end();
      } else {
        errorHandle(res)
      }
    } else if (req.url.startsWith('/todos/') && req.method == "PATCH") {
      req.on('end', () => {
        try {
          const title = JSON.parse(body).title
          const id = req.url.split('/').pop()
          const index = todos.findIndex(element => element.id == id)
          if (title !== undefined && index !== -1) { // 判斷是不是有傳來 title 資料、以及該資料是不是在 todos 裡面 (如果沒有值，index 是 -1)
            todos[index].title = title // 利用 index，把 todos 資料改寫
            res.writeHead(200, headers); 
            res.write(JSON.stringify({ 
                'status': 'success',
                'data': todos,
            }))
            res.end()
          } else {
            errorHandle(res)
          }
          res.end()
        } catch {
          errorHandle(res)
        }
      })
    } else if (req.method == "OPTIONS") {
        res.writeHead(200, headers);
        res.end();
    }  
    else {
        res.writeHead(404, headers); 
        res.write(JSON.stringify({
            'status': 'false',
            'message': '無此網站路由'
        }));
        res.end();
    }
}

const server = http.createServer(requestListener);
server.listen(3005)