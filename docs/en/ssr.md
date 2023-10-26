# Server-Side Rendering

In this chapter, based on the project created in the [Creating a Project](creating-a-project) chapter, we will introduce how to implement server-side rendering using Svelte Pilot.

## Code Structure

The main code structure for SSR is as follows:

```
- index.html
- ssr-dev-server.js    // HTTP service for the development environment
- src/
  - render.js          // Server-side renderer
  - server.js          // Server entry point
  - main.js            // Client entry point
```

## Development Server

In the development environment, we need an HTTP service to provide SSR and HMR (Hot Module Replacement) features. Example:

```js
/// file: ssr-dev-server.js
import fs from 'fs'
import { createServer } from 'http'
import { createServer as createViteDevServer } from 'vite'

const PORT = Number(process.env.PORT) || 5173

const vite = await createViteDevServer({
  server: { middlewareMode: true },
  appType: 'custom'
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
      const { default: render } = await vite.ssrLoadModule('/src/render.ts')

      // 4. render the app HTML. This assumes entry-server.js's exported
      //     `render` function calls appropriate framework SSR APIs,
      //    e.g. ReactDOMServer.renderToString()
      const {
        statusCode = 200,
        statusMessage,
        headers,
        body
      } = await render({
        url: req.url,
        template,
        headers: req.headers
      })

      res.writeHead(statusCode, statusMessage, headers)
      res.end(body)
    } catch (e) {
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

## Server-Side Renderer

```js
/// file: src/render.js
import { ServerApp } from 'svelte-pilot'
import router from './router'

export default async function render({ url, template }) {
  try {
    const route = await router.handleServer(
      new URL(url, 'http://127.0.0.1').href
    )

    if (!route) {
      return {
        statusCode: 404,
        body: import.meta.env.DEV
          ? `${url} did not match any routes. Did you forget to add a catch-all route?`
          : '404 Not Found'
      }
    }

    const body = ServerApp.render({ router, route })

    return {
      statusCode: 200,

      headers: {
        'Content-Type': 'text/html'
      },

      body: template
        .replace('</head>', body.head + '</head>')
        .replace(
          '<div id="app">',
          '<div id="app">' +
            body.html +
            `<script>__SSR_STATE__ = ${serialize(route.ssrState)}</script>`
        )
    }
  } catch (e) {
    console.error(e)

    return {
      statusCode: 500,
      body: import.meta.env.DEV && e instanceof Error ? e.message : ''
    }
  }
}

function serialize(data) {
  return JSON.stringify(data).replace(/</g, '\\u003C').replace(/>/g, '\\u003E')
}
```

## Client Entry Point

```js
/// file: src/main.js
import './app.css'
import { ClientApp } from 'svelte-pilot'
import router from './router'

router.start(
  () => {
    new ClientApp({
      target: document.getElementById('app'),
      hydrate: true,
      props: { router }
    })

    delete window.__SSR_STATE__
  },
  {
    ssrState: window.__SSR_STATE__
  }
)
```

## Build Configuration

Configure the `hydratable` option of Svelte to `true` in `vite.config.js`:

```js
/// file: vite.config.js
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        hydratable: true
      }
    })
  ]
})
```

Now, run `node ssr-dev-server.js` in the command line to start the HTTP service for the development environment and visit `http://localhost:5173` to see the effect.

