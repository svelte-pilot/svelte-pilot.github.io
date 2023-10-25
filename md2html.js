import { decode } from 'html-entities'
import { Marked } from 'marked'
import { getHeadingList, gfmHeadingId } from 'marked-gfm-heading-id'
import fs from 'node:fs/promises'
import path from 'path'
import shiki from 'shiki'
import toc from './docs/toc.json' assert { type: 'json' }

const highlighter = await shiki.getHighlighter({
  theme: 'dark-plus'
})

const marked = new Marked()

marked.use({
  renderer: {
    code(code, lang) {
      let filename = ''

      if (code.startsWith('/// file:') || code.startsWith('<!--- file:')) {
        const newlineIndex = code.indexOf('\n')
        filename = code.slice(0, newlineIndex).match(/file: (\S+)/)[1]
        code = code.slice(newlineIndex + 1)
      }

      const tokens = highlighter.codeToThemedTokens(code, lang)
      return shiki.renderToHtml(tokens, {
        fg: highlighter.getForegroundColor('dark-plus'),
        bg: highlighter.getBackgroundColor('dark-plus'),

        elements: {
          pre({ className, style, children }) {
            const pre = `<pre class="not-prose overflow-auto p-4 leading-normal ${
              filename ? 'rounded-b' : 'rounded'
            }" style="${style}" tabindex="0">${children}</pre>`

            return filename
              ? `
<div class="my-5">
  <div class="text-white bg-zinc-800 rounded-t py-1 px-3">${filename}</div>
  ${pre}
</div>`
              : pre
          }
        }
      })
    }
  }
})

marked.use(gfmHeadingId())

const files = await fs.readdir('docs', { withFileTypes: true })

for (const file of files) {
  if (file.isDirectory()) {
    const lang = file.name
    const outputDir = path.join('.html', lang)
    await fs.mkdir(outputDir, { recursive: true })

    const { default: messages } = await import(`./docs/${lang}/messages.json`, {
      assert: { type: 'json' }
    })

    const _toc = {}

    for (const [chapterId, files] of Object.entries(toc)) {
      const chapter = (_toc[messages[chapterId]] = {})

      for (const file of files) {
        const content = await fs.readFile(
          path.join('docs', lang, file + '.md'),
          'utf-8'
        )

        const htmlContent = await marked.parse(content)
        const outputPath = path.join(outputDir, path.basename(file) + '.html')
        await fs.writeFile(outputPath, htmlContent)
        const headings = getHeadingList()
        headings.forEach(item => (item.text = decode(item.text)))
        chapter[headings[0].text] = { headings, file }
      }
    }

    await fs.writeFile(
      path.join(outputDir, 'toc.json'),
      JSON.stringify(_toc, null, 2)
    )
  }
}
