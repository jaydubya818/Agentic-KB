---
title: "Relay — Federated Knowledge & Agent Communication"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p8848
captured_at: 2026-09-18T20:13:49.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: fceaf3b1cd54251afc916733cd3bb4db8f6eaf0b08a667326c6f394b27a3fc45
---

Relay — Federated Knowledge & Agent Communication
Architecture & Implementation Plan for Review
Mission
Extend Relay into the trusted communication and knowledge-sharing layer between independently owned personal Agents.
The fundamental product principle is:
People own their knowledge. Their Agents represent them. Relay allows those Agents to discover, query, communicate, and collaborate using only the authority their owners explicitly grant.
Relay must not become a centralized copy of everyone’s private memory.
Instead:
MYEVE / AGENT PLATFORM
Owns:
- private Memory
- personal Knowledge
- Goals
- Workspace
- conversations
- Agents
- local execution

              │
              │ Published capability
              ▼

RELAY
Owns:
- identities
- addresses
- discovery
- grants
- authorization
- routing
- communication
- cross-owner approvals
- revocation
- rate limits
- audit / receipts

              │
              ▼

OTHER AGENTS
MyEve
Codex
Claude Code
OpenClaw
Custom Agents
Enterprise Agents
Relay should be agent-platform agnostic.
MyEve is the reference personal-agent client, not a required Relay runtime.

⸻

1. Core Architecture Boundary
Preserve this boundary:
MYEVE                          RELAY

What do I know?                Who may ask?
What do I remember?            Who may discover?
What are my Goals?             What may they request?
What are my files?             What may be disclosed?
What are my Agents?            What may be delegated?
What can I execute?            How is it routed?
                               How is it revoked?
                               What happened?
Do not move canonical private Knowledge into Relay.

⸻

2. Canonical Flow
Jay
 ↓
Sofie
 ↓
MyEve Knowledge
 ↓
Published Knowledge View
 ↓
Relay
 ↓
Identity + Grant + Policy
 ↓
Ava
 ↓
Sarah
Reverse direction works identically.

⸻

3. Trust Domains
Every owner is an independent trust domain.
Example:
Jay Trust Domain
├── Sofie
├── Researcher
├── Developer
├── Private Memory
├── Knowledge
└── Connected Accounts

Sarah Trust Domain
├── Ava
├── Marketing Agent
├── Private Memory
├── Knowledge
└── Connected Accounts
Relay mediates interactions between trust domains.
Within a trust domain, the owner’s Agent platform remains responsible for local authorization.

⸻

4. Relay Identity
Relay needs durable identities for:
Owner
Agent
Agent Platform
Organization / Group — future
Conceptually:
RelayOwner

RelayAgent
  id
  ownerId
  name
  description
  platform
  endpoint
  publicKey / credential identity
  status
  capabilities
  createdAt
Do not bind Agent identity to MyEve.

⸻

5. Agent Address
Give every Relay Agent a durable address.
Conceptually:
relay://jay/sofie
relay://sarah/ava
The exact URI format may differ.
Requirements:
stable
unique
owner-controlled
revocable
platform-independent
Do not encode infrastructure location into the durable identity.

⸻

6. Authentication
Every Agent request to Relay must authenticate the calling Agent.
Relay must establish:
Which Agent?
Which owner?
Which credential?
Is it active?
Has it been revoked?
Never trust caller-supplied:
owner name
Agent name
Agent ID
without authenticated identity binding.

⸻

7. Agent Credentials
Use revocable Agent credentials.
Requirements:
scoped
rotatable
revocable
auditable
Do not require sharing owner credentials with Agents.
A compromised Agent credential should not compromise the owner’s Relay account.

⸻

8. Agent Registration
Agent platforms should be able to register an Agent with Relay.
Example:
MyEve
 ↓
Register Sofie
 ↓
Relay Agent identity
 ↓
Credential issued
Registration must require owner authorization.

⸻

9. Capability Discovery
Agents should advertise what they are capable of receiving.
Examples:
knowledge.query
message.receive
work.request
artifact.receive
Later:
work.delegate
collaboration.join
Do not infer capabilities solely from Agent descriptions.

