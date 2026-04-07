'use client'

import React from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarLink {
  label: string
  href: string
}

interface SidebarSection {
  title: string
  links: SidebarLink[]
}

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: 'Navigation',
    links: [
      { label: 'Main Page', href: '/wiki' },
      { label: 'All Articles', href: '/wiki' },
      { label: 'Ask AI', href: '/query' },
      { label: 'Add Material', href: '/ingest' },
    ],
  },
  {
    title: 'Concepts',
    links: [
      { label: 'Agent Loops', href: '/wiki/concepts/agent-loops' },
      { label: 'Multi-Agent Systems', href: '/wiki/concepts/multi-agent-systems' },
      { label: 'Memory Systems', href: '/wiki/concepts/memory-systems' },
      { label: 'Task Decomposition', href: '/wiki/concepts/task-decomposition' },
      { label: 'Tool Use', href: '/wiki/concepts/tool-use' },
      { label: 'Context Management', href: '/wiki/concepts/context-management' },
      { label: 'Guardrails', href: '/wiki/concepts/guardrails' },
      { label: 'LLM-as-Judge', href: '/wiki/concepts/llm-as-judge' },
      { label: 'Self-Critique', href: '/wiki/concepts/self-critique' },
      { label: 'CoT Prompting', href: '/wiki/concepts/chain-of-thought' },
    ],
  },
  {
    title: 'Patterns',
    links: [
      { label: 'Supervisor-Worker', href: '/wiki/patterns/pattern-supervisor-worker' },
      { label: 'Pipeline', href: '/wiki/patterns/pattern-pipeline' },
      { label: 'Fan-Out Worker', href: '/wiki/patterns/pattern-fan-out-worker' },
      { label: 'Plan-Execute-Verify', href: '/wiki/patterns/pattern-plan-execute-verify' },
      { label: 'Reflection Loop', href: '/wiki/patterns/pattern-reflection-loop' },
      { label: 'External Memory', href: '/wiki/patterns/pattern-external-memory' },
      { label: 'Rolling Summary', href: '/wiki/patterns/pattern-rolling-summary' },
    ],
  },
  {
    title: 'Frameworks',
    links: [
      { label: 'GSD', href: '/wiki/frameworks/framework-gsd' },
      { label: 'Superpowers', href: '/wiki/frameworks/framework-superpowers' },
      { label: 'BMAD', href: '/wiki/frameworks/framework-bmad' },
      { label: 'Claude API', href: '/wiki/frameworks/framework-claude-api' },
      { label: 'Claude Code', href: '/wiki/frameworks/framework-claude-code' },
      { label: 'LangGraph', href: '/wiki/frameworks/framework-langgraph' },
      { label: 'MCP', href: '/wiki/frameworks/framework-mcp' },
      { label: 'AutoGen', href: '/wiki/frameworks/framework-autogen' },
    ],
  },
  {
    title: 'Recipes',
    links: [
      { label: 'Build a Tool Agent', href: '/wiki/recipes/recipe-build-tool-agent' },
      { label: 'Multi-Agent Crew', href: '/wiki/recipes/recipe-multi-agent-crew' },
      { label: 'Parallel Sub-agents', href: '/wiki/recipes/recipe-parallel-subagents' },
      { label: 'Context Compression', href: '/wiki/recipes/recipe-context-compression' },
      { label: 'Agent Evaluation', href: '/wiki/recipes/recipe-agent-evaluation' },
      { label: 'MCP Server', href: '/wiki/recipes/recipe-mcp-server' },
    ],
  },
  {
    title: 'Evaluations',
    links: [
      { label: 'Orchestration Frameworks', href: '/wiki/evaluations/eval-orchestration-frameworks' },
      { label: 'Memory Approaches', href: '/wiki/evaluations/eval-memory-approaches' },
    ],
  },
  {
    title: 'Entities',
    links: [
      { label: 'Anthropic', href: '/wiki/entities/anthropic' },
      { label: 'OpenAI', href: '/wiki/entities/openai' },
      { label: 'Jay\'s Stack', href: '/wiki/entities/jay-west-agent-stack' },
      { label: 'Model Landscape', href: '/wiki/entities/model-landscape' },
      { label: 'MCP Ecosystem', href: '/wiki/entities/mcp-ecosystem' },
    ],
  },
  {
    title: 'Personal',
    links: [
      { label: 'Framework Philosophy', href: '/wiki/personal/personal-jays-framework-philosophy' },
      { label: 'Design Observations', href: '/wiki/personal/personal-agent-design-observations' },
    ],
  },
]

export default function WikiSidebar(): React.ReactElement {
  const pathname = usePathname()

  return (
    <nav className="wiki-sidebar-nav">
      {SIDEBAR_SECTIONS.map((section) => (
        <div key={section.title}>
          <h3>{section.title}</h3>
          <ul>
            {section.links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={pathname === link.href ? 'active' : ''}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
