import { EXIT, visit } from 'unist-util-visit'
import YAML from 'yaml'
import { create } from 'zustand'
import { useTocStore } from './toc'
import type { Root as HastRoot } from 'hast'
import type { Root as MdastRoot } from 'mdast'

type ContentType = React.ReactElement<
  unknown,
  string | React.JSXElementConstructor<any>
>

interface ContentState {
  dom: ContentType | null
  mdast: MdastRoot | null
  hast: HastRoot | null
  title: string | null
  markdown: string | null
  properties: Record<string, unknown> | null
  render: (markdown: string, fallbackTitle?: string) => Promise<void>
  lastError: Error | null | undefined
}

export const useContentStore = create<ContentState>(set => ({
  renderId: 0,
  dom: null,
  mdast: null,
  hast: null,
  title: null,
  markdown: null,
  properties: null,
  lastError: null,
  render: async (markdown: string, fallbackTitle = '') => {
    set({ markdown })
    try {
      const { MarkdownRenderer } = await import('@/markdown-renderer')
      const renderer = new MarkdownRenderer()
      const { result: dom, mdast, hast } = await renderer.render(markdown)
      // Obsidian titles live in the file name, which the API sends alongside the
      // markdown; a frontmatter `title` still wins when present.
      let title = fallbackTitle
      let properties: Record<string, unknown> | null = null

      visit(mdast, 'yaml', node => {
        const frontmatter = YAML.parse(node.value)
        properties = frontmatter ?? null
        // YAML can yield a non-string (e.g. an unfilled `{ title }` template
        // parses as an object); rendering that as a React child crashes the app.
        if (typeof frontmatter?.title === 'string' && frontmatter.title)
          title = frontmatter.title
        return EXIT
      })

      set({ dom, mdast, hast, title, properties, lastError: null })
      useTocStore.getState().update(mdast)
    } catch (e: any) {
      console.error(`Failed to render preview: ${e.stack}`)
      set({
        dom: null,
        mdast: null,
        hast: null,
        title: null,
        markdown: null,
        properties: null,
        lastError: new Error('Failed to render Markdown')
      })
    }
  }
}))