⸻

10. Knowledge Visibility
MyEve or another Agent platform owns knowledge visibility.
Support:
PRIVATE
SHARED
UNLISTED
PUBLIC
PRIVATE
Never externally queryable.
SHARED
Queryable only by explicitly granted owners/Agents/groups.
UNLISTED
Queryable through explicit knowledge address/grant but not discoverable.
PUBLIC
Discoverable/queryable according to public Relay policy.

⸻

11. Published Knowledge View
Do not expose the source Knowledge database.
The Agent platform publishes a view contract.
Conceptually:
PublishedKnowledgeView

id
ownerId
publisherAgentId

name
description

topics
recordTypes

visibility

allowedAudience

queryEndpoint / capability

provenancePolicy
expiration?
status
Relay stores the publication metadata and policy.
The canonical records remain with the owner.

⸻

12. Publication Is Explicit
Nothing becomes externally shareable merely because an Agent determines it is “not sensitive.”
Publication must come from:
explicit owner action
or:
explicit owner-defined policy
Never:
LLM decides this looks public
→ publish

⸻

13. Shareable Knowledge Types
Initial published knowledge may include:
Facts
Insights
Public resources
Experience
Recommendations
Published documents
Public projects
Public profile
Be more conservative with:
Observations
Hypotheses
Preferences
unless explicitly published.

⸻

14. Never Implicitly Publish
Never automatically expose:
Private Memory
Conversations
Goals
Email
Calendar
Finance
Private files
Private Knowledge
Connected-account data
Agent-private Memory
Task-private context
These require separate explicit capabilities/policies if ever supported.

⸻

15. Knowledge Projection
MyEve should expose only an authorized projection.
Example:
Canonical Knowledge

Fact 1 PUBLIC
Fact 2 PRIVATE
Insight 1 SHARED with Sarah
Decision 1 PRIVATE

          ↓

Published View for Ava

Fact 1
Insight 1

          ↓

Relay
Relay never sees Fact 2 or Decision 1.

⸻

16. Knowledge Query Protocol
Implement the first cross-Agent protocol:
knowledge.query
Example request:
caller
relay://sarah/ava

target
relay://jay/sofie

view
software-factories

query
"How does Jay approach verification in autonomous software factories?"

requestedTypes
Fact
Insight
Resource

⸻

17. Query Authorization
Relay evaluates:
Authenticated caller
       ↓
Target exists?
       ↓
Target accepts knowledge.query?
       ↓
Published view exists?
       ↓
Visibility policy
       ↓
Specific grant
       ↓
Rate/budget policy
       ↓
ALLOW / APPROVAL / DENY
Do not forward unauthorized queries to the target Agent.

⸻

18. Knowledge Response
Response should contain:
answer / records
owner
publisher Agent
sources
provenance
updated date
confidence where applicable
visibility
Do not return hidden reasoning.

⸻

19. Provenance
Externally shared knowledge should preserve provenance.
At minimum:
owner
publisher
source
updatedAt
record type
Where available:
original source
evidence
confidence
The receiving Agent should be able to distinguish:
Jay explicitly published this
from:
Sofie generated this response

⸻

20. Query Receipts
Both sides should have receipts.
Sender:
Asked
Jay / Sofie

Topic
Software Factory Verification

Returned
7 published records
Receiver:
Sarah / Ava queried:
Software Factory Verification

Published records shared:
7

Private records shared:
0

⸻

21. Disclosure Receipt
Relay should record the IDs/categories of information disclosed.
Do not unnecessarily duplicate the full knowledge content into Relay’s audit database.
Prefer:
view ID
record references
record types
count
policy
over complete content.

⸻

22. Minimal Relay Data Principle
Relay should know:
who
asked whom
for what
under what authority
what category was returned
when
Relay should not need to permanently store:
the entire answer
the entire Knowledge record
private source content
unless explicitly required for delivery and retention policy.

⸻

23. Grants
Create a first-class Relay Grant.
Conceptually:
RelayGrant

id

grantorOwnerId
grantorAgentId?

