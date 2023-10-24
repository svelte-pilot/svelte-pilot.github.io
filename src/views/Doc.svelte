<script context="module" lang="ts">
  import type { LoadFunction } from 'svelte-pilot'
  import type { Context } from '../context/types'
  import docs from '../docs'

  export const load: LoadFunction<
    { lang: string; slug: string },
    Context
  > = async ({ lang, slug }, route, ctx) => {
    const doc = docs[`../.html/${lang}/${slug}.html`]

    if (!doc) {
      return ctx.rewrite('/404')
    }

    return {
      content: await doc()
    }
  }
</script>

<script lang="ts">
  export let lang: string
  export let slug: string
  export let content: string
</script>

<article class="prose prose-pre:not-prose max-w-none">
  {@html content}
</article>
