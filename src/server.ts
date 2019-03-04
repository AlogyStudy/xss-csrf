
// 当用户登录 返回一个标示 cookie

import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

const app = express()

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, '../')))
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())

interface IUser {
  username: string
  password: string
}

let userList: Array<IUser> = [
  { username: 'tpack', password: 'tpack' },
  { username: 'alogy', password: '123123' }
]
const SESSION_ID: string = 'connect.sid'
let session: {[key: string]: Object} = {}

app.post('/api/login', (req, res) => {
  let { username, password } = req.body
  let user = userList.find(user => (user.username === username) && (user.password === password))
  if (user) {
    let cardId = Math.random() + Date.now()
    session[cardId] = {user}
    res.cookie(SESSION_ID, cardId)
    res.json({code: 0, error: null})
  } else {
    res.json({ code: 1, error: '用户不存在' })
  }
})

// 反射型xss
// chrome 发现路径存在异常，会有 xss屏蔽功能。
// 诱导用户自己点击存在异常的链接。（一次性，点开就获取到信息，没有点开就不存在是否获取）
// 解决方法：过滤
app.get('/welcome', (req, res) => {
  res.send(`${encodeURIComponent(req.query.type)}`)
})

// 用户评论信息
let comments = [
  {username: 'tpack', content: 'welcome'},
  {username: 'sue', content: 'xixihaha'}
]
app.get('/api/list', (req, res) => {
  res.json({code: 0, comments})
})

app.post('/api/addcomment', (req, res) => {
  // 验证登录信息
  let ret: any = session[req.cookies[SESSION_ID]] || {}
  let user = ret.username
  if (user) {
    comments.push({ username: user.username, content: req.body.content })
    res.json({code: 0})
  } else {
    res.json({code: 1, error: '用户未登陆'})
  }
})

app.listen(1230)
