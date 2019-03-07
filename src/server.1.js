"use strict";
// 当用户登录 返回一个标示 cookie
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var body_parser_1 = __importDefault(require("body-parser"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var app = express_1.default();
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use(express_1.default.static(path_1.default.join(__dirname, '../')));
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(cookie_parser_1.default());
var userList = [
    { username: 'tpack', password: 'tpack', money: 10000 },
    { username: 'alogy', password: '123123', money: 200 }
];
var SESSION_ID = 'connect.sid';
var session = {};
app.post('/api/login', function (req, res) {
    var _a = req.body, username = _a.username, password = _a.password;
    var user = userList.find(function (user) { return (user.username === username) && (user.password === password); });
    if (user) {
        var cardId = Math.random() + Date.now();
        session[cardId] = { user: user };
        res.cookie(SESSION_ID, cardId);
        res.json({ code: 0, error: null });
    }
    else {
        res.json({ code: 1, error: '用户不存在' });
    }
});
// 反射型xss
// chrome 发现路径存在异常，会有 xss屏蔽功能。
// 诱导用户自己点击存在异常的链接。（一次性，点开就获取到信息，没有点开就不存在是否获取）
// 解决方法：过滤
app.get('/welcome', function (req, res) {
    res.send("" + encodeURIComponent(req.query.type));
});
// 用户评论信息
var comments = [
    { username: 'tpack', content: 'welcome' },
    { username: 'sue', content: 'xixihaha' }
];
app.get('/api/list', function (req, res) {
    res.json({ code: 0, comments: comments });
});
app.post('/api/addcomment', function (req, res) {
    // 验证登录信息
    var ret = session[req.cookies[SESSION_ID]] || {};
    var user = ret.user;
    if (user) {
        comments.push({ username: user.username, content: req.body.content });
        res.json({ code: 0 });
    }
    else {
        res.json({ code: 1, error: '用户未登陆' });
    }
});
app.get('/api/userinfo', function (req, res) {
    // 验证登录信息
    var ret = session[req.cookies[SESSION_ID]] || {};
    var user = ret.user;
    if (user) {
        res.json({ code: 0, username: user.username, money: user.money });
    }
    else {
        res.json({ code: 1, error: '用户未登陆' });
    }
});
app.post('/api/transfer', function (req, res) {
    var ret = session[req.cookies[SESSION_ID]] || {};
    var user = ret.user;
    if (user) {
        var _a = req.body, target_1 = _a.target, money_1 = _a.money;
        console.log(req.body, 'req.body');
        userList.forEach(function (u) {
            console.log(u, 'u');
            if (u.username === user.username) {
                u.money -= +money_1;
            }
            if (u.username === target_1) {
                u.money += +money_1;
            }
        });
        res.json({ code: 0 });
    }
    else {
        res.json({ code: 1, error: '用户未登陆' });
    }
});
app.listen(1231);
