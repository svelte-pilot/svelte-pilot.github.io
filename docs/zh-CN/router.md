# Router

## 构造函数

```ts
constructor({
  routes,
  base = '',
  pathQuery = '',
  clientContext,
  callLoadOnClient = false
}: {
  routes: ViewConfigGroup
  base?: string
  pathQuery?: string
  clientContext?: unknown
  callLoadOnClient?: boolean
})
```

### routes
路由配置。用法请参考 [路由配置](routing)。

### base
应用的基本路径。

如果您的应用部署在域名子目录中，例如 `https://www.example.com/app/`，在这种情况下， 基本路径将是 `/app/`。如果你希望根路径不以斜杠结尾，你可以设置没有结束斜杠的基地，像 `/app`。

到你导航到一个 URL 时，如果你传递一个以协议开头的绝对 URL（例如 `https://www.example.com/app/my-route`），在匹配时将裁剪掉基本路径。但如果你传递的路径不包含协议，例如 `/app/my-route`，则不会裁剪掉基本路径。例子：

```js
const router = new Router({
  base: '/app',
  
  routes: [
    {
      path: '/user',
      component: () => import('./User.svelte')
    }
  ]
})

// 正确
router.push('http://127.0.0.1/app/user')

// 正确
router.push('/user')

// 错误
router.push('/app/user')
```

### pathQuery
使用查询参数作为路由路径。比如当在 `file:` 协议下提供应用程序时，我们可以使用此功能。例子：

```js
const router = new Router({
  pathQuery: '__path__',
  // ...
})
```

上面例子中，如何我们访问 `file:///path/to/index.html?__path__=/home`，则会匹配到 `/home` 路由。

