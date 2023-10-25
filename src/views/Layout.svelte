<script lang="ts" context="module">
  import { View, Link, setLinkOptions, type LoadFunction } from 'svelte-pilot'
  type Toc = typeof import('/.html/en/toc.json')

  setLinkOptions({
    activeClass: 'font-semibold !text-[#FF3E00]'
  })

  export const load: LoadFunction<{ lang: string }> = async ({ lang }) => {
    const { default: toc } = await import(`../../.html/${lang}/toc.json`)
    const { default: messages } = await import(`../i18n/${lang}.json`)
    return { toc, messages }
  }

  load.cacheKey = ['lang']
</script>

<script lang="ts">
  export let lang: string
  export let slug: string
  export let toc: Toc
  export let messages: Record<string, string>

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

<div class="flex w-fit mx-auto min-h-screen">
  <nav class="w-64 shrink-0 px-8 bg-slate-100">
    <div class="sticky top-0">
      <Link
        to="/"
        class="text-xl py-4 flex items-center border-b border-b-slate-300"
      >
        <img src="../favicon.svg" alt="logo" width="32" height="32" />
        <span class="tracking-wider ml-2 text-slate-800">Svelte Pilot</span>
      </Link>

      <ul class="py-4">
        {#each Object.entries(toc) as [chapterName, sections]}
          <li class="mb-4">
            <span class="font-semibold text-slate-500 tracking-widest uppercase"
              >{chapterName}</span
            >
            <ul>
              {#each Object.entries(sections) as [sectionName, section]}
                <li class="my-2">
                  <Link to="/{lang}/{section.file}" class="text-slate-800"
                    >{sectionName}</Link
                  >
                </li>
              {/each}
            </ul>
          </li>
        {/each}
      </ul>
    </div>
  </nav>

  <main class="shrink grow">
    <div class="text-right px-4 pt-4">
      {#if lang === 'en'}
        <Link to="/zh-CN/{slug}" class="text-slate-800">中文</Link>
      {:else}
        <Link to="/en/{slug}" class="text-slate-800">English</Link>
      {/if}
    </div>

    <div class="p-8">
      <View />
    </div>
  </main>

  <aside class="w-64 px-8 shrink-0">
    <div class="sticky top-0">
      <h2 class="font-semibold text-slate-500 tracking-widest uppercase py-4">
        {messages.on_this_page}
      </h2>

      <ul>
        {#each headings as { id, text }}
          <li class="my-2">
            <a href="#{id}" class="text-slate-800">{text}</a>
          </li>
        {/each}
      </ul>
    </div>
  </aside>
</div>
