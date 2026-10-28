import React from 'react'
import { Box } from '@kuma-ui/core'
import Slugger from 'github-slugger'
import { useContentStore } from '@/stores/content'

// Turn the raw markdown already in the store into a downloaded .md file.
// Native Blob + <a download>; no dependency, no backend round-trip.
const download = (markdown: string, title: string | null) => {
  const name = (title && new Slugger().slug(title)) || 'note'
  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name}.md`
  a.click()
  URL.revokeObjectURL(url)
}

export const DownloadButton: React.FC = () => {
  const { markdown, title } = useContentStore()
  if (!markdown) return null

  return (
    <Box
      as="button"
      type="button"
      aria-label="Download note"
      title="Download note"
      onClick={() => download(markdown, title)}
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      width="2.2em"
      height="2.2em"
      p={0}
      border="1px solid var(--color-muted)"
      borderRadius="0.4em"
      background="transparent"
      color="var(--color-fg)"
      cursor="pointer"
      _hover={{ backgroundColor: 'var(--color-muted)' }}
    >
      {/* download icon */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    </Box>
  )
}