granteeOwnerId?
granteeAgentId?

capability

resource

scope

conditions

createdAt
expiresAt?

status

⸻

24. Capability-Based Grants
Do not create only generic:
canContact = true
Use capabilities.
Initial:
knowledge.query
message.send
artifact.share
work.request
Future:
work.delegate
collaboration.join

⸻

25. Knowledge Grant
Example:
Grant

Grantee
Sarah / Ava

Capability
knowledge.query

Resource
Jay / Software Factory Knowledge

Scope
PUBLIC + explicitly shared records

Expiration
None

Rate limit
100 queries/day

⸻

26. Message Grant
Separate from knowledge access.
message.send
does not imply:
knowledge.query
and vice versa.

⸻

27. Work Request Grant
Likewise:
work.request
is separate.
An Agent allowed to ask questions should not automatically be able to consume another owner’s compute/resources.

⸻

28. Delegation Grant
Future:
work.delegate
should be stronger than:
work.request
Delegation may permit one Agent to assign bounded work directly to another Agent.
Do not implement unrestricted delegation in V1.

⸻

29. Grant Conditions
Prepare for conditions such as:
expiration
rate limit
cost limit
time window
allowed topics
allowed resource
approval required
Do not overbuild the policy language initially.
Use typed conditions.

⸻

30. Revocation
Every grant must be revocable.
Revocation should immediately prevent new requests.
In-flight behavior should be explicitly defined.
Recommended:
new work denied
existing knowledge query may finish if already authorized
long-running delegated work stops/rechecks policy at next checkpoint

⸻

31. Agent Discovery
Build discovery after basic knowledge query works.
Agents may publish a discovery profile.
Example:
Sofie

Owner
Jay

Topics
AI software factories
FDLC
Agent governance

Capabilities
knowledge.query
message.receive

Published collections
Software Factory Knowledge
FDLC

⸻

32. Discovery Privacy
Discovery is opt-in.
Owners may choose:
Hidden
Contacts only
Network
Public
Do not make every registered Relay Agent globally discoverable.

⸻

33. Expertise Discovery
Relay should eventually support:
Find an Agent/person who has published expertise about X.
Discovery should use published metadata.
Do not search private Knowledge to determine expertise.

⸻

34. Agent Profile
Agent discovery profile may include:
Agent name
Owner display name
Description
Topics
Capabilities
Published collections
Verification status
Do not expose:
private capabilities
private accounts
private Goals
private Agent roster

⸻

35. Messaging Protocol
After Knowledge Query, implement:
message.send
Message:
from
to
subject?
body
conversationId?
replyTo?
createdAt
Messages must be authenticated and authorized.

⸻

36. Inbox
Relay should provide an Agent inbox.
States:
unread
read
accepted
rejected
expired
MyEve may surface this through:
Universal Inbox
or:
Agent Control Center → External

⸻

37. Conversation Threads
Support cross-Agent conversation threads.
Do not assume all communication is stateless.
Conceptually:
RelayConversation
  participants
  messages
  createdAt
  status
Retention policy should be explicit.

⸻

38. Message Content Retention
Prefer minimal Relay retention.
Possible model:
Relay stores encrypted/durable messages until delivered
then retains only metadata/receipt
or configurable retention.
Relay review should determine the simplest trustworthy approach.

⸻

39. Work Requests
Introduce:
work.request
Example:
Sofie → Ava

Request:
Research marketing positioning for MyEve

Expected output:
Brief

Budget:
20 minutes

Deadline:
Tomorrow

Context:
attached published artifacts

⸻

40. Work Request ≠ Delegation
Work request means:
Would your Agent perform this work?
The receiving owner/Agent may:
accept
reject
request approval
Delegation means pre-authorized work assignment.
Keep them separate.

⸻

41. Cross-Owner Approval
Default consequential cross-owner work should require receiving-owner policy.
Example:
Sofie requests Ava perform research
        ↓
Sarah policy
        ↓
Auto-accept research requests from Jay?
        ↓
Yes / Approval / Deny

⸻

