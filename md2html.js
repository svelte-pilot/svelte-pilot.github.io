/* eslint-disable antfu/no-top-level-await */
import fs from 'node:fs/promises'
import path from 'node:path'
// @ts-check
import { decode } from 'html-entities'
import { Marked } from 'marked'
import { getHeadingList, gfmHeadingId } from 'marked-gfm-heading-id'
import { getSingletonHighlighter } from 'shiki'

import toc from './docs/toc.json'

const highlighter = await getSingletonHighlighter({
  langs: ['sh', 'js', 'svelte', 'json'],
  themes: ['dark-plus'],
})

const marked = new Marked()

marked.use({
  renderer: {
    code({ lang, text }) {
      let filename = ''

      if (text.startsWith('// file:') || text.startsWith('<!-- file:')) {
        const newlineIndex = text.indexOf('\n')
        filename = text.slice(0, newlineIndex).match(/file: (\S+)/)?.[1] || ''
        text = text.slice(newlineIndex + 1)
      }

      return highlighter.codeToHtml(text, {
        lang: lang || 'text',
        theme: 'dark-plus',

        transformers: [
          {
            postprocess(html) {
              if (filename) {
                return `
                  <div class="my-5">
                    <div class="text-white bg-zinc-800 rounded-t py-2 px-3">${filename}</div>
                    ${html}
                  </div>`
              }
              else {
                return html
              }
            },

            pre(element) {
              element.properties.class += ` not-prose leading-normal overflow-auto p-4 ${filename ? 'rounded-b' : 'rounded'}`
            },
          },
        ],
      })
    },
  },
})

marked.use(gfmHeadingId())

const files = await fs.readdir('docs', { withFileTypes: true })
const urls = ['/']

for (const file of files) {
  if (file.isDirectory()) {
    const lang = file.name
    const outputDir = path.join('.html', lang)
    await fs.mkdir(outputDir, { recursive: true })
    const { default: messages } = await import(`./docs/${lang}/messages.json`)
    const _toc = {}

    for (const [chapterId, files] of Object.entries(toc)) {
      const chapter = (_toc[messages[chapterId]] = {})

      for (const file of files) {
        urls.push(`/${lang}/${file}`)
        const content = await fs.readFile(
          path.join('docs', lang, `${file}.md`),
          'utf-8',
        )

        const htmlContent = await marked.parse(content)
        const outputPath = path.join(outputDir, `${path.basename(file)}.html`)
        await fs.writeFile(outputPath, htmlContent)
        const headings = getHeadingList()
        headings.forEach(item => (item.text = decode(item.text)))
        chapter[headings[0].text] = { file, headings }
      }
    }

    await fs.writeFile(
      path.join(outputDir, 'toc.json'),
      JSON.stringify(_toc, null, 2),
    )
  }
}

await fs.writeFile('ssg.json', JSON.stringify(urls, null, 2))
