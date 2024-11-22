# \<ServerApp>

The `<ServerApp>` component is used for rendering Svelte applications on the server side. We call its `render` static method, passing in a `router` instance and a `route` object, to obtain an object containing `html`, `head`, and `css` properties. These can be inserted into the HTML template accordingly. For usage, please refer to [Server-Side Rendering](ssr).