42. Request Budget
Work requests should include bounded resources.
Potential:
maximum runtime
maximum cost
maximum model steps
maximum delegated workers
Do not permit unbounded external compute consumption.

⸻

43. Work Result
A completed external work request should return:
status
summary
artifacts
evidence
cost
provider receipts where relevant
Do not return hidden reasoning.

⸻

44. External Run Identity
Relay should have a durable request identity.
MyEve may map:
RelayRequest
      ↕
MyEve Run
Relay should not own MyEve’s internal Run model.

⸻

45. Cross-Agent Artifacts
Support:
artifact.share
Metadata:
name
type
size
checksum
owner
visibility
expiration
Do not automatically make owner files public.

⸻

46. Artifact Transfer
Prefer signed, expiring retrieval rather than copying every artifact permanently into Relay.
Relay authorizes access.
Storage may remain with the owner’s platform/provider.

⸻

47. External Requests in MyEve Control Center
MyEve should eventually surface:
AGENT CONTROL CENTER

External
Views:
Incoming
Outgoing
Waiting
Completed
Denied
Example:
Ava / Sarah

Request
Query published FDLC knowledge

Policy
Allowed automatically

Shared
7 records

Private records
0

⸻

48. External Approval
Example:
Ava wants Sofie to perform work

Requested:
Analyze this architecture

Expected output:
Review

Estimated cost:
$0.18

Access requested:
Published Software Factory Knowledge

[Approve]
[Reject]

⸻

49. MyEve Sharing UI
MyEve owns owner-facing sharing configuration.
Recommended:
Manage → Sharing
or:
Manage → Relay
Sections:
Published Knowledge
Who Can Contact My Agent
Shared With Me
External Activity
Relay Connection

⸻

50. Published Knowledge UI
Example:
PUBLISHED KNOWLEDGE

Software Factories
Public
137 records

FDLC
Public
42 records

MyEve Architecture
Shared with Sarah

Work
Private

Personal
Private

⸻

51. Publish Flow
Owner selects:
Knowledge collection / records
       ↓
Visibility
       ↓
Allowed audience
       ↓
Provenance policy
       ↓
Preview
       ↓
Publish
Show exactly what becomes externally queryable.

⸻

52. Publication Preview
Before publishing:
42 records will become PUBLIC

Types
31 Facts
7 Insights
4 Resources

Excluded
Private Memory
Conversations
Goals
Private Sources

[Publish]

⸻

53. Unpublish
Owner can revoke publication.
New queries fail immediately.
Existing external copies cannot necessarily be erased.
Explain that distinction.
Relay should revoke future access.

⸻

54. Share With Person
Support:
Share collection with Sarah
MyEve resolves Sarah’s Relay identity.
Relay creates/updates the appropriate grant.

⸻

55. Share With Agent
Support more granular:
Share with Sarah's Ava
Agent-level grants should not automatically apply to every Agent Sarah owns.

⸻

56. Owner vs Agent Grants
Allow:
Owner-level grant
or:
Agent-specific grant
Owner-level grants may permit the receiving owner to choose which authorized Agent uses the capability.
Document semantics carefully.

⸻

57. Private-by-Default
All MyEve Knowledge and Memory remain:
PRIVATE
unless explicitly published/shared.
Do not migrate existing records into PUBLIC automatically.

⸻

58. Publication Metadata
Do not mutate canonical Knowledge semantics merely to support Relay.
Prefer a separate publication projection:
Knowledge Record
       ↓
Publication Entry
This allows:
same Fact
PRIVATE normally
SHARED through one view
PUBLIC through another
without changing its canonical ownership.

⸻

59. Collection Model
Support publishable collections.
Example:
Software Factory Knowledge
contains references to:
Facts
Insights
Resources
Documents
Collections simplify owner sharing.

⸻

60. Dynamic vs Snapshot Collections
Decide explicitly whether a collection is:
SNAPSHOT
or:
DYNAMIC
Snapshot:
records fixed at publication time
Dynamic:
matching future
60. Dynamic vs Snapshot Collections
A Published Knowledge Collection must explicitly declare whether it is:
SNAPSHOT
or:
DYNAMIC
Snapshot
The records included at publication time remain fixed.
Useful for:
research packages
published reports
project handoffs
versioned expertise bundles
Dynamic
Future Knowledge records matching the collection policy may become available.
Example:
Collection:
FDLC Public Knowledge

