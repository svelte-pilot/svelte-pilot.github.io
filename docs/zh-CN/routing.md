# 路由配置

在[新建一个项目](creating-a-project)章节中，我们可以看到路由条目是在实例化 `Router` 时传入的 `routes` 配置项中定义的。每个路由条目都包含两个属性：`path` 和 `component`。其中，`path` 是路由路径，`component` 是路由对应的组件。例子：

```js
// file: src/router.js
import { Router } from 'svelte-pilot'

import About from './views/About.svelte'
import Home from './views/Home.svelte'

export default new Router({
  routes: [
    {
      component: Home,
      path: '/'
    },

    {
      component: About,
      path: '/about'
    }
  ]
})
```

在上面的例子中，我们定义了两个路由条目，分别对应了 `/` 和 `/about` 两个路径。当我们访问 `/` 时，`<Home>` 组件会被渲染到页面中；当我们访问 `/about` 时，`<About>` 组件会被渲染到页面中。

## 动态导入

在上面的例子中，我们直接将组件的类传入到路由条目中，这样做的缺点是，所有的组件都会被打包到同一个文件中，用户没有访问的组件也会被下载下来，导致了资源的浪费和首屏加载时间过长。为了解决这些问题，我们可以使用动态加载的方式来加载路由组件。例子：

```js
// file: src/router.js
import { Router } from 'svelte-pilot'

export default new Router({
  routes: [
    {
      component: () => import('./views/Home.svelte'),
      path: '/'
    },

    {
      component: () => import('./views/About.svelte'),
      path: '/about'
    }
  ]
})
```

在上面的例子中，我们将组件的类替换成了一个函数，这个函数会返回一个 `Promise`，只有当用户访问这个路由时才会调用该函数加载对应的组件。这样做的好处是，每个组件都会被打包到单独的文件中，这样可以按需加载对应的组件。

## 布局

如果有多个路由条目都需要使用同一个布局，我们可以配置一个没有 `path` 属性的条目，我们称之为视图，它的 `component` 属性指向布局组件，然后将需要使用这个布局的路由条目配置为它的子条目。事实上，带有 `path` 属性的路由条目是视图的特殊类型，它起到了把 URL 映射到对应布局的作用，只要匹配到了路由条目，就能顺着节点往上遍历出完整的布局。例子：

```js
// file: src/router.js
import { Router } from 'svelte-pilot'

export default new Router({
  routes: [
    {
      children: [
        {
          component: () => import('./views/Home.svelte'),
          path: '/'
        },

        {
          component: () => import('./views/About.svelte'),
          path: '/about'
        }
      ],
      component: () => import('./views/Layout.svelte')
    }
  ]
})
```

```svelte
<!-- file: src/Layout.svelte -->
<script>
  import { View } from 'svelte-pilot'
</script>

<header>My Awesome App</header>
<View />
<footer>App Footer</footer>
```

在上面的例子中，我们定义了一个布局组件 `<Layout>`，它包含了一个 `<View>` 组件，`<View>` 组件会根据当前路由条目的 `component` 属性来渲染对应的组件。当我们访问 `/` 时，`<Home>` 组件会被渲染到 `<View>` 组件中；当我们访问 `/about` 时，`<About>` 组件会被渲染到 `<View>` 组件中。

视图条目是可以多级嵌套的，这样就可以实现更灵活的布局复用。

### 命名视图

如果我们需要在布局中渲染多个视图，我们可以给视图条目定义一个 `name` 属性，然后在布局中使用 `<View>` 组件的 `name` 属性来指定要渲染的视图。例子：

```js
// file: src/router.js
import { Router } from 'svelte-pilot'

export default new Router({
  routes: [
    {
      component: () => import('./views/Layout.svelte'),
      children: [
        {
          component: () => import('./views/Ad.svelte'),
          name: 'sidebar'
        }

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
<!-- file: src/Layout.svelte -->
<script>
  import { View } from 'svelte-pilot'
</script>

<header>My Awesome App</header>

<div class='container'>
  <aside>
    <View name='sidebar' />
  </aside>

  <main>
    <View />
  </main>
</div>

<footer>App Footer</footer>
```

在上面的例子中，我们定义了一个布局组件 `Layout`，它包含了两个 `<View>` 组件，一个是默认视图，另一个是命名为 `sidebar` 的视图。当我们访问 `/` 或者 `/about` 时，路由器在匹配到对应的路由条目后，由此条目得到同级的视图条目。然后根据视图条目的 `name` 属性来渲染对应的 `<View>` 组件。

### 视图覆盖

