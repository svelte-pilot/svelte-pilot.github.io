import { Router } from 'svelte-pilot'

export default new Router({
  callLoadOnClient: true,

  routes: [
    {
      path: '/',
      component: () => import('./views/index.svelte')
    },

    {
      path: '/:lang',
      component: () => import('./views/index.svelte'),
      props: route => ({ lang: route.params.string('lang') })
    },

    {
      path: '/:lang/:slug',
      component: () => import('./views/Doc.svelte'),
      meta: route => ({ lang: route.params.string('lang') }),
      props: route => ({
        lang: route.params.string('lang'),
        slug: route.params.string('slug')
      })
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