Rule:
approved Knowledge
topic = FDLC
visibility = publishable
Dynamic collections require stronger owner controls.
Do not allow arbitrary new Knowledge to become externally visible merely because an LLM assigns a topic.

⸻

61. Dynamic Publication Guardrail
Dynamic publication requires deterministic eligibility.
Conceptually:
Knowledge Record
      ↓
Explicit publication eligibility
      ↓
Collection rule
      ↓
Published View
Not:
Agent thinks record is related
      ↓
Automatically public
Future records should enter a dynamic collection only when their publication metadata explicitly permits it.

⸻

62. Publication Versioning
Published Views and Collections should be versioned.
Track:
version
createdAt
updatedAt
publisher
policy
record membership
This allows an external Agent to know:
I queried version 12 of Jay's FDLC collection.

⸻

63. Publication Changes
When published content changes:
record added
record removed
record corrected
record superseded
visibility changed
increment the publication version.
Do not silently alter the historical meaning of an existing receipt.

⸻

64. Knowledge Corrections
If MyEve Knowledge is corrected:
Published Fact V1
      ↓
Owner corrects canonical Knowledge
      ↓
Fact V1 superseded
      ↓
Published View V2
Future queries receive the corrected active state.
Historical Relay receipts may continue to reference the version originally disclosed.

⸻

65. Forget / Delete Interaction
If an owner Forget/Delete operation removes canonical Knowledge that was published:
Canonical Knowledge deleted
      ↓
Publication reference invalidated
      ↓
Future queries cannot retrieve it
Relay should retain only the minimum audit metadata required to explain that a disclosure previously occurred.
Do not retain deleted knowledge content merely for convenience.

⸻

66. Publication Revocation
Support:
ACTIVE
PAUSED
REVOKED
EXPIRED
A revoked publication immediately denies new queries.

⸻

67. Grant Revocation vs Publication Revocation
Keep these separate.
Publication revoked
→ nobody can query it

Grant revoked
→ that grantee can no longer query it
Other valid grants may remain active.

⸻

68. Knowledge Query Modes
Support two bounded query modes initially.
Record Retrieval
Find published records about X
Returns authorized structured records.
Answer Query
What has Jay published about X?
The publisher Agent may synthesize an answer from authorized published records.
Record retrieval should be the simpler foundational protocol.

⸻

69. Retrieval Before Synthesis
For synthesized responses:
External query
      ↓
Relay authorization
      ↓
Published View
      ↓
Authorized retrieval
      ↓
Publisher Agent synthesis
      ↓
Response + citations
The publisher Agent must not expand retrieval into private context merely because it would improve the answer.

⸻

70. External Context Boundary
An external query creates an explicit context boundary.
Allowed context:
query
published records
public/shared sources
explicit request metadata
Not automatically allowed:
private Memory
private conversations
private Goals
email
calendar
private Workspace
unpublished Knowledge

⸻

71. Publisher Agent Policy
The publisher Agent should receive an explicit instruction such as:
You are answering an external Relay query.

Use only the Published Knowledge View authorized
for this request.

Do not retrieve private owner context.

Return provenance for material claims.
This should be enforced by capability/context boundaries, not instructions alone.

⸻

72. Relay Request Envelope
Create a canonical request envelope.
Conceptually:
RelayRequestEnvelope {
  id

  protocol
  version

  caller
  target

  capability
  resource

  conversationId?

  createdAt
  expiresAt?

  idempotencyKey

  payload

  authorizationContext
}
Do not expose internal Relay authorization secrets inside the payload.

⸻

73. Protocol Versioning
Relay communication protocols must be versioned.
Example:
relay.agent.v1
relay.knowledge.v1
or equivalent.
Do not assume today’s message schema will remain permanent.

⸻

