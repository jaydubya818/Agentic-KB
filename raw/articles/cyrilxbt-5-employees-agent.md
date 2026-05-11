# How to Build an AI Agent That Does the Work of 5 Employees for $20 a Month (Full Course)

Source: @cyrilxbt | https://x.com/cyrilxbt/status/2052570518667378918
Engagement: 440 favorites · 20 replies | Fri May 08 02:05:21 +0000 2026

---

Five employees cost between $300,000 and $500,000 a year when you factor in salary, benefits, payroll taxes, equipment, and management overhead.

A Claude subscription costs $20 a month.

That is $240 a year.

I am not going to tell you that Claude is better than five great employees at everything they do. It is not. Human judgment, creativity, and relationship management are irreplaceable.

What I am going to show you is how to build an AI agent system that handles the specific categories of work that five entry-level to mid-level employees would typically own — research, content, customer communication, operations, and analytics — and delivers that output reliably, consistently, and at a scale that would exhaust any human team.

This is not theory. This is the exact architecture with the exact prompts.

Why Five Employees and Not One

The framing matters before the build.

You are not building one AI that is five times better than a human employee.

You are building five specialized agents that each do one category of work extremely well.

Specialization is the key principle behind every effective multi-agent system.

A generalist AI asked to do research, write content, manage customer emails, compile reports, and update databases in the same session produces mediocre output in every category because it is constantly context-switching between completely different kinds of work with completely different quality standards.

A specialist AI asked to do only research produces exceptional research because its entire configuration — its system prompt, its memory, its tools, its quality standards — is optimized for that one function.

Five specialized agents running in parallel produce better output in every category than one generalist agent doing everything.

This is the architecture that replaces five employees.

Employee 1: The Research Agent

What a human researcher does: Monitors industry news, analyzes competitors, synthesizes information from multiple sources, produces structured briefs, and surfaces insights that inform decisions.

What this costs with a human: $50,000 to $70,000 per year for a competent junior researcher.

What the agent does: Runs automated research on any topic you configure, synthesizes findings from multiple sources, identifies the key insight most people miss, produces structured briefs in a consistent format, and deposits them in your knowledge base automatically.

The system prompt that powers this agent:

You are a specialist research agent. Your only job is to produce 
Research Briefs.

When you receive a research request:

1. Identify the core question
2. Search for the most relevant and recent sources
3. Cross-reference at least 3 independent sources for any factual claim
4. Identify the key insight most people miss on this topic
5. Identify the counterintuitive angle that creates genuine interest
6. Find 3 specific examples, statistics, or stories that support 
   the insight

Output ONLY in this exact format:

CORE INSIGHT: [one sentence]
SUPPORTING EVIDENCE: [3 specific examples with sources]
COUNTERINTUITIVE ANGLE: [what most people get wrong]
KEY DATA: [2-3 specific numbers or quotes]
CONTENT ANGLES: [3 ranked angles for content creation]

Never editorialize. Never add commentary outside the format.
Produce the brief and stop.

The N8N workflow that makes this run automatically:

Every morning at 6AM, N8N triggers the Research Agent with a list of topics pulled from your Obsidian vault. The agent runs each research query, produces a brief for each topic, and deposits the briefs in a research folder in your vault. When you sit down to work, your research is already done.

Build time: 3 hours. Daily time saved: 2 to 3 hours of manual research eliminated entirely.

Employee 2: The Content Agent

What a human content person does: Takes research briefs and turns them into publish-ready content in your specific voice across multiple formats and platforms.

What this costs with a human: $55,000 to $80,000 per year for a mid-level content producer.

What the agent does: Reads your research briefs, applies your voice profile, produces first drafts in every format you need, and queues them for your 5-minute review session rather than requiring you to write from scratch.

The voice profile that makes this work is the most important thing you will configure for this agent. Generic AI content sounds like AI. A properly configured voice profile produces content that sounds like you.

You are a specialist content agent for [YOUR NAME/BRAND].

Voice Profile (learned from examples):
- [YOUR SPECIFIC SENTENCE PATTERNS]
- [YOUR CAPITALIZATION HABITS]
- [YOUR VOCABULARY PREFERENCES]
- [YOUR STRUCTURAL PATTERNS]
- [WHAT YOU NEVER DO]

When you receive a Research Brief:
1. Select the strongest angle from CONTENT ANGLES
2. Write the opening hook in the style specified
3. Write the body using the voice profile above
4. End with the appropriate CTA for this content type
5. Verify every sentence sounds like the voice profile before submitting

Output format: [SPECIFY YOUR EXACT REQUIRED FORMAT]

Always specify the format you are producing at the top of your output.
Never produce output in a format not specified in your brief.

The key to this agent performing well is the training data you give it.

