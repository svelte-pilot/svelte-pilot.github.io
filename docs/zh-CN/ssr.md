# 服务端渲染

这一章节我们基于[新建一个项目](creating-a-project)章节中创建的项目，介绍如何使用 Svelte Pilot 实现服务端渲染。

## 代码结构

SSR 的主要代码结构如下：

```
- index.html
- ssr-dev-server.js    // 开发环境 HTTP 服务
- src/
  - render.js          // 服务端渲染器
  - server.js          // 服务端入口
  - main.js            // 客户端入口
```

## 开发服务器

在开发环境中，我们需要一个 HTTP 服务来提供 SSR 和 HMR（模块热替换） 功能。例子：

```js
// file: ssr-dev-server.js
import fs from 'node:fs'
import { createServer } from 'node:http'
import process from 'node:process'
import { createServer as createViteDevServer } from 'vite'

const PORT = Number(process.env.PORT) || 5173

const vite = await createViteDevServer({
  appType: 'custom',
  server: { middlewareMode: true },
})

createServer((req, res) => {
  vite.middlewares(req, res, async () => {
    try {
      // 1. Read index.html
      let template = fs.readFileSync('index.html', 'utf-8')

      // 2. Apply Vite HTML transforms. This injects the Vite HMR client,
      //    and also applies HTML transforms from Vite plugins, e.g. global
      //    preambles from @vitejs/plugin-react
      template = await vite.transformIndexHtml(req.url, template)

      // 3. Load the server entry. ssrLoadModule automatically transforms
      //    ESM source code to be usable in Node.js! There is no bundling
      //    required, and provides efficient invalidation similar to HMR.
      const { default: render } = await vite.ssrLoadModule('./src/render.js')

      // 4. render the app HTML. This assumes entry-server.js's exported
      //     `render` function calls appropriate framework SSR APIs,
      //    e.g. ReactDOMServer.renderToString()
      const {
        body,
        headers,
        statusCode = 200,
        statusMessage,
      } = await render({
        headers: req.headers,
        template,
        url: req.url,
      })

      res.writeHead(statusCode, statusMessage, headers)
      res.end(body)
    }
    catch (e) {
      // If an error is caught, let Vite fix the stack trace so it maps back
      // to your actual source code.
      vite.ssrFixStacktrace(e)
      console.error(e)
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end(e.message)
    }
  })
}).listen(PORT)

console.log(`Server running at http://localhost:${PORT}`)
```

## 服务端渲染器

```js
// file: src/render.js
import { render } from 'svelte/server'
import { ServerApp } from 'svelte-pilot'

import router from './router'

export default async function ({ template, url }) {
  try {
    const route = await router.handleServer(
      new URL(url, 'http://127.0.0.1').href
    )

    if (!route) {
      return {
        body: import.meta.env.DEV
          ? `${url} did not match any routes. Did you forget to add a catch-all route?`
          : '404 Not Found',
        statusCode: 404
      }
    }

    const html = render(ServerApp, {
      props: { route, router }
    })

    return {
      body: template
        .replace('</head>', `${html.head}</head>`)
        .replace(
          '<div id="app">',
          `<div id="app">${
            html.body
          }<script>__SSR_STATE__ = ${serialize(route.ssrState)}</script>`
        ),

      headers: {
        'Content-Type': 'text/html'
      },

      statusCode: 200
    }
  }
  catch (e) {
    console.error(e)

    return {
      body: import.meta.env.DEV && e instanceof Error ? e.message : '',
      statusCode: 500
    }
  }
}

function serialize(data) {
  return JSON.stringify(data).replace(/</g, '\\u003C').replace(/>/g, '\\u003E')
}
```

## 客户端入口

```js
// file: src/main.js
import './app.css'

import { hydrate } from 'svelte'
import { ClientApp } from 'svelte-pilot'

import router from './router'

router.start(
  () => {
    hydrate(ClientApp, {
      props: { router },
      target: document.getElementById('app')
    })

    delete window.__SSR_STATE__
  },
  {
    ssrState: window.__SSR_STATE__
  }
)
```

现在，我们可以在命令行中运行 `node ssr-dev-server.js` 来启动开发环境 HTTP 服务，然后访问 `http://localhost:5173` 来查看效果。

