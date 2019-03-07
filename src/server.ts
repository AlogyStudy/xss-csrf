
// 当用户登录 返回一个标示 cookie

import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import svgCaptcha from 'svg-captcha'

const app = express()

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, '../')))
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())

interface IUser {
  username: string
  password: string
  money: number
}

let userList: Array<IUser> = [
  { username: 'tpack', password: 'tpack', money: 10000 },
  { username: 'alogy', password: '123123', money: 200 }
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
  let user = ret.user
  if (user) {
    comments.push({ username: user.username, content: req.body.content })
    res.json({code: 0})
  } else {
    res.json({code: 1, error: '用户未登陆'})
  }
})

app.get('/api/userinfo', (req, res) => {
  // 验证登录信息
  let ret: any = session[req.cookies[SESSION_ID]] || {}
  // data, svg内容，text表示验证码对应结果
  let {data, text} = svgCaptcha.create()
  ret.text = text
  let user = ret.user
  if (user) {
    res.json({code: 0, username: user.username, money: user.money, svg: data})
  } else {
    res.json({code: 1, error: '用户未登陆'})
  }
})

app.post('/api/transfer', (req, res) => {
  let ret: any = session[req.cookies[SESSION_ID]] || {}
  let user = ret.user
  if (user) {
    let { target, money, code } = req.body
    if (user.text === code) {
      userList.forEach(u => {
        if (u.username === user.username) {
          u.money -= +money
        }
        if (u.username === target) {
          u.money += +money
        }
      })
      res.json({code: 0})
    }
    res.json({code: 1, error: '非'})
  } else {
    res.json({code: 1, error: '用户未登陆'})
  }
})

app.listen(1230)