### clientContext
客户端调用 `load` 函数时的 `context` 对象。建立此对象可能需要用到客户端专有的 API，因此我们一般在 [Router.start()](#routerstart) 方法中设置。用法请参考 [服务端渲染](ssr)。

### callLoadOnClient
是否在客户端调用 `load` 函数。

## router.current
当前 [Route](#route) 对象。只在客户端可用。

## Router.start()

```ts
start(
  onReady: () => void,
  {
    clientContext,
    ssrState,
    path
  }: {
    clientContext?: unknown
    ssrState?: SSRState
    path?: string | Location
  } = {}
): void
```

启动路由器。只在 `client` 模式下可用。

### onReady
当路由器准备好时调用的回调函数。我们需要在这个回调函数中创建 `ClientApp` 实例。用法请参考 [新建一个项目](creating-a-project)。

### clientContext
设置 `Router` 实例的 `clientContext` 属性。

### ssrState
将服务端 `load` 函数返回的数据提供给客户端进行水合（hydration）。

### path
用于初始化路由器的路径。可以是 URL 字符串或者 [Location](#location) 类型对象。默认为当前网页的 URL。如果提供的 URL 与当前网页的 URL 不同，则会调用 `Router.handleClient()` 渲染对应的路由但不进行跳转。比如当服务端渲染的是 404 或 500 页面时，我们可以在客户端渲染时使用此参数防止页面跳转。

## Router.handleClient()

```ts
handleClient(location: string | Location, ssrState?: SSRState): Promise<Route | undefined | false>
```

客户端渲染时，用于处理导航的路由器方法。如果你想要渲染一个路由但不希望 `history.pushState()` 或 `history.replaceState` 被执行，可以使用此方法。如果返回 [Route](#route) 类型对象，表示匹配到了路由并成功渲染；如果返回 `undefined`，表示没有匹配到路由；如果返回 `false`，表示匹配到了路由但被路由守卫拦截了。

## Router.handleServer()

```ts
handleServer(location: string | Location, loadFunctionContext?: unknown): Promise<Route | undefined>
```

服务端渲染时，用于处理请求的路由器方法。详情请参考 [服务端渲染](ssr)。


## Router.parseLocation()

```ts
parseLocation(location: string | Location): Pick<Route, "path" | "query" | "search" | "hash" | "state" | "href">
```

解析 [Location](#location) 类型对象或 URL 字符串，并返回 [Route](#route) 对象的子集：

```js
{
  path,
  query,
  search,
  hash,
  state,
  href
}
```

## Router.href()

```ts
href(location: string | Location): string
```

可以赋值给 `<a>` 标签的 `href` 属性和 `location.href` 属性的 URL 字符串。如果你的路由器基于 `pathQuery`，它将包含 `search` 和 `hash` 但不包含 `path`，因为基于 `pathQuery` 的路由是不关心路径的。

## Router.push()

```ts
push(location: string | Location): Promise<void>
```

导航到 `location` 并调用 `history.pushState()` 更改当前页面的 URL。

## Router.replace()


```ts
replace(location: string | Location): Promise<void>
```

导航到 `location` 并调用 `history.replaceState()` 更改当前页面的 URL。

## Router.setState()

```ts
setState(state: Record<string, unknown>): void
```

将 `state` 合并到当前路由的 `state` 并调用 `history.replaceState()`。

## Router.go()

```ts
go(position: number, state?: Record<string, unknown>): void
```

调用 `history.go()`。如果设置了 `state`，则会将 `state` 合并到目的地路由的 `state` 并调用 `history.replaceState()`。

## Router.back()
  
```ts
back(state?: Record<string, unknown>): void
```

`router.go(-1, state)` 的别名。

## Router.forward()

```ts
forward(state?: Record<string, unknown>): void
```

`router.go(1, state)` 的别名。

## Router.on()

```ts
router.on('beforeChange', handler: NavigationGuard)
router.on('beforeCurrentRouteLeave', handler: NavigationGuard)
router.on('update', handler: UpdateHandler)
router.on('afterChange', handler: AfterChangeHandler)
router.on('error', handler: ErrorHandler)

type NavigationGuardResult = void | boolean | string | Location

type NavigationGuard = (
  to: Route,
  from?: Route
) => NavigationGuardResult | Promise<NavigationGuardResult>

type AfterChangeHandler = (to: Route, from?: Route) => void
type UpdateHandler = (route: Route) => void
type Errorhandler = (error: unknown) => void
```

监听路由器事件。

### beforeChange
在路由改变之前触发。详细用法请参考 [路由守卫](routing#路由守卫)。

### beforeCurrentRouteLeave
在当前路由离开之前触发。事件处理器只注册在当前路由中，路由改变后会被移除。

### update
在新路由成功加载时触发。

### afterChange
在路由改变之后触发。

### error
在路由改变时发生错误时触发。

### 事件触发顺序
1. 调用即将离开的路由的视图树中的 `beforeLeave` 事件处理器。
2. 调用 `beforeCurrentRouteLeave` 事件处理器。
3. 调用 `beforeChange` 事件处理器。
4. 调用即将进入的路由的视图树中的 `beforeEnter` 事件处理器。
5. 调用同步加载的 Svelte 组件中 `<script context="module">` 导出的 `beforeEnter` 事件处理器。
5. 调用异步加载的 Svelte 组件中 `<script context="module">` 导出的 `beforeEnter` 事件处理器。
6. 调用 `update` 事件处理器。
7. 调用 `afterChange` 事件处理器。

## Router.off()

```ts
router.off(event: Event, handler: EventHandler)
```

移除路由器事件监听器。

## Router.once()

```ts
router.once(event: Event, handler: EventHandler)
```

监听路由器事件，但只会触发一次。

## Route

```ts
type Route = {
  path: string
  query: StringCaster
  search: string
  hash: string
  state: Record<string, unknown>
  params: StringCaster
  meta: Record<string, unknown>
  href: string
  ssrState: SSRState
}
```

`Route` 类型对象描述匹配到的路由信息。它由以下属性组成：

### path
一个以 `/` 开头的路径字符串，不包括查询字符串或片段标识符。

### query
一个 [StringCaster](https://github.com/jiangfengming/cast-string#stringcaster) 对象，包含查询参数。

### search
一个以 `?` 开头的 URL 查询字符串。

### hash
一个以 `#` 开头的字符串，后面跟着 URL 片段标识符。

### state
一个 [history.state](https://developer.mozilla.org/en-US/docs/Web/API/History/state) 对象。

### params
一个 [StringCaster](https://github.com/jiangfengming/cast-string#stringcaster) 对象，包含路径参数。

### meta
一个用于在视图配置之间共享信息的普通对象。

### href
可以赋值给 `<a>` 标签的 `href` 属性和 `location.href` 属性的 URL 字符串。如果你的路由器基于 `pathQuery`，它将包含 `search` 和 `hash` 但不包含 `path`，因为基于 `pathQuery` 的路由是不关心路径的。

### ssrState
一个用于在服务端渲染和客户端水合时传递数据的可 JSON 序列化的对象。

## Location

```ts
type Location = {
  path: string
  params?: Record<string, string | number | boolean>
  query?: Record<string, PrimitiveType | PrimitiveType[]> | URLSearchParams
  hash?: string
  state?: Record<string, unknown>
}
```

`Location` 类型对象用于描述导航的目的地。它可以由以下属性组成：

### path
路径。一个以 `/` 开头的路径字符串。它可以包括查询字符串和片段标识符，但并不推荐，因为你需要手动进行编码处理。

### params
路径参数。一个键值对对象，用于填充 `path` 的参数占位符。例如，`{ path: '/articles/:id', params: { id: 123 } }` 等于 `{ path: '/articles/123 }`。使用 `params` 而不是手动拼接字符串更安全，因为参数值会自动调用 `encodeURIComponent()` 进行编码处理。

### query
查询参数。如果提供了一个普通对象，其格式与 [querystring](https://nodejs.org/api/querystring.html) 模块的 [parse()](https://nodejs.org/api/querystring.html#querystring_querystring_parse_str_sep_eq_options) 方法的返回值相同：

```js
{
  foo: 'bar',
  abc: ['xyz', '123']
}
```

### hash
一个以 `#` 开头的字符串，后面跟着 URL 片段标识符。

### state
用于设置 `history.state`。

## 其他

### 从组件 context 中获取 `Router` 实例和 `$route` store

虽然很少需要用到，但你可以从组件 context 中获取 `Router` 实例和 `$route` store：

```svelte
<script>
  import { getContext } from 'svelte';

  const router = getContext('__SVELTE_PILOT_ROUTER__');
  router.push('/foo');

  const routeStore = getContext('__SVELTE_PILOT_ROUTE__');
  console.log($routeStore.path);
</script>
```

比如 `<Link>` 组件就是这样获得 `Router` 实例的。
