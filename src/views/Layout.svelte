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

  type Heading = { id: string; text: string; level: number }

  type Section = {
    file: string
    headings: Heading[]
  }

  let headings: Heading[]
  let prevSection: Section | undefined
  let nextSection: Section | undefined

  $: {
    const sections = Object.values(toc)
      .map(item => Object.values(item))
      .flat()

    const currentSectionIndex = sections.findIndex(item => item.file === slug)

    headings =
      sections[currentSectionIndex].headings.filter(h => h.level <= 2) || []

    prevSection =
      currentSectionIndex === 0 ? undefined : sections[currentSectionIndex - 1]

    nextSection =
      currentSectionIndex === sections.length - 1
        ? undefined
        : sections[currentSectionIndex + 1]
  }

  function blur() {
    ;(document.activeElement as HTMLElement)?.blur()
  }
</script>

<svelte:head>
  <title>{headings[0].text}</title>
</svelte:head>

<a class="sr-only" href="#{headings[0].id}">{messages.skip_to_content}</a>

<div class="flex md:w-fit md:mx-auto">
  <nav
    id="toc"
    tabindex="-1"
    class="bg-slate-100 sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-0 focus-within:left-0 focus-within:h-screen focus-within:w-64 focus-within:px-8 lg:not-sr-only lg:h-screen lg:w-64 lg:px-8 lg:!sticky lg:top-0 lg:left-0 lg:shrink-0 lg:shadow-[-99999px_0_0_99999px] lg:shadow-slate-100"
  >
    <div class="sticky top-0">
      <Link
        to="/"
        class="text-xl py-4 flex items-center border-b border-b-slate-300"
        aria-hidden
      >
        <img src="../favicon.svg" alt="logo" width="32" height="32" />
        <span class="tracking-wide ml-2 text-slate-800">Svelte Pilot</span>
      </Link>

      <ul class="py-4">
        {#each Object.entries(toc) as [chapterName, sections]}
          <li class="mb-4">
            <span class="font-semibold text-slate-500 tracking-wider uppercase"
              >{chapterName}</span
            >
            <ul>
              {#each Object.entries(sections) as [sectionName, section]}
                <li class="my-2">
                  <Link
                    to="/{lang}/{section.file}"
                    class="text-slate-700"
                    on:click={blur}>{sectionName}</Link
                  >
                </li>
              {/each}
            </ul>
          </li>
        {/each}
      </ul>
    </div>
  </nav>

  <main class="max-w-3xl min-w-0 p-4 sm:p-6 md:p-8">
    <div class="mb-4 flex justify-between">
      <div>
        <a href="#toc" aria-hidden class="lg:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 -960 960 960"
            width="24"
          >
            <path
              d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"
            />
          </svg>
        </a>
      </div>

      <div>
        {#if lang === 'en'}
          <Link to="/zh-CN/{slug}" class="text-[#FF3E00]">中文</Link>
        {:else}
          <Link to="/en/{slug}" class="text-[#FF3E00]">English</Link>
        {/if}
      </div>
    </div>

    <View />

    <div class="mt-5 text-slate-600">
      <a
        href="https://github.com/jiangfengming/svelte-pilot-docs/edit/main/docs/{lang}/{slug}.md"
        >{messages.edit_this_page}</a
      >
    </div>

    <div class="flex justify-between border-t border-t-slate-300 mt-6 py-3">
      <div>
        {#if prevSection}
          <Link to="/{lang}/{prevSection.file}" class="text-[#FF3E00]">
            &larr; {prevSection.headings[0].text}
          </Link>
        {/if}
      </div>

      <div>
        {#if nextSection}
          <Link to="/{lang}/{nextSection.file}" class="text-[#FF3E00]">
            {nextSection.headings[0].text} &rarr;
          </Link>
        {/if}
      </div>
    </div>
  </main>

  <aside class="sr-only xl:not-sr-only xl:w-64 xl:px-8 xl:shrink-0">
    <div class="sticky top-0">
      <h2
        class="font-semibold text-slate-500 tracking-widest uppercase pt-8 pb-4"
      >
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
