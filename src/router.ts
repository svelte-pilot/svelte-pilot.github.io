import { Router } from 'svelte-pilot'
import { langs } from './global'

const langParam = ':lang(' + langs.join('|') + ')'

export default new Router({
  callLoadOnClient: true,

  routes: [
    {
      component: () => import('./views/Layout.svelte'),
      props: route => ({
        lang: route.meta.lang,
        slug: route.meta.slug,
        home: Boolean(route.meta.home)
      }),
      children: [
        {
          path: `/${langParam}/:slug`,
          component: () => import('./views/Doc.svelte'),
          meta: route => ({
            lang: route.params.string('lang'),
            slug: route.params.string('slug')
          }),
          props: route => ({
            lang: route.params.string('lang'),
            slug: route.params.string('slug')
          })
        },

        {
          path: '/',
          component: () => import('./views/Doc.svelte'),
          meta: {
            lang: 'en',
            slug: 'introduction',
            home: true
          },
          props: {
            lang: 'en',
            slug: 'introduction'
          }
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
