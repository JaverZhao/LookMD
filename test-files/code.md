# 代码高亮测试

## TypeScript

```ts
interface User {
  id: string
  name: string
  email: string
}

async function getUser(id: string): Promise<User | null> {
  const response = await fetch(`/api/users/${id}`)
  if (!response.ok) return null
  return response.json()
}
```

## JavaScript

```js
const greet = (name) => {
  console.log(`Hello, ${name}!`)
}

document.querySelector('#btn')?.addEventListener('click', () => {
  greet('World')
})
```

## Bash

```bash
#!/bin/bash
echo "Checking system..."
node -v
pnpm -v
rustc --version
cargo --version
```

## JSON

```json
{
  "name": "md-reader-lite",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build"
  }
}
```

## 未指定语言

```
这是一段没有指定语言的代码块
纯文本内容
保持缩进和换行
```