74. Idempotency
Every mutating/request operation should support idempotency.
Examples:
message.send
work.request
artifact.share
grant.create
publication.create
A client retry must not create duplicate requests/messages/grants.

⸻

75. Request Expiration
Requests may expire.
Examples:
approval request
work request
artifact access
temporary grant
Expired requests cannot be executed.

⸻

76. Request Status
Normalize request lifecycle.
Recommended:
CREATED
AUTHORIZED
WAITING
DELIVERED
ACCEPTED
RUNNING
COMPLETED
REJECTED
DENIED
FAILED
CANCELLED
EXPIRED
Not every protocol uses every state.

⸻

77. Delivery Semantics
Relay should provide durable delivery semantics.
At minimum:
accepted by Relay
delivered to target
acknowledged by target
Do not equate:
Relay accepted request
with:
Target Agent processed request

⸻

78. Delivery Attempts
Persist bounded delivery attempts.
Track:
attempt
startedAt
completedAt
result
nextRetryAt
Use bounded retry policy.
Do not retry indefinitely.

⸻

79. Exactly-Once Expectations
Do not promise strict exactly-once execution across external Agent platforms.
Use:
idempotency
delivery receipts
execution receipts
to provide effectively-once behavior where possible.

⸻

80. Agent Availability
Relay should know whether an Agent is:
ONLINE
OFFLINE
DEGRADED
PAUSED
REVOKED
UNKNOWN
Do not require permanent socket connections.
Availability may be heartbeat- or endpoint-derived.

⸻

81. Offline Delivery
Messages and requests should be capable of waiting for an offline Agent.
Example:
Sofie sends request
      ↓
Ava offline
      ↓
Relay stores bounded pending request
      ↓
Ava returns
      ↓
Delivery
Respect expiration.

⸻

82. Agent Endpoint
Agent platforms need a Relay-compatible endpoint.
Conceptually:
POST /relay/v1/inbox
Exact API should follow Relay conventions.
Endpoint responsibilities:
verify Relay authenticity
accept envelope
validate target Agent
enqueue locally
return receipt

⸻

83. Relay Authenticity
Receiving Agent platforms must authenticate Relay itself.
Do not accept arbitrary Internet callers pretending to be Relay.
Use signed requests or equivalent server authentication.

⸻

84. Request Signing
Consider cryptographic signing for Relay → Agent delivery.
The receiving platform should verify:
issuer
audience
timestamp
request ID
payload hash
Protect against replay.

⸻

85. Replay Protection
Reject reused signed requests outside permitted idempotent replay behavior.
Use:
request ID
timestamp
nonce / idempotency key

⸻

86. Agent-to-Agent Encryption
Transport must use TLS.
Evaluate whether end-to-end message encryption between trust domains is necessary for:
shared private knowledge
messages
artifacts
Do not implement custom cryptography casually.
Use established primitives/libraries if added.
Public Knowledge does not require exotic encryption beyond normal transport/security.

⸻

87. Rate Limits
Apply rate limits at multiple dimensions:
per Agent
per owner
per target
per capability
per Published View
Example:
Ava
100 public knowledge queries/day
10 work requests/day

⸻

88. Abuse Protection
Protect against:
spam
query flooding
compute exhaustion
oversized payloads
repeated denied requests
artifact abuse
discovery scraping
Relay should be able to:
throttle
block
revoke

⸻

89. Owner Blocking
Owners must be able to block:
Agent
Owner
Organization — future
Blocked identities cannot:
message
query shared resources
request work
Public discovery behavior after blocking should be explicitly defined.
Recommended:
blocked identity cannot interact with blocker

⸻

90. Trust Relationships
Prepare a simple trust relationship model.
Potential:
UNKNOWN
CONTACT
TRUSTED
BLOCKED
Do not create social-network complexity in V1.
Trust level may influence default policies but must not silently grant broad capabilities.

⸻

91. Contacts
Relay may support an owner-controlled contact list.
Example:
Sarah
Relay identity verified
Trusted contact
This makes policies such as:
Contacts may message me
possible.

⸻

