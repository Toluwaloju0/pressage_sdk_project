import { Link } from 'react-router-dom'
import { insightCopy as copy } from '../content.js'
import { parseInsight } from '../insight/parse.js'
import ReminderEditor from './ReminderEditor.jsx'

function Inline({ parts }) {
  return parts.map((p, i) => (p.bold ? <strong key={i}>{p.text}</strong> : <span key={i}>{p.text}</span>))
}

// Draws the explanation as React elements (never as raw HTML), and gives each suggested
// everyday habit its own reminder control.
export default function InsightView({ text }) {
  const { blocks, habits } = parseInsight(text)
  return (
    <div className="insight">
      {blocks.map((b, i) => {
        if (b.type === 'heading') {
          return b.level <= 2 ? (
            <h3 className="h-item" key={i}>
              <Inline parts={b.parts} />
            </h3>
          ) : (
            <h4 className="insight__sub" key={i}>
              <Inline parts={b.parts} />
            </h4>
          )
        }
        if (b.type === 'paragraph') {
          if (b.hidden) return null
          return (
            <p key={i}>
              <Inline parts={b.parts} />
            </p>
          )
        }
        if (b.habits) return null
        const List = b.ordered ? 'ol' : 'ul'
        return (
          <List className="insight__list" key={i}>
            {b.items.map((parts, j) => (
              <li key={j}>
                <Inline parts={parts} />
              </li>
            ))}
          </List>
        )
      })}

      {habits.length > 0 && (
        <section className="habits" aria-labelledby="habits-title">
          <h3 className="h-item" id="habits-title">
            {copy.habitsTitle}
          </h3>
          <p className="habits__help">{copy.habitsHelp}</p>
          <ul className="habits__list">
            {habits.map((h) => (
              <li className="habit" key={h.key}>
                <p className="habit__text">{h.text}</p>
                <ReminderEditor habit={h} />
              </li>
            ))}
          </ul>
          <p className="note">
            {copy.manage} <Link to="/reminders">{copy.manageLink}</Link>
          </p>
        </section>
      )}
      <p className="note">{copy.aiNote}</p>
    </div>
  )
}
