# Routing

In the [Creating a New Project](creating-a-project) section, we can see that the route entries are defined within the `routes` configuration item when instantiating the `Router`. Each route entry contains two properties: `path` and `component`. Here, `path` is the route path, and `component` is the corresponding component for the route. Here’s an example:

```js
/// file: src/router.js
import { Router } from 'svelte-pilot'
import Home from './views/Home.svelte'
import About from './views/About.svelte'

export default new Router({
  routes: [
    {
      path: '/',
      component: Home
    },

    {
      path: '/about',
      component: About
    }
  ]
})
```

In the example above, we defined two route entries corresponding to the paths `/` and `/about`. When we navigate to `/`, the `<Home>` component is rendered on the page; navigating to `/about` renders the `<About>` component.

## Dynamic Import

In the initial example, we directly passed the class of the component into the route entry. However, this approach results in all components being bundled into a single file. Users will download components they aren't accessing, leading to resource wastage and prolonged initial loading times. To mitigate these issues, we can employ dynamic loading for route components. For example:

```js
/// file: src/router.js
import { Router } from 'svelte-pilot'

export default new Router({
  routes: [
    {
      path: '/',
      component: () => import('./views/Home.svelte')
    },

    {
      path: '/about',
      component: () => import('./views/About.svelte')
    }
  ]
})
```

In this updated example, we’ve replaced the component class with a function. This function returns a `Promise` that only invokes when a user accesses the route, loading the corresponding component. Each component is packaged into a separate file to enable load-on-demand.

## Layouts

For scenarios where multiple route entries require the same layout, we can configure an entry without a `path` attribute, referred to as a view. Its `component` attribute points to the layout component, and route entries utilizing this layout are configured as its children. In fact, route entries with a `path` attribute are a specialized type of view that maps the URL to the corresponding layout. The entire layout is assembled by traversing the nodes upon matching a route entry. For example:

```js
/// file: src/router.js
import { Router } from 'svelte-pilot'

export default new Router({
  routes: [
    {
      component: () => import('./views/Layout.svelte'),
      children: [
        {
          path: '/',
          component: () => import('./views/Home.svelte')
        },

        {
          path: '/about',
          component: () => import('./views/About.svelte')
        }
      ]
    }
  ]
})
```

```svelte
<!--- file: src/Layout.svelte --->
<script>
  import { View } from 'svelte-pilot'
</script>

<header>My Awesome App</header>
<View />
<footer>App Footer</footer>
```

In the instance above, we defined a `<Layout>` component that includes a `<View>` component. The `<View>` component renders the component specified by the current route entry’s `component` attribute. Views can be nested to enable more flexible layout reuse.

### Named Views

If we need to render multiple views in a layout, we can assign a `name` attribute to the view entries, and then use the `name` attribute of the `<View>` component in the layout to specify the view to be rendered. For instance:

```js
/// file: src/router.js
import { Router } from 'svelte-pilot'

export default new Router({
  routes: [
    {
      component: () => import('./views/Layout.svelte'),
      children: [
        {
          component: () => import('./views/Ad.svelte'),
          name: 'sidebar'
        },

        {
          path: '/',
          component: () => import('./views/Home.svelte'),
        },

        {
          path: '/about',
          component: () => import('./views/About.svelte'),
        }
      ]
    }
  ]
})
```

```svelte
<!--- file: src/Layout.svelte --->
<script>
  import { View } from 'svelte-pilot'
</script>

<header>My Awesome App</header>

<div class="container">
  <aside>
    <View name="sidebar" />
  </aside>

  <main>
    <View />
  </main>
</div>

<footer>App Footer</footer>
```

In this example, the `<Layout>` component includes two `<View>` components; one default view and another named `sidebar`. Upon accessing `/` or `/about`, the router matches the corresponding route entry, retrieving sibling view entries to render the appropriate `<View>` components based on the `name` attribute.

### View Override

