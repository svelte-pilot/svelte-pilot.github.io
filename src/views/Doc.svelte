<script context="module" lang="ts">
  import type { Route } from 'svelte-pilot'
  import toc from '../lib/toc'
  import type { Context } from '../context/type'

  export async function load(
    {
      lang,
      slug
    }: {
      lang: string
      slug: string
    },
    route: Route,
    ctx: Context
  ) {
    if (!(lang in toc)) {
      return ctx.rewrite('/404')
    }

    const article = toc[lang as keyof typeof toc]
      .flatMap((chapter) => chapter.sections)
      .find((article) => article.slug === slug)

    if (!article) {
      return ctx.rewrite('/404')
    }

    const { default: content } = await article.file()

    return {
      title: article.title,
      content
    }
  }
</script>

<script lang="ts">
  export let lang: string
  export let slug: string
  export let title: string
  export let content: string
</script>

{@debug lang}
{@debug slug}
{@debug title}
{@html content}