在上述例子中，如果 `<About>` 组件要使用不同的侧边栏组件，我们可以将 `<About>` 组件和它需要的侧边栏组件定义在一个嵌套数组中，这样就可以覆盖默认的侧边栏组件了。例子：

```js
// file: src/router.js
import { Router } from 'svelte-pilot'

export default new Router({
  routes: [
    {
      children: [
        {
          component: () => import('./views/Ad.svelte'),
          name: 'sidebar'
        },

        {
          component: () => import('./views/Home.svelte'),
          path: '/',
        },

        [
          {
            component: () => import('./views/AnotherSidebar.svelte'),
            name: 'sidebar'
          },

          {
            component: () => import('./views/About.svelte'),
            path: '/about',
          }
        ]
      ],
      component: () => import('./views/Layout.svelte')
    }
  ]
})
```

## 组件属性

我们可以通过定义视图的 `props` 对象给组件传递属性。`props` 对象中的每个属性都会被传递到组件中。例子：

```js
// file: src/router.js
import { Router } from 'svelte-pilot'

export default new Router({
  routes: [
    {
      component: () => import('./views/User.svelte'),
      path: '/user/Alice',
      props: {
        user: 'Alice'
      }
    }
  ]
})
```

```svelte
<!-- file: src/User.svelte -->
<script>
  let { user } = $props()
</script>

<h1>Hello {user}!</h1>
```

在上面的例子中，我们定义了一个路由条目，它的路径是 `/user/Alice`，并且传入了一个 `props` 对象，其中包含了一个 `user` 属性。当我们访问 `/user/Alice` 时，`<User>` 组件会被渲染到页面中，并且 `user` 属性的值会被传入到 `<User>` 组件中。

### 从路径中提取参数

