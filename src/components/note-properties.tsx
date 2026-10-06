import React from 'react'
import { Box, HStack } from '@kuma-ui/core'
import { useContentStore } from '@/stores/content'

// Render one frontmatter value: arrays become chips, everything else is text.
const PropertyValue: React.FC<{ value: unknown }> = ({ value }) => {
  if (Array.isArray(value))
    return (
      <Box display="flex" flexWrap="wrap" gap="0.4em">
        {value.map((item, i) => (
          <Box
            key={i}
            px="0.6em"
            py="0.15em"
            fontSize="0.85em"
            borderRadius="0.4em"
            backgroundColor="var(--color-neutral-100)"
            color="var(--color-neutral-700)"
          >
            {String(item)}
          </Box>
        ))}
      </Box>
    )
  return <Box>{String(value)}</Box>
}

export const NoteProperties: React.FC = () => {
  const { properties } = useContentStore()

  // Skip `title` (shown by <PageTitle />) and empty values.
  const entries = Object.entries(properties ?? {}).filter(
    ([key, value]) => key !== 'title' && value != null && value !== ''
  )
  if (entries.length === 0) return null

  return (
    <Box
      mx="1em"
      mb="1.5em"
      px="1em"
      py="0.75em"
      borderRadius="0.4em"
      border="1px solid var(--color-neutral-200)"
      backgroundColor="var(--color-neutral-50)"
    >
      {entries.map(([key, value]) => (
        <HStack key={key} alignItems="flex-start" py="0.3em" gap="1em">
          <Box
            flexShrink={0}
            width="8em"
            fontSize="0.9em"
            fontWeight="var(--font-weights-medium)"
            color="var(--color-neutral-500)"
            textTransform="capitalize"
          >
            {key}
          </Box>
          <Box flexGrow={1} minWidth={0} fontSize="0.9em">
            <PropertyValue value={value} />
          </Box>
        </HStack>
      ))}
    </Box>
  )
}
