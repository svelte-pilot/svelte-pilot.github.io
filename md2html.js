import { decode } from 'html-entities'
import { Marked } from 'marked'
import { getHeadingList, gfmHeadingId } from 'marked-gfm-heading-id'
import { markedHighlight } from 'marked-highlight'
import fs from 'node:fs/promises'
import path from 'path'
import shiki from 'shiki'
import toc from './docs/toc.json' assert { type: 'json' }

const highlighter = await shiki.getHighlighter({})

const marked = new Marked(
  markedHighlight({
    highlight: (code, lang) => highlighter.codeToHtml(code, { lang })
  })
)

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
