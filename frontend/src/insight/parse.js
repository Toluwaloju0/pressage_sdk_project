// Turns the text Presage's language model writes into plain data the page can draw safely
// (no HTML is ever inserted), and picks out the everyday habits it suggests.
//
// The model writes light Markdown: "## Heading", "**bold**" and "- list items". The wording
// changes from scan to scan, so nothing here depends on exact titles.

const HEADING = /^(#{1,6})\s+(.*)$/
const ITEM = /^\s*(?:[-*•]|\d+[.)])\s+(.*)$/
const ORDERED = /^\s*\d+[.)]\s+/
const RULE = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/
// A list is the habits list when the line that introduces it sounds like advice.
const HABIT_LEAD = /habit|everyday|routine|ideas?|suggest|tips?\b|may help|can help|try\b/i

export const MAX_HABITS = 8
export const MAX_HABIT_CHARS = 200

// Splits a line into bold and plain pieces. Stray asterisks are dropped.
export function inline(text) {
  const parts = []
  for (const piece of String(text).split(/(\*\*[^*]+?\*\*|__[^_]+?__)/)) {
    if (!piece) continue
    const bold = /^(\*\*|__)[\s\S]*(\*\*|__)$/.test(piece) && piece.length > 4
    const clean = (bold ? piece.slice(2, -2) : piece).replace(/\*/g, '')
    if (clean) parts.push({ text: clean, bold })
  }
  return parts
}

export const plain = (parts) => parts.map((p) => p.text).join('').replace(/\s+/g, ' ').trim()

// A short, stable id for a habit, so a reminder can be matched to it again later.
export function habitKey(text) {
  const s = text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0
  return `h${h.toString(36)}`
}

// -> { blocks, habits }
//   blocks: { type: 'heading', level, parts } | { type: 'paragraph', parts }
//         | { type: 'list', ordered, items: [parts], habits: boolean }
//   habits: [{ key, text }]
export function parseInsight(text) {
  const blocks = []
  let paragraph = []
  let list = null
  let lead = ''

  const flushParagraph = () => {
    if (!paragraph.length) return
    const parts = inline(paragraph.join(' '))
    paragraph = []
    if (parts.length) {
      blocks.push({ type: 'paragraph', parts })
      lead = plain(parts)
    }
  }
  const flushList = () => {
    if (!list) return
    const habits = HABIT_LEAD.test(lead)
    // The line that introduces the habits list becomes our own "Everyday habits" heading.
    const prev = blocks[blocks.length - 1]
    if (habits && prev && prev.type === 'paragraph') prev.hidden = true
    blocks.push({ ...list, habits })
    list = null
  }

  for (const line of String(text ?? '').replace(/\r/g, '').split('\n')) {
    if (!line.trim() || RULE.test(line)) {
      flushParagraph()
      flushList()
      continue
    }
    const heading = line.match(HEADING)
    if (heading) {
      flushParagraph()
      flushList()
      const parts = inline(heading[2])
      if (parts.length) {
        blocks.push({ type: 'heading', level: heading[1].length, parts })
        lead = plain(parts)
      }
      continue
    }
    const item = line.match(ITEM)
    if (item) {
      flushParagraph()
      if (!list) list = { type: 'list', ordered: ORDERED.test(line), items: [] }
      const parts = inline(item[1])
      if (parts.length) list.items.push(parts)
      continue
    }
    flushList()
    paragraph.push(line.trim())
  }
  flushParagraph()
  flushList()

  const habits = []
  const seen = new Set()
  for (const block of blocks) {
    if (block.type !== 'list' || !block.habits) continue
    for (const parts of block.items) {
      const text = plain(parts).slice(0, MAX_HABIT_CHARS)
      const key = habitKey(text)
      if (!text || seen.has(key) || habits.length >= MAX_HABITS) continue
      seen.add(key)
      habits.push({ key, text })
    }
  }
  return { blocks, habits }
}
