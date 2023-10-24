# \<Link>

`<Link>` 组件用于跳转到指定的路由。它的用法与 `<a>` 标签类似，但它默认使用 HTML5 History API 因此不会刷新页面。`<Link>` 组件的内容会被渲染为一个 `<a>` 标签。

## 用法

```svelte
<Link to="..." method="...">text</Link>
```

`<Link>` 组件的 `to` 属性用于指定跳转的路由，它的值可以是一个字符串，也可以是一个 [Location 对象](router#location)。`method` 属性用于指定跳转的方式，它的值可以是 `push`、`replace` 或 `null`，默认为 `push`。如果 `method` 的值为 `null`，则不会调用路由器的 `push()` 或 `replace()` 方法，而是进行普通的页面跳转。

`<Link>` 组件可以设置 `on:click` 属性来监听点击事件。

`<Link>` 组件自带 `.router-link` CSS 类，如果当前路由匹配 `to` 属性指定的路由，则会添加 `.router-link-active` CSS 类。你可以通过传递 `class` 属性来添加自定义的 CSS 类。其他属性会被原样传递给 `<a>` 标签。

## 设置全局默认属性

```js
import { linkOptions, setLinkOptions } from 'svelte-pilot'

console.log(linkOptions)

setLinkOptions({
  method: null, // 'push' | 'replace' | null
  class: 'my-link',
  activeClass: 'my-link-active'
})
```
