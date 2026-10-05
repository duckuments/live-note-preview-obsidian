import './markdown-view.css'
import React, { useEffect, useState } from 'react'
import { Box } from '@kuma-ui/core'
import { useVisibleSections } from '@/hooks/use-visible-sections'
import { useContentStore } from '@/stores/content'

// Deep links look like /r/<slug>. Everything else has no note to show.
const slugFromPath = () => location.pathname.match(/^\/r\/([^/]+)/)?.[1] ?? null

type Status = 'loading' | 'ready' | 'notfound' | 'error'

export const MarkdownView: React.FC = () => {
  const { dom, title, render } = useContentStore()
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    const slug = slugFromPath()
    if (!slug) {
      setStatus('notfound')
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/note/${encodeURIComponent(slug)}`)
        if (res.status === 404) return !cancelled && setStatus('notfound')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const { markdown } = (await res.json()) as { markdown: string }
        if (cancelled) return
        await render(markdown)
        if (!cancelled) setStatus('ready')
      } catch (e) {
        console.error('Failed to load note:', e)
        if (!cancelled) setStatus('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [render])

  useEffect(() => {
    if (status === 'ready' && title) document.title = title
  }, [status, title])

  useVisibleSections()

  if (status === 'loading') return <Box className="markdown-view">Loading…</Box>
  if (status === 'notfound')
    return <Box className="markdown-view">Note not found.</Box>
  if (status === 'error')
    return <Box className="markdown-view">Failed to load note.</Box>

  return <Box className="markdown-view">{dom ? dom : 'rendering...'}</Box>
}
