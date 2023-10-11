<script context="module" lang="ts">
  import type { Route } from 'svelte-pilot'
  import toc from '../toc'
  import type { Context } from '../context-interface'

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
    console.log(lang, slug)

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
    console.log(content)

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
