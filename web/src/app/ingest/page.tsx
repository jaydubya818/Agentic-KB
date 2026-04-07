import React from 'react'
import Link from 'next/link'
import WikiLayout from '@/components/WikiLayout'
import IngestForm from '@/components/IngestForm'

export default function IngestPage(): React.ReactElement {
  return (
    <WikiLayout>
      <div>
        {/* Page header */}
        <div style={{
          background: '#fff',
          border: '1px solid #a2a9b1',
          borderBottom: 'none',
          padding: '0.75rem 1rem 0',
        }}>
          <h1 style={{
            fontFamily: "'Linux Libertine', Georgia, serif",
            fontSize: '2rem',
            fontWeight: 'normal',
            margin: 0,
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #a2a9b1',
            color: '#202122',
          }}>
            Add Raw Material
          </h1>
          <div style={{
            fontSize: '0.75rem',
            color: '#54595d',
            padding: '0.4rem 0',
            fontFamily: '-apple-system, sans-serif',
          }}>
            Paste content to save to <code>raw/</code> — then run the INGEST workflow to process it into the wiki
          </div>
        </div>

        <div className="article-body">
          {/* How ingest works */}
          <div className="infobox">
            <table>
              <thead>
                <tr>
                  <th colSpan={2}>Ingest Workflow</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="label">Step 1</td>
                  <td>Save to raw/ (this form)</td>
                </tr>
                <tr>
                  <td className="label">Step 2</td>
                  <td><Link href="/process" style={{ color: '#0645ad' }}>Go to Process Raw Materials →</Link></td>
                </tr>
                <tr>
                  <td className="label">Step 3</td>
                  <td>Click &ldquo;Ingest&rdquo; on the file or &ldquo;Process All&rdquo;</td>
                </tr>
                <tr>
                  <td className="label">Result</td>
                  <td>Wiki page + index update</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>What happens when you ingest</h2>
          <p>
            When you submit material here, it is saved to <code>raw/</code> with proper frontmatter.
            The raw directory is <em>read-only for the wiki</em> — it is the immutable source of truth.
          </p>
          <p>
            To process the raw material into the wiki, go to{' '}
            <Link href="/process" style={{ color: '#0645ad', fontWeight: 500 }}>Process Raw Materials</Link>{' '}
            and click <strong>Ingest</strong> next to the file, or <strong>Process All</strong> to ingest everything at once.
            Alternatively, open a Claude Code session in <code>/Users/jaywest/Agentic-KB/</code> and say:{' '}
            <strong>&ldquo;Ingest raw/{'{type}'}/{'{slug}'}.md&rdquo;</strong>
          </p>
          <p>
            Claude will then: extract key concepts, create a <code>wiki/summaries/</code> page,
            update or create relevant concept/pattern/framework pages, add cross-links,
            update <code>wiki/index.md</code>, and append to <code>wiki/log.md</code>.
          </p>

          <hr />

          <h2>Submit new material</h2>
          <IngestForm />

          <hr />

          <h2>Raw directory structure</h2>
          <table>
            <thead>
              <tr>
                <th>Directory</th>
                <th>What goes here</th>
                <th>Examples</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>raw/transcripts/</code></td>
                <td>Video and podcast transcripts</td>
                <td>Karpathy LLM wiki video</td>
              </tr>
              <tr>
                <td><code>raw/articles/</code></td>
                <td>Blog posts and web articles</td>
                <td>Anthropic blog posts</td>
              </tr>
              <tr>
                <td><code>raw/papers/</code></td>
                <td>Research papers (PDF → markdown)</td>
                <td>arXiv agentic papers</td>
              </tr>
              <tr>
                <td><code>raw/notes/</code></td>
                <td>Personal notes and ideas</td>
                <td>Quick observations</td>
              </tr>
              <tr>
                <td><code>raw/video-notes/</code></td>
                <td>Notes taken while watching videos</td>
                <td>Conference talk notes</td>
              </tr>
              <tr>
                <td><code>raw/framework-docs/</code></td>
                <td>Framework documentation snippets</td>
                <td>LangGraph docs excerpt</td>
              </tr>
              <tr>
                <td><code>raw/conversations/</code></td>
                <td>Notable Claude Code sessions</td>
                <td>Exported CLAUDE.md sessions</td>
              </tr>
              <tr>
                <td><code>raw/code-examples/</code></td>
                <td>Annotated code patterns</td>
                <td>Working agent implementations</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </WikiLayout>
  )
}