We can observe the existence of a [FOUC (Flash of Unstyled Content)](https://en.wikipedia.org/wiki/Flash_of_unstyled_content) issue. In production mode, for projects that use Tailwind CSS, this can be resolved by setting the Vite configuration option `build.cssCodeSplit` to `true`. If your CSS is too large and needs to be loaded on demand, you can read the Vite compiled [ssr-manifest.json](https://vitejs.dev/guide/ssr.html#generating-preload-directives) file, and then insert the CSS files required for the current page into the HTML during server-side rendering. A specific implementation can be referred to in the [svelte-pilot-template](https://github.com/svelte-pilot/svelte-pilot-template) project.

## Server Entry Point

Next, we create an entry file `src/server.js` for the production environment:

```js
/// file: src/server.js
import { createServer } from 'http'
import sirv from 'sirv'
import render from './render'
import template from '../dist/client/index.html?raw'

const PORT = Number(process.env.PORT) || 5173
const serve = sirv('../client')

createServer(async (req, res) => {
  console.log(req.url)

  serve(req, res, async () => {
    const {
      statusCode = 200,
      statusMessage,
      headers,
      body
    } = await render({
      url: req.url,
      template,
      headers: req.headers
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

Install dependencies:

```bash
npm i sirv
```

Then, we add SSR related commands in `package.json`:

```json
{
  "scripts": {
    "dev:ssr": "node ssr-dev-server.js",
    "build:ssr": "vite build --outDir dist/client && vite build --ssr src/server.js --outDir dist/server",
    "start:ssr": "cd dist/server && node server.js"
  }
}
```

Now, we can run `npm run build:ssr` in the command line to build the code for the production environment, and then run `npm run start:ssr` to start the HTTP service for the production environment, and visit `http://localhost:5173` to see the effect.

## Loading Data

We can export a `load` function in the view component to load data. For example:

```svelte
<script context="module">
  export async function load() {
    return {
      user: 'World'
    }
  }
</script>

<script>
  export let user
</script>

<h1>Hello {user}!</h1>
```

The `load` function is called during server-side rendering, and the returned data is passed to the view component. In `render.js`, we embedded the data into HTML, and during client-side rendering, we provide the data to the router for hydration.

The `load` function accepts three parameters:
- `props`: The `props` object of the view component.
- `route`: The current [route object](router#route).
- `context`: A custom context object. Passed as the second parameter when calling [router.handleServer()](router#routerhandleserver). You can store information like `headers`, `cookies`, etc., of the current request in the `context` object and also set the response’s `statusCode`, `statusMessage`, `headers`, etc. The specific implementation can be referred to in the [svelte-pilot-template](https://github.com/svelte-pilot/svelte-pilot-template) project, details of which are not reiterated here.

### Client-Side Calling the load Function

When we use the HTML5 History API for routing on the client side, the `load` function of the view component is not called by default, leading to a lack of data during client-side rendering. We have three solutions:

#### Not Using HTML5 History API

- Avoid using `router.push()` and `router.replace()`, and use `location.href` for routing instead;
- Set the [default `method`](link#setting-global-default-properties) of the `<Link>` component to `null` to prevent it from invoking the HTML5 History API. Alternatively, use the `<a>` tag directly.

#### Using `$:` Label to Monitor Component props

This is the common practice with regular Svelte components—monitor the component props, and load new data with client-side code when they change.

#### Setting callLoadOnClient Attribute

Set the [callLoadOnClient](router#callloadonclient) parameter to `true` when instantiating the Router. This way, the view component’s `load` function will be called when using the HTML5 History API for routing on the client side. But as the server and client have significant differences in data retrieval, request processing, and response handling, we need to implement compatible `context` objects for both. The server’s `context` object has already been mentioned; for the client, set the `clientContext` attribute in the second parameter of [router.start()](router#start).

Besides setting the `callLoadOnClient` attribute globally, we can also set the `callOnClient` attribute for each `load` function individually. This way, some view components can call the `load` function while others do not. For instance, if you need fine-grained control over the UI style when loading data, you can set `load.callOnClient = false` to prevent the current view component from calling the `load` function on the client side, and then use the `$:` label to monitor component props to load data.

The `load` function also has a `cacheKey` attribute that can be set to an array, the elements of which are property names from the component's props object. When the prop values specified in the `cacheKey` array of the route after the jump are all the same as the current route, the `load` function will not be called, and the current cached data will be used directly, avoiding unnecessary data loading. If the `cacheKey` attribute is not set, it defaults to all property names in the props object.

Example:

```js
export async function load({ id }, route, ctx) {
  const user = await ctx.api.get('/user/' + id)

  if (!user) {
    /*
      The rewrite() method needs to be implemented separately for both the server and the client.
      On the server-side, we can call router.handleServer('/404') to render the 404 page.
      On the client-side, we can call router.handleClient('/404') to render the 404 page.
    */
    ctx.rewrite('/404')
    return
  } else {
    return { user }
  }
}

load.callOnClient = true
load.cacheKey = ['id']
```

By this point, you should have a basic understanding of implementing server-side rendering using Svelte Pilot. If you need to deploy on a serverless platform or generate a static website (Static-Site Generation), it can be achieved with minor modifications. You can directly use or refer to the [svelte-pilot-template](https://github.com/svelte-pilot/svelte-pilot-template) project.