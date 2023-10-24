# \<ServerApp>

`<ServerApp>` 组件用于在服务端渲染 Svelte 应用，我们调用其 `render` 静态方法，传入一个 `router` 实例和一个 `route` 对象，即可得到一个包含 `html`、`head` 和 `css` 属性的对象，将其分别插入到 HTML 模板中即可。用法请参考[服务端渲染](ssr)。