92. Identity Verification
Relay should distinguish:
registered
verified
where verification is meaningful.
Do not overstate identity assurance.
Potential verification mechanisms can be added later.

⸻

93. Agent Ownership Verification
Relay must always know which owner controls a registered Agent.
An Agent cannot self-claim:
I belong to Jay
without owner-bound registration.

⸻

94. Agent Replacement
Agents are replaceable.
If Jay replaces Sofie:
Old Sofie
      ↓
revoked

New Sofie
      ↓
new Agent identity
Owner-level grants may continue if policy permits.
Agent-specific grants should not automatically transfer.
This preserves the principle:
Identity and authority are durable; Agent implementations are replaceable.

⸻

95. Agent Rotation
Support credential rotation without changing Agent identity.
Track:
credential version
issuedAt
revokedAt

⸻

96. Multiple Agents per Owner
Relay must support:
Jay
├── Sofie
├── Research Agent
└── Developer Agent
Do not assume one Agent per owner.

⸻

97. Primary Agent
Agent platforms may designate a primary Agent.
Relay may expose:
primaryAgent
for convenience.
But Relay should not require every platform to have one.

⸻

98. External Agent Compatibility
Relay should support non-MyEve Agents.
Target future compatibility:
MyEve
OpenClaw
Claude Code wrapper
Codex wrapper
Enterprise Agent
Custom MCP Agent
Do not require MyEve database schemas or Goal OS to participate.

⸻

99. Relay SDK
Create a future seam for a lightweight Relay SDK.
Conceptually:
registerAgent
listAgents
discover
queryKnowledge
sendMessage
requestWork
shareArtifact
listInbox
respond
Do not build a large SDK until the HTTP protocol stabilizes.

⸻

100. MCP Surface
Relay may expose capabilities through MCP.
Potential tools:
relay_discover_agents
relay_query_knowledge
relay_send_message
relay_request_work
relay_get_request
relay_respond
MCP is an adapter to Relay.
It is not the canonical protocol/data model.

⸻

101. MyEve Relay Adapter
MyEve should eventually have a Relay adapter.
Responsibilities:
register owner Agents
publish Knowledge Views
receive Relay requests
map requests into MyEve Inbox/Control Center
query external published Knowledge
send messages
submit work requests
Keep this adapter isolated from MyEve canonical Knowledge and Run repositories.

⸻

102. External Knowledge in MyEve
Knowledge retrieved from another owner should not automatically become trusted canonical Knowledge.
Initial behavior:
External Knowledge
      ↓
used as sourced context
Optional future:
Owner / Agent reviews
      ↓
promote into MyEve Knowledge
Preserve provenance.

⸻

103. External Knowledge Provenance
If imported/promoted:
Source owner
Source Agent
Relay publication
Original record reference
Retrieved date
Publication version
must be retained.

⸻

104. External Knowledge Freshness
A receiving Agent should understand:
publishedAt
updatedAt
publicationVersion
Do not assume externally retrieved Knowledge remains current forever.

⸻

105. External Knowledge Revocation
If the source later revokes publication:
Relay prevents future retrieval.
A receiving owner may already possess information legitimately disclosed earlier.
Do not claim Relay can erase knowledge already delivered to another trust domain.
This must be clear in the sharing UI.

⸻

106. Share Warning
Before publishing private-to-shared/public information, explain:
Once another owner or Agent receives shared information, revoking access prevents future retrieval but cannot guarantee deletion of copies already received.
Keep this concise but explicit.

⸻

107. Usage Policy per Publication
Published Views may specify allowed usage metadata.
Examples:
personal-use
collaboration
public-reference
Do not attempt full legal licensing infrastructure in V1.
Preserve a future seam.

⸻

108. Attribution Policy
Owners may require attribution.
Example:
Attribution:
Jay West via Sofie
Responses should carry that metadata.

⸻

109. Public Knowledge Caching
Relay may eventually cache PUBLIC Knowledge for performance.
Do not do this in V1 unless necessary.
If caching is added:
short TTL
publication version
revocation invalidation
must be respected.
Never cache private/shared Knowledge beyond what delivery requires without explicit design.

⸻

