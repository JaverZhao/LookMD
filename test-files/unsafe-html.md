# 安全测试

## HTML 注入

这段内容包含潜在的 HTML 注入：

```html
<script>alert('xss')</script>
<img src="x" onerror="alert('xss')" />
```

如果应用正常，上面的脚本不会执行，页面不会弹出 alert。

## 普通 Markdown

- 脚本内容应该被 DOMPurify 过滤
- 页面不会崩溃
- 应用可以继续正常使用