我们可以在路径中使用 `:参数名`的格式定义参数，然后通过 [route.params](router#route) 对象来获取参数的值。`route.params` 是一个 [StringCaster](https://github.com/jiangfengming/cast-string#stringcaster) 对象，它包含了路径中提取的参数。然后我们把 `props` 属性定义为函数，它的参数是 [route](router#route) 对象，返回值会作为组件的参数。例子：

```js
// file: src/router.js
import { Router } from 'svelte-pilot'

export default new Router({
  routes: [
    {
      component: () => import('./views/User.svelte'),
      path: '/user/:name',
      props: route => ({
        user: route.params.string('name')
      })
    }
  ]
})
```

#### 使用正则表达式匹配路径参数

如果路径参数需要满足一定的格式，我们可以使用正则表达式来匹配路径参数。例子：

```js
// file: src/router.js
import { Router } from 'svelte-pilot'

export default new Router({
  routes: [
    {
      component: () => import('./views/User.svelte'),
      path: '/user/:id(\\d+)',
      props: route => ({
        id: route.params.int('id')
      })
    },

    {
      component: () => import('./views/User.svelte'),
      path: '/user/:name',
      props: route => ({
        name: route.params.string('name')
      })
    }
  ]
})
```

在上面的例子中，我们定义了两个路由条目，第一个条目的 `id` 参数必须是数字，第二个条目的 `name` 参数可以是任意字符串。路由器会根据路径的顺序来匹配路由条目。所以当我们访问 `/user/123` 时，第一个路由条目会匹配到这个路径，并且将 `id` 参数的值转换为数字类型，然后将它传递给 `<User>` 组件；当我们访问 `/user/Alice` 时，第二个路由条目会匹配到这个路径，并且将 `name` 参数的值转换为字符串类型，然后将它传递给 `<User>` 组件。

事实上没有定义正则表达式的路径参数会被默认为 `[^/]+`，也就是说它可以匹配到下一个 `/` 之前的任意字符。

#### 未命名的正则表达式参数

如果我们不需要从路径中提取参数的值，只需要判断参数是否满足某个正则表达式，我们可以使用未命名的正则表达式参数。例子：

```js
// file: src/router.js
import { Router } from 'svelte-pilot'

export default new Router({
  routes: [
    // ...

    {
      component: () => import('./views/NotFound.svelte'),
      path: '(.*)'
    }
  ]
})
```

在上面的例子中，我们定义了一个路由条目，它的路径是 `(.*)`，这个路径可以匹配到任意路径。当我们访问的路径没有匹配到任何其他路由条目时，这个路由条目会被匹配到。

#### 路由条目的匹配顺序

1. 纯字符串路径的路由条目的优先级高于包含路径参数的路由条目。只有当纯字符串路径的路由条目都没有匹配到时，才会匹配包含路径参数的路由条目。
2. 字符串前缀更长的路由条目优先级更高。比如 `/user/:id` 的优先级高于 `(.*)`。路由器会尽可能匹配到更长的字符串路径。
3. 字符串前缀长度一样的路由条目，按定义顺序匹配。比如 `/user/:id(\\d+)` 和 `/user/:name`，由于它俩都是 `/user/` 前缀的，所以路由器会按照定义的顺序来匹配。如果我们把 `/user/:name` 放在 `/user/:id(\\d+)` 前面，那么 `/user/123` 就会匹配到 `/user/:name` 而不是 `/user/:id(\\d+)`。

一般来说，我们应该按照从精确到模糊的顺序来定义路由条目，这样可以减少思维负担，也可以避免一些不必要的错误。

### 从查询字符串中提取参数

我们可以通过 `route.query` 对象来获取查询字符串中的参数，它也是一个 `StringCaster` 对象。例子：

```js
// file: src/router.js
import { Router } from 'svelte-pilot'

export default new Router({
  routes: [
    {
      component: () => import('./views/User.svelte'),
      path: '/user',
      props: route => ({
        name: route.query.string('name')
      })
    }
  ]
})
```

在上面的例子中，当我们访问 `/user?name=Alice` 时，组件的 `name` 属性会被设置为 `Alice`。

### 跨视图传参

我们可以使用 `route.meta` 对象实现跨视图传参。`route.meta` 对象包含了当前路由条目的自定义数据。它是一个普通的对象。例子：

```js
// file: src/router.js
import { Router } from 'svelte-pilot'

export default new Router({
  routes: [
    {
      children: [
        {
          component: () => import('./views/Home.svelte'),
          meta: {
            title: 'Home'
          },
          path: '/'
        },

        {
          component: () => import('./views/About.svelte'),
          meta: {
            title: 'About'
          },
          path: '/about'
        }
      ],
      component: () => import('./views/Layout.svelte'),
      props: route => ({
        title: route.meta.title
      })
    }
  ]
})
```

在上面的例子中，我们在路由条目中定义了 `meta` 对象，它可以通过 `route.meta` 传递给其他视图组件。 `meta` 属性既可以是一个对象，也可以是一个函数。如果是一个函数，它会接收一个 `route` 对象作为参数，然后返回一个对象。
整个视图树的 `meta` 对象会被合并到一起，如果有重复的属性，子视图的属性会覆盖父视图的属性。

## key

我们可以通过定义 `key` 属性来控制组件是否需要销毁重建。`key` 属性是一个函数，它会接收一个 `route` 对象作为参数，然后返回一个基本类型（通常为字符串、数字），如果返回值发生变化，则组件会被销毁重建。例子：

```js
// file: src/router.js
import { Router } from 'svelte-pilot'

export default new Router({
  routes: [
    {
      component: () => import('./views/User.svelte'),
      key: route => route.params.int('id'),
      path: '/user/:id'
    }
  ]
})
```

在上面的例子中，当用户从 `/user/123` 跳转到 `/user/456` 时，`<User>` 组件会被销毁重建。如果没有定义 `key` 属性，组件会被复用。

## 路由守卫

### beforeEnter

我们可以在视图配置中定义 `beforeEnter` 属性来定义即将进入此路由时的路由守卫。`beforeEnter` 属性是一个函数，它会接收两个 `from` 和 `to`, 类型都是 `Route` 对象。如果函数返回 `true` 或者 `undefined`，则路由会继续跳转；如果函数返回 `false`，则跳转会被中断；如果返回的是一个字符串或者 [Location](router#location) 对象，则会重定向到对应的路径；如果返回的是一个 `Promise`，则以 `Promise` 的结果作为返回值进行处理。如果视图树中有多个 `beforeEnter` 函数，则按由父到子的顺序依次调用。任何一个函数返回 `false` 或者重定向路径，则后续的函数都不会被调用。例子：

```js
// file: src/router.js
import { Router } from 'svelte-pilot'

import auth from './auth'

export default new Router({
  routes: [
    {
      beforeEnter: () => {
        if (!auth.loggedIn) {
          return '/login'
        }
      },
      component: () => import('./views/User.svelte'),
      path: '/user'
    }
  ]
})
```

在上面的例子中，我们定义了一个路由条目，它的路径是 `/user`，当用户访问 `/user` 时，路由器会调用 `beforeEnter` 函数，如果用户已经登录，则路由会继续跳转；如果用户没有登录，则会重定向到 `/login`。

### beforeLeave

我们可以在视图配置中定义 `beforeLeave` 属性来定义离开当前路由时的路由守卫。使用方式和 `beforeEnter` 一样。