In the previous examples, if the `<About>` component requires a different sidebar component, it, along with the required sidebar component, can be defined within a nested array, overriding the default sidebar component. For instance:

```js
/// file: src/router.js
import { Router } from 'svelte-pilot'

export default new Router({
  routes: [
    {
      component: () => import('./views/Layout.svelte'),
      children: [
        {
          component: () => import('./views/Ad.svelte'),
          name: 'sidebar'
        },

        {
          path: '/',
          component: () => import('./views/Home.svelte'),
        },

        [
          {
            component: () => import('./views/AnotherSidebar.svelte'),
            name: 'sidebar'
          },

          {
            path: '/about',
            component: () => import('./views/About.svelte'),
          }
        ]
      ]
    }
  ]
})
```

## Component Props

Parameters can be passed to components by defining the `props` object in the view configuration. Each attribute of the `props` object is passed to the component. For example:

```js
/// file: src/router.js
import { Router } from 'svelte-pilot'

export default new Router({
  routes: [
    {
      path: '/user/Alice',
      component: () => import('./views/User.svelte'),
      props: {
        user: 'Alice'
      }
    }
  ]
})
```

```svelte
<!--- file: src/User.svelte --->
<script>
  export let user
</script>

<h1>Hello {user}!</h1>
```

In this example, we defined a route entry with the path `/user/Alice`, and included a `props` object containing a `user` attribute. When navigating to `/user/Alice`, the `<User>` component is rendered, and the `user` attribute value is passed into the component.

### Extracting Parameters from Paths

