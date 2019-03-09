## xss-csrf
XSS CSRF demo

> XSS

过滤参数：`encodeURIComponent`
过滤URL: `encodeURI`

## 反射型xss

诱导用户自己点击存在异常的链接。（一次性，点开就获取到信息，没有点开就不存在是否获取）
解决方法：过滤，过滤特殊字符。

```typescript
app.get('/welcome', (req, res) => {
  res.send(`${encodeURIComponent(req.query.type)}`)
})
```

## DOM-Based

`DOM-Based`只会改变了当前客户端的页面展示，不会伤害到其它用户的客户端。

```html
<script>
// 不基于后端 DOM-Based, `修改属性`, `插入内容`, `document.write`, `script结构`
// 改变结构，会造成攻击。
// 攻击的内容称之为：XSS payload
// 解决方法：转译
// <img src="xxx" onerror="alert(123)" id="" />
// xxx" onerror="alert(123)" id="

// <img src=""><script>alert(123)<\/script>"" \/>
// "><script>alert(123)<\/script>"

$('#add').on('click', () => {
    $('.box').html(`<img src="${encodeURI($('#web').val())}" />`)
})
</script>
```

## xss存储型

提交数据到服务器中，恶意脚本存储到服务器上，所有人访问数据都会造成攻击。

解决方案：
1. 客户端传给服务器时，需要校验过滤。
2. 服务端再做过滤。
3. 直接输出到时候再过滤。

```javascript
function encodeHtml (str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot').replace(/'/g, '&apos').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
```

获取api的接口漏洞，从抓包，返回参数，接口参数等信息分析。

## csrf

跨站请求伪造，钓鱼网站

防御：
- 添加验证码（体验不好）
- 判断来源 referer(可以伪造，不靠谱)
- token, 前后台约定规则生成token

## xsrf

`xss` + `csrf` = `xsrf`

解决方法：过滤，过滤特殊字符。

注入第三方写好脚本


-----

[前端攻击](https://segmentfault.com/a/1190000011862576#articleHeader1)
