# \<Link>

The `<Link>` component is used to navigate to a specified route. It is similar in use to the `<a>` tag, but by default, it uses the HTML5 History API and therefore does not refresh the page. The content of the `<Link>` component is rendered as an `<a>` tag.

## Usage

```svelte
<Link to="..." method="...">text</Link>
```

The `to` attribute of the `<Link>` component is used to specify the route to navigate to. Its value can be a string or a [Location object](router#location). The `method` attribute is used to specify the way to navigate, and its values can be `push`, `replace`, or `null`, defaulting to `push`. If the value of `method` is `null`, the router's `push()` or `replace()` methods won’t be called, and a normal page navigation will occur instead.

You can set the `on:click` attribute on the `<Link>` component to listen to click events.

The `<Link>` component comes with a `.router-link` CSS class. If the current route matches the route specified by the `to` attribute, the `.router-link-active` CSS class will be added. You can add custom CSS classes by passing the `class` attribute. Other attributes will be passed directly to the `<a>` tag.

## Setting Global Default Method

```js
import { linkOptions, setLinkOptions } from 'svelte-pilot'

console.log(linkOptions)

setLinkOptions({
  method: null, // 'push' | 'replace' | null
  class: 'my-link',
  activeClass: 'my-link-active'
})
```
