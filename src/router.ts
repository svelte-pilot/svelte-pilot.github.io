import { Router } from 'svelte-pilot'

import { langs } from './global'

const langParam = `:lang(${langs.join('|')})`

export default new Router({
  callLoadOnClient: true,

  routes: [
    {
      children: [
        {
          component: () => import('./views/Doc.svelte'),
          meta: route => ({
            lang: route.params.string('lang'),
            slug: route.params.string('slug'),
          }),
          path: `/${langParam}/:slug`,
          props: route => ({
            lang: route.params.string('lang'),
            slug: route.params.string('slug'),
          }),
        },

        {
          component: () => import('./views/Doc.svelte'),
          meta: {
            home: true,
            lang: 'en',
            slug: 'introduction',
          },
          path: '/',
          props: {
            lang: 'en',
            slug: 'introduction',
          },
        },
      ],
      component: () => import('./views/Layout.svelte'),
      props: route => ({
        home: Boolean(route.meta.home),
        lang: route.meta.lang,
        slug: route.meta.slug,
      }),
    },

    {
      component: () => import('./views/500.svelte'),
      path: '/500',
    },

    {
      component: () => import('./views/404.svelte'),
      path: '(.*)',
    },
  ],
})
