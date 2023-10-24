# Router

## Constructor

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
The route configuration. Refer to [routing](routing) for usage.

### base
The base path of the application.

If your application is deployed in a subdirectory of a domain, like `https://www.example.com/app/`, in this case, the base path would be `/app/`. If you prefer the root path not to end with a slash, you can set the base without a trailing slash, like `/app`.

When you navigate to a URL, if you pass an absolute URL starting with the protocol (for example, `https://www.example.com/app/my-route`), the base path will be trimmed during matching. But if the path you pass does not include the protocol, like `/app/my-route`, the base path will not be trimmed. Example:

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

// Correct
router.push('http://127.0.0.1/app/user')

// Correct
router.push('/user')

// Incorrect
router.push('/app/user')
```

### pathQuery
Uses query parameters as the routing path. This feature can be useful when providing applications under the `file:` protocol, for example:

```js
const router = new Router({
  pathQuery: '__path__',
  // ...
})
```

In the example above, if we visit `file:///path/to/index.html?__path__=/home`, the `/home` route will be matched.

### clientContext
The `context` object when calling the `load` function on the client side. Creating this object might require client-specific APIs, so it is generally set in the [Router.start()](#routerstart) method. Refer to [server-side rendering](ssr) for usage.

### callLoadOnClient
Indicates whether to call the `load` function on the client side.

## router.current
The current [Route](#route) object. Available only on the client side.

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

Starts the router. Available only in `client` mode.

### onReady
A callback function called when the router is ready. We need to create a `ClientApp` instance in this callback. Refer to [creating a new project](creating-a-project) for usage.

### clientContext
Sets the `clientContext` attribute of the `Router` instance.

### ssrState
Provides the data returned by the server’s `load` function to the client for hydration.

### path
Used to initialize the router's path. It can be a URL string or a [Location](#location) type object. It defaults to the current webpage's URL. If the provided URL is different from the current webpage’s URL, it will call `Router.handleClient()` to render the corresponding route but not navigate. This parameter can be used to prevent page navigation, for instance, when the server renders a 404 or 500 page.

## Router.handleClient()

```ts
handleClient(location: string | Location, ssrState?: SSRState): Promise<Route | undefined | false>
```

A router method used for handling navigation during client-side rendering. Use this method if you want to render a route but don’t want `history.pushState()` or `history.replaceState()` to be executed. If a [Route](#route) type object is returned, it means the route was matched and successfully rendered. If `undefined` is returned, no route was matched. If `false` is returned, a route was matched but was intercepted by a route guard.

## Router.handleServer()

```ts
handleServer(location: string | Location, loadFunctionContext?: unknown): Promise<Route | undefined>
```

A router method used for handling requests during server-side rendering. Refer to [server-side rendering](ssr) for details.

## Router.parseLocation()

```ts
parseLocation(location: string | Location): Pick<Route, "path" | "query" | "search" | "hash" | "state" | "href">
```

Parses a [Location](#location) type object or URL string and returns a subset of the [Route](#route) object:

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

A URL string that can be assigned to the `href` attribute of an `<a>` tag and the `location.href` attribute. If your router is based on `pathQuery`, it will include `search` and `hash` but not `path`, because routers based on `pathQuery` do not care about the path.

## Router.push()

```ts
push(location: string | Location): Promise<void>
```

Navigates to `location` and calls `history.pushState()` to change the current page's URL.

## Router.replace()

```ts
replace(location: string | Location): Promise<void>
```

Navigates to `location` and calls `history.replaceState()` to change the current page's URL.

## Router.setState()

```ts
setState(state: Record<string, unknown>): void
```

Merges `state` into the current route’s `state` and calls `history.replaceState()`.

## Router.go()

```ts
go(position: number, state?: Record<string, unknown>): void
```

Calls `history.go()`. If `state` is set, it will merge `state` into the destination route’s `state` and call `history.replaceState()`.

## Router.back()

```ts
back(state?: Record<string, unknown>): void
```

An alias for `router.go(-1, state)`.

## Router.forward()

```ts
forward(state?: Record<string, unknown>): void
```

An alias for `router.go(1, state)`.

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
type ErrorHandler = (error: unknown) => void
```

Listens to router events.

### beforeChange
Triggered before the route changes. For detailed usage, refer to [Route Guards](routing#route-guards).

### beforeCurrentRouteLeave
Triggered before leaving the current route. The event handler is only registered in the current route and will be removed once the route changes.

### update
Triggered when the new route is successfully loaded.

### afterChange
Triggered after the route changes.

### error
Triggered when an error occurs during the route change.

### Event Trigger Sequence
1. Call the `beforeLeave` event handlers in the view tree of the route that is about to be left.
2. Call the `beforeCurrentRouteLeave` event handler.
3. Call the `beforeChange` event handler.
4. Call the `beforeEnter` event handlers in the view tree of the incoming route.
5. Call the `beforeEnter` event handler exported in the `<script context="module">` of synchronously loaded Svelte components.
6. Call the `beforeEnter` event handler exported in the `<script context="module">` of asynchronously loaded Svelte components.
7. Call the `update` event handler.
8. Call the `afterChange` event handler.

## Router.off()

```ts
router.off(event: Event, handler: EventHandler)
```

Removes the event listener from the router.

## Router.once()

```ts
router.once(event: Event, handler: EventHandler)
```

Listens to a router event, but will be triggered only once.

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

The `Route` type object describes the information of the matched route. It consists of the following properties:

### path
A string starting with `/`, excluding the query string or fragment identifier.

### query
A [StringCaster](https://github.com/jiangfengming/cast-string#stringcaster) object containing the query parameters.

### search
A string starting with `?`, representing the URL query string.

### hash
A string starting with `#`, followed by the URL fragment identifier.

### state
A [history.state](https://developer.mozilla.org/en-US/docs/Web/API/History/state) object.

### params
A [StringCaster](https://github.com/jiangfengming/cast-string#stringcaster) object containing the path parameters.

### meta
A plain object used for sharing information between view configurations.

### href
A URL string that can be assigned to the `href` attribute of an `<a>` tag and the `location.href` attribute. If your router is based on `pathQuery`, it will include `search` and `hash` but not `path`, as routers based on `pathQuery` are not concerned with the path.

### ssrState
A JSON serializable object used for passing data during server-side rendering and client-side hydration.

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

The `Location` type object is used to describe the destination of navigation. It can consist of the following properties:

### path
A string starting with `/`. It can include a query string and fragment identifier, but it's not recommended, as you'll need to handle encoding manually.

### params
Path parameters. A key-value pair object used to fill the parameter placeholders in `path`. For example, `{ path: '/articles/:id', params: { id: 123 } }` is equivalent to `{ path: '/articles/123' }`. Using `params` is safer than manually concatenating strings, as the parameter values are automatically encoded with `encodeURIComponent()`.

### query
Query parameters. If a plain object is provided, its format is similar to the return value of the [parse()](https://nodejs.org/api/querystring.html#querystring_querystring_parse_str_sep_eq_options) method of the [querystring](https://nodejs.org/api/querystring.html) module:

```js
{
  foo: 'bar',
  abc: ['xyz', '123']
}
```

### hash
A string starting with `#`, followed by the URL fragment identifier.

### state
Used to set `history.state`.

## Miscellaneous

### Accessing `Router` Instance and `$route` Store from Component Context

Although rarely needed, you can access the `Router` instance and `$route` store from the component context:

```svelte
<script>
  import { getContext } from 'svelte';

  const router = getContext('__SVELTE_PILOT_ROUTER__');
  router.push('/foo');

  const routeStore = getContext('__SVELTE_PILOT_ROUTE__');
  console.log($routeStore.path);
</script>
```

For instance, the `<Link>` component accesses the `Router` instance in this way.