我们能看到存在 [FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content) 问题。在生产模式下，对于使用了 Tailwind CSS 的项目，我们可以通过设置 Vite 的配置项 `build.cssCodeSplit` 为 `true` 来解决。如果你的 CSS 太大，需要按需加载，可以通过读取 Vite 编译生成的 [ssr-manifest.json](https://vitejs.dev/guide/ssr.html#generating-preload-directives) 文件，然后在服务端渲染时把当前页面所需的 CSS 文件插入到 HTML 中。具体实现可以参考 [svelte-pilot-template](https://github.com/svelte-pilot/svelte-pilot-template) 项目。

## 服务端入口

接下来，我们创建生产环境的入口文件 `src/server.js`：

```js
// file: src/server.js
import { createServer } from 'node:http'
import sirv from 'sirv'

import template from '../dist/client/index.html?raw'
import render from './render'

const PORT = Number(process.env.PORT) || 5173
const serve = sirv('../client')

createServer(async (req, res) => {
  console.log(req.url)

  serve(req, res, async () => {
    const {
      body,
      headers,
      statusCode = 200,
      statusMessage
    } = await render({
      headers: req.headers,
      template,
      url: req.url
    })

    if (statusMessage) {
      res.statusMessage = statusMessage
    }

    res.writeHead(statusCode, headers)
    res.end(body)
  })
}).listen(PORT)

console.log(`Server running at http://localhost:${PORT}`)
```

安装依赖：

```bash
npm i sirv
```

然后，我们在 `package.json` 中添加 SSR 相关命令：

```json
{
  "scripts": {
    "dev:ssr": "node ssr-dev-server.js",
    "build:ssr": "vite build --outDir dist/client && vite build --ssr src/server.js --outDir dist/server",
    "start:ssr": "cd dist/server && node server.js"
  }
}
```

现在，我们可以在命令行中运行 `npm run build:ssr` 来构建生产环境的代码，然后运行 `npm run start:ssr` 来启动生产环境 HTTP 服务，然后访问 `http://localhost:5173` 来查看效果。

## 加载数据

我们可以在视图组件中导出 `load` 函数来加载数据。例子：

```svelte
<script context='module'>
  export async function load() {
    return {
      user: 'World',
    }
  }
</script>

<script>
  let { user } = $props()
</script>

<h1>Hello {user}!</h1>
```

`load` 函数会在服务端渲染时被调用，返回的数据会被传递到视图组件中。在 `render.js` 中，我们将数据嵌入了 HTML 中，然后在客户端渲染时，我们将数据提供给路由器进行水合（hydration）。

`load` 函数接受三个参数：

- `props`：视图组件的 `props` 对象。
- `route`：当前[路由对象](router#route)。
- `context`: 自定义上下文对象。在调用 [router.handleServer()](router#routerhandleserver) 时作为第二个参数传入。你可以通过 `context` 对象储存当前请求的 `headers`、`cookies` 等信息，还可以实现设置响应的 `statusCode`、`statusMessage`、`headers` 等功能。具体实现可以参考 [svelte-pilot-template](https://github.com/svelte-pilot/svelte-pilot-template) 项目，这里不再赘述。

### 客户端调用 load 函数

当我们在客户端使用 HTML5 History API 进行路由跳转时，视图组件的 `load` 函数默认不会被调用，这会导致客户端渲染时缺少数据。我们有三种解决办法：

#### 不使用 HTML5 History API

- 不使用 `router.push()` 和 `router.replace()`，而是使用 `location.href` 进行路由跳转；
- 将 `<Link>` 组件的[默认 `method`](link#设置全局默认属性) 设为 `null` 禁止其调用 HTML5 History API。或者直接使用 `<a>` 标签。

#### 使用 `$:` 标记监听组件 props

这就是普通 Svelte 组件的做法，监听组件 prop，在发生变化时使用客户端代码加载新数据。

#### 设置 callLoadOnClient 属性

在实例化 Router 时设置参数 [callLoadOnClient](router#callloadonclient) 为 `true`。这样，当我们在客户端使用 HTML5 History API 进行路由跳转时，视图组件的 `load` 函数会被调用。但由于服务端和客户端获取数据、处理请求和响应的方式有很多不同，我们需要为服务端和客户端各自实现相互兼容的 `context` 对象。服务端的 `context` 对象上文已提到，客户端的 `context` 对象则是在 [router.start()](router#start) 的第二个参数中设置 `clientContext` 属性。

除了在全局配置中设置 `callLoadOnClient` 属性，我们还可以为每个 `load` 函数单独设置 `callOnClient` 属性。这样，我们可以在某些视图组件中调用 `load` 函数，而在另一些视图组件中不调用 `load` 函数。比如，如果你需要精细控制加载数据时的 UI 样式，你可以通过设置 `load.callOnClient = false` 来禁止当前视图组件在客户端调用 `load` 函数，然后在客户端使用 `$:` 标记监听组件 props 的方式来加载数据。

`load` 函数还有一个属性 `cacheKey`，它可以设置为一个数组，数组元素为组件 props 对象中的属性名。当跳转后的路由与当前路由的 `cacheKey` 数组中指定的 prop 值全部相同时，`load` 函数不会被调用，而是直接使用当前的缓存数据，这样我们可以避免不必要的数据加载。如果不设置 `cacheKey` 属性，则默认为 props 对象中的所有属性名。

例子：

```js
export async function load({ id }, route, ctx) {
  const user = await ctx.api.get(`/user/${id}`)

  if (!user) {
    /*
      rewrite() 方法在服务端和客户端需要各自实现。
      在服务端，我们可以调用 router.handleServer('/404') 来渲染 404 页面。
      在客户端，我们可以调用 router.handleClient('/404') 来渲染 404 页面。
    */
    ctx.rewrite('/404')
  }
  else {
    return { user }
  }
}

load.callOnClient = true
load.cacheKey = ['id']
```

看到这里，相信你已经了解了使用 Svelte Pilot 实现服务端渲染的基本流程。如果你需要在无服务（Serverless）平台上部署，或者生成静态网站（Static-Site Generation），只需稍加改造就可以实现。您可以直接使用或参考 [svelte-pilot-template](https://github.com/svelte-pilot/svelte-pilot-template) 项目。
