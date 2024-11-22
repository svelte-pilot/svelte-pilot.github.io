# 模板

基于 [Svelte Pilot](https://github.com/svelte-pilot/svelte-pilot) 路由库的[模板](https://github.com/svelte-pilot/svelte-pilot-template)，提供了服务端渲染（SSR）和其他丰富功能。

## 核心特性

- **多种部署模式**：无论是 SSR（服务端渲染）、SSG（静态站点生成）、SPA（单页应用程序），还是无服务器函数，应有尽有。
- **强大的路由和布局系统**：由 [Svelte Pilot](https://github.com/svelte-pilot/svelte-pilot) 提供支持。
- **集成 TypeScript**：以实现类型安全和稳健的编码。
- **集成 PostCSS 和 Tailwind CSS**：无需配置开箱即用。
- **方便的图片导入**：通过 [svelte-preprocess-import-assets](https://github.com/bluwy/svelte-preprocess-import-assets)，`<img src="./img.png">` 标签直接导入图片，无需手写 `import`。
- **增强 CSS 隔离**：通过 [svelte-preprocess-css-hash](https://github.com/jiangfengming/svelte-preprocess-css-hash)，`<Child class="-child">` 变为 `<Child class="-child-HaShEd">`。

## 快速预览

在 [StackBlitz 在线 IDE](https://stackblitz.com/~/github.com/svelte-pilot/svelte-pilot-template?startScript=dev:ssr) 上体验可编辑的演示。

## 创建项目

```sh
npm create svelte-pilot my-svelte-app
cd my-svelte-app
npm i
```

或者：

```sh
mkdir my-svelte-app
cd my-svelte-app
npm init svelte-pilot
npm i
```

## 开发

```sh
npm run dev:spa           # 以 SPA 模式开发
npm run dev:ssr           # 以 SSR 模式开发
PORT=8080 npm run dev:ssr # 指定端口
```

## 构建

```sh
npm run build:spa        # 构建 SPA 站点
npm run build:ssr        # node.js SSR 服务器
npm run build:ssg        # 生成静态站点。在 `package.json` 的 `ssg` 字段中配置 URL。
NOJS=1 npm run build:ssg # 无 JS 生成静态站点
npm run build:cloudflare # Cloudflare Pages

# Netlify Functions
cp src/adapters/netlify/netlify.toml .
npm run build:netlify

# Netlify Edge Functions
cp src/adapters/netlify-edge/netlify.toml .
npm run build:netlify-edge
```

## 运行

```sh
npx sirv-cli dist --single --host # SPA
npx sirv-cli dist --host          # SSG
npm run start:ssr                 # node.js SSR 服务器
PORT=8080 npm run start:ssr       # 指定端口
```

## 部署到云

### Cloudflare Pages

#### 使用 `wrangler` CLI 部署：

```sh
wrangler pages deploy dist
```

#### 使用 Git 部署

1. 将您的 Git 仓库链接到 Cloudflare Pages。
2. 设置构建配置：
   - 构建命令：`npm run build:cloudflare`
   - 构建输出目录：`dist`

### Netlify

使用 CLI `netlify deploy` 部署，或将您的 Git 仓库链接到 Netlify。

## 常见问题

### Windows 上无法运行

```sh
npm config set script-shell "C:\\Program Files\\git\\bin\\bash.exe"
```

[How to set shell for npm run-scripts in Windows](https://stackoverflow.com/questions/23243353/how-to-set-shell-for-npm-run-scripts-in-windows)