Before you write the system prompt, collect your 20 best performing pieces of content. Feed all of them to Claude and ask it to extract the patterns: average sentence length, capitalization habits, vocabulary level, structural tendencies, what you never say.

Use that extracted profile as the voice section of your system prompt.

My Content Agent now produces first drafts that require under 5 minutes of editing for 80% of outputs. The other 20% get flagged for more significant revision.

That is not the same as writing from scratch. Writing from scratch takes 45 minutes to 2 hours per piece. Reviewing and editing an 80% draft takes 5 minutes.

Employee 3: The Customer Communication Agent

What a human customer communication person does: Responds to inquiries, routes support requests, sends follow-up emails, handles objections, and maintains relationship touchpoints.

What this costs with a human: $45,000 to $60,000 per year for a customer success coordinator.

What the agent does: Reads incoming communications, categorizes them by type and urgency, drafts responses in your voice, routes complex issues for human review, and sends automated follow-ups on a configured schedule.

This agent requires the most careful constraint engineering because it operates in the most consequential category. Errors in customer communication have direct business impact.

The constraint system for this agent:

You are a specialist customer communication agent for [BUSINESS NAME].

Your role:
Read all incoming communications and produce a structured response 
recommendation for each one.

Categories you assign to every communication:
ROUTINE: Standard inquiry that can be handled with a template
CUSTOM: Requires personalized response within your authority
ESCALATE: Requires human review before any response is sent

For ROUTINE communications:
Select the appropriate response template and personalize it
with specific details from the inquiry.

For CUSTOM communications:
Draft a complete response. Mark clearly: DRAFT - REVIEW BEFORE SENDING

For ESCALATE communications:
Summarize the issue, explain why it needs escalation, and suggest
the appropriate human to involve.

Hard rules:
NEVER promise anything you have not been authorized to promise.
NEVER send any communication marked ESCALATE without human approval.
NEVER reference competitors by name.
NEVER discuss pricing outside the approved pricing document.

When uncertain about the category: ESCALATE. Never guess.

The hard rules section is not optional. It is what separates a communication agent that builds your business from one that creates liability.

Run this agent in review mode for the first two weeks. Every output gets human approval before sending. After two weeks you will have identified every edge case and updated the constraints to handle them. Then you can move routine communications to automated sending with a daily audit.

Employee 4: The Operations Agent

What a human operations person does: Maintains databases, compiles reports, tracks project status, updates records, and keeps the operational infrastructure of the business functioning.

What this costs with a human: $50,000 to $65,000 per year for an operations coordinator.

What the agent does: Runs scheduled data pulls, updates your Notion and Airtable databases, generates status reports, monitors metrics against your defined thresholds, and alerts you only when something requires your attention.

The operations agent is the one that saves the most mindless time because operations work is highly repetitive, highly structured, and highly automatable.

The operations workflow that most operators build first:

Every Monday at 7AM the Operations Agent pulls the previous week's data from every relevant source. Revenue numbers from Stripe. Traffic numbers from your analytics. Content performance from your social media. Project status from your project management tool.

It compiles all of it into a structured weekly operations report and deposits it in your Notion dashboard.

You open your laptop Monday morning and the report is waiting. You did not compile it. You did not pull the numbers. You did not format anything. You just read the summary and make decisions.

The prompt that powers this:

You are a specialist operations agent. Your job is to compile, 
update, and report on operational data.

Weekly Report Structure:
REVENUE SUMMARY: [Template with Stripe data]
TRAFFIC SUMMARY: [Template with analytics data]  
CONTENT PERFORMANCE: [Template with social data]
PROJECT STATUS: [Template with project data]
ALERTS: [Any metric that crossed a threshold requiring attention]
DECISIONS NEEDED: [Items that require human judgment this week]

Data sources and access: [LIST YOUR MCP CONNECTIONS]

Thresholds that trigger an ALERT:
[LIST YOUR SPECIFIC THRESHOLDS]

Format everything for a 5-minute executive read.
No raw data. Only interpreted summaries.
Flag anything above or below threshold.
Do not include data that has not changed meaningfully since last week.

The ALERTS and DECISIONS NEEDED sections are what make this agent valuable beyond simple reporting. Most operations agents just report numbers. This one filters the noise and surfaces only what actually requires your attention.

Employee 5: The Analytics Agent

What a human analytics person does: Analyzes performance data, identifies patterns, generates insights, recommends optimizations, and tracks progress against goals.

What this costs with a human: $60,000 to $80,000 per year for a data analyst.

What the agent does: Reads performance data across all of your channels, identifies the patterns that explain what is working and what is not, generates specific recommendations, and updates the operating parameters of your other agents based on what it learns.

The Analytics Agent is the one that makes your entire system smarter over time.

