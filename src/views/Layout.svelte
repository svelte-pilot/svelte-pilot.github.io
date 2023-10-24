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

<div class="flex">
  <nav>
    <ul>
      {#each Object.entries(toc) as [chapterName, sections]}
        <li>
          <span>{@html chapterName}</span>
          <ul>
            {#each Object.entries(sections) as [sectionName, section]}
              <li>
                <Link to="/{lang}/{section.file}">{@html sectionName}</Link>
              </li>
            {/each}
          </ul>
        </li>
      {/each}
    </ul>
  </nav>

  <main>
    <View />
  </main>

  <aside>
    <h2>On this page</h2>
    <ul>
      {#each headings as { id, text }}
        <li>
          <a href="#{id}">{@html text}</a>
        </li>
      {/each}
    </ul>
  </aside>
</div>
