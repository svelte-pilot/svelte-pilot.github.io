# Creating a Project

We will use Vite to create a new Svelte project:

```sh
npm create vite@latest my-svelte-app -- --template svelte
```

Follow the prompts to execute the commands. If everything goes smoothly, your browser should be able to successfully open the project homepage. Alternatively, you can visit https://vite.new/svelte to continue this tutorial via an online IDE.

Next, we install `svelte-pilot` in the project:

```sh
npm i svelte-pilot
```

Then, we create a route configuration file `src/router.js`:

```js
// file: src/router.js
import { Router } from 'svelte-pilot'

export default new Router({
  routes: [
    {
      component: () => import('./App.svelte'),
      path: '/'
    }
  ]
})
```

Finally, we modify `src/main.js` to start the router:

```js
// file: src/main.js
import './app.css'

import { mount } from 'svelte'
import { ClientApp } from 'svelte-pilot'

import router from './router'

router.start(() =>
  mount(ClientApp, {
    props: { router },
    target: document.getElementById('app')
  })
)
```

At this point, we have completed a simplest Svelte application and successfully integrated Svelte Pilot. Next, we will introduce how to configure routing and layout using Svelte Pilot.
