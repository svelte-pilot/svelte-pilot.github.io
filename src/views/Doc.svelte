<script lang='ts' module>
  import type { LoadFunction } from 'svelte-pilot'

  import type { Context } from '../context'

  import docs from '../docs'

  export const load: LoadFunction<
    { lang: string, slug: string },
    Context
  > = async ({ lang, slug }, route, ctx) => {
    const doc = docs[`../.html/${lang}/${slug}.html`]

    if (!doc) {
      ctx.rewrite('/404')
    }

    return {
      content: await doc(),
    }
  }
</script>

<script lang='ts'>
  let { content }: { content: string } = $props()
</script>

<article
  class='prose prose-slate max-w-none prose-a:text-[#FF3E00] prose-code:before:content-none prose-code:after:content-none prose-code:bg-slate-100 prose-code:inline-block prose-code:rounded prose-code:px-1'
>
  <!-- eslint-disable svelte/no-at-html-tags -->
  {@html content}
</article>
