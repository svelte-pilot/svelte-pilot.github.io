# 创建一个项目

我们使用 Vite 创建一个 Svelte 项目：
  
```sh
npm create vite@latest my-svelte-app -- --template svelte
```

遵循提示执行命令。一切顺利的话，你的浏览器应该能成功打开项目主页了。或者你可以访问 https://vite.new/svelte 通过在线 IDE 继续本教程。

接下来，我们在项目中安装`svelte-pilot`：

```sh
npm i svelte-pilot
```

然后，我们创建路由配置文件`src/router.js`：

```js
/// file: src/router.js
import { Router } from 'svelte-pilot'

export default new Router({
  routes: [
    {
      path: '/',
      component: () => import('./App.svelte')
    }
  ]
})
```

最后，我们修改`src/main.js`以启动路由器：

```js
/// file: src/main.js
import './app.css'
import { ClientApp } from 'svelte-pilot'
import router from './router'

router.start(
  () =>
    new ClientApp({
      target: document.getElementById('app'),
      props: { router }
    })
)
```

至此，我们已经完成了一个最简单的 Svelte 应用并成功接入了 Svelte Pilot。接下来，我们将介绍如何使用 Svelte Pilot 来实现路由功能。
