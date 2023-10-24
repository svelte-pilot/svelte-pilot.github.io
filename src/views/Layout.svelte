<script lang="ts" context="module">
  import { View, Link, type LoadFunction } from 'svelte-pilot'
  type Toc = typeof import('/.html/en/toc.json')

  export const load: LoadFunction<{ lang: string }> = async ({ lang }) => {
    const { default: toc } = await import(`../../.html/${lang}/toc.json`)
    return { toc }
  }

  load.cacheKey = ['lang']
</script>

<script lang="ts">
  export let lang: string
  export let slug: string
  export let toc: Toc

  $: headings =
    Object.values(toc)
      .map(item => Object.values(item))
      .flat()
      .find(item => item.file === slug)
      ?.headings.filter(h => h.level <= 2) || []
</script>

<svelte:head>
  <title>{headings[0].text}</title>
</svelte:head>

<div class="flex max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
  <nav class="w-40 shrink-0">
    <ul class="sticky top-0">
      {#each Object.entries(toc) as [chapterName, sections]}
        <li>
          <span>{chapterName}</span>
          <ul>
            {#each Object.entries(sections) as [sectionName, section]}
              <li>
                <Link to="/{lang}/{section.file}">{sectionName}</Link>
              </li>
            {/each}
          </ul>
        </li>
      {/each}
    </ul>
  </nav>

  <main class="shrink grow">
    <View />
  </main>

  <aside class="w-40 shrink-0">
    <div class="sticky top-0">
      <h2>On this page</h2>
      <ul>
        {#each headings as { id, text }}
          <li>
            <a href="#{id}">{text}</a>
          </li>
        {/each}
      </ul>
    </div>
  </aside>
</div>
