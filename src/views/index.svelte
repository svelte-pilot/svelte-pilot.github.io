<script lang="ts" context="module">
  import type { Route } from 'svelte-pilot'
  import type { Context } from '../context/type'
  import { langs } from '../lib/util'

  export async function load(props: {}, route: Route, ctx: Context) {
    ctx.redirect(
      `/${ctx.getCookie('lang') || ctx.negotiateLanguage(langs)}/introduction`
    )
  }
</script>