We can define parameters in the path using the `:parameterName` format and then retrieve the parameter values through the [route.params](router#params) object. `route.params` is a [StringCaster](https://github.com/jiangfengming/cast-string#stringcaster) object, which contains the parameters extracted from the path. We then define the `props` attribute as a function, where its parameter is the [route](router#route) object, and the return value will serve as the parameters for the component. For example:

```js
/// file: src/router.js
import { Router } from 'svelte-pilot'

export default new Router({
  routes: [
    {
      path: '/user/:name',
      component: () => import('./views/User.svelte'),
      props: route => ({
        user: route.params.string('name')
      })
    }
  ]
})
```

#### Using Regular Expressions to Match Path Parameters

If path parameters must conform to a specific format, regular expressions can be employed to match them. For example:

```js
/// file: src/router.js
import { Router } from 'svelte-pilot'

export default new Router({
  routes: [
    {
      path: '/user/:id(\\d+)',
      component: () => import('./views/User.svelte'),
      props: route => ({
        id: route.params.int('id')
      })
    },

    {
      path: '/user/:name',
      component: () => import('./views/User.svelte'),
      props: route => ({
        name: route.params.string('name')
      })
    }
  ]
})
```

In this example, two route entries are defined. The `id` parameter of the first entry must be numeric, while the `name` parameter of the second can be any string. The router matches route entries based on the order of paths. So, when navigating to `/user/123`, the first route entry matches, converting the `id` parameter to an integer type before passing it to the `<User>` component. Navigating to `/user/Alice` matches the second entry, converting the `name` parameter to a string before passing it to the `User” component.

In fact, path parameters without defined regular expressions are assumed to match `[^/]+` by default, meaning they can match any character up to the next `/`.

#### Unnamed Regular Expression Parameters

If there’s no need to extract the value of a parameter from the path, and the only requirement is to ascertain if the parameter satisfies a specific regular expression, unnamed regular expression parameters can be used. For instance:

```js
/// file: src/router.js
import { Router } from 'svelte-pilot'

export default new Router({
  routes: [
    // ...

    {
      path: '(.*)',
      component: () => import('./views/NotFound.svelte')
    }
  ]
})
```

In the example above, a route entry with the path `(.*)` is defined, capable of matching any path. It’s matched when the accessed path doesn’t correspond to any other route entry.

#### Order of Route Entry Matching

1. Pure string path route entries take precedence over those containing path parameters. Route entries containing path parameters are only considered when no match is found for those with pure string paths.
2. Route entries with longer string prefixes take precedence. For instance, `/user/:id` takes precedence over `(.*)` as the router strives to match the longer string path.
3. For route entries with equal string prefix lengths, the order of definition is considered. For example, between `/user/:id(\\d+)` and `/user/:name`, since both have the `/user/` prefix, the router matches based on the order of definition.

Generally, defining route entries from the most specific to the most general helps reduce cognitive load and prevent errors.

### Extracting Parameters from Query Strings

Parameters from the query string can be obtained through the `route.query` object. It’s also a `StringCaster` object. Here’s an example:

```js
/// file: src/router.js
import { Router } from 'svelte-pilot'

export default new Router({
  routes: [
    {
      path: '/user',
      component: () => import('./views/User.svelte'),
      props: route => ({
        name: route.query.string('name')
      })
    }
  ]
})
```

In this example, navigating to `/user?name=Alice` sets the `name` attribute to `Alice`.

### Cross-View Parameter Passing

The `route.meta` object enables cross-view parameter passing. It contains custom data for the current route entry and is a regular object. Here's an example:

```js
/// file: src/router.js
import { Router } from 'svelte-pilot'

export default new Router({
  routes: [
    {
      component: () => import('./views/Layout.svelte'),
      props: route => ({
        title: route.meta.title
      }),
      children: [
        {
          path: '/',
          component: () => import('./views/Home.svelte'),
          meta: {
            title: 'Home'
          }
        },

        {
          path: '/about',
          component: () => import('./views/About.svelte'),
          meta: {
            title: 'About'
          }
        }
      ]
    }
  ]
})
```

In this example, the `meta` object defined in the route entry can be passed to other view components via `route.meta`. The `meta` attribute can be an object or a function. If it’s a function, it accepts a `route` object as a parameter and returns an object. The `meta` objects of the entire view tree are merged, with attributes of child views overriding those of parent views.

## Key

The `key` attribute can be defined to control whether a component should be destroyed and recreated. The `key` attribute is a function that accepts a `route` object and returns a primitive type (typically a string or number). If the returned value changes, the component is destroyed and recreated. For example:

```js
/// file: src/router.js
import { Router } from 'svelte-pilot'

export default new Router({
  routes: [
    {
      path: '/user/:id',
      component: () => import('./views/User.svelte'),
      key: route => route.params.int('id')
    }
  ]
})
```

In this example, navigating from `/user/123` to `/user/456` results in the destruction and recreation of the `<User>` component. If the `key` attribute isn’t defined, the component is reused.

## Route Guards

### beforeEnter

The `beforeEnter` attribute can be defined in the view configuration to set up a route guard before entering the route. The `beforeEnter` attribute is a function that receives two parameters, `from` and `to`, both of which are `Route` objects. If the function returns `true` or `undefined`, the route transition continues. If it returns `false`, the transition is interrupted. If it returns a string or [Location](router#location) object, a redirection occurs. If a `Promise` is returned, it’s processed based on its resolved value. When multiple `beforeEnter` functions exist in the view tree, they’re invoked in parent-to-child order. If any function returns `false` or a redirection path, subsequent functions aren’t invoked. Here’s an example:

```js
/// file: src/router.js
import { Router } from 'svelte-pilot'
import auth from './auth'

export default new Router({
  routes: [
    {
      path: '/user',
      component: () => import('./views/User.svelte'),
      beforeEnter: () => {
        if (!auth.loggedIn) {
          return '/login'
        }
      }
    }
  ]
})
```

In this example, a route entry with the path `/user` is defined. When navigating to `/user`, the `beforeEnter` function is invoked. If the user is logged in, the route transition continues. If not, a redirection to `/login` occurs.

### beforeLeave

The `beforeLeave` attribute can be defined in the view configuration to set up a route guard before leaving the current route. Its usage is similar to `beforeEnter`.