Without it, your other agents run the same way in week 52 as they did in week 1.

With it, every agent gets monthly optimization updates based on actual performance data.

The system prompt for the Analytics Agent:

You are a specialist analytics agent. Your job is not to report data.
Your job is to extract insight from data that changes decisions.

When you receive a performance data set:

1. Identify the 3 most significant patterns. Not the obvious ones. 
   The ones that explain the non-obvious performance differences.

2. Identify the single highest-leverage action supported by the data.
   Not a list of recommendations. The ONE thing that would move 
   the most important number the most.

3. Identify what the data predicts will happen next if current 
   patterns continue.

4. Produce agent optimization recommendations: specific changes to 
   the system prompts or configurations of other agents that the 
   data supports.

Output format:
PATTERN 1: [Pattern + evidence]
PATTERN 2: [Pattern + evidence]
PATTERN 3: [Pattern + evidence]
HIGHEST LEVERAGE ACTION: [Specific recommendation with reasoning]
PREDICTION: [What happens next if nothing changes]
AGENT OPTIMIZATIONS: [Specific changes to agent configurations]

Never recommend more than one highest leverage action.
Never include a recommendation not directly supported by the data.

The AGENT OPTIMIZATIONS section is what makes this agent different from a standard analytics tool.

Every month the Analytics Agent reads your performance data and produces specific changes to the system prompts of your other four agents. Your Content Agent's voice profile gets refined. Your Research Agent's topic list gets updated. Your Communication Agent's templates get optimized.

The system learns. Every agent gets better every month. The compound effect over 12 months is dramatic.

The Architecture That Connects All Five

The five agents work independently but share context through a common infrastructure.

Shared memory: All five agents can read and write to the same Obsidian vault. The Research Agent deposits briefs. The Content Agent reads them. The Analytics Agent reads performance data. The Operations Agent updates project status. The Communication Agent logs interactions.

Shared tools via MCP: All five agents have access to the same set of connected tools configured in your claude_desktop_config.json. What one agent can read, any agent can read.

N8N orchestration: N8N is what schedules each agent's workflows and passes outputs between them. The Research Agent's Monday briefing output triggers the Content Agent's Monday drafting queue. The Analytics Agent's monthly report triggers agent optimization updates.

The CLAUDE.md that governs all five:

# Master System Context

## Business Overview
[Who you are, what you do, who you serve]

## Agent Roster
- Research Agent: Produces research briefs on configured topics
- Content Agent: Produces content from research briefs
- Communication Agent: Handles customer communications
- Operations Agent: Maintains operational data and reports
- Analytics Agent: Analyzes performance and optimizes agents

## Shared Standards
[Quality standards that apply to all agents]

## Current Focus
[Current business priorities that all agents should weight toward]

## Hard Rules That Apply to All Agents
[Non-negotiables that override any other instruction]

The Build Order and Timeline

Do not build all five agents simultaneously.

Week 1: Research Agent plus Obsidian memory layer. Run it for a week. Verify the brief format is useful before connecting it to anything else.

Week 2: Content Agent. Connect it to the Research Agent output. Verify the voice profile is accurate by reviewing every draft for one week.

Week 3: Operations Agent. Connect it to your data sources. Run it in reporting mode for one week before letting it update any databases.

Week 4: Communication Agent. Run it in review mode for two weeks. No automated sending until you have approved 100 outputs and updated the constraints for every edge case you found.

Week 6: Analytics Agent. By now you have enough data from the other four agents to actually analyze.

Total build time: 6 weeks of evenings and weekends. Total daily operating time: 30 to 60 minutes reviewing outputs, approving communications, and making the decisions only you can make.

Everything else runs itself.

The Real Cost Calculation

Five human employees at average loaded cost: $350,000 per year.

This agent system: Claude Max: $100 per month for heavy usage. N8N self-hosted: $5 per month. Supabase free tier: $0. Obsidian: $0.

Total: $105 per month. $1,260 per year.

The output is not identical to five great human employees. For complex creative work, relationship management, and strategic judgment, humans remain essential.

But for the research, the content production, the routine communications, the operational maintenance, and the performance analysis that constitute the majority of entry-level to mid-level employee work hours, this system delivers at a level that was not possible two years ago.

You are not replacing humans.

You are replacing the hours that humans spend on work that AI now does well enough that spending human hours on it is the most expensive mistake in your operation.

The $20 a month figure in the headline was the starting point for this architecture.

At full deployment with Claude Max and N8N, the real cost is closer to $105 per month.

That is still less than half of one human employee's monthly salary before benefits.

The math is not close.

Build the first agent this weekend.

Follow @cyrilXBT for the exact system prompts, N8N workflows, and MCP configurations that make this entire architecture run.