110. Search Index
Relay discovery may maintain an index of:
Agent profile
Published View name
topics
descriptions
Do not index private record content.
For PUBLIC collections, full-content indexing should be a separate explicit owner choice.

⸻

111. Knowledge Discovery Query
Future:
Find published knowledge about:
agent verification
Relay returns:
Jay / Sofie
Software Factory Knowledge

Sarah / Ava
Agent Evaluation Knowledge
The Agent can then query specific views.

⸻

112. Discovery Ranking
Rank based on deterministic/public metadata such as:
topic relevance
publication freshness
source count
owner-provided description
Do not create opaque “expert reputation scores” in V1.

⸻

113. External Agent Requests in Control Center
MyEve Control Center should consume Relay request states.
Example:
EXTERNAL

Incoming                    2
Outgoing                    1
Needs Approval              1
Completed                  14
Relay remains canonical for cross-owner request identity.
MyEve remains canonical for local execution.

⸻

114. Incoming Knowledge Query
Example:
INCOMING QUERY

From
Sarah / Ava

Asking
What has Jay published about FDLC verification?

Published View
FDLC

Policy
Auto-allowed

Disclosure
6 Facts
2 Insights
3 Resources

Private Knowledge
Not accessible

⸻

115. Incoming Work Request
Example:
WORK REQUEST

From
Sarah / Ava

Request
Review this software-factory architecture

Expected output
Architecture review

Estimated local cost
$0.30

Requested access
Published FDLC Knowledge

[Accept]
[Reject]

⸻

116. Outgoing Request
Example:
OUTGOING

To
Sarah / Ava

Request
Research marketing-engineering positioning

Status
Working

Requested
12:42 PM

Budget
$0.25

[View]
[Cancel]

⸻

117. External Execution
If MyEve accepts a work request:
Relay Work Request
      ↓
MyEve authorization
      ↓
Goal? / Task?
      ↓
Run
      ↓
Agent / Role
      ↓
Evidence
      ↓
Result
      ↓
Relay response
Do not let Relay directly execute MyEve tools.
Relay requests work; MyEve’s local control plane executes it.

⸻

118. Local Authority Wins
Even if Relay authorizes:
work.request
MyEve may still deny a requested local capability.
Example:
Relay:
Sarah may request research.

Request:
Research private Gmail.

MyEve:
DENY — Gmail is outside the granted context.
Cross-owner authorization never overrides local owner policy.

⸻

119. Double Authorization Boundary
For cross-owner consequential work:
Relay authorization
       +
Local MyEve authorization
       =
Execution allowed
Both must permit.

⸻

120. Cross-Owner Consequential Actions
Initially prohibit external work requests from causing actions such as:
send owner's email
spend owner's money
modify owner's production systems
delete owner's data
publish as owner
even when a work request is accepted.
Later these may require explicit owner approval.
Keep V1 conservative.

⸻

121. External Research
Ideal first work-request use case:
research
analysis
summarization
artifact generation
These provide value without broad external authority.

⸻

122. Shared Project Seam
Future collaboration may introduce:
Shared Project
where multiple owners explicitly contribute:
Knowledge
Artifacts
Agents
Do not implement shared Projects in the first federation release.
Preserve a seam.

⸻

123. Collaboration Session
Future:
Jay / Sofie
Sarah / Ava
Mike / Atlas
may join a bounded collaboration.
This is distinct from arbitrary group chat.
A collaboration should define:
purpose
participants
shared resources
capabilities
duration
budget

⸻

124. Agent Groups Across Owners
Do not implement cross-owner Agent Groups initially.
MyEve Agent Groups remain owner-local.
Relay collaboration can later coordinate multiple trust domains without merging ownership.

⸻

125. Public Agent Endpoint Abuse
Never expose a raw MyEve Agent chat endpoint publicly and rely on prompts to prevent disclosure.
All external communication must pass:
Relay identity
      ↓
authorization
      ↓
publication/request scope
      ↓
MyEve local authorization

⸻

126. Prompt Injection Boundary
Externally supplied:
queries
messages
documents
artifacts
are untrusted input
