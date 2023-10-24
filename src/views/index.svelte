<script lang="ts" context="module">
  import type { Route } from 'svelte-pilot'
  import type { Context } from '../context/types'
  import { langs } from '../global'

  export async function load(
    {
      lang
    }: {
      lang?: string
    },
    route: Route,
    ctx: Context
  ) {
    if (!lang) {
      lang = ctx.getCookie('lang')

      if (!lang || !langs.includes(lang)) {
        lang = ctx.language(langs)
      }
    }

    ctx.redirect(`/${lang}/introduction`)
  }
</script>
