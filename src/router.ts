import { Router } from 'svelte-pilot'
import { langs } from './global'

const langParam = ':lang(' + langs.join('|') + ')'

export default new Router({
  callLoadOnClient: true,

  routes: [
    {
      path: '/',
      component: () => import('./views/index.svelte')
    },

    {
      path: `/${langParam}`,
      component: () => import('./views/index.svelte'),
      props: route => ({
        lang: route.params.string('lang')
      })
    },

    {
      component: () => import('./views/Layout.svelte'),
      props: route => ({
        lang: route.params.string('lang'),
        slug: route.params.string('slug')
      }),
      children: [
        {
          path: `/${langParam}/:slug`,
          component: () => import('./views/Doc.svelte'),
          props: route => ({
            lang: route.params.string('lang'),
            slug: route.params.string('slug')
          })
        }
      ]
    },

    {
      path: '/500',
      component: () => import('./views/500.svelte')
    },

    {
      path: '(.*)',
      component: () => import('./views/404.svelte')
    }
  ]
})
