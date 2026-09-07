---
title: "S (Part 55 - Evaluating Agent Memory & Knowledge)"
source: apple-notes
source_id: x-coredata://A060B05D-4894-4B91-8A8E-363EB15CD0A8/ICNote/p7512
captured_at: 2026-09-05T18:22:18.000Z
type_hint: note
tags: [quick-capture, source-apple-notes]
canonical_hash: 82dcc13da31e8261fdbd4be35dd6fcb48835e7a0a6b183b3b657682a9e13db5e
---

S

𝗣𝗮𝗿𝘁 𝟱𝟱 | 𝗘𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗻𝗴 𝗔𝗴𝗲𝗻𝘁 𝗠𝗲𝗺𝗼𝗿𝘆 & 𝗞𝗻𝗼𝘄𝗹𝗲𝗱𝗴𝗲

An agent can have access to the right memory and knowledge sources and still produce the wrong answer.

The important question is not:

“Can the agent retrieve information?”

It is:

𝗗𝗶𝗱 𝘁𝗵𝗲 𝗮𝗴𝗲𝗻𝘁 𝗿𝗲𝘁𝗿𝗶𝗲𝘃𝗲 𝗮𝗻𝗱 𝘂𝘀𝗲 𝘁𝗵𝗲 𝗿𝗶𝗴𝗵𝘁 𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻?

Consider an enterprise support agent.

A customer says:

“We had the same equipment issue last quarter. Can you recommend what we should do this time?”

The agent may need to reason over several pieces of context:

• The current support conversation
• The customer's previous interactions
• Relevant equipment history
• Product documentation
• Current support policies

The challenge is that having this information available does not guarantee that the agent will use the correct information.

For example, the customer's previous case may contain a workaround that solved the problem temporarily.

The product documentation may contain a newer procedure.

The current support policy may have changed the recommended action.

A good evaluation should therefore test whether the agent uses the 𝗿𝗶𝗴𝗵𝘁 𝗰𝗼𝗻𝘁𝗲𝘅𝘁, not simply whether it produces a plausible answer.

I might define an evaluation case like this:

test_case = {
"query": "Recommend how to handle this
equipment issue.",
"expected_facts": [
"Use current support procedure",
"Consider previous customer history",
"Do not rely on outdated workaround"
]
}

Then evaluate the response against those expectations:

result = evaluate(
agent_response,
expected_facts=test_case["expected_facts"]
)

The result might look like:

{
"memory_used": True,
"knowledge_used": True,
"current_information_used": False,
"score": 0.62
}

The response may sound completely reasonable to a customer.

But the evaluation reveals an important problem:

𝗧𝗵𝗲 𝗮𝗴𝗲𝗻𝘁 𝗿𝗲𝗺𝗲𝗺𝗯𝗲𝗿𝗲𝗱 𝘁𝗵𝗲 𝗿𝗶𝗴𝗵𝘁 𝗰𝗮𝘀𝗲, 𝗯𝘂𝘁 𝗿𝗲𝗹𝗶𝗲𝗱 𝗼𝗻 𝗼𝘂𝘁𝗱𝗮𝘁𝗲𝗱 𝗸𝗻𝗼𝘄𝗹𝗲𝗱𝗴𝗲.

That is very different from a simple retrieval failure.

For an agent, I want to evaluate at least three things:

𝗥𝗲𝗰𝗮𝗹𝗹
Did it retrieve the relevant memory or knowledge?

𝗥𝗲𝗹𝗲𝘃𝗮𝗻𝗰𝗲
Was the retrieved information actually relevant to the current situation?

𝗨𝘀𝗮𝗴𝗲
Did the agent use the retrieved information correctly in its response?

Microsoft Foundry supports evaluations for agent behavior and provides evaluation capabilities that can be used to assess agent responses and establish performance baselines.

The key lesson for me is:

𝗚𝗼𝗼𝗱 𝗺𝗲𝗺𝗼𝗿𝘆 𝗮𝗻𝗱 𝗸𝗻𝗼𝘄𝗹𝗲𝗱𝗴𝗲 𝗮𝗿𝗲 𝗻𝗼𝘁 𝗲𝗻𝗼𝘂𝗴𝗵.

We also need to evaluate whether the agent uses them correctly in context.   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
2   Like  Comment      Repost       Send          
 Feed post number 2 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 11h •        𝗣𝗮𝗿𝘁 𝟱𝟰 | 𝗛𝘂𝗺𝗮𝗻 𝗥𝗲𝘃𝗶𝗲𝘄 𝗳𝗼𝗿 𝗔𝗜 𝗔𝗴𝗲𝗻𝘁 𝗘𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗼𝗻

Automated evaluation is important for AI agents, but there are cases where I would still want a human to review the result. Consider a customer support agent handling a complaint like:
“Several of our customers received their equipment late this month. Find out what happened and recommend what we should do.”

There is no single deterministic function for this request.

The agent may need to:

Understand the complaint
↓
Identify affected orders
↓
Look at delivery information
↓
Check inventory or fulfillment data
↓
Look for common patterns
↓
Determine likely causes
↓
Recommend an appropriate response
↓
Prepare a summary for the support team

This is where an agent actually adds value. But how do we know whether the agent's final response is good? This is where 𝗵𝘂𝗺𝗮𝗻 𝗿𝗲𝘃𝗶𝗲𝘄 becomes useful.

A human reviewer could assess questions such as:

• Did the response correctly understand the customer's problem?
• Was the explanation supported by the available information?
• Did the agent identify the important affected customers?
• Was the recommended action reasonable?
• Was anything important missing?
• Would this response be useful to a support manager?

For example, an agent might correctly identify the delayed orders but incorrectly conclude that a warehouse shortage was the main cause.

An automated evaluator may give the response a reasonable score because the task was completed and the response was well structured.

A domain expert may look at the same response and say:
“The conclusion is plausible, but the evidence does not support it.”

That feedback is extremely valuable.

A simple way to represent the human evaluation is:
evaluation = {
"accurate": True,
"useful": False,
"recommendation_appropriate": False,
"comments": "Cause was plausible but not
sufficiently supported by the data."
}

The important point is that human evaluation is not about replacing automated evaluation. It provides another perspective when quality depends on context, domain knowledge, judgment, or nuances that are difficult to capture with a fixed metric. 

In Microsoft Foundry, human evaluation can be configured using evaluation templates. Reviewers can provide ratings, multiple-choice responses, or free-form feedback for agent responses.

The resulting human feedback can then help answer a more important question than “Did the agent run successfully?”

𝗗𝗶𝗱 𝘁𝗵𝗲 𝗮𝗴𝗲𝗻𝘁 𝗽𝗿𝗼𝗱𝘂𝗰𝗲 𝗮 𝗿𝗲𝘀𝗽𝗼𝗻𝘀𝗲 𝘁𝗵𝗮𝘁 𝗮 𝗵𝘂𝗺𝗮𝗻 𝘄𝗼𝘂𝗹𝗱 𝘁𝗿𝘂𝘀𝘁 𝗮𝗻𝗱 𝘂𝘀𝗲?

For agentic systems, that distinction matters.   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
1   Like  Comment      Repost       Send          
 Feed post number 3 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 1d •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | Part 53: 𝗖𝗼𝗺𝗽𝗮𝗿𝗶𝗻𝗴 𝗔𝗜 𝗔𝗴𝗲𝗻𝘁 𝗘𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗼𝗻 𝗥𝗲𝘀𝘂𝗹𝘁𝘀 & 𝗕𝗮𝘀𝗲𝗹𝗶𝗻𝗲𝘀

Running an evaluation tells us how an agent is performing. But there is another important question:

𝗜𝘀 𝘁𝗵𝗲 𝗻𝗲𝘄 𝘃𝗲𝗿𝘀𝗶𝗼𝗻 𝗼𝗳 𝘁𝗵𝗲 𝗮𝗴𝗲𝗻𝘁 𝗮𝗰𝘁𝘂𝗮𝗹𝗹𝘆 𝗯𝗲𝘁𝘁𝗲𝗿?

This is where 𝗯𝗮𝘀𝗲𝗹𝗶𝗻𝗲𝘀 and 𝗲𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗼𝗻 𝗿𝘂𝗻𝘀 become useful.

Consider an enterprise Order Agent.

We have a validated version of the agent, Version 1.

We run the same evaluation dataset and get:

Task completion: 88%
Tool selection: 92%
Response quality: 85%

These results become our 𝗯𝗮𝘀𝗲𝗹𝗶𝗻𝗲.

Now we modify the agent instructions and run the same evaluation dataset again.

Version 2:

Task completion: 93%
Tool selection: 89%
Response quality: 91%

At first glance, Version 2 looks better.

But notice what happened.

Task completion improved from 88% to 93%.
Response quality improved from 85% to 91%.
However, tool selection dropped from 92% to 89%.

So simply looking at one overall score can hide an important regression.

𝗧𝗵𝗲 𝗴𝗼𝗮𝗹 𝗶𝘀 𝗻𝗼𝘁 𝗷𝘂𝘀𝘁 𝘁𝗼 𝗴𝗲𝘁 𝗮 𝗵𝗶𝗴𝗵𝗲𝗿 𝘀𝗰𝗼𝗿𝗲. 𝗪𝗲 𝗻𝗲𝗲𝗱 𝘁𝗼 𝘂𝗻𝗱𝗲𝗿𝘀𝘁𝗮𝗻𝗱 𝘄𝗵𝗮𝘁 𝗰𝗵𝗮𝗻𝗴𝗲𝗱.

A simple evaluation workflow looks like this:

Evaluation Dataset
↓
Run Version 1
↓
Record Baseline Results
↓
Modify Agent
↓
Run Version 2
↓
Compare Evaluation Results
↓
Identify Improvements / Regressions

The comparison can be automated.

Sample Python:

test_cases = [
("Check order 1001", "get_order_status"),
("Cancel order 1002", "cancel_order"),
("Check order 1003", "get_order_status")
]

baseline = []

for prompt, expected_tool in test_cases:
result = run_agent_v1(prompt)
baseline.append(result)

current = []

for prompt, expected_tool in test_cases:
result = run_agent_v2(prompt)
current.append(result)

compare(baseline, current)

In a real system, the comparison would include evaluator scores and other relevant results for each test case.

The important point is that the 𝗯𝗮𝘀𝗲𝗹𝗶𝗻𝗲 gives us a reference point.

Without a baseline, saying "the new agent scored 90%" tells us very little.

With a baseline, we can ask:

Did it improve?
Did something regress?
Which evaluation dimensions changed?

𝗞𝗲𝘆 𝘁𝗮𝗸𝗲𝗮𝘄𝗮𝘆:

𝗔𝗻 𝗲𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗼𝗻 𝗿𝘂𝗻 𝘁𝗲𝗹𝗹𝘀 𝘂𝘀 𝗵𝗼𝘄 𝘁𝗵𝗲 𝗮𝗴𝗲𝗻𝘁 𝗽𝗲𝗿𝗳𝗼𝗿𝗺𝗲𝗱. 𝗔 𝗯𝗮𝘀𝗲𝗹𝗶𝗻𝗲 𝗹𝗲𝘁𝘀 𝘂𝘀 𝘁𝗲𝗹𝗹 𝘄𝗵𝗲𝘁𝗵𝗲𝗿 𝗶𝘁 𝗽𝗲𝗿𝗳𝗼𝗿𝗺𝗲𝗱 𝗯𝗲𝘁𝘁𝗲𝗿 𝗼𝗿 𝘄𝗼𝗿𝘀𝗲 𝗮𝗳𝘁𝗲𝗿 𝗮 𝗰𝗵𝗮𝗻𝗴𝗲.

hashtag #AI500 hashtag #AIAgents hashtag #AgentEvaluation hashtag #MicrosoftFoundry hashtag #GenerativeAI hashtag #AIEngineering   Activate to view larger image, 
￼
    Activate to view larger image,    Like  Comment      Repost       Send          
 Feed post number 4 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 1d •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | Part 52: 𝗔𝗴𝗲𝗻𝘁 𝗘𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗼𝗻 𝗧𝗲𝘀𝘁 𝗗𝗮𝘁𝗮𝘀𝗲𝘁𝘀 & 𝗘𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗼𝗻 𝗥𝘂𝗻𝘀

If I want to evaluate an AI agent properly, running it once with one prompt is not enough. I need a collection of realistic test scenarios that I can run repeatedly. That is where an 𝗲𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗼𝗻 𝘁𝗲𝘀𝘁 𝗱𝗮𝘁𝗮𝘀𝗲𝘁 becomes useful.

𝗖𝗼𝗻𝘀𝗶𝗱𝗲𝗿 𝗮𝗻 𝗼𝗿𝗱𝗲𝗿 𝗽𝗿𝗼𝗰𝗲𝘀𝘀𝗶𝗻𝗴 𝗮𝗴𝗲𝗻𝘁.

Instead of manually testing:
"Check the status of order 1001."

I can create a dataset containing multiple scenarios:

Test 1
Prompt: Check the status of order 1001
Expected tool: get_order_status
Expected order_id: 1001

Test 2
Prompt: Cancel order 1002
Expected tool: cancel_order
Expected order_id: 1002

Test 3
Prompt: Check the status of order 1003
Expected tool: get_order_status
Expected order_id: 1003

Now the agent can be evaluated against the complete dataset.

Conceptually:

𝗘𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗼𝗻 𝗗𝗮𝘁𝗮𝘀𝗲𝘁
↓
𝗥𝘂𝗻 𝗔𝗜 𝗔𝗴𝗲𝗻𝘁
↓
𝗖𝗮𝗽𝘁𝘂𝗿𝗲 𝗥𝘂𝗻 𝗥𝗲𝘀𝘂𝗹𝘁𝘀
↓
𝗥𝘂𝗻 𝗘𝘃𝗮𝗹𝘂𝗮𝘁𝗼𝗿𝘀
↓
𝗘𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗼𝗻 𝗥𝗲𝘀𝘂𝗹𝘁𝘀

A simple representation in Python could be:

test_cases = [
("Check order 1001", "get_order_status", 1001),
("Cancel order 1002", "cancel_order", 1002),
("Check order 1003", "get_order_status", 1003)
]

for prompt, expected_tool, expected_id in test_cases:
result = run_agent(prompt)

assert result.tool == expected_tool
assert result.arguments["order_id"] == expected_id

The important part here is not the Python itself.

It is the idea of turning individual test scenarios into a 𝗿𝗲𝗽𝗲𝗮𝘁𝗮𝗯𝗹𝗲 𝗲𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗼𝗻.

An 𝗲𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗼𝗻 𝗿𝘂𝗻 takes the dataset and executes the agent against those test cases.

For example:

Dataset: Order Agent Tests
Test cases: 100
Agent: Order Processing Agent
Run: Evaluation Run

The resulting run can contain the evaluation results for those scenarios.

This is much more useful than manually checking a few conversations because the same structured dataset can be used consistently. In Microsoft Foundry, evaluation workflows allow us to provide test data, run evaluations against an agent or model, and inspect the resulting evaluation metrics.

𝗞𝗲𝘆 𝘁𝗮𝗸𝗲𝗮𝘄𝗮𝘆:

An AI agent should not be evaluated from a handful of ad-hoc prompts.

𝗘𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗼𝗻 𝘁𝗲𝘀𝘁 𝗱𝗮𝘁𝗮𝘀𝗲𝘁𝘀 𝘁𝘂𝗿𝗻 𝗮𝗴𝗲𝗻𝘁 𝗲𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗼𝗻 𝗶𝗻𝘁𝗼 𝗮 𝗿𝗲𝗽𝗲𝗮𝘁𝗮𝗯𝗹𝗲 𝗽𝗿𝗼𝗰𝗲𝘀𝘀.   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
1   Like  Comment      Repost       Send          
 Feed post number 5 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 1d •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | Part 51: 𝗣𝗿𝗼𝗰𝗲𝘀𝘀 & 𝗧𝗼𝗼𝗹 𝗘𝘃𝗮𝗹𝘂𝗮𝘁𝗼𝗿𝘀 𝗳𝗼𝗿 𝗔𝗜 𝗔𝗴𝗲𝗻𝘁𝘀

An AI agent may understand a user's request correctly, but that does not mean it will use its tools correctly.

Consider an order-processing agent with these tools:

get_order_status(order_id)
cancel_order(order_id)
get_customer_details(customer_id)

The user asks:
"Check the status of order 1001."

The agent should select:
get_order_status(1001)

That looks simple. But there are several ways the agent can get the tool interaction wrong.

It could select the wrong tool:
get_customer_details(1001)

It could select the correct tool but provide the wrong input:
get_order_status(10001)

It could make a technically successful call but fail to use the returned information correctly.
For example, the tool returns:
{
"order_id": 1001,
"status": "Shipped"
}
But the agent responds:
"Your order is still processing."
The API call succeeded.
The agent behavior did not.

𝗧𝗵𝗶𝘀 𝗶𝘀 𝘄𝗵𝗲𝗿𝗲 𝗣𝗿𝗼𝗰𝗲𝘀𝘀 & 𝗧𝗼𝗼𝗹 𝗘𝘃𝗮𝗹𝘂𝗮𝘁𝗼𝗿𝘀 𝗯𝗲𝗰𝗼𝗺𝗲 𝗶𝗺𝗽𝗼𝗿𝘁𝗮𝗻𝘁.

They can evaluate different parts of the tool interaction:

• 𝗧𝗼𝗼𝗹 𝗦𝗲𝗹𝗲𝗰𝘁𝗶𝗼𝗻: Did the agent choose the appropriate tool?
• 𝗧𝗼𝗼𝗹 𝗜𝗻𝗽𝘂𝘁 𝗔𝗰𝗰𝘂𝗿𝗮𝗰𝘆: Were the tool parameters correct?
• 𝗧𝗼𝗼𝗹 𝗢𝘂𝘁𝗽𝘂𝘁 𝗨𝘁𝗶𝗹𝗶𝘇𝗮𝘁𝗶𝗼𝗻: Did the agent correctly use the information returned by the tool?
• 𝗧𝗼𝗼𝗹 𝗖𝗮𝗹𝗹 𝗦𝘂𝗰𝗰𝗲𝘀𝘀: Did the tool call execute without a technical error?
• 𝗧𝗼𝗼𝗹 𝗖𝗮𝗹𝗹 𝗔𝗰𝗰𝘂𝗿𝗮𝗰𝘆: Was the overall tool call appropriate and correct?

𝗔 𝘀𝗶𝗺𝗽𝗹𝗲 𝘁𝗲𝘀𝘁 𝗰𝗼𝘂𝗹𝗱 𝗹𝗼𝗼𝗸 𝗹𝗶𝗸𝗲 𝘁𝗵𝗶𝘀:

result = run_agent("Check the status of order 1001")
assert result.tool == "get_order_status"
assert result.arguments["order_id"] == 1001
assert result.tool_success == True

We can then evaluate the individual aspects:

Tool Selection: PASS
Tool Input Accuracy: PASS
Tool Call Success: PASS
Tool Output Utilization: FAIL

This distinction matters in production.

A tool can work perfectly. The agent can still make the wrong decision about how to use the tool or how to interpret its result.

𝗞𝗲𝘆 𝘁𝗮𝗸𝗲𝗮𝘄𝗮𝘆:

For an AI agent, evaluating the tool itself is not enough. We need to evaluate 𝗵𝗼𝘄 𝘁𝗵𝗲 𝗮𝗴𝗲𝗻𝘁 𝘀𝗲𝗹𝗲𝗰𝘁𝘀, 𝗰𝗮𝗹𝗹𝘀, 𝗮𝗻𝗱 𝘂𝘀𝗲𝘀 𝘁𝗵𝗲 𝘁𝗼𝗼𝗹. …more   Activate to view larger image, 
￼
    Activate to view larger image,    Like  Comment      Repost       Send          
 Feed post number 6 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 2d •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | Part 50: 𝗦𝘆𝘀𝘁𝗲𝗺 𝗘𝘃𝗮𝗹𝘂𝗮𝘁𝗼𝗿𝘀 𝗳𝗼𝗿 𝗔𝗜 𝗔𝗴𝗲𝗻𝘁𝘀

An AI agent can return a valid-looking response and still fail at the task.

For an agent, I would ask four basic questions:

Did it understand what the user wanted?
Did it actually complete the task?
Did it follow the instructions?
Did it take a sensible path to complete the task?

These are the kinds of questions addressed by 𝗦𝘆𝘀𝘁𝗲𝗺 𝗘𝘃𝗮𝗹𝘂𝗮𝘁𝗼𝗿𝘀.

𝗖𝗼𝗻𝘀𝗶𝗱𝗲𝗿 𝗮𝗻 𝗼𝗿𝗱𝗲𝗿 𝗽𝗿𝗼𝗰𝗲𝘀𝘀𝗶𝗻𝗴 𝗮𝗴𝗲𝗻𝘁.

User:
"Cancel order 1002 and tell me whether the cancellation was successful."
Suppose the agent calls:
cancel_order(1002)
The tool executes successfully.
But the tool returns:
{
"status": "CancellationRejected",
"reason": "Order already shipped"
}
The agent responds:
"Order 1002 has been cancelled successfully."
The tool call succeeded.
The agent still failed the task.

Why?

Because completing an agent task is more than successfully executing an API call.

𝗧𝗵𝗶𝘀 𝗶𝘀 𝘄𝗵𝗲𝗿𝗲 𝘀𝘆𝘀𝘁𝗲𝗺 𝗲𝘃𝗮𝗹𝘂𝗮𝘁𝗼𝗿𝘀 𝗵𝗲𝗹𝗽.

They can evaluate aspects such as:

• 𝗜𝗻𝘁𝗲𝗻𝘁 𝗥𝗲𝘀𝗼𝗹𝘂𝘁𝗶𝗼𝗻: Did the agent understand the user's request?
• 𝗧𝗮𝘀𝗸 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗶𝗼𝗻: Did the agent accomplish the requested task?
• 𝗧𝗮𝘀𝗸 𝗔𝗱𝗵𝗲𝗿𝗲𝗻𝗰𝗲: Did the agent follow the instructions it was given?
• 𝗧𝗮𝘀𝗸 𝗡𝗮𝘃𝗶𝗴𝗮𝘁𝗶𝗼𝗻 𝗘𝗳𝗳𝗶𝗰𝗶𝗲𝗻𝗰𝘆: Did the agent follow an appropriate path to accomplish the task?

The evaluation is therefore not simply:
"Did the API call return HTTP 200?"

It is closer to:
"Did the agent accomplish what the user actually asked it to do?"

𝗔 𝘀𝗶𝗺𝗽𝗹𝗲 𝘁𝗲𝘀𝘁 𝗺𝗶𝗴𝗵𝘁 𝗹𝗼𝗼𝗸 𝗹𝗶𝗸𝗲 𝘁𝗵𝗶𝘀:

prompt = "Cancel order 1002"
result = run_agent(prompt)
assert result.task_completed == True
assert result.intent == "cancel_order"

For a more realistic evaluation, we might define the expected behavior separately:

expected = {
"intent": "cancel_order",
"task_completed": True
}

result = evaluate_agent(
prompt=prompt,
expected=expected
)

print(result.score)
print(result.passed)

The important part is the separation between the 𝗮𝗴𝗲𝗻𝘁 𝗿𝘂𝗻 and the 𝗲𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗼𝗻.

The agent performs the task.

The evaluator judges whether the behavior meets the expected criteria.

𝗞𝗲𝘆 𝘁𝗮𝗸𝗲𝗮𝘄𝗮𝘆:

For AI agents, system evaluation asks a fundamental question:

𝗗𝗶𝗱 𝘁𝗵𝗲 𝗮𝗴𝗲𝗻𝘁 𝗱𝗼 𝘄𝗵𝗮𝘁 𝘁𝗵𝗲 𝘂𝘀𝗲𝗿 𝗮𝘀𝗸𝗲𝗱 𝗶𝘁 𝘁𝗼 𝗱𝗼?

That is very different from simply checking whether the underlying tools executed successfully. …more   Activate to view larger image, 
￼
    Activate to view larger image,    Like  Comment      Repost       Send           
 Feed post number 7 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 2d •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | Part 49: 𝗔𝗴𝗲𝗻𝘁 𝗘𝘃𝗮𝗹𝘂𝗮𝘁𝗼𝗿𝘀 𝗶𝗻 𝗠𝗶𝗰𝗿𝗼𝘀𝗼𝗳𝘁 𝗙𝗼𝘂𝗻𝗱𝗿𝘆

How do you know that an AI agent is actually doing its job correctly?

For a traditional application, we can write tests such as:

Input: order_id = 1001
Expected result: status = "Shipped"

With an AI agent, the situation is different.

The agent has to understand the request, decide what to do, select the appropriate tool, provide the right arguments, and use the result correctly.

A successful API call does not necessarily mean the agent made the right decision.

𝗖𝗼𝗻𝘀𝗶𝗱𝗲𝗿 𝗮𝗻 𝗼𝗿𝗱𝗲𝗿 𝗽𝗿𝗼𝗰𝗲𝘀𝘀𝗶𝗻𝗴 𝗮𝗴𝗲𝗻𝘁.

User:

"Check the status of order 1001."

The expected behavior is:

User request
↓
Understand intent
↓
Select get_order_status
↓
Pass order_id = 1001
↓
Use the returned order information
↓
Respond to the user

Now imagine the agent calls:

get_order_status(1001)

The call succeeds, but the agent then gives the customer an incorrect answer.

Did the agent perform correctly?

No.

This is where 𝗔𝗴𝗲𝗻𝘁 𝗘𝘃𝗮𝗹𝘂𝗮𝘁𝗼𝗿𝘀 become useful.

An Agent Evaluator examines agent behavior against an expected outcome or criteria and produces an evaluation result, such as a score or pass/fail result.

Conceptually:

Agent Run
↓
Agent Evaluators
↓
Evaluation Result
↓
Pass / Fail / Score

For example, an evaluator can assess whether the agent:

• Understood the user's intent correctly
• Completed the requested task
• Followed the required task behavior
• Used tools appropriately
• Produced a good-quality response

𝗔 𝘀𝗶𝗺𝗽𝗹𝗲 𝗲𝘅𝗮𝗺𝗽𝗹𝗲

Suppose we have:

def run_agent(prompt):
...
result = run_agent("Check the status of order 1001")

We can evaluate the agent's behavior:

expected_tool = "get_order_status"
expected_order_id = 1001

assert result.tool == expected_tool
assert result.arguments["order_id"] == expected_order_id

The important difference is that we are no longer testing only the final text.

We are evaluating 𝗵𝗼𝘄 𝘁𝗵𝗲 𝗮𝗴𝗲𝗻𝘁 𝗯𝗲𝗵𝗮𝘃𝗲𝗱 while completing the task.

In Microsoft Foundry, Agent Evaluators provide a structured way to evaluate agent runs and help determine whether an agent is meeting the expected behavior and quality requirements.

𝗞𝗲𝘆 𝘁𝗮𝗸𝗲𝗮𝘄𝗮𝘆:

For AI agents, "the API call succeeded" and "the agent did the right thing" are two different things.

Agent evaluation helps us measure the second one. …more   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
1   Like  Comment      Repost       Send           
 Feed post number 8 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 2d •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | Part 48: 𝗔𝗜 𝗔𝗴𝗲𝗻𝘁 𝗥𝗲𝗴𝗿𝗲𝘀𝘀𝗶𝗼𝗻 𝗧𝗲𝘀𝘁𝗶𝗻𝗴

An AI agent can work perfectly today and behave differently tomorrow. 

You change the agent instructions, update the model, modify a tool, or change the workflow. The new scenario works, but something that was working earlier quietly breaks.

That is where 𝗿𝗲𝗴𝗿𝗲𝘀𝘀𝗶𝗼𝗻 𝘁𝗲𝘀𝘁𝗶𝗻𝗴 becomes important.

Consider an enterprise order-processing agent.

A few validated scenarios are:

"Check the status of order 1001."
"Cancel order 1002."
"Check the status of order 1003."

The expected tool calls are:

Check order 1001 → get_order_status(1001)
Cancel order 1002 → cancel_order(1002)
Check order 1003 → get_order_status(1003)

Now suppose we modify the agent instructions to improve how cancellation requests are handled. The cancellation scenario works better. But after the change, the agent starts selecting the wrong tool for order-status requests.

That is a 𝗿𝗲𝗴𝗿𝗲𝘀𝘀𝗶𝗼𝗻.

The important point is that we should not test only the new behavior. We need to rerun the scenarios that were already known to work.

A simple regression test could look like this:

tests = [
("Check order 1001", "get_order_status"),
("Cancel order 1002", "cancel_order"),
("Check order 1003", "get_order_status")
]

for prompt, expected_tool in tests:

result = run_agent(prompt)

assert result.tool == expected_tool

Here, each test contains:

User request → Expected behavior

The agent is executed against every test case, and the actual tool selected by the agent is compared with the expected tool.

If the agent returns:
cancel_order
for:
"Check order 1003"
the assertion fails and the regression is detected.

𝗪𝗵𝗮𝘁 𝗰𝗮𝗻 𝗰𝗮𝘂𝘀𝗲 𝗿𝗲𝗴𝗿𝗲𝘀𝘀𝗶𝗼𝗻𝘀?

• Changing agent instructions
• Changing the underlying model
• Modifying tool definitions
• Adding or removing tools
• Changing prompts
• Changing the agent workflow
• Updating dependencies

The test cases become a safety net around the agent.

The goal is not simply to prove that the new functionality works.

The goal is to make sure that 𝗻𝗲𝘄 𝗰𝗵𝗮𝗻𝗴𝗲𝘀 𝗱𝗼 𝗻𝗼𝘁 𝗯𝗿𝗲𝗮𝗸 𝗯𝗲𝗵𝗮𝘃𝗶𝗼𝗿 𝘁𝗵𝗮𝘁 𝗮𝗹𝗿𝗲𝗮𝗱𝘆 𝘄𝗼𝗿𝗸𝗲𝗱.

For AI agents, this becomes particularly important because the same input does not always guarantee identical behavior.

𝗞𝗲𝘆 𝗧𝗮𝗸𝗲𝗮𝘄𝗮𝘆:

Regression testing gives an AI agent development team a repeatable way to detect unintended behavior changes before they reach production.   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
1   Like  Comment      Repost       Send           
 Feed post number 9 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 3d •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | Part 47: 𝗧𝗲𝘀𝘁𝗶𝗻𝗴 𝗔𝗜 𝗔𝗴𝗲𝗻𝘁𝘀

An AI agent may produce a good answer most of the time. That does not mean it is ready for production. An agent can call the wrong tool, pass incorrect parameters, fail to handle missing information, or break when one of its dependent services changes.

That is why 𝗔𝗜 𝗮𝗴𝗲𝗻𝘁𝘀 𝗻𝗲𝗲𝗱 𝘁𝗼 𝗯𝗲 𝘁𝗲𝘀𝘁𝗲𝗱 𝗹𝗶𝗸𝗲 𝘀𝗼𝗳𝘁𝘄𝗮𝗿𝗲.

Consider an enterprise order-processing agent.

A user asks:

"Check the status of order 1001."

The agent may need to:

User request
↓
Understand the request
↓
Call get_order_status(1001)
↓
Process the result
↓
Return the response

There are several places where we can test the system.

𝗨𝗻𝗶𝘁 𝗧𝗲𝘀𝘁𝗶𝗻𝗴

Test individual components independently.

For example, test the order lookup function without involving the LLM:

def test_get_order_status():
result = get_order_status(1001)
assert result["status"] == "Shipped"

This tells us whether the underlying function behaves correctly.

𝗔𝗴𝗲𝗻𝘁 𝗧𝗲𝘀𝘁𝗶𝗻𝗴

Now test whether the agent selects the expected tool and provides the correct arguments.

A simplified example:

def test_order_agent():
response = run_agent("Check the status of order 1001")

assert response.tool == "get_order_status"
assert response.arguments["order_id"] == 1001 

We are no longer testing just the function. We are testing the agent's behavior.

𝗜𝗻𝘁𝗲𝗴𝗿𝗮𝘁𝗶𝗼𝗻 𝗧𝗲𝘀𝘁𝗶𝗻𝗴

An agent usually depends on several components.

For example:

Agent
↓
Order API
↓
Customer database

An integration test checks whether these components work together correctly.

𝗘𝗻𝗱-𝘁𝗼-𝗘𝗻𝗱 𝗧𝗲𝘀𝘁𝗶𝗻𝗴

Finally, test the complete user interaction.

For example:

Input:
"Check the status of order 1001."

Expected behavior:
→ Identify the request
→ Retrieve order 1001
→ Return the order status

We can automate these scenarios and run them as part of the development process.

𝗪𝗵𝘆 𝗶𝘀 𝘁𝗵𝗶𝘀 𝗶𝗺𝗽𝗼𝗿𝘁𝗮𝗻𝘁?

With traditional software, a function usually produces a predictable result for a given input.

AI agents are different. The same user request can involve model reasoning, tool selection, parameters, external services, and different execution paths. So testing needs to cover both the individual components and the agent workflow.

𝗔𝗜-𝟱𝟬𝟬 𝗧𝗮𝗸𝗲𝗮𝘄𝗮𝘆

Think about testing an AI agent at multiple levels:

𝗨𝗻𝗶𝘁 → Does each component work correctly?
𝗜𝗻𝘁𝗲𝗴𝗿𝗮𝘁𝗶𝗼𝗻 → Do the components work correctly together?
𝗔𝗴𝗲𝗻𝘁 → Does the agent choose and use its capabilities correctly?
𝗘𝗻𝗱-𝘁𝗼-𝗘𝗻𝗱 → Does the complete workflow behave as expected?

For production AI agents, "it worked when I tried it" is not a testing strategy.   Activate to view larger image, 
￼
    Activate to view larger image,    Like  Comment      Repost       Send           
 Feed post number 10 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 3d •        A great initiative by Beomsoo Park to share practical knowledge and experience with fellow and next-generation bridge engineers. TheBridgeEng.com will become a one-stop resource for bridge design and engineering, bringing together design tools, construction methods, FE exercises, bridge data, failure cases, regulations, and industry insights.
What I particularly appreciate is the philosophy behind it: engineering knowledge should be shared, not guarded. My great respect and thanks to Beomsoo Park for putting so much effort into creating such a valuable resource for fellow and next-generation bridge engineers. Definitely worth exploring and following. …more   
￼
   Beomsoo Park    • 3rd+ Cable Bridge specialist | 26y+ Experience | 43K+Followers | TheBridgeEng.com | MODON 3d •     Follow Engineers must share their knowledge with the younger generation.

When I first started designing bridges, there were many things I had to figure out for myself, as I did not learn the detailed methods of bridge design from my senior colleagues.

It seems my senior colleagues were labouring under the misconception that sharing their knowledge would create future competitors.

That is why, wanting to make it easier for young engineers to learn about bridges, I purchased a web domain two months ago without any real plan and created Thebridgeeng.com.

At first, it consisted solely of an intro page, five simple calculation tools and some bridge-related news.

By devoting almost all my time after work to keeping the site updated, I have now been able to incorporate a wealth of bridge-related knowledge onto the website.

- 25 bridge-related calculation tools
- Animated demonstrations of bridge construction methods
- FE test exercises for civil engineers
- Data on over 10,000 bridges worldwide
- Over 200 cases of bridge collapses and failures
- Bridge-related regulations
- Long-span bridge rankings
- And bridge-related news and insights

I won’t stop here. I intend to continue updating the site with bridge-related content.

I will strive to provide plenty of information and insights on this website, particularly for young civil and bridge engineers, so I hope you’ll follow the site closely.

PS: Try catching the birds and dolphins that occasionally appear in the animation.

For more information on bridges, please visit

TheBridgeEng.com

hashtag #bridge hashtag #design hashtag #civil hashtag #construction hashtag #engineering hashtag #project hashtag #structure hashtag #management …more      Play    Remaining time  0:461x  Playback speed   Unmute   Turn fullscreen on         Like  Comment      Repost       Send           
 Feed post number 11 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 3d •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | Part 46: 𝗔𝗴𝗲𝗻𝘁 𝗖𝗼𝗻𝗰𝘂𝗿𝗿𝗲𝗻𝗰𝘆, 𝗕𝗮𝘁𝗰𝗵𝗶𝗻𝗴 & 𝗦𝗰𝗮𝗹𝗶𝗻𝗴

When we build a multi-agent AI system, getting one request to execute quickly is only part of the problem.

What happens when hundreds or thousands of requests arrive at the same time?

This is where 𝗰𝗼𝗻𝗰𝘂𝗿𝗿𝗲𝗻𝗰𝘆, 𝗯𝗮𝘁𝗰𝗵𝗶𝗻𝗴, and 𝘀𝗰𝗮𝗹𝗶𝗻𝗴 become important.

Consider an enterprise order management system.

A customer submits an order. The system may need different agents to handle parts of the request:

Order Agent → Validate the order
Inventory Agent → Check stock
Pricing Agent → Calculate the price
Shipping Agent → Estimate delivery

Now imagine 500 customer orders arriving within a short period.

Running everything sequentially would create a bottleneck.

𝗖𝗼𝗻𝗰𝘂𝗿𝗿𝗲𝗻𝗰𝘆

Multiple independent agent tasks can execute at the same time.

For example:

Order 1 → Inventory Agent
Order 2 → Inventory Agent
Order 3 → Inventory Agent
Order 4 → Inventory Agent

Instead of waiting for one request to finish before starting another, the system can process multiple requests concurrently.

A simple Python example:

from concurrent.futures import ThreadPoolExecutor

def process_order(order_id):
return inventory_agent(order_id)

orders = [101, 102, 103, 104, 105]

with ThreadPoolExecutor(max_workers=3) as executor:
results = list(executor.map(process_order, orders))

Here, up to three tasks can execute concurrently.

𝗕𝗮𝘁𝗰𝗵𝗶𝗻𝗴

Sometimes the same type of operation can be grouped together.

Instead of sending:

Inventory check → Order 101
Inventory check → Order 102
Inventory check → Order 103
Inventory check → Order 104

the system may send a batch:

Inventory check → [101, 102, 103, 104]

If the underlying model, API, or data service supports batch processing, this can reduce request overhead and improve throughput.

𝗦𝗰𝗮𝗹𝗶𝗻𝗴

Concurrency helps us process more work at the same time.

But when demand keeps increasing, we may need more agent workers or compute resources.

For example:

100 requests
↓
2 agent workers

1,000 requests
↓
10 agent workers

10,000 requests
↓
Scale out agent workers

The key is not simply to create more agents.

We need to control how many agents or tasks are executing concurrently and scale resources according to workload.

𝗔𝗜-𝟱𝟬𝟬 𝗧𝗮𝗸𝗲𝗮𝘄𝗮𝘆

For multi-agent solutions, remember the distinction:

𝗖𝗼𝗻𝗰𝘂𝗿𝗿𝗲𝗻𝗰𝘆 → Process multiple tasks at the same time.

𝗕𝗮𝘁𝗰𝗵𝗶𝗻𝗴 → Group similar work into fewer operations.

𝗦𝗰𝗮𝗹𝗶𝗻𝗴 → Increase capacity as workload increases.

A well-designed multi-agent system needs all three to handle increasing workload efficiently. …more   Activate to view larger image, 
￼
    Activate to view larger image,    Like  Comment      Repost       Send           
 Feed post number 12 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 3d •        This looks like a valuable opportunity for students interested in building a foundation in AI and Data Science.

The program is offered by the Matsuo-Iwasawa Lab at the University of Tokyo and covers Python, Data Science, and AI fundamentals in a structured format. As per the official website, the application deadline is 10-Sep-2026.

One important point: the eligibility and application requirements may be specific to registered students. I would therefore encourage interested students to check the official GCI website carefully, verify their eligibility, and then apply if they qualify.

Sharing this for students who may find the opportunity useful. …more   
￼
   GCI World by Matsuo-Iwasawa Lab U-Tokyo 5,948 followers 1mo •     Follow 🚀 Applications Now Open: "GCI World 2026 September" | Introduction to AI & Data Science

We are excited to announce that applications are now open for GCI, the introductory AI and Data Science course hosted by the Matsuo-Iwasawa Lab at the University of Tokyo! Over 30,000 students have taken this program to date.

📌 Program Highlights:
・Online Program
・Free of charge
・Open to all students
・Systematic learning of Python, Data Science, and AI fundamentals

GCI is an intensive 3-month online course designed to teach foundational AI concepts through data science, equipping you with practical, business-oriented problem-solving skills with a focus on marketing.

No prior programming or AI experience required—beginners are fully welcome!

Apply today via the link below:
https://lnkd.in/diX5RpzU …more   Activate to view larger image, 
￼
    Activate to view larger image,    
￼
1 1 comment   Like  Comment      Repost       Send           
 Feed post number 13 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 3d • Edited •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | Part 45: 𝗣𝗮𝗿𝗮𝗹𝗹𝗲𝗹 𝗘𝘅𝗲𝗰𝘂𝘁𝗶𝗼𝗻, 𝗥𝗮𝘁𝗲 𝗟𝗶𝗺𝗶𝘁𝘀 & 𝗧𝗮𝘀𝗸 𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻

When an AI agent has multiple tasks to complete, running everything sequentially is not always the best approach.

Consider an enterprise agent that receives this request:

"Prepare a production readiness report for tomorrow."

The agent needs to:

Retrieve tomorrow's production schedule
Check current inventory
Retrieve incoming material information
Retrieve customer orders

These tasks are independent. There is no reason to wait for one task to finish before starting the next one.

𝗦𝗲𝗾𝘂𝗲𝗻𝘁𝗶𝗮𝗹 𝗘𝘅𝗲𝗰𝘂𝘁𝗶𝗼𝗻

Production Schedule
↓
Inventory
↓
Incoming Materials
↓
Customer Orders
↓
Combine Results

If the tasks take 2, 3, 2 and 4 seconds respectively:
2 + 3 + 2 + 4 = 11 seconds

𝗣𝗮𝗿𝗮𝗹𝗹𝗲𝗹 𝗘𝘅𝗲𝗰𝘂𝘁𝗶𝗼𝗻

The four independent tasks can be started at the same time:

Request
↓
Start tasks concurrently
Get production schedule
Check inventory
Get incoming materials
Get customer orders
↓
Wait for all tasks to complete
↓
Combine the results

In this case, the total execution time can be closer to the longest-running task, around 4 seconds instead of 11 seconds.

This is a simple but important design consideration when building multi-agent systems.

𝗔 𝘀𝗶𝗺𝗽𝗹𝗲 𝗣𝘆𝘁𝗵𝗼𝗻 𝗲𝘅𝗮𝗺𝗽𝗹𝗲

Instead of executing each operation one after another:

result1 = get_production_schedule()
result2 = get_inventory()
result3 = get_incoming_materials()
result4 = get_customer_orders()

The independent operations can be executed concurrently:

from concurrent.futures import ThreadPoolExecutor
tasks = [
get_production_schedule,
get_inventory,
get_incoming_materials,
get_customer_orders
]

with ThreadPoolExecutor(max_workers=4) as executor:
results = list(executor. map(lambda task: task(), tasks))

The key is not simply "run everything in parallel."

𝗥𝗮𝘁𝗲 𝗹𝗶𝗺𝗶𝘁𝘀 𝗺𝗮𝘁𝘁𝗲𝗿.

Suppose an agent launches 50 concurrent API requests, but the downstream service allows only 10 requests per second.

Increasing concurrency will not necessarily make the system faster.

The service may start throttling requests, which can increase latency and cause some requests to fail.

Therefore, the agent needs to balance the amount of parallel execution with the concurrency and rate limits of the services it calls.

𝗧𝗵𝗲 𝗔𝗜-𝟱𝟬𝟬 𝗲𝘅𝗮𝗺 𝗽𝗼𝗶𝗻𝘁

When optimizing task duration, identify operations that are independent and can execute concurrently.

At the same time, consider the concurrency and rate limits of the models, tools, APIs and other services involved.

𝗣𝗮𝗿𝗮𝗹𝗹𝗲𝗹𝗶𝘀𝗺 𝗿𝗲𝗱𝘂𝗰𝗲𝘀 𝘄𝗮𝗶𝘁𝗶𝗻𝗴. 𝗚𝗼𝗼𝗱 𝗮𝗴𝗲𝗻𝘁 𝗮𝗿𝗰𝗵𝗶𝘁𝗲𝗰𝘁𝘂𝗿𝗲 𝗸𝗻𝗼𝘄𝘀 𝗵𝗼𝘄 𝗺𝘂𝗰𝗵 𝗽𝗮𝗿𝗮𝗹𝗹𝗲𝗹𝗶𝘀𝗺 𝗶𝘀 𝗮𝗰𝘁𝘂𝗮𝗹𝗹𝘆 𝗵𝗲𝗹𝗽𝗳𝘂𝗹.

hashtag #AI500 hashtag #AIEngineering hashtag #MultiAgentAI hashtag #AzureAI …more   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
1 2 comments 1 repost   Like  Comment      Repost       Send           
 Feed post number 14 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 3d •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | Part 44: 𝗖𝗼𝗻𝘁𝗲𝘅𝘁 𝗪𝗶𝗻𝗱𝗼𝘄 𝗠𝗮𝗻𝗮𝗴𝗲𝗺𝗲𝗻𝘁

An AI agent can have an excellent model, good tools, and access to relevant information.

But what happens when the conversation and retrieved information become too large for the model's context window?

𝗧𝗵𝗶𝘀 𝗶𝘀 𝘄𝗵𝗲𝗿𝗲 𝗰𝗼𝗻𝘁𝗲𝘅𝘁 𝘄𝗶𝗻𝗱𝗼𝘄 𝗺𝗮𝗻𝗮𝗴𝗲𝗺𝗲𝗻𝘁 𝗯𝗲𝗰𝗼𝗺𝗲𝘀 𝗶𝗺𝗽𝗼𝗿𝘁𝗮𝗻𝘁.

A context window is the amount of information a model can consider in a single request. It can contain system instructions, conversation history, tool results, retrieved documents, and the current user request.

As an agent runs, this context can continuously grow.

𝗔 𝘀𝗶𝗺𝗽𝗹𝗲 𝗲𝘅𝗮𝗺𝗽𝗹𝗲:

Imagine a customer support agent handling a long conversation.

Initially:

System instructions
+
Customer question
+
Relevant customer information

Later, the agent may also have:

Conversation history
+
Multiple tool results
+
Retrieved support documents
+
Previous reasoning context
+
New customer questions

Eventually, the accumulated context may approach the model's context-window limit.
The agent then needs to decide what information should remain in the active context.

𝗢𝗻𝗲 𝗽𝗿𝗮𝗰𝘁𝗶𝗰𝗮𝗹 𝗮𝗽𝗽𝗿𝗼𝗮𝗰𝗵 𝗶𝘀 𝘁𝗼 𝗸𝗲𝗲𝗽 𝘁𝗵𝗲 𝗺𝗼𝘀𝘁 𝗿𝗲𝗹𝗲𝘃𝗮𝗻𝘁 𝗰𝗼𝗻𝘁𝗲𝘅𝘁 𝗮𝗰𝘁𝗶𝘃𝗲.

For example:

Recent conversation → Keep
Important customer facts → Keep
Current task → Keep
Old, irrelevant conversation → Remove
Large historical tool output → Summarize

A simple implementation might look like this:

MAX_MESSAGES = 20
if len(messages) > MAX_MESSAGES:
 old_messages = messages[:-10]
 recent_messages = messages[-10:]

 summary = summarize(old_messages)
 messages = [
 {"role": "system", "content": summary}
 ] + recent_messages

The idea is simple: instead of sending the entire history every time, preserve a compact representation of older information and keep recent interactions available.

𝗕𝘂𝘁 𝘁𝗵𝗲𝗿𝗲 𝗶𝘀 𝗮 𝗰𝗵𝗮𝗹𝗹𝗲𝗻𝗴𝗲.

If summarization removes an important detail, the agent may lose critical context. Repeated summarization can also introduce 𝘀𝘂𝗺𝗺𝗮𝗿𝘆 𝗱𝗿𝗶𝗳𝘁, where information becomes increasingly incomplete or inaccurate.

Therefore, effective context window management is not simply about reducing the number of tokens.

𝗧𝗵𝗲 𝗴𝗼𝗮𝗹 𝗶𝘀 𝘁𝗼 𝗽𝗿𝗲𝘀𝗲𝗿𝘃𝗲 𝘁𝗵𝗲 𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻 𝘁𝗵𝗮𝘁 𝗺𝗮𝘁𝘁𝗲𝗿𝘀 𝘄𝗵𝗶𝗹𝗲 𝗸𝗲𝗲𝗽𝗶𝗻𝗴 𝘁𝗵𝗲 𝗮𝗰𝘁𝗶𝘃𝗲 𝗰𝗼𝗻𝘁𝗲𝘅𝘁 𝘄𝗶𝘁𝗵𝗶𝗻 𝘁𝗵𝗲 𝗺𝗼𝗱𝗲𝗹'𝘀 𝗹𝗶𝗺𝗶𝘁.

That is a key design consideration when building reliable AI agents.

hashtag #AI500 hashtag #AI hashtag #AIAgents hashtag #GenerativeAI hashtag #LLM hashtag #MicrosoftAzure hashtag #ContextWindow hashtag #AIEngineering …more   Activate to view larger image, 
￼
    Activate to view larger image,    Like  Comment      Repost       Send           
 Feed post number 15 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 4d •        𝗙𝗼𝗿𝘁𝘂𝗻𝗲 𝟱𝟬𝟬 𝗦𝗰𝗮𝗹𝗲 𝗘𝗻𝘁𝗲𝗿𝗽𝗿𝗶𝘀𝗲 𝗔𝗜: 𝗔 𝗠𝗶𝗰𝗿𝗼𝘀𝗼𝗳𝘁 𝗘𝗰𝗼𝘀𝘆𝘀𝘁𝗲𝗺 𝗩𝗶𝗲𝘄

I recently passed a number of Microsoft AI and Data certifications at both associate and expert levels:

𝗔𝗕-𝟭𝟬𝟬 | 𝗔𝗜-𝟭𝟬𝟯 | 𝗗𝗣-𝟳𝟬𝟬 | 𝗗𝗣-𝟴𝟬𝟬

While preparing for and writing these exams, I realized that having a good understanding of the various products in the Microsoft ecosystem, and how they fit together, is extremely important.

Initially, I was learning individual products and concepts separately. But as I kept delving deeper into the ecosystem and understood how these products work together, preparing for the exams became easier.

This led me to create the accompanying infographic:

𝗙𝗼𝗿𝘁𝘂𝗻𝗲 𝟱𝟬𝟬 𝗦𝗰𝗮𝗹𝗲 𝗘𝗻𝘁𝗲𝗿𝗽𝗿𝗶𝘀𝗲 𝗔𝗜 𝗔𝗿𝗰𝗵𝗶𝘁𝗲𝗰𝘁𝘂𝗿𝗲 𝘄𝗶𝘁𝗵 𝗠𝗶𝗰𝗿𝗼𝘀𝗼𝗳𝘁 𝗘𝗰𝗼𝘀𝘆𝘀𝘁𝗲𝗺

The idea is to provide a single snapshot of how the major pieces of the Microsoft ecosystem can come together to build and operate enterprise-scale AI solutions.

It brings together areas such as:

𝗠𝗶𝗰𝗿𝗼𝘀𝗼𝗳𝘁 𝗔𝗜 𝗙𝗼𝘂𝗻𝗱𝗿𝘆
Models, agents, tools, evaluation and observability

𝗠𝗶𝗰𝗿𝗼𝘀𝗼𝗳𝘁 𝗙𝗮𝗯𝗿𝗶𝗰
OneLake, data engineering, warehousing, real-time intelligence and analytics

𝗗𝘆𝗻𝗮𝗺𝗶𝗰𝘀 𝟯𝟲𝟱 & 𝗘𝗻𝘁𝗲𝗿𝗽𝗿𝗶𝘀𝗲 𝗦𝘆𝘀𝘁𝗲𝗺𝘀
CRM, ERP, supply chain, manufacturing, HR and other business applications

𝗔𝘇𝘂𝗿𝗲 𝗔𝗜 & 𝗗𝗮𝘁𝗮 𝗦𝗲𝗿𝘃𝗶𝗰𝗲𝘀
AI Search, databases, APIs, integration and data services

𝗦𝗲𝗰𝘂𝗿𝗶𝘁𝘆 & 𝗚𝗼𝘃𝗲𝗿𝗻𝗮𝗻𝗰𝗲
Microsoft Entra, Microsoft Purview, Defender, AI Content Safety and responsible AI

𝗔𝘇𝘂𝗿𝗲 𝗖𝗹𝗼𝘂𝗱
The foundation for compute, networking, storage, scalability and operations

I know that this may not be a perfect architecture. There can certainly be different approaches depending on the business requirements.

However, I believe it captures the 𝗲𝘀𝘀𝗲𝗻𝗰𝗲 of how the different Microsoft products and services can fit together in an enterprise AI landscape.

I hope this single snapshot will be useful for people preparing for various Microsoft AI and Data certifications, as well as developers and architects working on AI solutions in production environments.

𝗟𝗲𝗮𝗿𝗻𝗶𝗻𝗴 𝘁𝗵𝗲 𝗽𝗿𝗼𝗱𝘂𝗰𝘁𝘀 𝗶𝘀 𝗼𝗻𝗲 𝘁𝗵𝗶𝗻𝗴.
𝗨𝗻𝗱𝗲𝗿𝘀𝘁𝗮𝗻𝗱𝗶𝗻𝗴 𝗵𝗼𝘄 𝘁𝗵𝗲𝘆 𝗳𝗶𝘁 𝘁𝗼𝗴𝗲𝘁𝗵𝗲𝗿 𝗶𝘀 𝘄𝗵𝗲𝗿𝗲 𝘁𝗵𝗲 𝗿𝗲𝗮𝗹 𝗹𝗲𝗮𝗿𝗻𝗶𝗻𝗴 𝗯𝗲𝗴𝗶𝗻𝘀. …more   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
￼
3 4 comments   Like  Comment      Repost       Send           
 Feed post number 16 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 4d •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | Part 43: 𝗣𝗿𝗼𝗺𝗽𝘁 𝗢𝗽𝘁𝗶𝗺𝗶𝘇𝗮𝘁𝗶𝗼𝗻 𝗳𝗼𝗿 𝗣𝗲𝗿𝗳𝗼𝗿𝗺𝗮𝗻𝗰𝗲 & 𝗖𝗼𝘀𝘁

A prompt can produce a good answer and still be inefficient. In an AI application, every unnecessary instruction, repeated piece of context, and irrelevant piece of information can increase token usage, latency, and cost.

𝗣𝗿𝗼𝗺𝗽𝘁 𝗼𝗽𝘁𝗶𝗺𝗶𝘇𝗮𝘁𝗶𝗼𝗻 is about improving the prompt while preserving the quality of the response.

Consider a customer support agent.
The user asks:
"Where is my order?"
A poorly optimized prompt might repeatedly send a large set of instructions, the complete customer profile, all previous conversations, and unrelated order information.
Instead, provide only the context required for the current task.

𝗕𝗲𝗳𝗼𝗿𝗲:

System:
"You are a helpful customer support assistant. Always be polite. Always explain your answer clearly. Follow company policies. Help customers with orders, returns, refunds, shipping, products, payments, account issues, and general questions..."

Context:
"Customer profile: ... [large profile]"
"Previous conversation: ... [entire conversation]"
"Order history: ... [all orders]"
"Current order: ..."

User:
"Where is my order?"

𝗔𝗳𝘁𝗲𝗿:

System:
"You are a customer support assistant. Answer using the provided order data. If tracking information is unavailable, say so."

Context:
"Order #10452: Shipped. Expected delivery: September 3. Tracking: TRK9821."

User:
"Where is my order?"

The second prompt contains much less unnecessary information while retaining everything required to answer the question.

𝗦𝗮𝗺𝗽𝗹𝗲 𝗣𝘆𝘁𝗵𝗼𝗻:
from openai import AzureOpenAI

client = AzureOpenAI(
azure_endpoint=AZURE_ENDPOINT,
api_key=AZURE_API_KEY,
api_version=API_VERSION
)

order_context = "Order #10452: Shipped. Delivery: Sep 3. Tracking: TRK9821."

response = client. chat. completions. create(
model=MODEL,
messages=[
{
"role": "system",
"content": "Answer using only the provided order data."
},
{
"role": "user",
"content": f"{order_context}\n\nWhere is my order?"
}
]
)

print(response. choices[0]. message. content)

𝗞𝗲𝘆 𝗽𝗿𝗼𝗺𝗽𝘁 𝗼𝗽𝘁𝗶𝗺𝗶𝘇𝗮𝘁𝗶𝗼𝗻 𝘁𝗲𝗰𝗵𝗻𝗶𝗾𝘂𝗲𝘀:

• Remove redundant instructions
• Avoid repeating the same context
• Inject only task-relevant information
• Keep examples concise and purposeful
• Avoid sending irrelevant conversation history
• Use structured and precise instructions
• Control the amount of context supplied to the model

The goal is not simply to make prompts shorter.
The goal is to find the right balance between:

𝗣𝗿𝗼𝗺𝗽𝘁 𝗟𝗲𝗻𝗴𝘁𝗵 → 𝗤𝘂𝗮𝗹𝗶𝘁𝘆 → 𝗟𝗮𝘁𝗲𝗻𝗰𝘆 → 𝗖𝗼𝘀𝘁

A well-optimized prompt can reduce token consumption and latency while maintaining the quality of the AI response.

𝗣𝗿𝗼𝗺𝗽𝘁 𝗼𝗽𝘁𝗶𝗺𝗶𝘇𝗮𝘁𝗶𝗼𝗻 𝗶𝘀 𝗻𝗼𝘁 𝗮𝗯𝗼𝘂𝘁 𝘀𝗮𝘆𝗶𝗻𝗴 𝗹𝗲𝘀𝘀.
𝗜𝘁 𝗶𝘀 𝗮𝗯𝗼𝘂𝘁 𝘀𝗲𝗻𝗱𝗶𝗻𝗴 𝘁𝗵𝗲 𝗿𝗶𝗴𝗵𝘁 𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻 𝗮𝘁 𝘁𝗵𝗲 𝗿𝗶𝗴𝗵𝘁 𝘁𝗶𝗺𝗲. …more   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
1   Like  Comment      Repost       Send           
 Feed post number 17 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 4d •        Got my first Expert-level AI certification - Microsoft Certified: Agentic AI Business Solutions Architect =>

After completing my Ph.D., I was focusing on getting an Expert-level AI certification. That dream came true today. I have earned the Microsoft Certified: Agentic AI Business Solutions Architect credential by passing the AB-100 exam.

I have been preparing for this exam for the past four months. I passed the AI-103 a few days back. I have also been preparing for another Expert-level exam, AI-500, which is currently in Beta. As part of that preparation, I have been sharing my learnings through a series of LinkedIn posts.

Today, I took a leap of faith. I still had doubts about my level of preparation for AB-100, but I decided to write the exam. Fortune favored me, and I passed the exam.

A verifiable link to the certificate is available in the comments.

I would also like to acknowledge the valuable discussions and knowledge-sharing sessions I have had with my brother, K.V.N. Rajesh, Ph.D., regarding this Expert-level AB-100 exam. Rajesh was among the early experts to pass AB-100 and earn the Microsoft Certified: Agentic AI Business Solutions Architect credential. The knowledge and insights I gained from those discussions proved valuable while preparing for and clearing the exam.

Thank you, K.V.N. Rajesh, Ph.D., for your unwavering support, guidance, and encouragement.

𝗪𝗶𝘁𝗵 𝘁𝗵𝗶𝘀 𝗮𝗰𝗵𝗶𝗲𝘃𝗲𝗺𝗲𝗻𝘁, 𝗜 𝗰𝘂𝗿𝗿𝗲𝗻𝘁𝗹𝘆 𝗵𝗼𝗹𝗱 𝘁𝗵𝗲 𝗳𝗼𝗹𝗹𝗼𝘄𝗶𝗻𝗴 𝗮𝗰𝘁𝗶𝘃𝗲 𝗠𝗶𝗰𝗿𝗼𝘀𝗼𝗳𝘁 𝗘𝘅𝗽𝗲𝗿𝘁-𝗟𝗲𝘃𝗲𝗹 𝗮𝗻𝗱 𝗔𝘀𝘀𝗼𝗰𝗶𝗮𝘁𝗲-𝗹𝗲𝘃𝗲𝗹 𝗰𝗲𝗿𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻𝘀 𝗮𝗻𝗱 𝗼𝘁𝗵𝗲𝗿 𝗰𝗲𝗿𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻𝘀 𝗶𝗻 𝗗𝗮𝘁𝗮 𝗮𝗻𝗱 𝗔𝗜:

• Microsoft Certified: Agentic AI Business Solutions Architect (Expert Level)
• Microsoft Certified: Azure AI Apps and Agents Developer Associate
• Microsoft Certified: SQL AI Developer Associate
• Microsoft Certified: Fabric Data Engineer Associate
• Microsoft Certified: Fabric Analytics Engineer Associate
• Microsoft Certified: Power BI Data Analyst Associate
• Microsoft Certified: Azure AI Engineer Associate
• Microsoft Certified: Azure Data Scientist Associate
• Certified: Oracle Database 11g Data Warehousing Essentials (1Z0-515)

𝗙𝗼𝘂𝗻𝗱𝗮𝘁𝗶𝗼𝗻𝗮𝗹 𝗰𝗲𝗿𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻𝘀:

• Microsoft Certified: Azure Fundamentals
• Microsoft Certified: Azure Data Fundamentals
• Microsoft Certified: Azure AI Fundamentals
• AWS Certified Cloud Practitioner
• Certified: Oracle Business Intelligence 10 Foundation Essentials (1Z0-526) …more   Your document has finished loading     
￼
￼
7 7 comments   Like  Comment      Repost       Send           
 Feed post number 18 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 5d •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | Part 42: 𝗠𝗼𝗱𝗲𝗹 𝗦𝗲𝗹𝗲𝗰𝘁𝗶𝗼𝗻 & 𝗠𝗼𝗱𝗲𝗹 𝗥𝗼𝘂𝘁𝗶𝗻𝗴 𝗶𝗻 𝗔𝗜 𝗔𝗴𝗲𝗻𝘁𝘀

𝗗𝗼𝗲𝘀 𝗲𝘃𝗲𝗿𝘆 𝘁𝗮𝘀𝗸 𝗻𝗲𝗲𝗱 𝘁𝗵𝗲 𝗺𝗼𝘀𝘁 𝗽𝗼𝘄𝗲𝗿𝗳𝘂𝗹 𝗟𝗟𝗠?

Not necessarily.

In an AI agent system, different tasks can have very different requirements. Using one powerful model for everything can increase latency and cost without improving the result.

𝗠𝗼𝗱𝗲𝗹 𝗦𝗲𝗹𝗲𝗰𝘁𝗶𝗼𝗻 means choosing an appropriate model based on the task.
𝗠𝗼𝗱𝗲𝗹 𝗥𝗼𝘂𝘁𝗶𝗻𝗴 means dynamically directing each request to the most suitable model.

𝗘𝘅𝗮𝗺𝗽𝗹𝗲:

Imagine an enterprise support agent handling these requests:

• "What is the status of order 12345?"
→ Simple retrieval → Smaller, faster model

• "Extract the key fields from this invoice."
→ Structured extraction → Efficient model

• "Analyze why this customer is likely to churn and recommend actions."
→ Complex reasoning → More capable model

The objective is not simply to use the best model.

𝗧𝗵𝗲 𝗼𝗯𝗷𝗲𝗰𝘁𝗶𝘃𝗲 𝗶𝘀 𝘁𝗼 𝘂𝘀𝗲 𝘁𝗵𝗲 𝗿𝗶𝗴𝗵𝘁 𝗺𝗼𝗱𝗲𝗹 𝗳𝗼𝗿 𝘁𝗵𝗲 𝗿𝗶𝗴𝗵𝘁 𝘁𝗮𝘀𝗸.

A simple routing layer could look like this:

def select_model(task):
 if task.type == "lookup":
 return "small-model"
 elif task.type == "extraction":
 return "small-model"
 elif task.type == "reasoning":
 return "large-model"
 else:
 return "default-model" 

The routing logic can consider factors such as:

𝗧𝗮𝘀𝗸 𝗖𝗼𝗺𝗽𝗹𝗲𝘅𝗶𝘁𝘆
𝗥𝗲𝗮𝘀𝗼𝗻𝗶𝗻𝗴 𝗥𝗲𝗾𝘂𝗶𝗿𝗲𝗺𝗲𝗻𝘁𝘀
𝗟𝗮𝘁𝗲𝗻𝗰𝘆 𝗥𝗲𝗾𝘂𝗶𝗿𝗲𝗺𝗲𝗻𝘁𝘀
𝗖𝗼𝘀𝘁 𝗖𝗼𝗻𝘀𝘁𝗿𝗮𝗶𝗻𝘁𝘀
𝗠𝗼𝗱𝗲𝗹 𝗖𝗮𝗽𝗮𝗯𝗶𝗹𝗶𝘁𝗶𝗲𝘀

𝗞𝗲𝘆 𝗜𝗱𝗲𝗮:

An effective AI agent does not blindly send every request to the same LLM.

It matches the task demands with the capabilities of the available models and routes the request accordingly.

𝗜𝗻 𝗲𝗻𝘁𝗲𝗿𝗽𝗿𝗶𝘀𝗲 𝗔𝗜, 𝗺𝗼𝗱𝗲𝗹 𝘀𝗲𝗹𝗲𝗰𝘁𝗶𝗼𝗻 𝗶𝘀 𝗮𝗻 𝗮𝗿𝗰𝗵𝗶𝘁𝗲𝗰𝘁𝘂𝗿𝗮𝗹 𝗱𝗲𝗰𝗶𝘀𝗶𝗼𝗻, 𝗻𝗼𝘁 𝗷𝘂𝘀𝘁 𝗮 𝗺𝗼𝗱𝗲𝗹 𝗽𝗿𝗲𝗳𝗲𝗿𝗲𝗻𝗰𝗲.

hashtag #AI500 hashtag #AI hashtag #AIAgents hashtag #LLM hashtag #GenerativeAI hashtag #AzureAI hashtag #ModelRouting hashtag #ModelSelection …more   Activate to view larger image, 
￼
    Activate to view larger image,    Like  Comment      Repost       Send           
 Feed post number 19 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 5d •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | Part 41: 𝗖𝗮𝗰𝗵𝗶𝗻𝗴 𝗶𝗻 𝗔𝗜 𝗔𝗴𝗲𝗻𝘁𝘀

An AI agent may repeatedly perform the same expensive operation.

For example, an employee asks:
"What is the current production status of Plant A?"

If 100 employees ask the same question within a short period, should the agent make 100 identical LLM or backend calls?

𝗧𝗵𝗶𝘀 𝗶𝘀 𝘄𝗵𝗲𝗿𝗲 𝗰𝗮𝗰𝗵𝗶𝗻𝗴 𝗵𝗲𝗹𝗽𝘀.

A cache temporarily stores the result of a previous operation so it can be reused when an equivalent request arrives.

𝗪𝗵𝗮𝘁 𝗰𝗮𝗻 𝗯𝗲 𝗰𝗮𝗰𝗵𝗲𝗱?
• LLM responses
• Tool or API results
• Retrieval results
• Embeddings

𝗘𝘅𝗮𝗺𝗽𝗹𝗲

Suppose an agent calls a production system:

User Request
↓
AI Agent
↓
get_production_status("Plant A")
↓
Production System
↓
Result

The first request is a 𝗰𝗮𝗰𝗵𝗲 𝗺𝗶𝘀𝘀, so the agent calls the production system.

The result is stored in the cache.

A subsequent equivalent request becomes a 𝗰𝗮𝗰𝗵𝗲 𝗵𝗶𝘁, allowing the agent to reuse the stored result.

User Request
↓
AI Agent
↓
Cache
↓
Cached Result
↓
Final Answer

𝗦𝗶𝗺𝗽𝗹𝗲 𝗣𝘆𝘁𝗵𝗼𝗻 𝗘𝘅𝗮𝗺𝗽𝗹𝗲

cache = {}

def get_production_status(plant):
if plant in cache:
return cache[plant]

result = production_api(plant)
cache[plant] = result
return result

The first request retrieves fresh data.

Later requests for the same plant can reuse the cached result.

𝗪𝗵𝘆 𝗰𝗮𝗰𝗵𝗶𝗻𝗴 𝗺𝗮𝘁𝘁𝗲𝗿𝘀

Caching can help an AI agent:

• Reduce latency
• Reduce repeated API calls
• Reduce unnecessary LLM calls
• Reduce token consumption
• Lower operational cost

But caching introduces an important question:

𝗛𝗼𝘄 𝗹𝗼𝗻𝗴 𝘀𝗵𝗼𝘂𝗹𝗱 𝗮 𝗰𝗮𝗰𝗵𝗲𝗱 𝗿𝗲𝘀𝘂𝗹𝘁 𝗯𝗲 𝗰𝗼𝗻𝘀𝗶𝗱𝗲𝗿𝗲𝗱 𝘃𝗮𝗹𝗶𝗱?

For data that changes frequently, returning an old cached value could be worse than making the original call.

That is why AI agent caching needs careful consideration of 𝗧𝗧𝗟 (Time To Live) and cache invalidation.

𝗞𝗲𝘆 𝗜𝗱𝗲𝗮
Caching is not simply about storing data.

For AI agents, it is about recognizing when a previous computation or result can safely be reused instead of performing the same work again.

hashtag #AI hashtag #AI500 hashtag #AIAgents hashtag #GenerativeAI hashtag #LLM hashtag #AgenticAI hashtag #ArtificialIntelligence hashtag #Microsoft …more   Activate to view larger image, 
￼
    Activate to view larger image,    Like  Comment      Repost       Send           
 Feed post number 20 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 5d •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟰𝟬: 𝗧𝗼𝗸𝗲𝗻 𝗨𝘀𝗮𝗴𝗲 & 𝗖𝗼𝘀𝘁 𝗢𝗽𝘁𝗶𝗺𝗶𝘇𝗮𝘁𝗶𝗼𝗻

An AI application can work correctly and still be unnecessarily expensive.

𝗪𝗵𝘆?

Because every LLM request consumes tokens, and token consumption can grow rapidly in applications involving long prompts, large retrieved contexts, repeated tool calls, and multi-step agent workflows.

𝗧𝗵𝗲 𝗴𝗼𝗮𝗹 𝗶𝘀 𝗻𝗼𝘁 𝘀𝗶𝗺𝗽𝗹𝘆 𝘁𝗼 𝘂𝘀𝗲 𝗳𝗲𝘄𝗲𝗿 𝘁𝗼𝗸𝗲𝗻𝘀.

The goal is to use 𝗼𝗻𝗹𝘆 𝘁𝗵𝗲 𝘁𝗼𝗸𝗲𝗻𝘀 𝗻𝗲𝗰𝗲𝘀𝘀𝗮𝗿𝘆 to produce the required result.

𝗔 𝘀𝗶𝗺𝗽𝗹𝗲 𝗲𝗻𝘁𝗲𝗿𝗽𝗿𝗶𝘀𝗲 𝗲𝘅𝗮𝗺𝗽𝗹𝗲

Suppose an AI assistant answers:

"Why did production fall below target last month?"

A poorly optimized workflow might send:

User question
↓
Entire production report
↓
Entire quality report
↓
Entire inventory report
↓
Large system instructions
↓
LLM

This can consume thousands of unnecessary tokens.

A better design retrieves only the relevant information:

User question
↓
Retrieve relevant production data
↓
Retrieve relevant quality data
↓
Send concise context
↓
LLM
↓
Answer

𝗖𝗼𝗺𝗺𝗼𝗻 𝘄𝗮𝘆𝘀 𝘁𝗼 𝗿𝗲𝗱𝘂𝗰𝗲 𝘁𝗼𝗸𝗲𝗻 𝘂𝘀𝗮𝗴𝗲

• Keep system instructions concise.
• Retrieve only relevant documents or chunks.
• Limit the amount of context sent to the model.
• Avoid repeating the same information across requests.
• Control unnecessary agent loops and tool calls.
• Set appropriate maximum output tokens.
• Use smaller or less expensive models when they are sufficient.
• Monitor input and output tokens separately.

𝗦𝗮𝗺𝗽𝗹𝗲 𝗣𝘆𝘁𝗵𝗼𝗻 𝗰𝗼𝗱𝗲

A simple pattern is to measure token usage and place a limit on generated output:

response = client.responses.create(
 model="your-model",
 input="Summarize the production issue.",
 max_output_tokens=300 )

usage = response.usage

print("Input tokens:", usage.input_tokens)
print("Output tokens:", usage.output_tokens)
print("Total tokens:", usage.total_tokens)

The important point is that optimization should be 𝗺𝗲𝗮𝘀𝘂𝗿𝗲𝗱, not guessed.

For example, if an application consistently sends 8,000 input tokens to obtain a response that needs only 1,000 relevant tokens, there is an obvious optimization opportunity.

𝗧𝗼𝗸𝗲𝗻 𝗼𝗽𝘁𝗶𝗺𝗶𝘇𝗮𝘁𝗶𝗼𝗻 𝗶𝘀 𝗮 𝗯𝗮𝗹𝗮𝗻𝗰𝗶𝗻𝗴 𝗮𝗰𝘁.

Too little context can reduce answer quality.

Too much context can increase latency, token consumption, and cost without improving the answer.

The objective is to find the right balance:

𝗥𝗲𝗹𝗲𝘃𝗮𝗻𝘁 𝗖𝗼𝗻𝘁𝗲𝘅𝘁 + 𝗔𝗽𝗽𝗿𝗼𝗽𝗿𝗶𝗮𝘁𝗲 𝗢𝘂𝘁𝗽𝘂𝘁 𝗟𝗶𝗺𝗶𝘁𝘀 + 𝗘𝗳𝗳𝗶𝗰𝗶𝗲𝗻𝘁 𝗠𝗼𝗱𝗲𝗹 𝗦𝗲𝗹𝗲𝗰𝘁𝗶𝗼𝗻 = 𝗕𝗲𝘁𝘁𝗲𝗿 𝗧𝗼𝗸𝗲𝗻 𝗘𝗳𝗳𝗶𝗰𝗶𝗲𝗻𝗰𝘆

And in enterprise AI, better token efficiency can translate into lower operating cost, lower latency, and more predictable usage.

hashtag #AI500 hashtag #GenerativeAI hashtag #LLM hashtag #AIEngineering hashtag #TokenUsage hashtag #CostOptimization hashtag #AzureAI …more   Activate to view larger image, 
￼
    Activate to view larger image,    Like  Comment      Repost       Send           
 Feed post number 21 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 6d • Edited •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | Part 39: 𝗧𝗼𝗸𝗲𝗻 𝗖𝗼𝘂𝗻𝘁𝗶𝗻𝗴 & 𝗨𝘀𝗮𝗴𝗲 𝗠𝗼𝗻𝗶𝘁𝗼𝗿𝗶𝗻𝗴

𝗪𝗵𝘆 𝗱𝗼 𝗲𝗻𝘁𝗲𝗿𝗽𝗿𝗶𝘀𝗲𝘀 𝗰𝗮𝗿𝗲 𝗮𝗯𝗼𝘂𝘁 𝗟𝗟𝗠 𝘁𝗼𝗸𝗲𝗻𝘀?

Because LLM usage is measured in tokens, and for many commercial LLM APIs, token consumption is also a basis for usage-based billing.

𝗪𝗵𝗮𝘁 𝗶𝘀 𝗮 𝘁𝗼𝗸𝗲𝗻?

A token is a unit of text processed by an LLM.

It can represent a whole word, part of a word, punctuation, or another piece of text.

For example:
"Production quality is stable."
is converted into multiple tokens before the model processes it.

For an LLM request, we commonly track:

Input tokens
Output tokens
Total tokens

Total tokens = Input tokens + Output tokens

𝗟𝗲𝘁'𝘀 𝘁𝗮𝗸𝗲 𝗮 𝗺𝗮𝗻𝘂𝗳𝗮𝗰𝘁𝘂𝗿𝗶𝗻𝗴 𝗾𝘂𝗮𝗹𝗶𝘁𝘆-𝗰𝗼𝗻𝘁𝗿𝗼𝗹 𝗮𝗴𝗲𝗻𝘁.

A user asks:
"Summarize the quality issues for Line 3."

The agent retrieves relevant production data and sends the request plus context to the LLM.

Suppose the response reports:
Input tokens: 1,850
Output tokens: 320
Total tokens: 2,170

The application can capture these usage metrics.

𝗔 𝘀𝗶𝗺𝗽𝗹𝗶𝗳𝗶𝗲𝗱 𝗣𝘆𝘁𝗵𝗼𝗻 𝗲𝘅𝗮𝗺𝗽𝗹𝗲:

from openai import AzureOpenAI
client = AzureOpenAI(
azure_endpoint="https://. openai. azure. com/",
api_key="",
api_version="2024-10-21"
)

response = client.chat.completions.create(
model="",
messages=[
{"role": "user",
"content": "Summarize quality issues for Line 3."}
]
)

print("Input:", response.usage.prompt_tokens)
print("Output:", response.usage.completion_tokens)
print("Total:", response.usage.total_tokens)

The application can send these metrics to an enterprise monitoring system.

𝗪𝗵𝘆 𝗶𝘀 𝗺𝗼𝗻𝗶𝘁𝗼𝗿𝗶𝗻𝗴 𝗶𝗺𝗽𝗼𝗿𝘁𝗮𝗻𝘁?

Imagine 50,000 requests per month.

The enterprise now needs to know:
• How many tokens are being consumed?
• Which applications consume the most?
• Are usage patterns changing?
• Are unexpected usage spikes occurring?
• What usage is contributing to the bill?

𝗧𝗵𝗲 𝗯𝗶𝗴 𝗶𝗱𝗲𝗮:

User Request
↓
AI Agent
↓
LLM Request
↓
Input + Output Tokens
↓
Usage Metrics
↓
Enterprise Monitoring

𝗧𝗼𝗸𝗲𝗻 𝗰𝗼𝘂𝗻𝘁𝗶𝗻𝗴 𝘁𝘂𝗿𝗻𝘀 𝗟𝗟𝗠 𝘂𝘀𝗮𝗴𝗲 𝗶𝗻𝘁𝗼 𝗮 𝗺𝗲𝗮𝘀𝘂𝗿𝗮𝗯𝗹𝗲 𝗲𝗻𝘁𝗲𝗿𝗽𝗿𝗶𝘀𝗲 𝗺𝗲𝘁𝗿𝗶𝗰.

And when token consumption affects usage-based billing, monitoring those tokens becomes essential for understanding AI workload usage and cost. …more   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
1   Like  Comment      Repost       Send           
 Feed post number 22 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 6d •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟯𝟴: 𝗔𝗜 𝗔𝗴𝗲𝗻𝘁 𝗢𝗯𝘀𝗲𝗿𝘃𝗮𝗯𝗶𝗹𝗶𝘁𝘆 & 𝗧𝗿𝗮𝗰𝗶𝗻𝗴

An AI agent gives the wrong answer.

The first question is:

𝗪𝗵𝗮𝘁 𝗵𝗮𝗽𝗽𝗲𝗻𝗲𝗱?

The next question is:

𝗪𝗵𝗲𝗿𝗲 𝗱𝗶𝗱 𝗶𝘁 𝗴𝗼 𝘄𝗿𝗼𝗻𝗴?

This is where 𝗢𝗯𝘀𝗲𝗿𝘃𝗮𝗯𝗶𝗹𝗶𝘁𝘆 and 𝗧𝗿𝗮𝗰𝗶𝗻𝗴 become important.

Consider a manufacturing quality-control agent.

A user asks:
"Why did the defect rate increase on Line 3 today?"

The agent may execute:

User Request
↓
AI Agent
↓
get_production_metrics()
↓
get_quality_metrics()
↓
Tool Responses
↓
LLM Analysis
↓
Final Answer

𝗢𝗯𝘀𝗲𝗿𝘃𝗮𝗯𝗶𝗹𝗶𝘁𝘆 gives us visibility into the agent's behavior.

It helps answer questions such as:

Was the agent called?
Which tools were used?
Did the tools succeed or fail?
How long did each step take?
How many tokens were used?

𝗧𝗿𝗮𝗰𝗶𝗻𝗴 goes one step further.

It connects the individual operations belonging to the same request, allowing us to follow the complete execution path.

For example:

Trace ID: 8F21

Agent started
→ get_production_metrics() → Success
→ get_quality_metrics() → Warning
→ Quality API → Delayed
→ Incomplete data returned
→ LLM analysis
→ Final answer

Now we can identify where the problem occurred.

A simple implementation might look like this:

trace_id = create_trace_id()
log(trace_id, "agent_started")
result = get_quality_metrics()
log(trace_id, "quality_tool_completed",
status="success")
answer = llm_analyze(result)
log(trace_id, "agent_completed")

The distinction is simple:

𝗢𝗯𝘀𝗲𝗿𝘃𝗮𝗯𝗶𝗹𝗶𝘁𝘆 = 𝗩𝗶𝘀𝗶𝗯𝗶𝗹𝗶𝘁𝘆 𝗶𝗻𝘁𝗼 𝗪𝗛𝗔𝗧 𝗵𝗮𝗽𝗽𝗲𝗻𝗲𝗱
𝗧𝗿𝗮𝗰𝗶𝗻𝗴 = 𝗩𝗶𝘀𝗶𝗯𝗶𝗹𝗶𝘁𝘆 𝗶𝗻𝘁𝗼 𝗛𝗢𝗪 𝗶𝘁 𝗵𝗮𝗽𝗽𝗲𝗻𝗲𝗱

Without observability, an incorrect answer may simply look like an incorrect answer.
With tracing, we can follow the request across the agent, tools, APIs, and model execution to investigate the failure.

𝗧𝗵𝗲 𝗳𝗶𝗻𝗮𝗹 𝗮𝗻𝘀𝘄𝗲𝗿 𝘀𝗵𝗼𝘄𝘀 𝘂𝘀 𝗪𝗛𝗔𝗧 𝘁𝗵𝗲 𝗮𝗴𝗲𝗻𝘁 𝗱𝗶𝗱.
𝗧𝗵𝗲 𝘁𝗿𝗮𝗰𝗲 𝗵𝗲𝗹𝗽𝘀 𝘂𝘀 𝘂𝗻𝗱𝗲𝗿𝘀𝘁𝗮𝗻𝗱 𝗛𝗢𝗪 𝗶𝘁 𝗴𝗼𝘁 𝘁𝗵𝗲𝗿𝗲.

hashtag #AI500 hashtag #AIAgents hashtag #AIObservability hashtag #AITracing hashtag #AgenticAI hashtag #AIEngineering hashtag #GenerativeAI hashtag #MicrosoftAzure …more   Activate to view larger image, 
￼
    Activate to view larger image,    Like  Comment      Repost       Send           
 Feed post number 23 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 6d •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟯𝟳: 𝗟𝗟𝗠-𝗮𝘀-𝗮-𝗝𝘂𝗱𝗴𝗲 𝗳𝗼𝗿 𝗔𝗜 𝗘𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗼𝗻

How do you evaluate thousands of AI-generated answers without manually reviewing every one?

One approach is to use an LLM to evaluate the output of another LLM.

This is called:

𝗟𝗟𝗠-𝗮𝘀-𝗮-𝗝𝘂𝗱𝗴𝗲

Consider an enterprise customer-support assistant.

Customer asks:

"Can I return a laptop after 25 days if the return policy allows returns within 30 days?"

The AI assistant responds:

"Yes. You can return the laptop within 30 days, provided the product meets the return conditions."

Now we can ask a separate LLM to evaluate this response.

The judge receives:

𝗤𝘂𝗲𝘀𝘁𝗶𝗼𝗻
𝗖𝗼𝗻𝘁𝗲𝘅𝘁
𝗔𝗜 𝗔𝗻𝘀𝘄𝗲𝗿
𝗘𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗼𝗻 𝗖𝗿𝗶𝘁𝗲𝗿𝗶𝗮

For example, the judge can evaluate:

𝗖𝗼𝗿𝗿𝗲𝗰𝘁𝗻𝗲𝘀𝘀
Does the answer accurately address the question?

𝗥𝗲𝗹𝗲𝘃𝗮𝗻𝗰𝗲
Does the answer stay focused on what was asked?

𝗚𝗿𝗼𝘂𝗻𝗱𝗲𝗱𝗻𝗲𝘀𝘀
Is the answer supported by the provided context?

The judge might produce:

Score: 4/5
Decision: PASS
Reason: The answer correctly applies the 30-day return window. 

A simplified implementation could look like this:

judge_prompt = f"""
 Evaluate this AI answer.

 Question: {question}
 Context: {context}
 Answer: {answer}

 Score correctness from 1 to 5.
 Return PASS or FAIL and a brief reason.
"""
result = judge_llm(judge_prompt)
print(result)

The important idea is that the judge is not generating the customer answer.

𝗜𝘁 𝗶𝘀 𝗲𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗻𝗴 𝘁𝗵𝗲 𝗮𝗻𝘀𝘄𝗲𝗿.

This makes automated evaluation possible across large numbers of test cases.

Instead of:

𝗛𝘂𝗺𝗮𝗻 → 𝗥𝗲𝘃𝗶𝗲𝘄 𝗘𝘃𝗲𝗿𝘆 𝗔𝗻𝘀𝘄𝗲𝗿

we can have:

𝗔𝗜 𝗦𝘆𝘀𝘁𝗲𝗺 → 𝗟𝗟𝗠 𝗝𝘂𝗱𝗴𝗲 → 𝗦𝗰𝗼𝗿𝗲 + 𝗥𝗲𝗮𝘀𝗼𝗻

𝗟𝗟𝗠-𝗮𝘀-𝗮-𝗝𝘂𝗱𝗴𝗲 turns qualitative evaluation into a repeatable automated process for measuring AI output quality.

hashtag #AI500 hashtag #LLM hashtag #AIEvaluation hashtag #LLMasAJudge hashtag #GenerativeAI hashtag #AIEngineering hashtag #MicrosoftAzure hashtag #ArtificialIntelligence …more   Activate to view larger image, 
￼
    Activate to view larger image,    Like  Comment      Repost       Send           
 Feed post number 24 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 1w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟯𝟲: 𝗥𝗔𝗚 𝗘𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗼𝗻: 𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹 𝗤𝘂𝗮𝗹𝗶𝘁𝘆 𝘃𝘀 𝗔𝗻𝘀𝘄𝗲𝗿 𝗤𝘂𝗮𝗹𝗶𝘁𝘆

A RAG system can produce a confident answer and still be wrong.

𝗪𝗵𝘆?

Because two different things need to work correctly:

𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗲 𝘁𝗵𝗲 𝗿𝗶𝗴𝗵𝘁 𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻.
𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗲 𝘁𝗵𝗲 𝗿𝗶𝗴𝗵𝘁 𝗮𝗻𝘀𝘄𝗲𝗿 𝗳𝗿𝗼𝗺 𝘁𝗵𝗮𝘁 𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻.

Consider a manufacturing RAG assistant.

An engineer asks:

"What is the maximum allowable temperature for the hydraulic system of Pump P-204?"

The RAG pipeline looks like this:

𝗤𝘂𝗲𝗿𝘆
↓
𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗲𝗿
↓
𝗥𝗲𝗹𝗲𝘃𝗮𝗻𝘁 𝗗𝗼𝗰𝘂𝗺𝗲𝗻𝘁 𝗖𝗵𝘂𝗻𝗸𝘀
↓
𝗟𝗟𝗠
↓
𝗔𝗻𝘀𝘄𝗲𝗿

Now consider two scenarios.

𝗙𝗮𝗶𝗹𝘂𝗿𝗲 𝟭: 𝗣𝗼𝗼𝗿 𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹

The knowledge base contains the correct maintenance manual for Pump P-204.
However, the retriever returns a generic hydraulic-system document and misses the Pump P-204 specification.
The LLM may generate a plausible answer, but the required evidence was never retrieved.

𝗙𝗮𝗶𝗹𝘂𝗿𝗲 𝟮: 𝗣𝗼𝗼𝗿 𝗔𝗻𝘀𝘄𝗲𝗿

This time, the retriever finds the correct specification:
"Maximum allowable hydraulic temperature: 80°C."
But the LLM generates:
"The maximum allowable temperature is 90°C."
𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹 𝘄𝗮𝘀 𝗴𝗼𝗼𝗱. 𝗧𝗵𝗲 𝗮𝗻𝘀𝘄𝗲𝗿 𝘄𝗮𝘀 𝘄𝗿𝗼𝗻𝗴.

This is why RAG evaluation must separate two questions.

𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹 𝗤𝘂𝗮𝗹𝗶𝘁𝘆
Did the retriever return the information needed to answer the question?

𝗔𝗻𝘀𝘄𝗲𝗿 𝗤𝘂𝗮𝗹𝗶𝘁𝘆
Did the generated answer correctly use the retrieved information?

A simple evaluation workflow could look like this:

chunks = retrieve(query)

retrieval_score = evaluate_retrieval(
 query, chunks, expected_chunks
)

answer = generate(query, chunks)

answer_score = evaluate_answer(
 query, chunks, answer
)

print(retrieval_score)
print(answer_score) 

The important distinction is:

𝗚𝗼𝗼𝗱 𝗿𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹 𝗱𝗼𝗲𝘀 𝗻𝗼𝘁 𝗴𝘂𝗮𝗿𝗮𝗻𝘁𝗲𝗲 𝗮 𝗰𝗼𝗿𝗿𝗲𝗰𝘁 𝗮𝗻𝘀𝘄𝗲𝗿.
𝗔𝗻𝗱 𝗮 𝗰𝗼𝗻𝘃𝗶𝗻𝗰𝗶𝗻𝗴 𝗮𝗻𝘀𝘄𝗲𝗿 𝗱𝗼𝗲𝘀 𝗻𝗼𝘁 𝗽𝗿𝗼𝘃𝗲 𝘁𝗵𝗮𝘁 𝘁𝗵𝗲 𝗿𝗶𝗴𝗵𝘁 𝗲𝘃𝗶𝗱𝗲𝗻𝗰𝗲 𝘄𝗮𝘀 𝗿𝗲𝘁𝗿𝗶𝗲𝘃𝗲𝗱.

𝗥𝗔𝗚 𝗘𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗼𝗻 = 𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹 𝗤𝘂𝗮𝗹𝗶𝘁𝘆 + 𝗔𝗻𝘀𝘄𝗲𝗿 𝗤𝘂𝗮𝗹𝗶𝘁𝘆

A reliable RAG system needs both.

hashtag #AI500 hashtag #RAG hashtag #RetrievalAugmentedGeneration hashtag #GenerativeAI hashtag #AIEngineering hashtag #MicrosoftAzure hashtag #ArtificialIntelligence …more   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
1   Like  Comment      Repost       Send           
 Feed post number 25 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 1w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟯𝟱: 𝗔𝗜 𝗔𝗴𝗲𝗻𝘁 𝗘𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗼𝗻

Building an AI agent is only half the job.

𝗛𝗼𝘄 𝗱𝗼 𝘄𝗲 𝗸𝗻𝗼𝘄 𝘁𝗵𝗮𝘁 𝘁𝗵𝗲 𝗮𝗴𝗲𝗻𝘁 𝗶𝘀 𝗮𝗰𝘁𝘂𝗮𝗹𝗹𝘆 𝘄𝗼𝗿𝗸𝗶𝗻𝗴 𝗰𝗼𝗿𝗿𝗲𝗰𝘁𝗹𝘆?

Consider an enterprise procurement agent.

A user asks:

"Find suppliers for Product X, compare their prices, and recommend the best option."

The agent may do the following:

User request
↓
Understand the task
↓
Search supplier database
↓
Retrieve supplier prices
↓
Compare options
↓
Generate recommendation

The final answer may look convincing.

But evaluation asks much deeper questions:

𝗪𝗮𝘀 𝘁𝗵𝗲 𝘁𝗮𝘀𝗸 𝗰𝗼𝗺𝗽𝗹𝗲𝘁𝗲𝗱?
Did the agent find all relevant suppliers?

𝗗𝗶𝗱 𝗶𝘁 𝘂𝘀𝗲 𝘁𝗵𝗲 𝗿𝗶𝗴𝗵𝘁 𝘁𝗼𝗼𝗹𝘀?
Did it provide the correct arguments to the supplier search tool?

𝗪𝗮𝘀 𝘁𝗵𝗲 𝗿𝗲𝘀𝘂𝗹𝘁 𝗰𝗼𝗿𝗿𝗲𝗰𝘁?
Did it correctly compare the retrieved prices?

𝗪𝗮𝘀 𝘁𝗵𝗲 𝗳𝗶𝗻𝗮𝗹 𝗮𝗻𝘀𝘄𝗲𝗿 𝗴𝗿𝗼𝘂𝗻𝗱𝗲𝗱?
Was the recommendation actually supported by the retrieved supplier data?

𝗪𝗮𝘀 𝘁𝗵𝗲 𝗮𝗴𝗲𝗻𝘁 𝗲𝗳𝗳𝗶𝗰𝗶𝗲𝗻𝘁?
Did it take unnecessary steps or make unnecessary tool calls?

A simple evaluation might look like this:

result = evaluate_agent(test_case)

print(result.task_success)
print(result.tool_accuracy)
print(result.answer_correctness)
print(result.groundedness)
print(result.efficiency)

The important idea is that 𝗮𝗴𝗲𝗻𝘁 𝗲𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗼𝗻 𝗶𝘀 𝗻𝗼𝘁 𝗷𝘂𝘀𝘁 𝗮𝗯𝗼𝘂𝘁 𝗰𝗵𝗲𝗰𝗸𝗶𝗻𝗴 𝘁𝗵𝗲 𝗳𝗶𝗻𝗮𝗹 𝗮𝗻𝘀𝘄𝗲𝗿.

We need to evaluate the agent's behavior across the entire execution.

𝗨𝘀𝗲𝗿 𝗧𝗮𝘀𝗸
↓
𝗣𝗹𝗮𝗻𝗻𝗶𝗻𝗴
↓
𝗧𝗼𝗼𝗹 𝗦𝗲𝗹𝗲𝗰𝘁𝗶𝗼𝗻
↓
𝗧𝗼𝗼𝗹 𝗖𝗮𝗹𝗹𝘀
↓
𝗥𝗲𝘀𝘂𝗹𝘁 𝗜𝗻𝘁𝗲𝗿𝗽𝗿𝗲𝘁𝗮𝘁𝗶𝗼𝗻
↓
𝗙𝗶𝗻𝗮𝗹 𝗔𝗻𝘀𝘄𝗲𝗿
↓
𝗘𝘃𝗮𝗹𝘂𝗮𝘁𝗶𝗼𝗻

A reliable AI agent is not simply one that produces impressive answers.

𝗜𝘁 𝗶𝘀 𝗼𝗻𝗲 𝘁𝗵𝗮𝘁 𝗰𝗼𝗻𝘀𝗶𝘀𝘁𝗲𝗻𝘁𝗹𝘆 𝗰𝗼𝗺𝗽𝗹𝗲𝘁𝗲𝘀 𝘁𝗵𝗲 𝗿𝗶𝗴𝗵𝘁 𝘁𝗮𝘀𝗸, 𝘂𝘀𝗲𝘀 𝘁𝗵𝗲 𝗿𝗶𝗴𝗵𝘁 𝘁𝗼𝗼𝗹𝘀, 𝗵𝗮𝗻𝗱𝗹𝗲𝘀 𝗱𝗮𝘁𝗮 𝗰𝗼𝗿𝗿𝗲𝗰𝘁𝗹𝘆, 𝗮𝗻𝗱 𝗽𝗿𝗼𝗱𝘂𝗰𝗲𝘀 𝗮 𝗴𝗿𝗼𝘂𝗻𝗱𝗲𝗱 𝗮𝗻𝗱 𝗮𝗰𝗰𝘂𝗿𝗮𝘁𝗲 𝗼𝘂𝘁𝗽𝘂𝘁.

hashtag #AI500 hashtag #AIAgents hashtag #AgentEvaluation hashtag #GenerativeAI hashtag #ArtificialIntelligence hashtag #AIEngineering hashtag #MicrosoftAzure hashtag #RAG …more   Activate to view larger image, 
￼
    Activate to view larger image,    Like  Comment      Repost       Send           
 Feed post number 26 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 1w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | Part 34: 𝗛𝘂𝗺𝗮𝗻-𝗶𝗻-𝘁𝗵𝗲-𝗟𝗼𝗼𝗽 𝗔𝗜 𝗔𝗴𝗲𝗻𝘁𝘀

Should an AI agent always act on its own?

Not necessarily.

In enterprise AI, some actions can have significant business impact. An agent may be capable of taking the action, but the system can be designed to require human approval before execution.

This is the idea behind 𝗛𝘂𝗺𝗮𝗻-𝗶𝗻-𝘁𝗵𝗲-𝗟𝗼𝗼𝗽 (𝗛𝗜𝗧𝗟).

𝗛𝗼𝘄 𝗱𝗼𝗲𝘀 𝗶𝘁 𝘄𝗼𝗿𝗸?

Consider a procurement agent.

A user asks:
"Purchase 5,000 units of Product X from Supplier A."

The agent can:
→ Check supplier details
→ Check current pricing
→ Calculate the purchase value
→ Prepare the purchase order

But before placing a large order, the system requires a human to approve it.

The workflow becomes:

User request
↓
AI Agent
↓
Analyze and prepare action
↓
Approval required?
↓
Human reviews
↓
Approved → Execute action
Rejected → Stop or revise

𝗪𝗵𝘆 𝗶𝘀 𝘁𝗵𝗶𝘀 𝗶𝗺𝗽𝗼𝗿𝘁𝗮𝗻𝘁?

The goal is not to remove humans from the workflow. It is to let AI handle routine reasoning while keeping humans involved when a decision requires judgment, accountability, or authorization.

𝗦𝗶𝗺𝗽𝗹𝗶𝗳𝗶𝗲𝗱 𝗶𝗺𝗽𝗹𝗲𝗺𝗲𝗻𝘁𝗮𝘁𝗶𝗼𝗻:

def process_order(order):
 if order.amount > 10000:
 approval = request_human_approval(order)
 if not approval:
 return "Order rejected."
 return place_order(order)

Here, the agent can prepare the order, but orders above the defined threshold require human approval.

The important distinction is:

𝗔𝗜 𝗱𝗲𝗰𝗶𝗱𝗲𝘀 𝘄𝗵𝗮𝘁 𝘁𝗼 𝗱𝗼.
𝗛𝘂𝗺𝗮𝗻 𝗮𝗽𝗽𝗿𝗼𝘃𝗮𝗹 𝗱𝗲𝗰𝗶𝗱𝗲𝘀 𝘄𝗵𝗲𝘁𝗵𝗲𝗿 𝘁𝗼 𝗽𝗿𝗼𝗰𝗲𝗲𝗱.

This pattern helps build AI agents that are not only capable, but also controllable and accountable.

hashtag #AI hashtag #ArtificialIntelligence hashtag #AIAgents hashtag #HumanInTheLoop hashtag #HITL hashtag #MicrosoftAI500 hashtag #AI500 …more   Activate to view larger image, 
￼
    Activate to view larger image,    Like  Comment      Repost       Send           
 Feed post number 27 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 1w •        𝗣𝗹𝗲𝗮𝘀𝗲𝗱 𝘁𝗼 𝘀𝗵𝗮𝗿𝗲 𝘁𝗵𝗮𝘁 𝗜 𝗵𝗮𝘃𝗲 𝗲𝗮𝗿𝗻𝗲𝗱 𝘁𝗵𝗲 𝗠𝗶𝗰𝗿𝗼𝘀𝗼𝗳𝘁 𝗖𝗲𝗿𝘁𝗶𝗳𝗶𝗲𝗱: 𝗔𝘇𝘂𝗿𝗲 𝗔𝗜 𝗔𝗽𝗽𝘀 𝗮𝗻𝗱 𝗔𝗴𝗲𝗻𝘁𝘀 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿 𝗔𝘀𝘀𝗼𝗰𝗶𝗮𝘁𝗲 credential by passing the AI-103 exam today.

A verifiable link to the certificate is available in the comments.

I have been preparing for the expert-level AI-500 exam, which is currently in Beta. As part of that preparation, I have been sharing my learnings through a series of LinkedIn posts.
The rigorous preparation for AI-500 helped me tremendously while preparing for and taking the AI-103 exam. It strengthened my understanding of several important concepts around Azure AI, generative AI, agents, and AI application development.

𝗧𝗵𝗶𝘀 𝗶𝘀 𝗮𝗻𝗼𝘁𝗵𝗲𝗿 𝘀𝘁𝗲𝗽 𝗳𝗼𝗿𝘄𝗮𝗿𝗱 𝗶𝗻 𝗺𝘆 𝗷𝗼𝘂𝗿𝗻𝗲𝘆 𝗼𝗳 𝘁𝗿𝗮𝗻𝘀𝗶𝘁𝗶𝗼𝗻𝗶𝗻𝗴 𝗳𝗿𝗼𝗺 𝗗𝗮𝘁𝗮 𝗮𝗻𝗱 𝗔𝗻𝗮𝗹𝘆𝘁𝗶𝗰𝘀 𝘁𝗼 𝗔𝗜.

I would also like to acknowledge the valuable discussions and knowledge-sharing sessions I have had with my brother, K.V.N. Rajesh, Ph.D., regarding the expert-level AB-100 exam.
Rajesh was among the early experts to pass AB-100 and earn the Microsoft Certified: Agentic AI Business Solutions Architect credential. The knowledge and insights I gained from those discussions also proved valuable while preparing for and clearing today's AI-103 exam.

Thank you, K.V.N. Rajesh, Ph.D., for your unwavering support, guidance, and encouragement.

𝗪𝗶𝘁𝗵 𝘁𝗵𝗶𝘀 𝗮𝗰𝗵𝗶𝗲𝘃𝗲𝗺𝗲𝗻𝘁, 𝗜 𝗰𝘂𝗿𝗿𝗲𝗻𝘁𝗹𝘆 𝗵𝗼𝗹𝗱 𝘁𝗵𝗲 𝗳𝗼𝗹𝗹𝗼𝘄𝗶𝗻𝗴 𝗮𝗰𝘁𝗶𝘃𝗲 𝗠𝗶𝗰𝗿𝗼𝘀𝗼𝗳𝘁 𝗔𝘀𝘀𝗼𝗰𝗶𝗮𝘁𝗲-𝗹𝗲𝘃𝗲𝗹 𝗰𝗲𝗿𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻𝘀 𝗮𝗻𝗱 𝗼𝘁𝗵𝗲𝗿 𝗰𝗲𝗿𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻𝘀 𝗶𝗻 𝗗𝗮𝘁𝗮 𝗮𝗻𝗱 𝗔𝗜:

• Microsoft Certified: Azure AI Apps and Agents Developer Associate
• Microsoft Certified: SQL AI Developer Associate
• Microsoft Certified: Fabric Data Engineer Associate
• Microsoft Certified: Fabric Analytics Engineer Associate
• Microsoft Certified: Power BI Data Analyst Associate
• Microsoft Certified: Azure AI Engineer Associate
• Microsoft Certified: Azure Data Scientist Associate
• Certified: Oracle Database 11g Data Warehousing Essentials (1Z0-515)

𝗙𝗼𝘂𝗻𝗱𝗮𝘁𝗶𝗼𝗻𝗮𝗹 𝗰𝗲𝗿𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻𝘀:
• Microsoft Certified: Azure Fundamentals
• Microsoft Certified: Azure Data Fundamentals
• Microsoft Certified: Azure AI Fundamentals
• AWS Certified Cloud Practitioner
• Certified: Oracle Business Intelligence 10 Foundation Essentials (1Z0-526)

Finally, I would like to thank everyone who has engaged with my AI-500 series posts, shared insights, asked questions, and contributed to the discussions throughout this learning journey.

Your interactions have made the learning process more meaningful and have encouraged me to keep learning, simplifying, and sharing.

𝗧𝗵𝗶𝘀 𝗷𝗼𝘂𝗿𝗻𝗲𝘆 𝗰𝗼𝗻𝘁𝗶𝗻𝘂𝗲𝘀.

I look forward to continuing to explore AI and share what I learn through my daily LinkedIn posts. …more   Your document has finished loading     
￼
￼
34 11 comments   Like  Comment      Repost       Send           
 Feed post number 28 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 1w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | Part 33: 𝗧𝗼𝗼𝗹 𝗘𝗿𝗿𝗼𝗿 𝗛𝗮𝗻𝗱𝗹𝗶𝗻𝗴 & 𝗙𝗮𝗹𝗹𝗯𝗮𝗰𝗸 𝗦𝘁𝗿𝗮𝘁𝗲𝗴𝗶𝗲𝘀

What happens when an AI agent calls a tool and the tool fails?

In a production AI system, a tool can fail because of a timeout, unavailable service, rate limiting, network failure, or an unexpected response. An agent should not simply stop.

𝗧𝗵𝗲 𝗴𝗼𝗮𝗹 𝗶𝘀 𝗴𝗿𝗮𝗰𝗲𝗳𝘂𝗹 𝗳𝗮𝗶𝗹𝘂𝗿𝗲.

Consider an enterprise supply-chain agent:

Question:
"Can we fulfill tomorrow's production plan?"

The agent needs inventory information.

It first calls the primary inventory service.

𝗦𝗰𝗲𝗻𝗮𝗿𝗶𝗼:

The primary inventory API times out.

Instead of returning an immediate failure, the agent can:

1. Retry the failed tool call
2. If it still fails, use an approved fallback source
3. If no reliable source is available, report that the information could not be verified

𝗦𝗶𝗺𝗽𝗹𝗶𝗳𝗶𝗲𝗱 𝗶𝗺𝗽𝗹𝗲𝗺𝗲𝗻𝘁𝗮𝘁𝗶𝗼𝗻:

def get_inventory():
 try:
 return primary_inventory_api()
 except TimeoutError:
 return fallback_inventory_api()

def answer(question):
 inventory = get_inventory()

 if inventory is None:
 return "Inventory data could not be verified."

 return agent.generate_answer(question, inventory) 

The important part is not the Python syntax.

It is the 𝗿𝗲𝗰𝗼𝘃𝗲𝗿𝘆 𝗹𝗼𝗴𝗶𝗰.

𝗣𝗿𝗶𝗺𝗮𝗿𝘆 𝘁𝗼𝗼𝗹
↓
𝗥𝗲𝘁𝗿𝘆
↓
𝗙𝗮𝗹𝗹𝗯𝗮𝗰𝗸 𝘁𝗼𝗼𝗹
↓
𝗩𝗲𝗿𝗶𝗳𝗶𝗲𝗱 𝗿𝗲𝘀𝘂𝗹𝘁
↓
𝗔𝗻𝘀𝘄𝗲𝗿

A good fallback should not silently substitute unreliable information. If neither the primary tool nor the fallback can provide trustworthy data, the agent should say so rather than inventing an answer.

𝗞𝗲𝘆 𝗶𝗱𝗲𝗮:

Tool failure is not necessarily agent failure.

A robust AI agent knows how to 𝗿𝗲𝘁𝗿𝘆, 𝗳𝗮𝗹𝗹 𝗯𝗮𝗰𝗸, and 𝗳𝗮𝗶𝗹 𝗴𝗿𝗮𝗰𝗲𝗳𝘂𝗹𝗹𝘆 when reliable information cannot be obtained. …more   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
￼
2   Like  Comment      Repost       Send           
 Feed post number 29 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 1w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | Part 32: 𝗧𝗼𝗼𝗹 𝗥𝗲𝘀𝘂𝗹𝘁 𝗩𝗮𝗹𝗶𝗱𝗮𝘁𝗶𝗼𝗻 𝗶𝗻 𝗔𝗜 𝗔𝗴𝗲𝗻𝘁𝘀

An AI Agent can call tools to retrieve information or perform actions. But should an agent 𝗯𝗹𝗶𝗻𝗱𝗹𝘆 𝘁𝗿𝘂𝘀𝘁 the result returned by a tool?
No.

A tool can return incomplete, invalid, unexpected, or inconsistent data. Therefore, a reliable agent should 𝗽𝗿𝗼𝗽𝗲𝗿𝗹𝘆 𝘃𝗮𝗹𝗶𝗱𝗮𝘁𝗲 the tool result before using it for further reasoning.

𝗘𝘅𝗮𝗺𝗽𝗹𝗲

A user asks:
"Can we fulfill tomorrow's order for 10,000 units?"

The agent calls an inventory tool.

The tool returns:
{"available_quantity": null}

The agent should not simply continue reasoning and assume that inventory information is available.

Instead, it should detect that the result is incomplete and handle the situation appropriately.

𝗧𝗵𝗲 𝗯𝗮𝘀𝗶𝗰 𝗽𝗮𝘁𝘁𝗲𝗿𝗻

Tool Call
↓
Tool Result
↓
Validate Result
↓
Valid → Continue
Invalid → Handle Error / Retry / Alternative Action

𝗦𝗶𝗺𝗽𝗹𝗶𝗳𝗶𝗲𝗱 𝗶𝗺𝗽𝗹𝗲𝗺𝗲𝗻𝘁𝗮𝘁𝗶𝗼𝗻

result = get_inventory("Product X")

if not result:
return "Inventory information unavailable"

if result.get("available_quantity") is None:
return "Inventory data is incomplete"

if result["available_quantity"] < 0:
return "Invalid inventory quantity"

return analyze_inventory(result)

The important point is that 𝗩𝗮𝗹𝗶𝗱𝗮𝘁𝗶𝗼𝗻 𝗵𝗮𝗽𝗽𝗲𝗻𝘀 𝗯𝗲𝗳𝗼𝗿𝗲 𝘁𝗵𝗲 𝗿𝗲𝘀𝘂𝗹𝘁 𝗶𝘀 𝘂𝘀𝗲𝗱.

In an enterprise AI agent, this simple principle can prevent unreliable tool outputs from propagating through the agent's reasoning and ultimately affecting the final response.

𝗥𝗲𝗹𝗶𝗮𝗯𝗹𝗲 𝗔𝗜 𝗔𝗴𝗲𝗻𝘁𝘀 𝗱𝗼 𝗻𝗼𝘁 𝗷𝘂𝘀𝘁 𝗰𝗮𝗹𝗹 𝘁𝗼𝗼𝗹𝘀.
𝗧𝗵𝗲𝘆 𝗰𝗵𝗲𝗰𝗸 𝘄𝗵𝗮𝘁 𝘁𝗵𝗼𝘀𝗲 𝘁𝗼𝗼𝗹𝘀 𝗿𝗲𝘁𝘂𝗿𝗻.

hashtag #AI500 hashtag #MicrosoftAzure hashtag #AIAgents hashtag #GenerativeAI hashtag #EnterpriseAI hashtag #AIEngineering hashtag #AgenticAI …more   Activate to view larger image, 
￼
    Activate to view larger image,    Like  Comment      Repost       Send           
 Feed post number 30 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 1w •        If you’re looking to strengthen your hands-on skills in RAG and AI Agents, the scholarship opportunity for the "AI Engineering Buildcamp: From RAG to Agents", an 8-week, hands-on learning experience led by Alexey Grigorev, is worth exploring. The link is available in the original post. …more   
￼
   Alexey Grigorev    • 3rd+ Founder of DataTalks.Club | Teaching engineers to build production AI systems | AI agents, LLMs, ML, data engineering | 100,000+ learners 1w •     Follow I'm launching a new iteration of my AI Engineering Buildcamp.

This time, I also offer several scholarship spots.

I understand that not everyone has the budget for a paid program, but many are eager to learn, practice, and develop their skills.

If you're motivated to learn but cost is a barrier, apply here: https://lnkd.in/d7FjPicT

Last time, this form went viral, and I got thousands of applications.

The course starts on September 21, 2026. It's live, hands-on, and focused on building production-ready AI agents step by step.

I hope this makes the program more accessible to those who need it most.

Don't postpone your application too long, because the deadline is September 13 (in 2 weeks).

Please share this with your network so more people in need of a scholarship can see it. Thank you for helping spread the word! …more   Activate to view larger image, 
￼
    Activate to view larger image,    
￼
3   Like  Comment      Repost       Send           
 Feed post number 31 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 1w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | Part 31: 𝗔𝗴𝗲𝗻𝘁𝗶𝗰 𝗥𝗔𝗚

What if answering an enterprise question requires information from several sources, and the system does not know in advance which sources it needs?

This is where 𝗔𝗴𝗲𝗻𝘁𝗶𝗰 𝗥𝗔𝗚 becomes powerful.

A traditional RAG flow is relatively fixed:

Question → Retrieve → Rerank → Generate

But consider:

"Which suppliers are at risk if we increase Product X production by 20% next month?"

There may be no single document containing the answer.

An Agentic RAG system can determine that it needs to:

1. Find Product X's material requirements.
2. Identify the relevant suppliers.
3. Retrieve supplier capacity.
4. Check current inventory.
5. Check incoming material.
6. Determine which suppliers are at risk.

The key difference is that the agent decides what information to retrieve and what to do next.

Conceptually:

Question
↓
𝗔𝗴𝗲𝗻𝘁
↓
Create plan
↓
Retrieve information
↓
Evaluate results
↓
Need more information?
↓ Yes
Retrieve again
↓
Enough information
↓
Generate answer

A simplified implementation:

question = "Which suppliers are at risk if Product X production increases 20%?"

data = []

action = agent.decide_next_action(question, data)

if action == "materials":
data.append(get_material_requirements("Product X"))

if action == "suppliers":
data.append(get_suppliers(data))

if action == "capacity":
data.append(get_supplier_capacity(data))

if action == "inventory":
data.append(get_inventory(data))

answer = agent.generate_answer(question, data)

The important idea is this:

The agent is not simply asking:

"Which document is most similar to my question?"

It is asking:

"What information do I need to answer this question?"

That makes retrieval a dynamic, goal-driven process rather than a single search operation.

RAG retrieves information. Agentic RAG uses an agent to decide how information should be retrieved to solve the task.

hashtag #AI500 hashtag #AgenticRAG hashtag #RAG hashtag #EnterpriseAI hashtag #GenerativeAI hashtag #AIEngineering …more   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
3   Like  Comment      Repost       Send           
 Feed post number 32 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 1w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | Part 30: 𝗠𝘂𝗹𝘁𝗶-𝗤𝘂𝗲𝗿𝘆 𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹

What if one question has several different ways of expressing the same information need? A single search query may retrieve relevant information, but it can also miss useful content simply because the documents use different terminology.

𝗧𝗵𝗶𝘀 𝗶𝘀 𝘄𝗵𝗲𝗿𝗲 𝗠𝘂𝗹𝘁𝗶-𝗤𝘂𝗲𝗿𝘆 𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹 𝗵𝗲𝗹𝗽𝘀.

Instead of searching with one query, we generate multiple queries that represent different aspects or formulations of the same question.

𝗘𝘅𝗮𝗺𝗽𝗹𝗲

User asks:
"What are the risks of terminating a supplier contract because of repeated quality issues?"

Different retrieval queries could be:

1. Supplier contract termination for quality nonconformance
2. Legal risks of supplier termination
3. Supplier termination clauses for repeated defects
4. Contractual consequences of supplier quality failures

Each query searches the knowledge base independently. The retrieved results are then combined, and duplicate results can be removed.

The important idea is:

𝗢𝗻𝗲 𝗾𝘂𝗲𝘀𝘁𝗶𝗼𝗻 → 𝗠𝘂𝗹𝘁𝗶𝗽𝗹𝗲 𝗾𝘂𝗲𝗿𝗶𝗲𝘀 → 𝗠𝘂𝗹𝘁𝗶𝗽𝗹𝗲 𝗿𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹𝘀 → 𝗖𝗼𝗺𝗯𝗶𝗻𝗲𝗱 𝗿𝗲𝘀𝘂𝗹𝘁𝘀

𝗦𝗶𝗺𝗽𝗹𝗲 𝗣𝘆𝘁𝗵𝗼𝗻 𝗘𝘅𝗮𝗺𝗽𝗹𝗲

queries = [
"supplier contract termination for quality nonconformance",
"legal risks of supplier termination",
"supplier termination clauses for repeated defects",
"contractual consequences of supplier quality failures"
]

results = []

for query in queries:
results.extend(vector_search(query))

unique_results = remove_duplicates(results)

print(unique_results)

The benefit is not simply retrieving more documents.

𝗧𝗵𝗲 𝗴𝗼𝗮𝗹 𝗶𝘀 𝘁𝗼 𝗶𝗺𝗽𝗿𝗼𝘃𝗲 𝗿𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹 𝗰𝗼𝘃𝗲𝗿𝗮𝗴𝗲.

A document missed by one query may be discovered by another because it uses different terminology or focuses on a different aspect of the same question.

That makes Multi-Query Retrieval particularly useful for complex enterprise questions where one wording may not capture the entire information need.

hashtag #AI500 hashtag #RAG hashtag #EnterpriseAI hashtag #GenerativeAI hashtag #AIEngineering …more   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
1   Like  Comment      Repost       Send           
 Feed post number 33 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 1w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | Part 29: 𝗤𝘂𝗲𝗿𝘆 𝗥𝗲𝘄𝗿𝗶𝘁𝗶𝗻𝗴 𝗳𝗼𝗿 𝗥𝗔𝗚

In a RAG system, retrieval quality depends heavily on the quality of the query sent to the retrieval system. But users do not always ask questions in a form that is optimal for retrieval.

For example:

User query:
"How does it authenticate users?"
What does "it" refer to?

If the conversation context tells us that the user is asking about an application, the query can be rewritten as:
"How does the application authenticate users?"

The rewritten query is more explicit and can improve the chances of retrieving relevant documents.

𝗪𝗵𝗮𝘁 𝗶𝘀 𝗤𝘂𝗲𝗿𝘆 𝗥𝗲𝘄𝗿𝗶𝘁𝗶𝗻𝗴?

Query rewriting uses an LLM to transform the user's original query into a clearer, more retrieval-friendly query while preserving its original intent.

Conceptually:

User Query
↓
Query Rewriting
↓
Optimized Query
↓
Retrieval
↓
Relevant Documents
↓
LLM Generation

𝗘𝘅𝗮𝗺𝗽𝗹𝗲

Suppose a user asks:
"What are its authentication requirements?"

Conversation context:
"We are designing a multi-agent application that uses OAuth 2.0."

The original query is ambiguous.

A query rewriting prompt could produce:
"What are the OAuth 2.0 authentication requirements for the multi-agent application?"

This rewritten query contains the missing context and is much more suitable for semantic retrieval.

𝗦𝗶𝗺𝗽𝗹𝗲 𝗣𝘆𝘁𝗵𝗼𝗻 𝗘𝘅𝗮𝗺𝗽𝗹𝗲

from openai import OpenAI

client = OpenAI()

query = "What are its authentication requirements?"
context = "We are designing a multi-agent application that uses OAuth 2.0."

prompt = f"""
Rewrite the user query for retrieval.
Preserve the original intent and use the available context.

Context: {context}
User query: {query}

Return only the rewritten query.
"""
response = client.responses.create(
model="gpt-4.1-mini",
input=prompt
)

rewritten_query = response.output_text
print(rewritten_query)

Possible output:

"What are the OAuth 2.0 authentication requirements for the multi-agent application?"

𝗪𝗵𝘆 𝗶𝘀 𝗶𝘁 𝘂𝘀𝗲𝗳𝘂𝗹?

Query rewriting can help when a query is:

* Ambiguous
* Too short
* Missing conversational context
* Expressed using informal language
* Different from the terminology used in the knowledge base

The key principle is simple:

𝗧𝗵𝗲 𝗯𝗲𝘁𝘁𝗲𝗿 𝘁𝗵𝗲 𝗾𝘂𝗲𝗿𝘆 𝗿𝗲𝗽𝗿𝗲𝘀𝗲𝗻𝘁𝘀 𝘁𝗵𝗲 𝘂𝘀𝗲𝗿'𝘀 𝗶𝗻𝘁𝗲𝗻𝘁, 𝘁𝗵𝗲 𝗯𝗲𝘁𝘁𝗲𝗿 𝘁𝗵𝗲 𝗿𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹 𝘀𝘁𝗲𝗽 𝗰𝗮𝗻 𝗽𝗲𝗿𝗳𝗼𝗿𝗺.

𝗔𝗜-𝟱𝟬𝟬 𝗧𝗮𝗸𝗲𝗮𝘄𝗮𝘆

Query rewriting is a preprocessing technique in RAG that transforms an original user query into a clearer, context-aware query optimized for information retrieval, while preserving the user's intent.

hashtag #AI500 hashtag #ArtificialIntelligence hashtag #GenerativeAI hashtag #RAG hashtag #RetrievalAugmentedGeneration hashtag #LLM hashtag #QueryRewriting hashtag #MicrosoftAzure …more   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
1   Like  Comment      Repost       Send           
 Feed post number 34 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 1w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | Part 28: 𝗥𝗲𝗿𝗮𝗻𝗸𝗶𝗻𝗴 𝗶𝗻 𝗥𝗔𝗚

Retrieving relevant information is important in RAG. But what if the retrieved results are relevant, yet the 𝗺𝗼𝘀𝘁 𝗿𝗲𝗹𝗲𝘃𝗮𝗻𝘁 result is not ranked first? This is where 𝗥𝗲𝗿𝗮𝗻𝗸𝗶𝗻𝗴 comes in.

𝗪𝗵𝗮𝘁 𝗶𝘀 𝗥𝗲𝗿𝗮𝗻𝗸𝗶𝗻𝗴?

Reranking is a second-stage process that takes the candidates returned by retrieval and reorders them according to their relevance to the user's query.

𝗥𝗔𝗚 𝗳𝗹𝗼𝘄:

User Query
↓
Retrieve Candidates
↓
Reranker
↓
Top-K Relevant Chunks
↓
LLM

𝗘𝘅𝗮𝗺𝗽𝗹𝗲

Suppose an employee asks:
"How can a supplier contract be terminated due to repeated quality failures?"

The retrieval system returns:

1. Supplier onboarding requirements
2. Supplier quality inspection
3. Contract renewal procedure
4. Supplier termination due to quality failures
5. Supplier performance evaluation

Several are related to the query, but #4 is the most relevant. A reranker evaluates the query against the retrieved chunks and may reorder them as:

1. Supplier termination due to quality failures
2. Supplier performance evaluation
3. Supplier quality inspection
4. Contract renewal procedure
5. Supplier onboarding

The LLM can now receive the highest-ranked chunks.

𝗦𝗶𝗺𝗽𝗹𝗲 𝗣𝘆𝘁𝗵𝗼𝗻 𝗘𝘅𝗮𝗺𝗽𝗹𝗲

from sentence_transformers import CrossEncoder

query = "How can a supplier contract be terminated due to quality failures?"

docs = [
"Supplier onboarding requirements",
"Supplier quality inspection",
"Contract renewal procedure",
"Supplier termination due to quality failures",
"Supplier performance evaluation"
]

model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
scores = model.predict([(query, d) for d in docs])
ranked = sorted(zip(scores, docs), reverse=True)

for score, doc in ranked:
print(score, doc)

𝗧𝗵𝗲 𝗞𝗲𝘆 𝗜𝗱𝗲𝗮

𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹 → Find potentially relevant information
𝗥𝗲𝗿𝗮𝗻𝗸𝗶𝗻𝗴 → Find the most relevant information
𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗼𝗻 → Use the best context to answer

Reranking gives a RAG system a second opportunity to identify the information that matters most for the specific question.

𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗲 𝗯𝗿𝗼𝗮𝗱𝗹𝘆.
𝗥𝗲𝗿𝗮𝗻𝗸 𝗽𝗿𝗲𝗰𝗶𝘀𝗲𝗹𝘆.

hashtag #AI500 hashtag #RAG hashtag #EnterpriseAI hashtag #GenerativeAI hashtag #AIEngineering …more   Activate to view larger image, 
￼
    Activate to view larger image,    Like  Comment      Repost       Send           
 Feed post number 35 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 1w • Edited •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟮𝟳: 𝗛𝘆𝗯𝗿𝗶𝗱 𝗦𝗲𝗮𝗿𝗰𝗵

𝗪𝗵𝘆 𝗱𝗼 𝘄𝗲 𝗻𝗲𝗲𝗱 𝗯𝗼𝘁𝗵 𝗸𝗲𝘆𝘄𝗼𝗿𝗱 𝘀𝗲𝗮𝗿𝗰𝗵 𝗮𝗻𝗱 𝘃𝗲𝗰𝘁𝗼𝗿 𝘀𝗲𝗮𝗿𝗰𝗵?

Imagine an enterprise employee asks:

"Show me the status of PO-847293 for the delayed shipment."

There are two different things to find.

𝗞𝗲𝘆𝘄𝗼𝗿𝗱 𝗦𝗲𝗮𝗿𝗰𝗵 can identify the exact identifier:
PO-847293
𝗩𝗲𝗰𝘁𝗼𝗿 𝗦𝗲𝗮𝗿𝗰𝗵 can understand the meaning behind:
"delayed shipment"

Keyword search is good at finding exact terms. Vector search is good at finding semantically related content, even when the words are different.

𝗛𝘆𝗯𝗿𝗶𝗱 𝗦𝗲𝗮𝗿𝗰𝗵 combines both.

𝗛𝗼𝘄 𝗶𝘁 𝘄𝗼𝗿𝗸𝘀

User Query
↓
Keyword Search
+
Vector Search
↓
Retrieve results from both
↓
Merge rankings using RRF
↓
Combined results

𝗪𝗵𝗮𝘁 𝗶𝘀 𝗥𝗥𝗙?

Reciprocal Rank Fusion combines results from different search methods based on their ranking positions. This allows keyword and vector search to contribute to one combined ranking.

𝗦𝗶𝗺𝗽𝗹𝗲 𝗲𝘅𝗮𝗺𝗽𝗹𝗲

Keyword Search finds:

1. PO-847293
2. PO-847294
3. PO-847281

Vector Search finds:

1. Shipment delay report
2. PO-847293 delivery issue
3. Delayed customer order

Hybrid Search combines these rankings to identify the most relevant results.

𝗦𝗮𝗺𝗽𝗹𝗲 𝗣𝘆𝘁𝗵𝗼𝗻

from azure.search.documents.models import VectorizedQuery

query_vector = embed(user_query)

vector_query = VectorizedQuery(
vector=query_vector,
k_nearest_neighbors=5,
fields="contentVector"
)

results = search_client. search(
search_text=user_query,
vector_queries=[vector_query],
top=5
)

Here, search_text performs keyword search while vector_queries performs vector search.

The search service combines their results into a unified ranking.

𝗞𝗲𝘆 𝗜𝗱𝗲𝗮

𝗞𝗲𝘆𝘄𝗼𝗿𝗱 𝗦𝗲𝗮𝗿𝗰𝗵 → 𝗠𝗮𝘁𝗰𝗵 𝘄𝗼𝗿𝗱𝘀
𝗩𝗲𝗰𝘁𝗼𝗿 𝗦𝗲𝗮𝗿𝗰𝗵 → 𝗠𝗮𝘁𝗰𝗵 𝗺𝗲𝗮𝗻𝗶𝗻𝗴
𝗛𝘆𝗯𝗿𝗶𝗱 𝗦𝗲𝗮𝗿𝗰𝗵 → 𝗖𝗼𝗺𝗯𝗶𝗻𝗲 𝗯𝗼𝘁𝗵

That is why Hybrid Search is particularly useful for enterprise search, where queries often contain both exact identifiers and natural-language intent.

hashtag #AI500 hashtag #ArtificialIntelligence hashtag #GenerativeAI hashtag #HybridSearch hashtag #AzureAISearch hashtag #RAG hashtag #VectorSearch …more   Activate to view larger image, 
￼
    Activate to view larger image,    Like  Comment      Repost       Send           
 Feed post number 36 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 1w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟮𝟲: 𝗦𝗲𝗺𝗮𝗻𝘁𝗶𝗰 𝗖𝗵𝘂𝗻𝗸𝗶𝗻𝗴

𝗪𝗵𝗮𝘁 𝗶𝗳 𝘁𝗵𝗲 𝗺𝗲𝗮𝗻𝗶𝗻𝗴 𝗰𝗵𝗮𝗻𝗴𝗲𝘀 𝗯𝘂𝘁 𝘁𝗵𝗲 𝘁𝗼𝗸𝗲𝗻 𝗰𝗼𝘂𝗻𝘁 𝗱𝗼𝗲𝘀𝗻'𝘁?

When preparing documents for RAG, splitting text every 500 tokens can create chunks that split related ideas or combine unrelated ones.

𝗦𝗲𝗺𝗮𝗻𝘁𝗶𝗰 𝗖𝗵𝘂𝗻𝗸𝗶𝗻𝗴 asks a different question:

"Where does the meaning of the document change?"

𝗛𝗼𝘄 𝗱𝗼𝗲𝘀 𝗶𝘁 𝘄𝗼𝗿𝗸?

1. Split the document into sentences.
2. Convert each sentence into an embedding.
3. Compare embeddings of neighboring sentences.
4. Identify significant drops in semantic similarity.
5. Use those points as potential chunk boundaries.

𝗘𝘅𝗮𝗺𝗽𝗹𝗲

Sentence 1:
The customer placed an order for 10,000 units.

Sentence 2:
The requested delivery date is September 15.

Sentence 3:
The customer has a premium shipping agreement.

Sentence 4:
The manufacturing plant increased production capacity by 20%.

Sentences 1, 2 and 3 discuss the customer order.

Sentence 4 introduces a different subject.

A semantic chunking approach could therefore create:

𝗖𝗵𝘂𝗻𝗸 𝟭
Customer order, delivery date and shipping agreement.

𝗖𝗵𝘂𝗻𝗸 𝟮
Manufacturing plant and production capacity.

The boundary is based on a change in meaning, not simply a fixed token count.

𝗦𝗶𝗺𝗽𝗹𝗶𝗳𝗶𝗲𝗱 𝗙𝗹𝗼𝘄

Document
↓
Sentences
↓
Sentence Embeddings
↓
Semantic Similarity
↓
Detect Meaning Change
↓
Chunk Boundary
↓
Meaningful Chunks

𝗦𝗮𝗺𝗽𝗹𝗲 𝗣𝘆𝘁𝗵𝗼𝗻 𝗖𝗼𝗱𝗲

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

sentences = [
"The customer placed an order for 10,000 units.",
"The requested delivery date is September 15.",
"The customer has a premium shipping agreement.",
"The manufacturing plant increased production capacity by 20%."
]

model = SentenceTransformer("all-MiniLM-L6-v2")
embeddings = model.encode(sentences)

for i in range(len(sentences) - 1):

score = cosine_similarity(
[embeddings[i]],
[embeddings[i + 1]]
)[0][0]

print(f"{i+1} → {i+2}: {score:.3f}")

The key idea:

𝗦𝗲𝗺𝗮𝗻𝘁𝗶𝗰 𝗖𝗵𝘂𝗻𝗸𝗶𝗻𝗴 = 𝗖𝗵𝘂𝗻𝗸 𝗯𝘆 𝗺𝗲𝗮𝗻𝗶𝗻𝗴, 𝗻𝗼𝘁 𝗷𝘂𝘀𝘁 𝗯𝘆 𝘀𝗶𝘇𝗲.

hashtag #AI500 hashtag #ArtificialIntelligence hashtag #GenerativeAI hashtag #RAG hashtag #SemanticChunking hashtag #Embeddings …more   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
1   Like  Comment      Repost       Send           
 Feed post number 37 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 1w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟮𝟱 | 𝗖𝗵𝘂𝗻𝗸 𝗦𝗶𝘇𝗲 & 𝗖𝗵𝘂𝗻𝗸 𝗢𝘃𝗲𝗿𝗹𝗮𝗽

In a RAG system, a large document is divided into smaller chunks before the content is embedded and stored for retrieval.

But how big should each chunk be?

Consider a manufacturing maintenance manual.

A user asks:
"How do I replace the hydraulic filter?"

Suppose we create a very small chunk:
"Depressurize the system..."

The chunk may not contain enough context to answer the question properly.

Now suppose we create a very large chunk containing an entire chapter.

It may contain pump specifications, filter replacement, lubrication, troubleshooting, and safety procedures. The relevant information is now mixed with a lot of unrelated content.

𝗧𝗵𝗶𝘀 𝗶𝘀 𝘁𝗵𝗲 𝘁𝗿𝗮𝗱𝗲-𝗼𝗳𝗳 𝗶𝗻 𝗰𝗵𝘂𝗻𝗸 𝘀𝗶𝘇𝗲.

𝗦𝗺𝗮𝗹𝗹 𝗰𝗵𝘂𝗻𝗸𝘀
Less context, but potentially more precise information.
𝗟𝗮𝗿𝗴𝗲 𝗰𝗵𝘂𝗻𝗸𝘀
More context, but potentially more unrelated information.

There is another problem. Suppose a sentence falls at the boundary between two chunks:

Chunk 1:
"Before replacing the hydraulic filter, ensure that the system is"
Chunk 2:
"depressurized and the machine is switched off."

The meaning has been split across the boundary.

𝗧𝗵𝗶𝘀 𝗶𝘀 𝘄𝗵𝗲𝗿𝗲 𝗰𝗵𝘂𝗻𝗸 𝗼𝘃𝗲𝗿𝗹𝗮𝗽 𝗵𝗲𝗹𝗽𝘀.

Some content from one chunk is repeated in the next chunk.

For example:
Chunk 1:
"Before replacing the hydraulic filter, ensure that the system is depressurized..."
Chunk 2:
"...the system is depressurized and the machine is switched off."

The overlapping content helps preserve context across the chunk boundary.

A simple Python implementation:

from langchain_text_splitters import RecursiveCharacterTextSplitter
splitter = RecursiveCharacterTextSplitter(
chunk_size=500,
chunk_overlap=100
)
chunks = splitter.split_text(document)

Here:

𝗰𝗵𝘂𝗻𝗸_𝘀𝗶𝘇𝗲 = 𝟱𝟬𝟬
defines the approximate maximum size of each chunk.

𝗰𝗵𝘂𝗻𝗸_𝗼𝘃𝗲𝗿𝗹𝗮𝗽 = 𝟭𝟬𝟬
allows part of one chunk to appear in the next chunk.

Conceptually:

Chunk 1
↓
Shared Context
↓
Chunk 2

𝗧𝗵𝗲𝗿𝗲 𝗶𝘀 𝗻𝗼 𝘂𝗻𝗶𝘃𝗲𝗿𝘀𝗮𝗹 𝗺𝗮𝗴𝗶𝗰 𝗻𝘂𝗺𝗯𝗲𝗿 𝗳𝗼𝗿 𝗰𝗵𝘂𝗻𝗸 𝘀𝗶𝘇𝗲 𝗼𝗿 𝗼𝘃𝗲𝗿𝗹𝗮𝗽.

The appropriate values depend on the nature and structure of the documents and the information that needs to be retrieved.

The key idea:

𝗧𝗼𝗼 𝘀𝗺𝗮𝗹𝗹 → 𝗟𝗼𝘀𝘀 𝗼𝗳 𝗰𝗼𝗻𝘁𝗲𝘅𝘁
𝗧𝗼𝗼 𝗹𝗮𝗿𝗴𝗲 → 𝗟𝗼𝘀𝘀 𝗼𝗳 𝗽𝗿𝗲𝗰𝗶𝘀𝗶𝗼𝗻
𝗥𝗶𝗴𝗵𝘁 𝘀𝗶𝘇𝗲 + 𝗿𝗶𝗴𝗵𝘁 𝗼𝘃𝗲𝗿𝗹𝗮𝗽 → 𝗕𝗲𝘁𝘁𝗲𝗿 𝗰𝗼𝗻𝘁𝗲𝘅𝘁 𝗽𝗿𝗲𝘀𝗲𝗿𝘃𝗮𝘁𝗶𝗼𝗻

𝗖𝗵𝘂𝗻𝗸 𝘀𝗶𝘇𝗲 𝗮𝗻𝗱 𝗼𝘃𝗲𝗿𝗹𝗮𝗽 𝗮𝗿𝗲 𝗶𝗺𝗽𝗼𝗿𝘁𝗮𝗻𝘁 𝗱𝗲𝘀𝗶𝗴𝗻 𝗱𝗲𝗰𝗶𝘀𝗶𝗼𝗻𝘀 𝗶𝗻 𝗮 𝗥𝗔𝗚 𝗽𝗶𝗽𝗲𝗹𝗶𝗻𝗲.

hashtag #AI500 hashtag #RAG hashtag #GenerativeAI hashtag #DocumentChunking hashtag #Chunking hashtag #ArtificialIntelligence …more   Activate to view larger image, 
￼
    Activate to view larger image,    Like  Comment      Repost       Send           
 Feed post number 38 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 1w •        𝗣𝗮𝗿𝘁 𝟮𝟰 | 𝗗𝗼𝗰𝘂𝗺𝗲𝗻𝘁 𝗖𝗵𝘂𝗻𝗸𝗶𝗻𝗴 𝗳𝗼𝗿 𝗥𝗔𝗚

In a RAG system, documents are rarely treated as one large piece of content. Consider a 200-page equipment maintenance manual containing information about machines, components, procedures, specifications, and troubleshooting. Embedding the entire document as one unit would make fine-grained retrieval difficult.

𝗧𝗵𝗶𝘀 𝗶𝘀 𝘄𝗵𝗲𝗿𝗲 𝗗𝗼𝗰𝘂𝗺𝗲𝗻𝘁 𝗖𝗵𝘂𝗻𝗸𝗶𝗻𝗴 𝗰𝗼𝗺𝗲𝘀 𝗶𝗻.

𝗗𝗼𝗰𝘂𝗺𝗲𝗻𝘁 𝗰𝗵𝘂𝗻𝗸𝗶𝗻𝗴 𝗶𝘀 𝘁𝗵𝗲 𝗽𝗿𝗼𝗰𝗲𝘀𝘀 𝗼𝗳 𝗱𝗶𝘃𝗶𝗱𝗶𝗻𝗴 𝗮 𝗹𝗮𝗿𝗴𝗲 𝗱𝗼𝗰𝘂𝗺𝗲𝗻𝘁 𝗶𝗻𝘁𝗼 𝘀𝗺𝗮𝗹𝗹𝗲𝗿 𝘂𝗻𝗶𝘁𝘀 𝗰𝗮𝗹𝗹𝗲𝗱 𝗰𝗵𝘂𝗻𝗸𝘀.

These chunks can then be embedded and stored for retrieval.

𝗗𝗼𝗰𝘂𝗺𝗲𝗻𝘁
↓
𝗖𝗵𝘂𝗻𝗸𝘀
↓
𝗘𝗺𝗯𝗲𝗱𝗱𝗶𝗻𝗴𝘀
↓
𝗩𝗲𝗰𝘁𝗼𝗿 𝗦𝘁𝗼𝗿𝗮𝗴𝗲

The objective is to make the relevant part of a document retrievable when a user asks a question. 

Now consider this section:

3.3 Filter Replacement Procedure

Before replacing the hydraulic filter, ensure that the hydraulic system is depressurized and the machine is switched off.

Replace the filter after 5,000 operating hours.

A poor split could produce:

Chunk 1:
"Before replacing the hydraulic filter, ensure that the hydraulic system..."
Chunk 2:
"...is depressurized and the machine is switched off. Replace the filter after 5,000 operating hours."

The meaning has been split.

A better chunk preserves the complete procedure:

"Before replacing the hydraulic filter, ensure that the hydraulic system is depressurized and the machine is switched off. Replace the filter after 5,000 operating hours."

𝗦𝗼 𝗵𝗼𝘄 𝗰𝗮𝗻 𝘄𝗲 𝗰𝗵𝘂𝗻𝗸 𝗮 𝗱𝗼𝗰𝘂𝗺𝗲𝗻𝘁 𝗺𝗼𝗿𝗲 𝗺𝗲𝗮𝗻𝗶𝗻𝗴𝗳𝘂𝗹𝗹𝘆?

A chunking strategy can consider:
• Headings and sections
• Paragraph boundaries
• Sentence boundaries
• Token or character limits
• Chunk overlap
• Semantic boundaries

A simple Python implementation:

from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
chunk_size=500,
chunk_overlap=100
)

chunks = splitter.split_text(document)

for chunk in chunks:
print(chunk)

The splitter attempts to preserve larger text units before splitting them into smaller ones.

𝗧𝗵𝗲 𝗸𝗲𝘆 𝗶𝗱𝗲𝗮:

𝗖𝗵𝘂𝗻𝗸𝗶𝗻𝗴 𝗶𝘀 𝗻𝗼𝘁 𝗷𝘂𝘀𝘁 𝗰𝘂𝘁𝘁𝗶𝗻𝗴 𝗮 𝗱𝗼𝗰𝘂𝗺𝗲𝗻𝘁 𝗶𝗻𝘁𝗼 𝗽𝗶𝗲𝗰𝗲𝘀.

It is about creating retrievable units while preserving the meaning and context of the original content.

𝗚𝗼𝗼𝗱 𝗰𝗵𝘂𝗻𝗸𝗶𝗻𝗴 𝗽𝗿𝗲𝘀𝗲𝗿𝘃𝗲𝘀 𝗺𝗲𝗮𝗻𝗶𝗻𝗴.
𝗣𝗼𝗼𝗿 𝗰𝗵𝘂𝗻𝗸𝗶𝗻𝗴 𝗰𝗮𝗻 𝗹𝗼𝘀𝗲 𝗰𝗼𝗻𝘁𝗲𝘅𝘁.

hashtag #AI500 hashtag #RAG hashtag #GenerativeAI hashtag #DocumentChunking hashtag #Embeddings hashtag #ArtificialIntelligence …more   Activate to view larger image, 
￼
    Activate to view larger image,   2 comments 1 repost   Like  Comment      Repost       Send           
 Feed post number 39 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 1w •        𝗣𝗮𝗿𝘁 𝟮𝟯 | 𝗩𝗲𝗰𝘁𝗼𝗿 𝗗𝗮𝘁𝗮𝗯𝗮𝘀𝗲𝘀 & 𝗩𝗲𝗰𝘁𝗼𝗿 𝗦𝘁𝗼𝗿𝗮𝗴𝗲

Where does an embedding actually live after it is created?

This becomes important when we move from 𝗘𝗺𝗯𝗲𝗱𝗱𝗶𝗻𝗴𝘀 and 𝗦𝗲𝗺𝗮𝗻𝘁𝗶𝗰 𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹 to real RAG systems. Consider a manufacturing company with thousands of equipment manuals. A document chunk might be:
"Replace the hydraulic filter after 5,000 operating hours."

An embedding model converts this text into a vector such as:
[0.12, -0.47, 0.83, 0.21, ...]

But where is this vector stored?

This is where a 𝗩𝗲𝗰𝘁𝗼𝗿 𝗗𝗮𝘁𝗮𝗯𝗮𝘀e or 𝗩𝗲𝗰𝘁𝗼𝗿 𝗦𝘁𝗼𝗿𝗲 comes in.

Some commonly used products include:
𝗣𝗶𝗻𝗲𝗰𝗼𝗻𝗲
𝗪𝗲𝗮𝘃𝗶𝗮𝘁𝗲
𝗠𝗶𝗹𝘃𝘂𝘀
𝗤𝗱𝗿𝗮𝗻𝘁
𝗖𝗵𝗿𝗼𝗺𝗮

Vector search is also supported by existing database and search platforms such as:
𝗣𝗼𝘀𝘁𝗴𝗿𝗲𝗦𝗤𝗟 + 𝗽𝗴𝘃𝗲𝗰𝘁𝗼𝗿
𝗠𝗼𝗻𝗴𝗼𝗗𝗕 𝗔𝘁𝗹𝗮𝘀 𝗩𝗲𝗰𝘁𝗼𝗿 𝗦𝗲𝗮𝗿𝗰𝗵
𝗔𝘇𝘂𝗿𝗲 𝗔𝗜 𝗦𝗲𝗮𝗿𝗰𝗵
𝗢𝗿𝗮𝗰𝗹𝗲 𝗗𝗮𝘁𝗮𝗯𝗮𝘀𝗲
𝗥𝗲𝗱𝗶𝘀

A vector record can conceptually contain:

ID:
8472

Text:
"Replace the hydraulic filter after 5,000 operating hours."
Embedding:
[0.12, -0.47, 0.83, ...]

Metadata:
machine = "M-102"
document = "Maintenance Manual"
plant = "P01"

Now suppose a user asks:

"How often should the hydraulic filter be replaced?"

The question is converted into an embedding.

The vector store searches for vectors that are closest to the query vector.

User Question
 ↓ 
Embedding Model
 ↓ 
Query Vector
 ↓ 
Vector Search
 ↓
Nearest Vectors
 ↓ 
Relevant Text Chunks

A simple Python example:

from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2") 

text = "Replace the hydraulic filter after 5,000 operating hours." 

vector = model.encode(text) 

print(vector.shape)
print(vector)

At query time:

query = "How often should the hydraulic filter be replaced?"
query_vector = model.encode(query) 

# Search the vector store using query_vector
# Retrieve the nearest matching chunks

The vector database or search engine performs the similarity search instead of requiring the LLM to scan every document.

𝗕𝘂𝘁 𝘁𝗵𝗲 𝘃𝗲𝗰𝘁𝗼𝗿 𝗱𝗮𝘁𝗮𝗯𝗮𝘀𝗲 𝗶𝘀 𝗻𝗼𝘁 𝘁𝗵𝗲 𝗟𝗟𝗠.

It stores vectors and associated information so that semantically relevant content can be efficiently retrieved.

The roles are different:

𝗩𝗲𝗰𝘁𝗼𝗿 𝗦𝘁𝗼𝗿𝗲 → 𝗙𝗶𝗻𝗱 𝗿𝗲𝗹𝗲𝘃𝗮𝗻𝘁 𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻
𝗟𝗟𝗠 → 𝗨𝗻𝗱𝗲𝗿𝘀𝘁𝗮𝗻𝗱 𝗮𝗻𝗱 𝗴𝗲𝗻𝗲𝗿𝗮𝘁𝗲 𝘁𝗵𝗲 𝗿𝗲𝘀𝗽𝗼𝗻𝘀𝗲
𝗧𝗼𝗴𝗲𝘁𝗵𝗲𝗿 → 𝗥𝗔𝗚

This is why vector storage is such an important component of a RAG architecture. …more   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
5 1 repost   Like  Comment      Repost       Send           
 Feed post number 40 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 1w •        𝗙𝗼𝗿𝘁𝘂𝗻𝗲 𝟱𝟬𝟬 𝗦𝗰𝗮𝗹𝗲 𝗘𝗻𝘁𝗲𝗿𝗽𝗿𝗶𝘀𝗲 𝗔𝗜: 𝗪𝗵𝗮𝘁 𝗗𝗼𝗲𝘀 𝘁𝗵𝗲 𝗔𝗿𝗰𝗵𝗶𝘁𝗲𝗰𝘁𝘂𝗿𝗲 𝗥𝗲𝗮𝗹𝗹𝘆 𝗟𝗼𝗼𝗸 𝗟𝗶𝗸𝗲?

When we say “Enterprise AI,” it is tempting to imagine one powerful LLM serving the entire organization. That is not how a large enterprise AI architecture typically needs to work. A Fortune 500 Scale company may have thousands of business processes, hundreds of applications, multiple data platforms and highly different requirements across departments. The solution is not one monolithic AI system.

It is a 𝗺𝗼𝗱𝘂𝗹𝗮𝗿 𝗘𝗻𝘁𝗲𝗿𝗽𝗿𝗶𝘀𝗲 𝗔𝗜 𝗮𝗿𝗰𝗵𝗶𝘁𝗲𝗰𝘁𝘂𝗿𝗲.

At the top are the 𝗔𝗜 𝗮𝗽𝗽𝗹𝗶𝗰𝗮𝘁𝗶𝗼𝗻𝘀 used by different business functions:

Sales AI
Finance AI
Supply Chain AI
Manufacturing AI
Customer Service AI
HR AI

Each can have specialized AI agents and workflows. But these applications can share a common 𝗘𝗻𝘁𝗲𝗿𝗽𝗿𝗶𝘀𝗲 𝗔𝗜 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺.

The platform can provide:

𝗠𝗼𝗱𝗲𝗹 𝗟𝗮𝘆𝗲𝗿
LLMs, embedding models and model gateways
𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹 𝗟𝗮𝘆𝗲𝗿
Vector databases, hybrid search and knowledge graphs
𝗔𝗴𝗲𝗻𝘁 𝗟𝗮𝘆𝗲𝗿
Planning, reasoning and tool orchestration
𝗧𝗼𝗼𝗹 & 𝗔𝗣𝗜 𝗟𝗮𝘆𝗲𝗿
Enterprise APIs, connectors and business services
𝗗𝗮𝘁𝗮 𝗦𝗲𝗿𝘃𝗶𝗰𝗲𝘀
Data access, semantic layers and metadata

Underneath this platform are the enterprise systems that already run the business:

𝗘𝗥𝗣
𝗖𝗥𝗠
𝗠𝗘𝗦 / 𝗣𝗟𝗠
𝗦𝘂𝗽𝗽𝗹𝘆 𝗖𝗵𝗮𝗶𝗻 𝗦𝘆𝘀𝘁𝗲𝗺𝘀
𝗙𝗶𝗻𝗮𝗻𝗰𝗶𝗮𝗹 𝗦𝘆𝘀𝘁𝗲𝗺𝘀
𝗛𝗖𝗠
𝗜𝗧𝗦𝗠
𝗟𝗲𝗴𝗮𝗹 𝗮𝗻𝗱 𝗢𝘁𝗵𝗲𝗿 𝗕𝘂𝘀𝗶𝗻𝗲𝘀𝘀 𝗦𝘆𝘀𝘁𝗲𝗺𝘀

Enterprise AI does not replace these systems.

𝗜𝘁 𝗰𝗼𝗻𝗻𝗲𝗰𝘁𝘀 𝘁𝗵𝗲𝗺 𝘁𝗼 𝗶𝗻𝘁𝗲𝗹𝗹𝗶𝗴𝗲𝗻𝘁 𝗔𝗜 𝗮𝗽𝗽𝗹𝗶𝗰𝗮𝘁𝗶𝗼𝗻𝘀 𝗮𝗻𝗱 𝗮𝗴𝗲𝗻𝘁𝘀.

For example, a manufacturing agent might combine:

IoT sensor data
Maintenance history
Engineering documents
ERP inventory
Production schedules
Customer orders

The agent can dynamically determine which information is required, retrieve it through approved tools and APIs, and provide the relevant context to the LLM.

But one layer cuts across the entire architecture:

𝗦𝗲𝗰𝘂𝗿𝗶𝘁𝘆, 𝗚𝗼𝘃𝗲𝗿𝗻𝗮𝗻𝗰𝗲 & 𝗖𝗼𝗺𝗽𝗹𝗶𝗮𝗻𝗰𝗲

Identity and access management
Authorization
Data security and privacy
Guardrails
Auditability
Risk and compliance
AI governance

This is critical because:

𝗧𝗵𝗲 𝗔𝗜 𝗮𝗴𝗲𝗻𝘁 𝗺𝗮𝘆 𝗱𝗲𝗰𝗶𝗱𝗲 𝘄𝗵𝗮𝘁 𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻 𝗶𝘁 𝗻𝗲𝗲𝗱𝘀.
𝗘𝗻𝘁𝗲𝗿𝗽𝗿𝗶𝘀𝗲 𝘀𝗲𝗰𝘂𝗿𝗶𝘁𝘆 𝗱𝗲𝗰𝗶𝗱𝗲𝘀 𝘄𝗵𝗮𝘁 𝗶𝘁 𝗶𝘀 𝗮𝗹𝗹𝗼𝘄𝗲𝗱 𝘁𝗼 𝗮𝗰𝗰𝗲𝘀𝘀.

So the central idea is:

𝗘𝗻𝘁𝗲𝗿𝗽𝗿𝗶𝘀𝗲 𝗔𝗜 𝗶𝘀 𝗻𝗼𝘁 𝗮 𝘀𝗶𝗻𝗴𝗹𝗲 𝗔𝗜 𝗺𝗼𝗱𝗲𝗹.

It is a 𝗰𝗼𝗺𝗽𝗼𝘀𝗮𝗯𝗹𝗲 𝗲𝗰𝗼𝘀𝘆𝘀𝘁𝗲𝗺 of models, agents, retrieval, enterprise data, APIs, business applications, security and governance.

𝗧𝗵𝗲 𝗟𝗟𝗠 𝗶𝘀 𝗼𝗻𝗲 𝗽𝗮𝗿𝘁 𝗼𝗳 𝘁𝗵𝗲 𝗮𝗿𝗰𝗵𝗶𝘁𝗲𝗰𝘁𝘂𝗿𝗲.

𝗧𝗵𝗲 𝗿𝗲𝗮𝗹 𝗘𝗻𝘁𝗲𝗿𝗽𝗿𝗶𝘀𝗲 𝗔𝗜 𝘃𝗮𝗹𝘂𝗲 𝗰𝗼𝗺𝗲𝘀 𝗳𝗿𝗼𝗺 𝗵𝗼𝘄 𝗮𝗹𝗹 𝘁𝗵𝗲𝘀𝗲 𝗰𝗼𝗺𝗽𝗼𝗻𝗲𝗻𝘁𝘀 𝘄𝗼𝗿𝗸 𝘁𝗼𝗴𝗲𝘁𝗵𝗲𝗿. …more   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
8 1 repost   Like  Comment      Repost       Send           
 Feed post number 41 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 2w • Edited •        𝗘𝗡𝗧𝗘𝗥𝗣𝗥𝗜𝗦𝗘 𝗔𝗜 𝗜𝗦 𝗡𝗢𝗧 𝗝𝗨𝗦𝗧 𝗔𝗡 𝗟𝗟𝗠

One of the biggest misconceptions about Enterprise AI is:

𝗝𝘂𝘀𝘁 𝗰𝗼𝗻𝗻𝗲𝗰𝘁 𝗮𝗻 𝗟𝗟𝗠 𝘁𝗼 𝗰𝗼𝗺𝗽𝗮𝗻𝘆 𝗱𝗮𝘁𝗮, 𝗮𝗻𝗱 𝘆𝗼𝘂 𝗵𝗮𝘃𝗲 𝗮𝗻 𝗘𝗻𝘁𝗲𝗿𝗽𝗿𝗶𝘀𝗲 𝗔𝗜 𝘀𝘆𝘀𝘁𝗲𝗺.

Not quite.

Consider a manufacturing company where a critical pump suddenly shows abnormal vibration.

An engineer asks:

𝗪𝗵𝗮𝘁 𝗶𝘀 𝗵𝗮𝗽𝗽𝗲𝗻𝗶𝗻𝗴, 𝗵𝗮𝘀 𝘁𝗵𝗶𝘀 𝗵𝗮𝗽𝗽𝗲𝗻𝗲𝗱 𝗯𝗲𝗳𝗼𝗿𝗲, 𝗮𝗻𝗱 𝘄𝗵𝗮𝘁 𝘀𝗵𝗼𝘂𝗹𝗱 𝘄𝗲 𝗱𝗼 𝗻𝗲𝘅𝘁?

A single LLM cannot reliably answer this question.

The Enterprise AI system may need to combine:

𝗟𝗟𝗠
Understands the question, reasons over information, and generates the response.
𝗩𝗘𝗖𝗧𝗢𝗥 𝗗𝗔𝗧𝗔𝗕𝗔𝗦𝗘
Retrieves maintenance manuals and reports from similar failures.
𝗘𝗡𝗧𝗘𝗥𝗣𝗥𝗜𝗦𝗘 𝗗𝗔𝗧𝗔𝗕𝗔𝗦𝗘
Provides asset history and structured operational data.
𝗜𝗢𝗧 𝗔𝗡𝗗 𝗔𝗣𝗜𝗦
Provide current sensor readings and real-time information.
𝗕𝗨𝗦𝗜𝗡𝗘𝗦𝗦 𝗟𝗢𝗚𝗜𝗖
Applies safety rules, operational constraints, and deterministic decisions.

The flow becomes:

𝗤𝘂𝗲𝘀𝘁𝗶𝗼𝗻
↓
𝗨𝗻𝗱𝗲𝗿𝘀𝘁𝗮𝗻𝗱
↓
𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗲
↓
𝗤𝘂𝗲𝗿𝘆 𝗘𝗻𝘁𝗲𝗿𝗽𝗿𝗶𝘀𝗲 𝗗𝗮𝘁𝗮
↓
𝗚𝗲𝘁 𝗥𝗲𝗮𝗹-𝗧𝗶𝗺𝗲 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻
↓
𝗔𝗽𝗽𝗹𝘆 𝗥𝘂𝗹𝗲𝘀
↓
𝗥𝗲𝗮𝘀𝗼𝗻
↓
𝗔𝗻𝘀𝘄𝗲𝗿

This leads to a fundamental principle:

𝗗𝗢 𝗡𝗢𝗧 𝗨𝗦𝗘 𝗔𝗡 𝗟𝗟𝗠 𝗙𝗢𝗥 𝗘𝗩𝗘𝗥𝗬𝗧𝗛𝗜𝗡𝗚.

Use each technology for what it does best.
𝗟𝗟𝗠 → Language, reasoning, synthesis
𝗩𝗘𝗖𝗧𝗢𝗥 𝗗𝗕 → Semantic retrieval
𝗦𝗤𝗟 𝗗𝗕 → Structured, authoritative data
𝗔𝗣𝗜𝗦 → Real-time information and actions
𝗕𝗨𝗦𝗜𝗡𝗘𝗦𝗦 𝗟𝗢𝗚𝗜𝗖 → Rules and workflows
𝗥𝗔𝗚 → Connects retrieved knowledge with the LLM

An LLM may know everything about predictive maintenance. But it does not automatically know:

𝗪𝗵𝗮𝘁 𝗶𝘀 𝗵𝗮𝗽𝗽𝗲𝗻𝗶𝗻𝗴 𝘁𝗼 𝗣𝘂𝗺𝗽 𝟯 𝗿𝗶𝗴𝗵𝘁 𝗻𝗼𝘄?

That requires access to current enterprise information.

So Enterprise AI is not:
𝗟𝗟𝗠 + 𝗗𝗢𝗖𝗨𝗠𝗘𝗡𝗧𝗦

It is:
𝗟𝗟𝗠 + 𝗥𝗘𝗧𝗥𝗜𝗘𝗩𝗔𝗟 + 𝗗𝗔𝗧𝗔 + 𝗔𝗣𝗜𝗦 + 𝗕𝗨𝗦𝗜𝗡𝗘𝗦𝗦 𝗟𝗢𝗚𝗜𝗖 + 𝗦𝗘𝗖𝗨𝗥𝗜𝗧𝗬 + 𝗚𝗢𝗩𝗘𝗥𝗡𝗔𝗡𝗖𝗘

𝗧𝗵𝗲 𝗟𝗟𝗠 𝗶𝘀 𝗻𝗼𝘁 𝘁𝗵𝗲 𝗲𝗻𝘁𝗶𝗿𝗲 𝗘𝗻𝘁𝗲𝗿𝗽𝗿𝗶𝘀𝗲 𝗔𝗜 𝘀𝘆𝘀𝘁𝗲𝗺.

𝗜𝘁 𝗶𝘀 𝘁𝗵𝗲 𝗶𝗻𝘁𝗲𝗹𝗹𝗶𝗴𝗲𝗻𝗰𝗲 𝗹𝗮𝘆𝗲𝗿 𝗶𝗻 𝗮 𝗹𝗮𝗿𝗴𝗲𝗿 𝗲𝗻𝘁𝗲𝗿𝗽𝗿𝗶𝘀𝗲 𝗔𝗜 𝗮𝗿𝗰𝗵𝗶𝘁𝗲𝗰𝘁𝘂𝗿𝗲. 𝗕𝗲𝘁𝘁𝗲𝗿 𝗺𝗼𝗱𝗲𝗹𝘀 𝗺𝗮𝘁𝘁𝗲𝗿.

𝗕𝘂𝘁 𝗯𝗲𝘁𝘁𝗲𝗿 𝗮𝗿𝗰𝗵𝗶𝘁𝗲𝗰𝘁𝘂𝗿𝗲 𝗺𝗮𝘁𝘁𝗲𝗿𝘀 𝗷𝘂𝘀𝘁 𝗮𝘀 𝗺𝘂𝗰𝗵.

hashtag #EnterpriseAI hashtag #GenerativeAI hashtag #LLM hashtag #RAG hashtag #VectorDatabase hashtag #AIArchitecture hashtag #IndustrialAI hashtag #ManufacturingAI hashtag #ArtificialIntelligence …more   Activate to view larger image, 
￼
    Activate to view larger image,   4 comments   Like  Comment      Repost       Send           
 Feed post number 42 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 2w •        LLM vs Vector Database: Where Does Knowledge Actually Live?

If an LLM is already trained with enormous amounts of information, why do we need a Vector Database?

The answer becomes clear when we distinguish learning, retrieval, and reasoning.

Consider a company HR system.

An employee asks:

“I joined in 2024, have used 10 days of leave, and need 15 more days. Am I eligible?”

A Vector Database can retrieve the relevant company leave policies.

But retrieving information is not the same as reasoning over it.

The LLM can read the retrieved policies, understand the employee's question, apply the relevant rules, and formulate a contextual answer.

The architecture is:

Question
↓
Embedding Model
↓
Vector Database
↓
Relevant Documents
↓
LLM
↓
Reasoning + Answer

This gives us a simple distinction:

LLM = Learn + Understand + Reason + Generate
Vector Database = Store + Index + Retrieve

An LLM's learned knowledge is not stored like a conventional Vector Database. Its knowledge is distributed across learned parameters represented by matrices and tensors.

A Vector Database works differently. Documents are divided into chunks, converted into embedding vectors, and stored with their original content and metadata. A query is also converted into a vector, and similar vectors are retrieved.

Now consider another question:

“My hotel costs ₹6,000 per night, but company policy allows ₹5,000. How much can I claim for three nights?”

The Vector Database retrieves the policy. The LLM interprets the policy and formulates the answer.

This leads to a powerful principle:

Don't replace databases with LLMs.

Use each technology for what it does best.

SQL Database: Structured data
Vector Database: Semantic retrieval
LLM: Language understanding and reasoning
RAG: Connects retrieved knowledge with LLM generation

The LLM is not a filing cabinet.

It is the reasoning and language engine that can work with the information retrieved from the filing cabinet.

hashtag #LLM hashtag #RAG hashtag #VectorDatabase hashtag #GenerativeAI hashtag #EnterpriseAI hashtag #AIArchitecture hashtag #ArtificialIntelligence …more   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
2   Like  Comment      Repost       Send           
 Feed post number 43 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 2w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟮𝟮

𝗥𝗔𝗚 𝗔𝗿𝗰𝗵𝗶𝘁𝗲𝗰𝘁𝘂𝗿𝗲 & 𝗣𝗶𝗽𝗲𝗹𝗶𝗻𝗲

A RAG system connects an LLM with external knowledge so that the model can generate responses using relevant information retrieved at query time. But how does the information actually flow through a RAG system?

𝗧𝗵𝗲 𝗥𝗔𝗚 𝗔𝗿𝗰𝗵𝗶𝘁𝗲𝗰𝘁𝘂𝗿𝗲

A simplified RAG architecture consists of two major stages:

𝗜𝗻𝗱𝗲𝘅𝗶𝗻𝗴 𝗦𝘁𝗮𝗴𝗲

Documents
↓
Knowledge Base
↓
Embeddings
↓
Search Index

𝗤𝘂𝗲𝗿𝘆 𝗦𝘁𝗮𝗴𝗲

User Query
↓
Query Representation
↓
Search Index
↓
Relevant Information
↓
Context
↓
LLM
↓
Generated Answer

The indexing stage prepares knowledge for retrieval. The query stage retrieves relevant information and uses it to generate the answer.

𝗔 𝘀𝗶𝗺𝗽𝗹𝗲 𝗲𝘅𝗮𝗺𝗽𝗹𝗲

Consider an organization's knowledge base containing:
"Employees receive 24 days of annual leave and 12 days of sick leave per year."

A user asks:
"How many sick leave days do employees receive?"

The RAG pipeline can be represented as:

𝗤𝘂𝗲𝗿𝘆
"How many sick leave days do employees receive?"
↓
𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹
"Employees receive 24 days of annual leave and 12 days of sick leave per year."
↓
𝗖𝗼𝗻𝘁𝗲𝘅𝘁 + 𝗤𝘂𝗲𝗿𝘆
↓
𝗟𝗟𝗠
↓
𝗔𝗻𝘀𝘄𝗲𝗿
"Employees receive 12 days of sick leave per year."

𝗦𝗶𝗺𝗽𝗹𝗶𝗳𝗶𝗲𝗱 𝗣𝘆𝘁𝗵𝗼𝗻 𝗘𝘅𝗮𝗺𝗽𝗹𝗲

documents = [
 "Employees receive 24 days of annual leave "
 "and 12 days of sick leave per year." 
]

query = "How many sick leave days do employees receive?"

relevant_info = retrieve(query, documents)

prompt = (
 "Answer the question using the provided context.\n\n"
 "Context: " + relevant_info + "\n\n"
 "Question: " + query
)

answer = llm.generate(prompt)

print(answer)

In this simplified example:

retrieve() finds the information relevant to the query.

The retrieved information is added to the prompt as context.

llm.generate() uses the context and question to produce the answer.

𝗧𝗵𝗲 𝗸𝗲𝘆 𝗶𝗱𝗲𝗮

A RAG system separates the process into:

𝗞𝗻𝗼𝘄𝗹𝗲𝗱𝗴𝗲 𝗣𝗿𝗲𝗽𝗮𝗿𝗮𝘁𝗶𝗼𝗻
Prepare information so that it can be searched.

𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻 𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹
Find information relevant to the user's query.

𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗼𝗻
Provide the retrieved information to the LLM to generate the answer.

𝗥𝗔𝗚 𝗔𝗿𝗰𝗵𝗶𝘁𝗲𝗰𝘁𝘂𝗿𝗲 = 𝗞𝗻𝗼𝘄𝗹𝗲𝗱𝗴𝗲 + 𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹 + 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗼𝗻

hashtag #AI500 hashtag #RAG hashtag #GenerativeAI hashtag #ArtificialIntelligence hashtag #AIEngineering hashtag #MicrosoftAzure …more   Activate to view larger image, 
￼
    Activate to view larger image,    Like  Comment      Repost       Send           
 Feed post number 44 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 2w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟮𝟭

𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹-𝗔𝘂𝗴𝗺𝗲𝗻𝘁𝗲𝗱 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗼𝗻 (𝗥𝗔𝗚)

Large Language Models can generate remarkably useful responses, but they do not automatically have access to an organization's private, proprietary, or frequently changing information.

𝗥𝗔𝗚 provides a mechanism for connecting an LLM with external knowledge at inference time.

𝗪𝗵𝗮𝘁 𝗶𝘀 𝗥𝗔𝗚?

Retrieval-Augmented Generation combines two fundamental capabilities:

𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹

Find information relevant to the user's question from an external knowledge source.

𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗼𝗻

Provide the retrieved information to the LLM as context so it can generate an answer.

The basic RAG flow is:

𝗨𝘀𝗲𝗿 𝗤𝘂𝗲𝗿𝘆
↓
𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗲 𝗥𝗲𝗹𝗲𝘃𝗮𝗻𝘁 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻
↓
𝗔𝗱𝗱 𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗲𝗱 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻 𝘁𝗼 𝗣𝗿𝗼𝗺𝗽𝘁
↓
𝗟𝗟𝗠
↓
𝗚𝗿𝗼𝘂𝗻𝗱𝗲𝗱 𝗔𝗻𝘀𝘄𝗲𝗿

𝗔 𝘀𝗶𝗺𝗽𝗹𝗲 𝗲𝘅𝗮𝗺𝗽𝗹𝗲

Imagine that an organization's HR knowledge base contains:
"Employees are entitled to 24 days of annual leave."

An employee asks:
"How many annual leave days do I receive?"

The RAG system retrieves the relevant information from the knowledge source. The retrieved information is then provided to the LLM together with the user's question.

The LLM can generate:
"Employees are entitled to 24 days of annual leave."

The important point is that the answer is based on the retrieved organizational information.

𝗦𝗶𝗺𝗽𝗹𝗶𝗳𝗶𝗲𝗱 𝗣𝘆𝘁𝗵𝗼𝗻 𝗘𝘅𝗮𝗺𝗽𝗹𝗲

query = "How many annual leave days do I receive?" 
context = "Employees are entitled to 24 days of annual leave." 

prompt = ( "Answer the question using the provided context.\n\n" 
 "Context: " + context + "\n\n"
 "Question: " + query
)

response = llm.generate(prompt)

print(response)

Here, context represents the information retrieved from the external knowledge source. The prompt combines the retrieved context with the user's question.

The LLM receives both and generates the response.

𝗧𝗵𝗲 𝗸𝗲𝘆 𝗶𝗱𝗲𝗮

RAG does not require the LLM to have every piece of domain-specific information stored in its model parameters. Instead, relevant external information is retrieved at inference time and supplied to the LLM as context.

𝗥𝗔𝗚 = 𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗲 + 𝗔𝘂𝗴𝗺𝗲𝗻𝘁 + 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗲

RAG therefore provides a fundamental architectural pattern for building AI applications that can generate responses grounded in external knowledge.

hashtag #AI500 hashtag #RAG hashtag #GenerativeAI hashtag #ArtificialIntelligence hashtag #AIEngineering hashtag #MicrosoftAzure …more   Activate to view larger image, 
￼
    Activate to view larger image,    Like  Comment      Repost       Send           
 Feed post number 45 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 2w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟮𝟬

𝗦𝗲𝗺𝗮𝗻𝘁𝗶𝗰 𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹

Traditional search mainly looks for matching words. Semantic retrieval looks for information based on 𝗺𝗲𝗮𝗻𝗶𝗻𝗴, even when the words are different.

Consider the query:
"How can I reduce the energy consumption of my house?"

A keyword search may look for:
energy + consumption + house

But a relevant document could say:
"Improving insulation can reduce energy consumption in residential buildings."

The wording is different, but the meaning is closely related.
⠀
𝗛𝗼𝘄 𝗗𝗼𝗲𝘀 𝗜𝘁 𝗪𝗼𝗿𝗸?

The basic flow is:

User Query
↓
Query Embedding
↓
Compare with Document Embeddings
↓
Similarity Scores
↓
Rank Results
↓
Retrieve Relevant Information

Suppose we have three documents:
A. Improving insulation can reduce energy consumption in residential buildings.
B. Structural design considerations for reinforced concrete beams.
C. Popular tourist destinations in tropical countries.

For the query about reducing household energy consumption, the semantic similarity might look like:

A → 0.82
B → 0.18
C → 0.11

These values are illustrative. The system can rank the documents and retrieve the most relevant one.
⠀
𝗦𝗶𝗺𝗽𝗹𝗲 𝗣𝘆𝘁𝗵𝗼𝗻 𝗘𝘅𝗮𝗺𝗽𝗹𝗲

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer("all-MiniLM-L6-v2")

query = "How can I reduce the energy consumption of my house?"

documents = [
"Improving insulation can reduce energy consumption in residential buildings.",
"Structural design considerations for reinforced concrete beams.",
"Popular tourist destinations in tropical countries."
]

query_vector = model.encode([query])
document_vectors = model.encode(documents)

scores = cosine_similarity(query_vector, document_vectors)[0]

for document, score in zip(documents, scores):
print(round(score, 3), document)

The actual scores depend on the embedding model.
⠀
𝗞𝗲𝘆 𝗗𝗶𝗳𝗳𝗲𝗿𝗲𝗻𝗰𝗲

𝗞𝗲𝘆𝘄𝗼𝗿𝗱 𝗦𝗲𝗮𝗿𝗰𝗵:
"Find documents containing similar words."

𝗦𝗲𝗺𝗮𝗻𝘁𝗶𝗰 𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹:
"Find documents expressing similar meaning."

The goal is not simply to find the same words. The goal is to find the 𝗿𝗶𝗴𝗵𝘁 𝗺𝗲𝗮𝗻𝗶𝗻𝗴.

hashtag #ArtificialIntelligence hashtag #GenerativeAI hashtag #AI500 hashtag #LLM hashtag #SemanticRetrieval hashtag #Embeddings hashtag #AIEngineering hashtag #MachineLearning …more   Activate to view larger image, 
￼
    Activate to view larger image,    Like  Comment      Repost       Send           
 Feed post number 46 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 2w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟭𝟵

𝗖𝗼𝘀𝗶𝗻𝗲 𝗦𝗶𝗺𝗶𝗹𝗮𝗿𝗶𝘁𝘆

Semantic similarity allows an AI system to determine how closely two pieces of text are related. But how is this similarity actually calculated?

One commonly used method is 𝗖𝗼𝘀𝗶𝗻𝗲 𝗦𝗶𝗺𝗶𝗹𝗮𝗿𝗶𝘁𝘆.
⠀
𝗧𝗵𝗲 𝗕𝗮𝘀𝗶𝗰 𝗜𝗱𝗲𝗮

Text is converted into embedding vectors. In following example, A, B, and C are simplified 2-dimensional vectors. They are not actual text embeddings. 

For example:
A = [1, 2]
B = [2, 4]
C = [2, -1]

In this example, each vector can be thought of as an arrow in a 2-dimensional space:
 
A = [1, 2] means an arrow with coordinates (1, 2) 
B = [2, 4] means an arrow with coordinates (2, 4) 
C = [2, -1] means an arrow with coordinates (2, -1)

In a real AI application, A, B, and C would represent embedding vectors generated from text like the following.

"I enjoy warm destinations."
 ↓
Embedding Model
 ↓
A = [0.12, -0.34, 0.87, ...]

Real embeddings typically have hundreds or thousands of dimensions, not just two.

Now, getting back to the example.

A and B point in the same direction.
A and C point in different directions.

Cosine similarity measures the 𝗮𝗻𝗴𝗹𝗲 between two vectors rather than simply comparing their lengths.
⠀
𝗧𝗵𝗲 𝗙𝗼𝗿𝗺𝘂𝗹𝗮

Cosine Similarity = Dot Product / (Magnitude of A × Magnitude of B)

The result normally ranges from:
+1 → Same direction
0 → Perpendicular
-1 → Opposite direction

Therefore, a value closer to +1 generally indicates greater similarity in the vector representation.
⠀
𝗔 𝗦𝗶𝗺𝗽𝗹𝗲 𝗘𝘅𝗮𝗺𝗽𝗹𝗲

Consider:
A = [1, 2]
B = [2, 4]

Dot Product:
(1 × 2) + (2 × 4) = 10

Magnitude of A:
√(1² + 2²) = √5

Magnitude of B:
√(2² + 4²) = √20

Therefore:
Cosine Similarity = 10 / (√5 × √20) = 1.00

The two vectors point in exactly the same direction, even though their lengths are different.
⠀
𝗣𝘆𝘁𝗵𝗼𝗻 𝗘𝘅𝗮𝗺𝗽𝗹𝗲

from sklearn.metrics.pairwise import cosine_similarity 

A = [[1, 2]] 
B = [[2, 4]] 

score = cosine_similarity(A, B)

print(score)

Output:
[[1.]]
⠀
𝗪𝗵𝘆 𝗜𝘀 𝗧𝗵𝗶𝘀 𝗜𝗺𝗽𝗼𝗿𝘁𝗮𝗻𝘁?

In an embedding space, two texts may have very different numerical vectors but still point in similar directions. Cosine similarity provides a way to quantify that relationship.

So the basic progression is:

𝗧𝗲𝘅𝘁 → 𝗘𝗺𝗯𝗲𝗱𝗱𝗶𝗻𝗴 → 𝗩𝗲𝗰𝘁𝗼𝗿 → 𝗖𝗼𝘀𝗶𝗻𝗲 𝗦𝗶𝗺𝗶𝗹𝗮𝗿𝗶𝘁𝘆 𝗦𝗰𝗼𝗿𝗲

𝗞𝗲𝘆 𝗜𝗱𝗲𝗮:

Cosine similarity measures how similarly two vectors are oriented, making it useful for comparing semantic representations.

hashtag #ArtificialIntelligence hashtag #GenerativeAI hashtag #AI500 hashtag #LLM hashtag #Embeddings hashtag #CosineSimilarity hashtag #MachineLearning hashtag #AIEngineering …more   Activate to view larger image, 
￼
    Activate to view larger image,    Like  Comment      Repost       Send           
 Feed post number 47 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 2w • Edited •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟭𝟴

𝗦𝗲𝗺𝗮𝗻𝘁𝗶𝗰 𝗦𝗶𝗺𝗶𝗹𝗮𝗿𝗶𝘁𝘆

Two sentences can use different words but still express similar ideas.

Consider:
A = "I enjoy warm destinations."
B = "I prefer tropical countries."
C = "I am studying structural engineering."

A human can recognize that A and B are more closely related than A and C. But how can an AI system determine this mathematically?

The answer involves comparing their 𝗲𝗺𝗯𝗲𝗱𝗱𝗶𝗻𝗴𝘀.
⠀
𝗙𝗿𝗼𝗺 𝗧𝗲𝘅𝘁 𝘁𝗼 𝗩𝗲𝗰𝘁𝗼𝗿

Each sentence is converted into an embedding vector:
Text → Embedding → Vector
The AI system can then compare these vectors.
⠀
𝗖𝗼𝘀𝗶𝗻𝗲 𝗦𝗶𝗺𝗶𝗹𝗮𝗿𝗶𝘁𝘆

If two vectors point in similar directions, their texts can be considered semantically similar. A commonly used measure is 𝗖𝗼𝘀𝗶𝗻𝗲 𝗦𝗶𝗺𝗶𝗹𝗮𝗿𝗶𝘁𝘆.

Similar direction → Higher similarity
Different direction → Lower similarity

The important point is that we compare the 𝗿𝗲𝗽𝗿𝗲𝘀𝗲𝗻𝘁𝗮𝘁𝗶𝗼𝗻𝘀, not simply matching words.
⠀
𝗦𝗶𝗺𝗽𝗹𝗲 𝗣𝘆𝘁𝗵𝗼𝗻 𝗘𝘅𝗮𝗺𝗽𝗹𝗲

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity 

model = SentenceTransformer("all-MiniLM-L6-v2")
sentences = [
 "I enjoy warm destinations.",
 "I prefer tropical countries.",
 "I am studying structural engineering."
]
embeddings = model.encode(sentences)
similarity = cosine_similarity(embeddings)
print(similarity)

The result is a 𝗦𝗶𝗺𝗶𝗹𝗮𝗿𝗶𝘁𝘆 𝗠𝗮𝘁𝗿𝗶𝘅.

Conceptually:

 A B C 
A 1.00 0.80 0.15
B 0.80 1.00 0.12
C 0.15 0.12 1.00

A and B have a higher similarity score than A and C.

The diagonal is 1.00 because each sentence is compared with itself.

The values are illustrative. Actual values depend on the embedding model.
⠀
𝗪𝗵𝗮𝘁 𝗗𝗼𝗲𝘀 𝗧𝗵𝗶𝘀 𝗧𝗲𝗹𝗹 𝗨𝘀?

The similarity matrix is mainly an 𝗶𝗻𝘁𝗲𝗿𝗺𝗲𝗱𝗶𝗮𝘁𝗲 𝗿𝗲𝘀𝘂𝗹𝘁. It tells an AI application how closely each piece of text is related to another.

For example, a new sentence:
"I want to travel somewhere hot."
could produce similarity scores such as:

A → 0.86
B → 0.79
C → 0.10

A has the highest similarity.

The fundamental idea is:
𝗧𝗲𝘅𝘁 → 𝗘𝗺𝗯𝗲𝗱𝗱𝗶𝗻𝗴 → 𝗩𝗲𝗰𝘁𝗼𝗿 → 𝗦𝗶𝗺𝗶𝗹𝗮𝗿𝗶𝘁𝘆 𝗦𝗰𝗼𝗿𝗲

𝗞𝗲𝘆𝘄𝗼𝗿𝗱 𝗠𝗮𝘁𝗰𝗵𝗶𝗻𝗴 asks:
"Do these texts contain the same words?"

𝗦𝗲𝗺𝗮𝗻𝘁𝗶𝗰 𝗦𝗶𝗺𝗶𝗹𝗮𝗿𝗶𝘁𝘆 asks:
"How closely related are their meanings?"

hashtag #ArtificialIntelligence hashtag #GenerativeAI hashtag #AI500 hashtag #LLM hashtag #Embeddings hashtag #SemanticSimilarity hashtag #AIEngineering …more   Activate to view larger image, 
￼
    Activate to view larger image,    Like  Comment      Repost       Send           
 Feed post number 48 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 2w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟭𝟳

𝗛𝗼𝘄 𝗘𝗺𝗯𝗲𝗱𝗱𝗶𝗻𝗴𝘀 𝗖𝗮𝗽𝘁𝘂𝗿𝗲 𝗟𝗮𝗻𝗴𝘂𝗮𝗴𝗲 𝗥𝗲𝗹𝗮𝘁𝗶𝗼𝗻𝘀𝗵𝗶𝗽𝘀

An embedding is a vector of numbers. But how can numbers represent relationships between words and concepts? The answer lies in 𝗽𝗮𝘁𝘁𝗲𝗿𝗻𝘀 𝗶𝗻 𝗹𝗮𝗻𝗴𝘂𝗮𝗴𝗲.

Consider these sentences:

The engineer designed the bridge.
The engineer inspected the structure.
The architect designed the building.

During training, a language model encounters enormous numbers of examples. It learns patterns in how words are used and which words tend to occur in related contexts. These learned patterns influence the numerical representations inside the model.
⠀
𝗛𝗼𝘄 𝗗𝗼 𝗡𝘂𝗺𝗯𝗲𝗿𝘀 𝗥𝗲𝗽𝗿𝗲𝘀𝗲𝗻𝘁 𝗟𝗮𝗻𝗴𝘂𝗮𝗴𝗲?

Consider this simplified example:

engineer → [0.72, 0.81, 0.34]
architect → [0.68, 0.76, 0.29]
bridge → [0.61, 0.70, 0.42]
banana → [-0.15, 0.08, 0.91]

These values are only illustrative. Real embeddings have many more dimensions. The important point is that these numbers are 𝗹𝗲𝗮𝗿𝗻𝗲𝗱 during training. Nobody manually assigns them to words.
⠀
𝗛𝗼𝘄 𝗗𝗼𝗲𝘀 𝗧𝗿𝗮𝗶𝗻𝗶𝗻𝗴 𝗖𝗿𝗲𝗮𝘁𝗲 𝗧𝗵𝗲𝘀𝗲 𝗥𝗲𝗽𝗿𝗲𝘀𝗲𝗻𝘁𝗮𝘁𝗶𝗼𝗻𝘀?

During training, the model repeatedly processes text and adjusts its learned parameters.

For example, it encounters patterns involving:
engineer
structure
bridge
construction
design
across many different sentences.

The repeated patterns influence the numerical parameters of the model. Over time, relationships found in language become reflected in its learned numerical representations.
⠀
𝗔 𝗦𝗶𝗺𝗽𝗹𝗲 𝗣𝘆𝘁𝗵𝗼𝗻 𝗘𝘅𝗮𝗺𝗽𝗹𝗲

We can inspect an embedding associated with a token:

text = "engineer"
tokens = tokenizer.tokenize(text)
token_ids = tokenizer.convert_tokens_to_ids(tokens)

print(tokens)
print(token_ids) 

vector = model.get_input_embeddings().weight[token_ids[0]]
print(vector)

What does weight mean here?

weight is the embedding matrix containing the learned numerical values for all tokens in the model's vocabulary.

 Embedding Dimensions
 d1 d2 d3 d4 ...
Token 0 [ 0.12 -0.34 0.81 0.22 ... ]
Token 1 [ 0.45 0.17 -0.63 0.09 ... ]
...
Token 5632 [ 0.21 -0.73 0.44 0.18 ... ]
...
Token 9274 [ 0.31 0.26 -0.18 0.67 ... ]

If:
token_ids[0] = 5632

then:
weight[5632]

means:

𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗲 𝗿𝗼𝘄 𝟱𝟲𝟯𝟮 𝗳𝗿𝗼𝗺 𝘁𝗵𝗲 𝗲𝗺𝗯𝗲𝗱𝗱𝗶𝗻𝗴 𝗺𝗮𝘁𝗿𝗶𝘅.

That row is the embedding vector for that token. The word weight does not mean the importance of the word. In neural networks, weights are learned numerical parameters.
⠀
𝗧𝗵𝗲 𝗞𝗲𝘆 𝗜𝗱𝗲𝗮

Language
↓
Patterns in training data
↓
Learned parameters
↓
Numerical representations
↓
Embeddings

An embedding is therefore not a manually created list of numbers representing a dictionary definition. It is a 𝗹𝗲𝗮𝗿𝗻𝗲𝗱 𝗻𝘂𝗺𝗲𝗿𝗶𝗰𝗮𝗹 𝗿𝗲𝗽𝗿𝗲𝘀𝗲𝗻𝘁𝗮𝘁𝗶𝗼𝗻 shaped by patterns in language. …more   Activate to view larger image, 
￼
    Activate to view larger image,   1 repost   Like  Comment      Repost       Send           
 Feed post number 49 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 2w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟭𝟲

𝗘𝗺𝗯𝗲𝗱𝗱𝗶𝗻𝗴𝘀

We have seen how text is divided into tokens and converted into token IDs. But a token ID such as 5632 is only an identifier. It does not contain the meaning of the token. So how does an AI model get a numerical representation that it can work with?

The answer is 𝗘𝗺𝗯𝗲𝗱𝗱𝗶𝗻𝗴𝘀.
⠀
𝗪𝗵𝗮𝘁 𝗜𝘀 𝗮𝗻 𝗘𝗺𝗯𝗲𝗱𝗱𝗶𝗻𝗴?

An embedding is a numerical vector associated with a token.

Conceptually (for a token text say "structural" with generated Token ID 5632):

"structural" 
 ↓
Token ID 5632
 ↓
Embedding
 ↓ 
[0.21, -0.73, 0.44, 0.18, ...]

The vector may contain hundreds or thousands of dimensions, depending on the model.
⠀
𝗧𝗼𝗸𝗲𝗻 𝗜𝗗 𝘃𝘀 𝗘𝗺𝗯𝗲𝗱𝗱𝗶𝗻𝗴

These are different things.

𝗧𝗼𝗸𝗲𝗻 𝗜𝗗

An integer used as an identifier or index.
"structural" → 5632

𝗘𝗺𝗯𝗲𝗱𝗱𝗶𝗻𝗴

A vector associated with that token.
5632 → [0.21, -0.73, 0.44, ...]

Therefore:
𝗧𝗼𝗸𝗲𝗻 𝗜𝗗 ≠ 𝗘𝗺𝗯𝗲𝗱𝗱𝗶𝗻𝗴
⠀
𝗛𝗼𝘄 𝗗𝗼𝗲𝘀 𝘁𝗵𝗲 𝗟𝗼𝗼𝗸𝘂𝗽 𝗪𝗼𝗿𝗸?

A model contains an embedding matrix.

Conceptually:

Token ID Embedding Vector 
0 → [ ... ] 
1 → [ ... ]
2 → [ ... ]
... 
5632 → [0.21, -0.73, 0.44, ...]

The token ID acts as an index into this matrix.

So:

Token ID
 ↓
Embedding Matrix
 ↓
Corresponding Vector
⠀
𝗦𝗶𝗺𝗽𝗹𝗲 𝗣𝘆𝘁𝗵𝗼𝗻 𝗘𝘅𝗮𝗺𝗽𝗹𝗲

Conceptually:

token_id = 5632
vector = model.get_input_embeddings().weight[token_id]
print(vector)

The output might look like:
tensor([
 0.0214,
 -0.0731,
 0.0448,
 ...
 ])

The actual values and dimensions depend on the model.
⠀
𝗪𝗵𝗲𝗿𝗲 𝗗𝗼 𝗧𝗵𝗲𝘀𝗲 𝗡𝘂𝗺𝗯𝗲𝗿𝘀 𝗖𝗼𝗺𝗲 𝗙𝗿𝗼𝗺?

The values are not manually assigned. They are learned by the model during training.

For this post, the key idea is:

𝗔𝗻 𝗲𝗺𝗯𝗲𝗱𝗱𝗶𝗻𝗴 𝗶𝘀 𝗮 𝗹𝗲𝗮𝗿𝗻𝗲𝗱 𝗻𝘂𝗺𝗲𝗿𝗶𝗰𝗮𝗹 𝗿𝗲𝗽𝗿𝗲𝘀𝗲𝗻𝘁𝗮𝘁𝗶𝗼𝗻.
⠀
𝗧𝗵𝗲 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲 𝗣𝗶𝗰𝘁𝘂𝗿𝗲

Human Text
 ↓ 
Tokenization
 ↓ 
Tokens
 ↓ 
Encoding
 ↓ 
Token IDs
 ↓ 
Embedding Lookup
 ↓ 
Embedding Vectors

The important distinction is:
𝗧𝗼𝗸𝗲𝗻 𝗜𝗗 = an index
𝗘𝗺𝗯𝗲𝗱𝗱𝗶𝗻𝗴 = a learned numerical vector

Understanding this distinction is important for understanding how language models represent text.

hashtag #ArtificialIntelligence hashtag #GenerativeAI hashtag #AgenticAI hashtag #LLM hashtag #Embeddings hashtag #AI500 hashtag #AIEngineering hashtag #MachineLearning …more   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
7 8 comments 1 repost   Like  Comment      Repost       Send           
 Feed post number 50 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 2w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟭𝟱

𝗧𝗼𝗸𝗲𝗻𝘀, 𝗧𝗼𝗸𝗲𝗻𝗶𝘇𝗮𝘁𝗶𝗼𝗻 𝗮𝗻𝗱 𝗘𝗻𝗰𝗼𝗱𝗶𝗻𝗴

We read and write language as words and sentences. But an AI model does not directly process text in the same way humans do. Before text can be processed, it is broken into smaller units called 𝗧𝗼𝗸𝗲𝗻𝘀.
⠀
𝗪𝗵𝗮𝘁 𝗜𝘀 𝗮 𝗧𝗼𝗸𝗲𝗻?

A token is a piece of text that a language model can process.

A token may be:
* A complete word
* Part of a word
* Punctuation
* Another text unit, depending on the tokenizer

For example:

I love structural engineering.
 ↓
"I" | "love" | "structural" | "engineering" | "."

A token is not necessarily a complete word.
For example, a word could conceptually be divided as:

"unbelievable"
 ↓
"un" | "believ" | "able"

The exact splitting depends on the tokenizer.

Therefore:

𝗧𝗼𝗸𝗲𝗻 ≠ 𝗪𝗼𝗿𝗱
⠀
𝗙𝗿𝗼𝗺 𝗧𝗲𝘅𝘁 𝘁𝗼 𝗧𝗼𝗸𝗲𝗻 𝗜𝗗𝘀

The overall process can be simplified as:

Human Text
 ↓
Tokenization
 ↓
Tokens
 ↓
Encoding
 ↓
Token IDs

For example:

"I love structural engineering."
 ↓
"I" | "love" | "structural" | "engineering" | "."
 ↓
[40, 1842, 5632, 9274, 13]

The numbers above are illustrative. Actual token IDs depend on the tokenizer and its vocabulary.
⠀
𝗪𝗵𝗮𝘁 𝗜𝘀 𝗘𝗻𝗰𝗼𝗱𝗶𝗻𝗴?

𝗧𝗼𝗸𝗲𝗻𝗶𝘇𝗮𝘁𝗶𝗼𝗻 divides text into tokens.
𝗘𝗻𝗰𝗼𝗱𝗶𝗻𝗴 converts those tokens into numerical token IDs.

Using Python, we can make this explicit:

text = "I love structural engineering."
tokens = tokenizer.tokenize(text)
token_ids = tokenizer.convert_tokens_to_ids(tokens)
print(tokens)
print(token_ids)

Many tokenizer libraries also provide:

token_ids = tokenizer.encode(text)

which performs the tokenization and conversion to IDs together, with tokenizer-specific processing.
⠀
𝗜𝘀 𝗮 𝗧𝗼𝗸𝗲𝗻 𝗜𝗗 𝘁𝗵𝗲 𝗠𝗲𝗮𝗻𝗶𝗻𝗴 𝗼𝗳 𝘁𝗵𝗲 𝗧𝗼𝗸𝗲𝗻?
𝗡𝗼.

If a tokenizer assigns:

"structural" → 5632

then 5632 is simply an identifier or index for that token in that particular vocabulary. Another tokenizer may assign a different ID or split the word differently. The number itself does not represent the meaning of "structural."
⠀
𝗪𝗵𝘆 𝗗𝗼 𝗧𝗼𝗸𝗲𝗻𝘀 𝗠𝗮𝘁𝘁𝗲𝗿?

Many LLM limits are expressed in tokens.

For example:
Context Window = 128K tokens
This does not mean 128,000 words.

Token counts can therefore affect context limits, processing requirements, and AI application costs.
⠀
𝗔𝗜-𝟱𝟬𝟬 𝗞𝗲𝘆 𝗖𝗼𝗻𝗰𝗲𝗽𝘁

𝗧𝗼𝗸𝗲𝗻 = a piece of text
𝗧𝗼𝗸𝗲𝗻𝗶𝘇𝗮𝘁𝗶𝗼𝗻 = breaking text into tokens
𝗘𝗻𝗰𝗼𝗱𝗶𝗻𝗴 = converting tokens into token IDs
𝗧𝗼𝗸𝗲𝗻 𝗜𝗗 = an identifier for a token in a particular vocabulary

Understanding these concepts is fundamental to understanding how language models process text.

hashtag #ArtificialIntelligence hashtag #GenerativeAI hashtag #AgenticAI hashtag #LLM hashtag #Tokenization hashtag #Tokens hashtag #AI500 hashtag #AIEngineering hashtag #MachineLearning …more   Activate to view larger image, 
￼
    Activate to view larger image,   1 repost   Like  Comment      Repost       Send           
 Feed post number 51 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 2w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟭𝟰

𝗦𝗲𝗺𝗮𝗻𝘁𝗶𝗰 𝗥𝗲𝗽𝗿𝗲𝘀𝗲𝗻𝘁𝗮𝘁𝗶𝗼𝗻 𝗼𝗳 𝗟𝗮𝗻𝗴𝘂𝗮𝗴𝗲
⠀
How can an AI system recognize that these two sentences are related?
"I enjoy warm destinations."
"I prefer travelling to tropical countries."
The words are different, but the meaning is similar.

𝗛𝗼𝘄 𝗱𝗼𝗲𝘀 𝗔𝗜 𝗱𝗼 𝘁𝗵𝗶𝘀?
⠀
𝗞𝗲𝘆𝘄𝗼𝗿𝗱𝘀 𝗔𝗿𝗲 𝗡𝗼𝘁 𝗘𝗻𝗼𝘂𝗴𝗵

Suppose we search for:
warm vacation

A traditional search may look for those exact words.
But this sentence could also be relevant:
I prefer tropical countries.

There is no exact word match, but the ideas are related.

AI needs to represent more than individual words. It needs to capture relationships between words and their context.
⠀
𝗛𝗼𝘄 𝗗𝗼𝗲𝘀 𝗔𝗜 𝗟𝗲𝗮𝗿𝗻 𝗧𝗵𝗶𝘀?

During training, a language model processes enormous amounts of text.

It repeatedly sees words used in different contexts.

For example:

tropical
warm
climate
vacation
travel

often appear in related contexts.

Similarly:

structural
engineering
buildings
bridges
concrete

appear in another group of related contexts.

The model gradually learns these patterns.
⠀
𝗜𝘁 𝗗𝗼𝗲𝘀 𝗡𝗼𝘁 𝗦𝘁𝗼𝗿𝗲 𝗦𝗶𝗺𝗽𝗹𝗲 𝗥𝘂𝗹𝗲𝘀

The model does not simply store rules such as:

warm = vacation
tropical = travel
engineering = buildings

Instead, relationships are distributed across a very large number of learned parameters.

You can think of this as a very large mathematical network where information about language is spread throughout the network.
⠀
𝗖𝗼𝗻𝘁𝗲𝘅𝘁 𝗖𝗵𝗮𝗻𝗴𝗲𝘀 𝗠𝗲𝗮𝗻𝗶𝗻𝗴

Consider:

The weather is warm.
The welcome was warm.

The word "warm" is the same, but the meaning is different.

The model looks at the surrounding words and uses that context when creating its internal representation.

This is one reason 𝗧𝗿𝗮𝗻𝘀𝗳𝗼𝗿𝗺𝗲𝗿𝘀 and 𝗦𝗲𝗹𝗳-𝗔𝘁𝘁𝗲𝗻𝘁𝗶𝗼𝗻 are important in modern language models.
⠀
𝗔 𝗦𝗶𝗺𝗽𝗹𝗶𝗳𝗶𝗲𝗱 𝗩𝗶𝗲𝘄

We can think of the process as:

Text
 ↓
Tokens
 ↓
Neural Network
 ↓
Context + Relationships
 ↓
Numerical Representation

The representation is not a simple label such as "travel". It contains information distributed across many numerical dimensions.
⠀
𝗦𝗶𝗺𝗽𝗹𝗲 𝗖𝗼𝗱𝗲 𝗘𝘅𝗮𝗺𝗽𝗹𝗲

Conceptually, a language model processes text like this:

text = "I enjoy warm destinations."
tokens = tokenizer(text)
representation = model(tokens)

The resulting representation is a numerical form that the model can use for further processing.
⠀
𝗪𝗵𝘆 𝗜𝘀 𝗧𝗵𝗶𝘀 𝗜𝗺𝗽𝗼𝗿𝘁𝗮𝗻𝘁?

This ability to represent relationships in language is fundamental to modern AI systems.

It provides the foundation for:
• Embeddings
• Semantic Search
• Vector Search
• RAG
• Agent Memory Retrieval
⠀
𝗔𝗜-𝟱𝟬𝟬 𝗞𝗲𝘆 𝗖𝗼𝗻𝗰𝗲𝗽𝘁

AI models do not represent language simply as a collection of words and rules. Through training, they learn distributed numerical representations that capture patterns and relationships between words and their context. …more   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
7 2 comments 1 repost   Like  Comment      Repost       Send           
 Feed post number 52 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 2w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟭𝟯

𝗔𝗴𝗲𝗻𝘁 𝗠𝗲𝗺𝗼𝗿𝘆
⠀
Can an AI agent remember something from a previous interaction and use it during a future interaction?

Yes.

But 𝗺𝗲𝗺𝗼𝗿𝘆 𝗶𝘀 𝗻𝗼𝘁 𝘁𝗵𝗲 𝘀𝗮𝗺𝗲 𝗮𝘀 𝗰𝗼𝗻𝘁𝗲𝘅𝘁 𝗼𝗿 𝘀𝘁𝗮𝘁𝗲.
⠀
𝗖𝗼𝗻𝘁𝗲𝘅𝘁

Information provided to the model for the current invocation.

User request
+ System instructions
+ Relevant conversation
+ Retrieved information
 ↓
 Model

𝗦𝘁𝗮𝘁𝗲

The current condition and progress of an ongoing agent workflow.
Payment = Successful
Inventory = Reserved
Shipping = Pending

𝗠𝗲𝗺𝗼𝗿𝘆

Information retained for potential use in future interactions.
User prefers vegetarian meals.
User prefers window seats.
User's preferred language is English.
⠀
𝗔 𝗦𝗶𝗺𝗽𝗹𝗲 𝗘𝘅𝗮𝗺𝗽𝗹𝗲

Suppose a user tells an agent:
"I prefer window seats when I fly."

The agent can store this as a memory:
memory = {
 "travel_preference": "window_seat"
}

During a future flight-booking interaction:
preference = memory.get("travel_preference")

if preference == "window_seat":
 search_for_window_seats()

The previous interaction does not need to remain in the current conversation context for the preference to be used.
⠀
𝗦𝘁𝗼𝗿𝗲 → 𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗲 → 𝗨𝘀𝗲

A simplified memory workflow is:

User Interaction
 ↓
Identify Useful Information
 ↓
Store Memory
 ↓
Future Request
 ↓
Retrieve Relevant Memory
 ↓
Add to Context
 ↓
Model Generates Response
⠀
𝗦𝗵𝗼𝗿𝘁 𝗧𝗲𝗿𝗺 𝘃𝘀 𝗟𝗼𝗻𝗴 𝗧𝗲𝗿𝗺 𝗠𝗲𝗺𝗼𝗿𝘆

𝗦𝗵𝗼𝗿𝘁 𝗧𝗲𝗿𝗺 𝗠𝗲𝗺𝗼𝗿𝘆

Information useful during the current task or conversation.

𝗟𝗼𝗻𝗴 𝗧𝗲𝗿𝗺 𝗠𝗲𝗺𝗼𝗿𝘆

Information retained across interactions and potentially reused later.
⠀
𝗦𝗵𝗼𝘂𝗹𝗱 𝗮𝗻 𝗔𝗴𝗲𝗻𝘁 𝗥𝗲𝗺𝗲𝗺𝗯𝗲𝗿 𝗘𝘃𝗲𝗿𝘆𝘁𝗵𝗶𝗻𝗴?

No.

An effective memory system needs to determine:
• What information is worth remembering
• What information should be retrieved
• When it should be retrieved
• When information should be updated
• When outdated information should be removed
⠀
𝗠𝗲𝗺𝗼𝗿𝘆 𝗮𝗹𝘀𝗼 𝗵𝗮𝘀 𝗮 𝗿𝗶𝘀𝗸.
Incorrect, outdated, or irrelevant memories can influence future responses. Therefore, memory management is not simply about storing more information. It is about storing and retrieving the 𝗿𝗶𝗴𝗵𝘁 information at the 𝗿𝗶𝗴𝗵𝘁 time.
⠀
𝗔𝗜-𝟱𝟬𝟬 𝗞𝗲𝘆 𝗖𝗼𝗻𝗰𝗲𝗽𝘁

𝗖𝗼𝗻𝘁𝗲𝘅𝘁 = What the model can use now.
𝗦𝘁𝗮𝘁𝗲 = Where the workflow currently is.
𝗠𝗲𝗺𝗼𝗿𝘆 = What the agent retains for potential future use.

A capable agent does not simply have a large memory.

It needs to know 𝘄𝗵𝗮𝘁 𝘁𝗼 𝗿𝗲𝗺𝗲𝗺𝗯𝗲𝗿, 𝘄𝗵𝗮𝘁 𝘁𝗼 𝗿𝗲𝘁𝗿𝗶𝗲𝘃𝗲, and 𝘄𝗵𝗮𝘁 𝘁𝗼 𝗳𝗼𝗿𝗴𝗲𝘁.

hashtag #ArtificialIntelligence hashtag #GenerativeAI hashtag #AgenticAI hashtag #AIAgents hashtag #AgentMemory hashtag #ContextManagement hashtag #AgentState hashtag #AzureAI hashtag #MicrosoftAI hashtag #AI500 hashtag #EnterpriseAI hashtag #AIEngineering …more   Activate to view larger image, 
￼
    Activate to view larger image,   1 repost   Like  Comment      Repost       Send           
 Feed post number 53 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 2w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟭𝟮

𝗔𝗴𝗲𝗻𝘁 𝗦𝘁𝗮𝘁𝗲 𝗣𝗲𝗿𝘀𝗶𝘀𝘁𝗲𝗻𝗰𝗲 & 𝗥𝗲𝗰𝗼𝘃𝗲𝗿𝘆
⠀
What happens when an AI agent is performing a long-running task and the application crashes?

If the agent's state exists only in memory, its progress may be lost.

𝗦𝘁𝗮𝘁𝗲 𝗽𝗲𝗿𝘀𝗶𝘀𝘁𝗲𝗻𝗰𝗲 allows the agent's state to survive beyond the current process or execution.
⠀
𝗪𝗵𝗮𝘁 𝗶𝘀 𝗣𝗲𝗿𝘀𝗶𝘀𝘁𝗲𝗻𝘁 𝗦𝘁𝗮𝘁𝗲?

Consider an order-processing agent:

state = {
 "order_id": "ORD-12345",
 "payment": "successful",
 "inventory": "reserved",
 "shipping": "pending"
}

If this state is stored durably, the agent can recover it after a restart rather than beginning the workflow again.
⠀
𝗪𝗵𝗮𝘁 𝗶𝘀 𝗖𝗵𝗲𝗰𝗸𝗽𝗼𝗶𝗻𝘁𝗶𝗻𝗴?

Checkpointing captures the state of an ongoing workflow at a known point so that execution can later resume from that point.

For example:

Order Received
 ↓
Payment Completed
 ↓
Checkpoint
 ↓
Inventory Reserved
 ↓
Application Failure
 ↓
Restart
 ↓
Restore Checkpoint
 ↓
Resume
⠀
𝗣𝗲𝗿𝘀𝗶𝘀𝘁𝗲𝗻𝗰𝗲 𝘃𝘀 𝗖𝗵𝗲𝗰𝗸𝗽𝗼𝗶𝗻𝘁𝗶𝗻𝗴

These concepts are closely related, but they are not identical.

𝗦𝘁𝗮𝘁𝗲 𝗣𝗲𝗿𝘀𝗶𝘀𝘁𝗲𝗻𝗰𝗲 means storing state durably.
𝗖𝗵𝗲𝗰𝗸𝗽𝗼𝗶𝗻𝘁𝗶𝗻𝗴 means capturing a recoverable state at a particular point in execution.

If the system persists state after significant workflow steps and uses those saved states for recovery, the persisted states effectively serve as checkpoints.
⠀
𝗔 𝗣𝗿𝗼𝗱𝘂𝗰𝘁𝗶𝗼𝗻 𝗣𝗿𝗼𝗯𝗹𝗲𝗺

Restoring state does not necessarily mean that the external world is in the same state.

Suppose an agent initiates a payment:

Agent → Payment Service
 ↓
 Payment succeeds
 X
 Response is lost
 ↓
Application fails

The persisted agent state might still say:
payment_status = "pending"

After recovery, blindly retrying the payment could create a duplicate side effect.

This is where the concepts we discussed earlier work together:
𝗣𝗲𝗿𝘀𝗶𝘀𝘁𝗲𝗻𝘁 𝗦𝘁𝗮𝘁𝗲 + 𝗖𝗵𝗲𝗰𝗸𝗽𝗼𝗶𝗻𝘁𝗶𝗻𝗴 + 𝗘𝘅𝘁𝗲𝗿𝗻𝗮𝗹 𝗦𝘁𝗮𝘁𝘂𝘀 𝗩𝗲𝗿𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻 + 𝗜𝗱𝗲𝗺𝗽𝗼𝘁𝗲𝗻𝗰𝘆
⠀
𝗦𝗮𝗳𝗲 𝗥𝗲𝗰𝗼𝘃𝗲𝗿𝘆 𝗙𝗹𝗼𝘄

Failure
 ↓
Load Persisted State
 ↓
Identify Last Known State
 ↓
Verify External Operations
 ↓
Resume or Safely Retry
 ↓
Update State
 ↓
Persist New State
⠀
𝗪𝗵𝘆 𝗶𝘀 𝗧𝗵𝗶𝘀 𝗜𝗺𝗽𝗼𝗿𝘁𝗮𝗻𝘁?

State persistence and recovery become particularly important for:
• Long-running agent workflows
• Multi-step processes
• Failure recovery
• Interrupted execution
• Distributed agent systems
• Workflows involving external side effects
⠀
𝗥𝗲𝗹𝗶𝗮𝗯𝗹𝗲 𝗮𝗴𝗲𝗻𝘁𝘀 𝗻𝗲𝗲𝗱 𝗺𝗼𝗿𝗲 𝘁𝗵𝗮𝗻 𝗿𝗲𝗮𝘀𝗼𝗻𝗶𝗻𝗴. 𝗧𝗵𝗲𝘆 𝗮𝗹𝘀𝗼 𝗻𝗲𝗲𝗱 𝘁𝗵𝗲 𝗮𝗯𝗶𝗹𝗶𝘁𝘆 𝘁𝗼 𝗿𝗲𝗰𝗼𝘃𝗲𝗿 𝘀𝗮𝗳𝗲𝗹𝘆 𝘄𝗵𝗲𝗻 𝘁𝗵𝗶𝗻𝗴𝘀 𝗴𝗼 𝘄𝗿𝗼𝗻𝗴.

hashtag #ArtificialIntelligence hashtag #GenerativeAI hashtag #AgenticAI hashtag #AIAgents hashtag #AgentState hashtag #Checkpointing hashtag #StatePersistence hashtag #AzureAI hashtag #MicrosoftAI hashtag #AI500 …more   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
1 1 repost   Like  Comment      Repost       Send           
 Feed post number 54 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 3w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟭𝟭

𝗜𝗱𝗲𝗺𝗽𝗼𝘁𝗲𝗻𝗰𝘆 𝗶𝗻 𝗔𝗜 𝗔𝗴𝗲𝗻𝘁𝘀
⠀
What happens when an AI agent calls a tool, but the response is lost?
The agent may not know whether the operation failed or actually succeeded. It may then retry the operation. For operations that create side effects, this can be dangerous.
⠀
𝗖𝗼𝗻𝘀𝗶𝗱𝗲𝗿 𝗮 𝗥𝗲𝗳𝘂𝗻𝗱 𝗘𝘅𝗮𝗺𝗽𝗹𝗲
⠀
The agent requests:
Refund ₹5,000 for Order ORD-12345
The request reaches the payment service.
AI Agent
 ↓
Refund Tool
 ↓
Payment Service
 ↓
₹5,000 refunded
 X
Response lost

The agent receives no confirmation.

It sees the result as:
UNKNOWN

The agent retries.

Without idempotency:
First call → ₹5,000 refunded
Retry → ₹5,000 refunded
Total → ₹10,000 refunded

This is a serious production problem.
⠀
𝗪𝗵𝗮𝘁 𝗶𝘀 𝗜𝗱𝗲𝗺𝗽𝗼𝘁𝗲𝗻𝗰𝘆?
⠀
Idempotency allows the same operation to be safely submitted multiple times without creating additional unintended side effects.

A unique 𝗶𝗱𝗲𝗺𝗽𝗼𝘁𝗲𝗻𝗰𝘆 𝗸𝗲𝘆 can identify the intended operation:
idempotency_key = "refund-ORD-12345-5000"

The request might contain:
refund(
 order_id="ORD-12345",
 amount=5000,
 idempotency_key=idempotency_key
)

The payment service stores the result associated with that key. If the same request arrives again:

Key already processed
 ↓
Do not execute another refund
 ↓
Return the original result

Therefore:

First call → ₹5,000 refunded
Retry → Existing result returned
Total → ₹5,000 refunded
⠀
𝗜𝗱𝗲𝗺𝗽𝗼𝘁𝗲𝗻𝗰𝘆 𝗗𝗼𝗲𝘀 𝗡𝗼𝘁 𝗣𝗿𝗲𝘃𝗲𝗻𝘁 𝗥𝗲𝘁𝗿𝗶𝗲𝘀

This is an important distinction. Idempotency does not mean:
"Never retry."
It means:
"Retries should not create duplicate effects."
⠀
𝗪𝗵𝗲𝗿𝗲 𝗶𝘀 𝗜𝗱𝗲𝗺𝗽𝗼𝘁𝗲𝗻𝗰𝘆 𝗨𝘀𝗲𝗳𝘂𝗹?
⠀
It is particularly important for agent tools that perform side effects such as:
• Payments
• Refunds
• Orders
• Bookings
• Database updates
• Account changes
• External API operations
⠀
A simplified production flow is:
𝗧𝗼𝗼𝗹 𝗖𝗮𝗹𝗹 → 𝗨𝗻𝗸𝗻𝗼𝘄𝗻 𝗥𝗲𝘀𝘂𝗹𝘁 → 𝗥𝗲𝘁𝗿𝘆 → 𝗜𝗱𝗲𝗺𝗽𝗼𝘁𝗲𝗻𝗰𝘆 𝗞𝗲𝘆 → 𝗦𝗮𝗳𝗲 𝗥𝗲𝘀𝘂𝗹𝘁
⠀
𝗔𝗜-𝟱𝟬𝟬 𝗖𝗼𝗻𝗰𝗲𝗽𝘁

When an agent interacts with systems that produce side effects, retries must be designed carefully. The agent should not be trusted to decide that a failed or timed-out operation is safe to repeat. The underlying system should provide mechanisms that make repeated requests safe.
⠀
𝗧𝗵𝗲 𝗞𝗲𝘆 𝗜𝗱𝗲𝗮

𝗜𝗱𝗲𝗺𝗽𝗼𝘁𝗲𝗻𝗰𝘆 𝗺𝗮𝗸𝗲𝘀 𝗿𝗲𝘁𝗿𝗶𝗲𝘀 𝘀𝗮𝗳𝗲 𝗯𝘆 𝗽𝗿𝗲𝘃𝗲𝗻𝘁𝗶𝗻𝗴 𝘁𝗵𝗲 𝘀𝗮𝗺𝗲 𝗶𝗻𝘁𝗲𝗻𝘁𝗶𝗼𝗻 𝗳𝗿𝗼𝗺 𝗽𝗿𝗼𝗱𝘂𝗰𝗶𝗻𝗴 𝘂𝗻𝗶𝗻𝘁𝗲𝗻𝗱𝗲𝗱 𝗱𝘂𝗽𝗹𝗶𝗰𝗮𝘁𝗲 𝘀𝗶𝗱𝗲 𝗲𝗳𝗳𝗲𝗰𝘁𝘀.

hashtag #ArtificialIntelligence hashtag #GenerativeAI hashtag #AgenticAI hashtag #AIAgents hashtag #Idempotency hashtag #ToolCalling hashtag #AzureAI hashtag #MicrosoftAI hashtag #AI500 hashtag #EnterpriseAI hashtag #AIEngineering …more   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
1 1 repost   Like  Comment      Repost       Send           
 Feed post number 55 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 3w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟭𝟬

𝗔𝗴𝗲𝗻𝘁 𝗦𝘁𝗮𝘁𝗲 𝗠𝗮𝗻𝗮𝗴𝗲𝗺𝗲𝗻𝘁
⠀
An AI agent may need to perform a task involving multiple steps, tools, decisions, and interactions.

During this process, the agent needs to know:

𝗪𝗵𝗲𝗿𝗲 𝗮𝗺 𝗜 𝗶𝗻 𝘁𝗵𝗲 𝘁𝗮𝘀𝗸?
𝗪𝗵𝗮𝘁 𝗵𝗮𝘀 𝗮𝗹𝗿𝗲𝗮𝗱𝘆 𝗯𝗲𝗲𝗻 𝗱𝗼𝗻𝗲?
𝗪𝗵𝗮𝘁 𝗻𝗲𝗲𝗱𝘀 𝘁𝗼 𝗵𝗮𝗽𝗽𝗲𝗻 𝗻𝗲𝘅𝘁?
⠀
𝗧𝗵𝗶𝘀 𝗶𝘀 𝘄𝗵𝗲𝗿𝗲 𝗔𝗴𝗲𝗻𝘁 𝗦𝘁𝗮𝘁𝗲 𝗠𝗮𝗻𝗮𝗴𝗲𝗺𝗲𝗻𝘁 𝗯𝗲𝗰𝗼𝗺𝗲𝘀 𝗶𝗺𝗽𝗼𝗿𝘁𝗮𝗻𝘁.
⠀
𝗪𝗵𝗮𝘁 𝗶𝘀 𝗔𝗴𝗲𝗻𝘁 𝗦𝘁𝗮𝘁𝗲?
⠀
State represents the current condition and progress of an agent's task.
For example, consider a travel-booking agent.
The user asks:
"Book a flight to Delhi."
⠀
The agent might maintain state such as:
state = {
 "destination": "Delhi",
 "flight_selected": False,
 "passenger_details": "Incomplete",
 "payment_status": "Pending",
 "booking_status": "Not Started"
}
⠀
As the workflow progresses, the state changes.

After selecting a flight:
state["flight_selected"] = True

After completing passenger details:
state["passenger_details"] = "Complete"

After successful payment:
state["payment_status"] = "Successful"

After booking:
state["booking_status"] = "Confirmed"
⠀
The agent's state has now evolved from:
𝗡𝗼𝘁 𝗦𝘁𝗮𝗿𝘁𝗲𝗱 → 𝗜𝗻 𝗣𝗿𝗼𝗴𝗿𝗲𝘀𝘀 → 𝗣𝗮𝘆𝗺𝗲𝗻𝘁 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲 → 𝗖𝗼𝗻𝗳𝗶𝗿𝗺𝗲𝗱
⠀
𝗖𝗼𝗻𝘁𝗲𝘅𝘁 𝘃𝘀 𝗦𝘁𝗮𝘁𝗲
⠀
These concepts are related, but they are not the same.
𝗖𝗼𝗻𝘁𝗲𝘅𝘁
Information provided to the model to help it reason about the current task.
𝗦𝘁𝗮𝘁𝗲
The current condition, progress, and relevant data associated with the agent's execution.
⠀
For example:
𝗖𝗼𝗻𝘁𝗲𝘅𝘁:
"Here are the previous messages and relevant information."
𝗦𝘁𝗮𝘁𝗲:
"Flight selected = True, Payment = Successful, Booking = Pending."
⠀
𝗪𝗵𝘆 𝗶𝘀 𝗦𝘁𝗮𝘁𝗲 𝗜𝗺𝗽𝗼𝗿𝘁𝗮𝗻𝘁?
⠀
State becomes particularly important when an agent:
• Performs multiple steps
• Calls multiple tools
• Runs for a long time
• Needs to resume interrupted work
• Coordinates with other agents
• Must track the current workflow status
⠀
A useful conceptual flow is:
𝗥𝗲𝗾𝘂𝗲𝘀𝘁 → 𝗔𝗴𝗲𝗻𝘁 → 𝗔𝗰𝘁𝗶𝗼𝗻 → 𝗨𝗽𝗱𝗮𝘁𝗲 𝗦𝘁𝗮𝘁𝗲 → 𝗡𝗲𝘅𝘁 𝗔𝗰𝘁𝗶𝗼𝗻 → 𝗨𝗽𝗱𝗮𝘁𝗲 𝗦𝘁𝗮𝘁𝗲
⠀
𝗔𝗜-𝟱𝟬𝟬 𝗘𝘅𝗮𝗺 𝗖𝗼𝗻𝗰𝗲𝗽𝘁
⠀
When designing agentic systems, state management helps maintain a reliable representation of the agent's current execution.

The key idea:

𝗖𝗼𝗻𝘁𝗲𝘅𝘁 𝗵𝗲𝗹𝗽𝘀 𝘁𝗵𝗲 𝗺𝗼𝗱𝗲𝗹 𝗿𝗲𝗮𝘀𝗼𝗻. 𝗦𝘁𝗮𝘁𝗲 𝗵𝗲𝗹𝗽𝘀 𝘁𝗵𝗲 𝗮𝗴𝗲𝗻𝘁 𝗸𝗻𝗼𝘄 𝘄𝗵𝗲𝗿𝗲 𝗶𝘁 𝗶𝘀 𝗶𝗻 𝘁𝗵𝗲 𝘄𝗼𝗿𝗸𝗳𝗹𝗼𝘄.

hashtag #ArtificialIntelligence hashtag #GenerativeAI hashtag #AgenticAI hashtag #AIAgents hashtag #AgentState hashtag #ContextManagement hashtag #AzureAI hashtag #MicrosoftAI hashtag #AI500 hashtag #EnterpriseAI hashtag #AIEngineering …more   Activate to view larger image, 
￼
    Activate to view larger image,   1 repost   Like  Comment      Repost       Send           
 Feed post number 56 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 3w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟵

𝗖𝗼𝗻𝘁𝗲𝘅𝘁 𝗖𝗼𝗺𝗽𝗮𝗰𝘁𝗶𝗼𝗻
⠀
What happens when an AI agent has been running for a long time and its context keeps growing?
⠀
𝗧𝗵𝗶𝘀 𝗶𝘀 𝘄𝗵𝗲𝗿𝗲 𝗖𝗼𝗻𝘁𝗲𝘅𝘁 𝗖𝗼𝗺𝗽𝗮𝗰𝘁𝗶𝗼𝗻 becomes important.
⠀
𝗪𝗵𝘆 𝗗𝗼𝗲𝘀 𝗖𝗼𝗻𝘁𝗲𝘅𝘁 𝗚𝗿𝗼𝘄?
⠀
During execution, information can accumulate:
𝗨𝘀𝗲𝗿 → 𝗔𝗴𝗲𝗻𝘁 → 𝗧𝗼𝗼𝗹 𝗖𝗮𝗹𝗹 → 𝗧𝗼𝗼𝗹 𝗥𝗲𝘀𝘂𝗹𝘁 → 𝗔𝗴𝗲𝗻𝘁 → 𝗠𝗼𝗿𝗲 𝗖𝗼𝗻𝘃𝗲𝗿𝘀𝗮𝘁𝗶𝗼𝗻
⠀
A long-running task can therefore accumulate conversation history, tool results and intermediate information. A model has a finite context window. If the context becomes too large, the agent cannot keep adding information indefinitely.
⠀
𝗪𝗵𝗮𝘁 𝗶𝘀 𝗖𝗼𝗻𝘁𝗲𝘅𝘁 𝗖𝗼𝗺𝗽𝗮𝗰𝘁𝗶𝗼𝗻?
⠀
Context compaction reduces the amount of context while preserving the information needed to continue the task effectively. The objective is not simply to make the context smaller. It is to make it smaller without losing important information.
⠀
𝗔 𝗦𝗶𝗺𝗽𝗹𝗲 𝗘𝘅𝗮𝗺𝗽𝗹𝗲
⠀
Imagine a coding agent working on a project.
After many interactions, its context contains:
• Original requirements
• Design decisions
• Code changes
• Tool outputs
• Error messages
• Resolved issues
• Current task
⠀
Instead of retaining every interaction in full, the system can create a compact representation and retain recent messages.
⠀
A simplified implementation might look like:
if token_count(context) > threshold:
 summary = summarize(context)
 context = summary + recent_messages(context)
⠀
The summary should preserve information such as:
𝗥𝗲𝗾𝘂𝗶𝗿𝗲𝗺𝗲𝗻𝘁𝘀 + 𝗞𝗲𝘆 𝗗𝗲𝗰𝗶𝘀𝗶𝗼𝗻𝘀 + 𝗖𝘂𝗿𝗿𝗲𝗻𝘁 𝗦𝘁𝗮𝘁𝗲 + 𝗥𝗲𝗰𝗲𝗻𝘁 𝗖𝗼𝗻𝘁𝗲𝘅𝘁
⠀
This is only a conceptual example. Actual implementations can use different compaction strategies.
⠀
𝗖𝗼𝗺𝗽𝗮𝗰𝘁𝗶𝗼𝗻 ≠ 𝗖𝗼𝗻𝘁𝗲𝘅𝘁 𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹
⠀
𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹 asks:
"What information should I bring into the context?"
⠀
𝗖𝗼𝗺𝗽𝗮𝗰𝘁𝗶𝗼𝗻 asks:
"How can I reduce the existing context while preserving what matters?"
⠀
𝗔𝗜-𝟱𝟬𝟬 𝗘𝘅𝗮𝗺 𝗖𝗼𝗻𝗰𝗲𝗽𝘁
⠀
Context compaction can help:
• Control context growth
• Stay within context limits
• Reduce unnecessary information
• Preserve important task information
• Support long-running interactions
⠀
The key idea:

𝗖𝗼𝗻𝘁𝗲𝘅𝘁 𝗰𝗼𝗺𝗽𝗮𝗰𝘁𝗶𝗼𝗻 𝗶𝘀 𝗻𝗼𝘁 𝗮𝗯𝗼𝘂𝘁 𝗿𝗲𝗺𝗼𝘃𝗶𝗻𝗴 𝗮𝘀 𝗺𝘂𝗰𝗵 𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻 𝗮𝘀 𝗽𝗼𝘀𝘀𝗶𝗯𝗹𝗲. 𝗜𝘁 𝗶𝘀 𝗮𝗯𝗼𝘂𝘁 𝗽𝗿𝗲𝘀𝗲𝗿𝘃𝗶𝗻𝗴 𝘄𝗵𝗮𝘁 𝗺𝗮𝘁𝘁𝗲𝗿𝘀 𝘄𝗵𝗶𝗹𝗲 𝗰𝗼𝗻𝘁𝗿𝗼𝗹𝗹𝗶𝗻𝗴 𝗰𝗼𝗻𝘁𝗲𝘅𝘁 𝗴𝗿𝗼𝘄𝘁𝗵.

hashtag #ArtificialIntelligence hashtag #GenerativeAI hashtag #AgenticAI hashtag #AIAgents hashtag #ContextManagement hashtag #AzureAI hashtag #MicrosoftAI hashtag #AI500 hashtag #EnterpriseAI hashtag #AIEngineering …more   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
2 2 comments 1 repost   Like  Comment      Repost       Send           
 Feed post number 57 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 3w • Edited •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟴

𝗖𝗼𝗻𝘁𝗲𝘅𝘁 𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹 & 𝗜𝗻𝗷𝗲𝗰𝘁𝗶𝗼𝗻
⠀
In Part 7, we looked at 𝗔𝗴𝗲𝗻𝘁 𝗖𝗼𝗻𝘁𝗲𝘅𝘁 𝗠𝗮𝗻𝗮𝗴𝗲𝗺𝗲𝗻𝘁 and why an agent should provide the model with the right information at the right time.
⠀
But where does that information come from?
⠀
Two important concepts are:
𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹
𝗜𝗻𝗷𝗲𝗰𝘁𝗶𝗼𝗻
⠀
𝗪𝗵𝗮𝘁 𝗶𝘀 𝗖𝗼𝗻𝘁𝗲𝘅𝘁 𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹?
⠀
Retrieval is the process of finding information relevant to the agent's current task.

The information could come from:

• Enterprise documents
• Knowledge bases
• Databases
• APIs and tools
• Other information sources
⠀
𝗔 𝗦𝗶𝗺𝗽𝗹𝗲 𝗘𝘅𝗮𝗺𝗽𝗹𝗲
⠀
Imagine an HR agent.
User asks:
"How many days of maternity leave does our company provide?"
⠀
The model may not have access to the company's current HR policy. The agent can retrieve the relevant policy from the organization's knowledge base.
⠀
Conceptually:
𝗤𝘂𝗲𝘀𝘁𝗶𝗼𝗻 → 𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹 → 𝗥𝗲𝗹𝗲𝘃𝗮𝗻𝘁 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻
⠀
𝗪𝗵𝗮𝘁 𝗶𝘀 𝗖𝗼𝗻𝘁𝗲𝘅𝘁 𝗜𝗻𝗷𝗲𝗰𝘁𝗶𝗼𝗻?
⠀
Retrieving information is not enough. The retrieved information must be made available to the model as part of its context. This is 𝗖𝗼𝗻𝘁𝗲𝘅𝘁 𝗜𝗻𝗷𝗲𝗰𝘁𝗶𝗼𝗻.
⠀
A simplified example:

query = "What is our maternity leave policy?"
documents = knowledge_base. search(query)
context = "\n". join(documents)
response = agent. run(
 request=query,
 context=context
)
⠀
Here:
𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹
knowledge_base. search(query)
Finds information relevant to the question.
⠀
𝗜𝗻𝗷𝗲𝗰𝘁𝗶𝗼𝗻
context=context
Makes the retrieved information available to the model.
⠀
So:
𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹 ≠ 𝗜𝗻𝗷𝗲𝗰𝘁𝗶𝗼𝗻
Retrieval finds the information.
Injection places the relevant information into the context used by the model.
⠀
𝗪𝗵𝗲𝗿𝗲 𝗱𝗼𝗲𝘀 𝗥𝗔𝗚 𝗳𝗶𝘁?
⠀
RAG, or Retrieval-Augmented Generation, is a common architecture where relevant information is retrieved and supplied to the model to improve its response.

A simplified flow is:
𝗤𝘂𝗲𝗿𝘆 → 𝗥𝗲𝘁𝗿𝗶𝗲𝘃𝗮𝗹 → 𝗖𝗼𝗻𝘁𝗲𝘅𝘁 → 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗼𝗻
⠀
In a production system, retrieval may also involve ranking, filtering, or selecting the most relevant results before they are added to the context.
⠀
𝗔𝗜-𝟱𝟬𝟬 𝗘𝘅𝗮𝗺 𝗖𝗼𝗻𝗰𝗲𝗽𝘁
⠀
When thinking about context retrieval, ask:
1. What information does the agent need?
2. Where can it be found?
3. How is it retrieved?
4. How is it provided to the model?
5. Is the retrieved information relevant?
⠀
The key idea:
𝗔𝗴𝗲𝗻𝘁𝘀 𝗱𝗼 𝗻𝗼𝘁 𝗻𝗲𝗲𝗱 𝘁𝗼 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮𝗹𝗹 𝗮𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲 𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻 𝘁𝗼 𝘁𝗵𝗲 𝗺𝗼𝗱𝗲𝗹. 𝗧𝗵𝗲𝘆 𝗻𝗲𝗲𝗱 𝘁𝗼 𝗿𝗲𝘁𝗿𝗶𝗲𝘃𝗲 𝗮𝗻𝗱 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝘁𝗵𝗲 𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻 𝗿𝗲𝗹𝗲𝘃𝗮𝗻𝘁 𝘁𝗼 𝘁𝗵𝗲 𝗰𝘂𝗿𝗿𝗲𝗻𝘁 𝘁𝗮𝘀𝗸.

hashtag #ArtificialIntelligence hashtag #GenerativeAI hashtag #AgenticAI hashtag #AIAgents hashtag #ContextManagement hashtag #RAG hashtag #AzureAI hashtag #MicrosoftAI hashtag #AI500 hashtag #EnterpriseAI hashtag #AIEngineering …more   Activate to view larger image, 
￼
    Activate to view larger image,   1 repost   Like  Comment      Repost       Send           
 Feed post number 58 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 3w • Edited •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟳

𝗔𝗴𝗲𝗻𝘁 𝗖𝗼𝗻𝘁𝗲𝘅𝘁 𝗠𝗮𝗻𝗮𝗴𝗲𝗺𝗲𝗻𝘁
⠀
An AI agent can process only the information available to the model for a particular invocation.

So the fundamental question is:

𝗪𝗵𝗮𝘁 𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻 𝘀𝗵𝗼𝘂𝗹𝗱 𝘁𝗵𝗲 𝗮𝗴𝗲𝗻𝘁 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝘁𝗼 𝘁𝗵𝗲 𝗺𝗼𝗱𝗲𝗹?
⠀
𝗪𝗵𝗮𝘁 𝗶𝘀 𝗖𝗼𝗻𝘁𝗲𝘅𝘁?
⠀
Context is the information available to the model when generating its next response.

It can include:

• System instructions
• User request
• Conversation history
• Tool results
• Retrieved information
• Other agent outputs
⠀
𝗖𝗼𝗻𝘁𝗲𝘅𝘁 𝗪𝗶𝗻𝗱𝗼𝘄
⠀
The model determines the maximum context window it can process. The agent or application determines what information is actually placed into that window. For example, a model may support a large context window, but an agent does not need to send the maximum amount for every request.
⠀
𝗔 𝗦𝗶𝗺𝗽𝗹𝗲 𝗘𝘅𝗮𝗺𝗽𝗹𝗲
⠀
An agent is analyzing company sales data.
User: "Analyze Q1 sales."
Later:
User: "Compare Q1 with Q2 and identify the best-performing region."
⠀
The agent may need the Q1 analysis, Q2 data, and the current request. But suppose the conversation contains many unrelated exchanges and tool results. Sending everything may be unnecessary.
⠀
The application can select relevant information:

history = get_conversation_history()
relevant = select_relevant(history)
response = agent .run (
 context=relevant,
 request=current_request
)
⠀
This illustrates an important distinction:

𝗔𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲 𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻 ≠ 𝗖𝗼𝗻𝘁𝗲𝘅𝘁 𝘀𝗲𝗻𝘁 𝘁𝗼 𝘁𝗵𝗲 𝗺𝗼𝗱𝗲𝗹
⠀
𝗖𝗼𝗻𝘁𝗲𝘅𝘁 𝗔𝗰𝗰𝘂𝗺𝘂𝗹𝗮𝘁𝗶𝗼𝗻
⠀
During execution, context can grow:
User → Agent → Tool → Result → Tool → Result
⠀
If everything is retained, the context can become unnecessarily large.
⠀
Therefore, context management must consider:

• Relevance
• Context size
• Information priority
• Current task requirements
⠀
𝗔𝗜-𝟱𝟬𝟬 𝗘𝘅𝗮𝗺 𝗖𝗼𝗻𝗰𝗲𝗽𝘁
⠀
Remember:
𝗠𝗼𝗱𝗲𝗹 → determines the maximum context window
𝗔𝗴𝗲𝗻𝘁 → determines what context to provide
⠀
The key idea:

𝗚𝗼𝗼𝗱 𝗰𝗼𝗻𝘁𝗲𝘅𝘁 𝗺𝗮𝗻𝗮𝗴𝗲𝗺𝗲𝗻𝘁 𝗶𝘀 𝗻𝗼𝘁 𝗮𝗯𝗼𝘂𝘁 𝗳𝗶𝗹𝗹𝗶𝗻𝗴 𝘁𝗵𝗲 𝗰𝗼𝗻𝘁𝗲𝘅𝘁 𝘄𝗶𝗻𝗱𝗼𝘄. 𝗜𝘁 𝗶𝘀 𝗮𝗯𝗼𝘂𝘁 𝗽𝗿𝗼𝘃𝗶𝗱𝗶𝗻𝗴 𝘁𝗵𝗲 𝗿𝗶𝗴𝗵𝘁 𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻 𝗮𝘁 𝘁𝗵𝗲 𝗿𝗶𝗴𝗵𝘁 𝘁𝗶𝗺𝗲.

hashtag #ArtificialIntelligence hashtag #GenerativeAI hashtag #AgenticAI hashtag #AIAgents hashtag #ContextManagement hashtag #AzureAI hashtag #MicrosoftAI hashtag #AI500 hashtag #EnterpriseAI …more   Activate to view larger image, 
￼
    Activate to view larger image,   1 repost   Like  Comment      Repost       Send           
 Feed post number 59 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 3w •        𝗪𝗵𝘆 𝗱𝗶𝗱 𝗲𝘃𝗼𝗹𝘂𝘁𝗶𝗼𝗻 𝗽𝘂𝘁 𝗮 𝗵𝗶𝗴𝗵𝗹𝘆 𝗱𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗱 𝗯𝗿𝗮𝗶𝗻 𝗼𝗻 𝗮 𝗯𝗼𝗱𝘆 𝘁𝗵𝗮𝘁 𝘀𝘁𝗮𝗻𝗱𝘀 𝗼𝗻 𝗼𝗻𝗹𝘆 𝘁𝘄𝗼 𝗹𝗲𝗴𝘀?

From an structural engineering perspective, quadrupedal locomotion generally offers greater static stability: four points of support, a larger base and a lower center of mass.

Humans chose a different design.

𝗧𝘄𝗼 𝗹𝗲𝗴𝘀.
𝗛𝗶𝗴𝗵𝗲𝗿 𝗰𝗲𝗻𝘁𝗿𝗲 𝗼𝗳 𝗺𝗮𝘀𝘀.
𝗦𝗺𝗮𝗹𝗹𝗲𝗿 𝗯𝗮𝘀𝗲 𝗼𝗳 𝘀𝘂𝗽𝗽𝗼𝗿𝘁.
𝗔 𝗹𝗮𝗿𝗴𝗲 𝗯𝗿𝗮𝗶𝗻 𝗮𝘁 𝘁𝗵𝗲 𝘁𝗼𝗽.

Yet bipedalism gave us something extraordinary: 𝗳𝗿𝗲𝗲 𝗵𝗮𝗻𝗱𝘀.

Hands could carry, manipulate, throw and make tools. Combined with our increasingly sophisticated brains, this helped create technology, science and civilization.

But there was a price: 𝗳𝗮𝗹𝗹 𝗿𝗶𝘀𝗸.

A fall can expose the head to substantial impact and acceleration.

Evolution's solution was not simply a stronger skull.

It was a sophisticated dynamic control system:

𝗩𝗲𝘀𝘁𝗶𝗯𝘂𝗹𝗮𝗿 𝗰𝗼𝗻𝘁𝗿𝗼𝗹 + 𝗽𝗿𝗼𝗽𝗿𝗶𝗼𝗰𝗲𝗽𝘁𝗶𝗼𝗻 + 𝗰𝗲𝗿𝗲𝗯𝗲𝗹𝗹𝗮𝗿 𝗰𝗼𝗻𝘁𝗿𝗼𝗹 + 𝗽𝗼𝘀𝘁𝘂𝗿𝗮𝗹 𝗿𝗲𝗳𝗹𝗲𝘅𝗲𝘀 + 𝗿𝗮𝗽𝗶𝗱 𝘀𝘁𝗲𝗽𝗽𝗶𝗻𝗴 + 𝗽𝗿𝗼𝘁𝗲𝗰𝘁𝗶𝘃𝗲 𝗿𝗲𝘀𝗽𝗼𝗻𝘀𝗲𝘀.

In engineering terms:

𝗧𝗵𝗲 𝗵𝘂𝗺𝗮𝗻 𝗯𝗼𝗱𝘆 𝗶𝘀 𝗻𝗼𝘁 𝗽𝗮𝘀𝘀𝗶𝘃𝗲𝗹𝘆 𝘀𝘁𝗮𝗯𝗹𝗲.
𝗜𝘁 𝗶𝘀 𝗮𝗰𝘁𝗶𝘃𝗲𝗹𝘆 𝘀𝘁𝗮𝗯𝗶𝗹𝗶𝘇𝗲𝗱.

But aging changes the equation.

Muscle strength, reaction speed, proprioception, vision, vestibular function and postural control can decline.
The result?

𝗧𝗵𝗲 𝗺𝗮𝗿𝗴𝗶𝗻 𝗼𝗳 𝘀𝗮𝗳𝗲𝘁𝘆 𝗴𝗲𝘁𝘀 𝘀𝗺𝗮𝗹𝗹𝗲𝗿.

A disturbance that a young person automatically corrects may become a fall later in life.

And a fall can trigger a cascade:

𝗙𝗮𝗹𝗹 → 𝗶𝗻𝗷𝘂𝗿𝘆 → 𝗶𝗻𝗮𝗰𝘁𝗶𝘃𝗶𝘁𝘆 → 𝗱𝗲𝗰𝗼𝗻𝗱𝗶𝘁𝗶𝗼𝗻𝗶𝗻𝗴 → 𝗴𝗿𝗲𝗮𝘁𝗲𝗿 𝘃𝘂𝗹𝗻𝗲𝗿𝗮𝗯𝗶𝗹𝗶𝘁𝘆.

Perhaps one of the great challenges of longevity is therefore not simply adding years to life.

𝗜𝘁 𝗶𝘀 𝗽𝗿𝗲𝘀𝗲𝗿𝘃𝗶𝗻𝗴 𝘁𝗵𝗲 𝗯𝗼𝗱𝘆’𝘀 𝗮𝗯𝗶𝗹𝗶𝘁𝘆 𝘁𝗼 𝗺𝗮𝗻𝗮𝗴𝗲 𝗶𝗻𝘀𝘁𝗮𝗯𝗶𝗹𝗶𝘁𝘆.

hashtag #HumanEvolution hashtag #Bipedalism hashtag #Biomechanics hashtag #Aging hashtag #Longevity hashtag #Brain hashtag #Evolution hashtag #Engineering hashtag #StructuralEngineering …more   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
1 2 comments 1 repost   Like  Comment      Repost       Send           
 Feed post number 60 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 3w •        𝗟𝗲𝗼𝗻𝗮𝗿𝗱𝗼 𝗱𝗮 𝗩𝗶𝗻𝗰𝗶’𝘀 𝗦𝗲𝗹𝗳-𝗦𝘂𝗽𝗽𝗼𝗿𝘁𝗶𝗻𝗴 𝗕𝗿𝗶𝗱𝗴𝗲 | 𝗦𝘁𝗿𝘂𝗰𝘁𝘂𝗿𝗮𝗹 𝗜𝗻𝗴𝗲𝗻𝘂𝗶𝘁𝘆 𝗪𝗶𝘁𝗵𝗼𝘂𝘁 𝗙𝗮𝘀𝘁𝗲𝗻𝗲𝗿𝘀
⠀
Imagine constructing a bridge using timber members with no nails, bolts, ropes or conventional fasteners. That is the remarkable concept behind 𝗟𝗲𝗼𝗻𝗮𝗿𝗱𝗼 𝗱𝗮 𝗩𝗶𝗻𝗰𝗶’𝘀 𝘀𝗲𝗹𝗳-𝘀𝘂𝗽𝗽𝗼𝗿𝘁𝗶𝗻𝗴 𝗯𝗿𝗶𝗱𝗴𝗲, documented in his 𝗖𝗼𝗱𝗲𝘅 𝗔𝘁𝗹𝗮𝗻𝘁𝗶𝗰𝘂𝘀.
⠀
The ingenious feature is the way the timber members are interlocked with one another. Each member constrains the movement of its neighbours, allowing the assembly to become stable through:

𝗚𝗲𝗼𝗺𝗲𝘁𝗿𝗶𝗰 𝗶𝗻𝘁𝗲𝗿𝗹𝗼𝗰𝗸𝗶𝗻𝗴
𝗖𝗼𝗺𝗽𝗿𝗲𝘀𝘀𝗶𝘃𝗲 𝗳𝗼𝗿𝗰𝗲𝘀
𝗙𝗿𝗶𝗰𝘁𝗶𝗼𝗻 𝗮𝘁 𝗰𝗼𝗻𝘁𝗮𝗰𝘁 𝘀𝘂𝗿𝗳𝗮𝗰𝗲𝘀
𝗟𝗼𝗮𝗱 𝗿𝗲𝗱𝗶𝘀𝘁𝗿𝗶𝗯𝘂𝘁𝗶𝗼𝗻
⠀
Leonardo conceived the bridge as a rapidly assembled and disassembled structure, likely intended for military applications during his association with Cesare Borgia. Its portability and rapid deployment were important features of the concept.
⠀
In 2001, the Leonardo Bridge at Ås, Norway was completed. It is a modern pedestrian bridge inspired by Leonardo's design, although it is not a literal reproduction of the interlocking-stick structure.
⠀
From a structural-engineering perspective, the deeper lesson is:
𝗚𝗲𝗼𝗺𝗲𝘁𝗿𝘆 𝗶𝘁𝘀𝗲𝗹𝗳 𝗰𝗮𝗻 𝗯𝗲𝗰𝗼𝗺𝗲 𝗮 𝘀𝘁𝗿𝘂𝗰𝘁𝘂𝗿𝗮𝗹 𝗺𝗲𝗰𝗵𝗮𝗻𝗶𝘀𝗺.

Individually unstable members can form a stable load-bearing system when their geometry, contact forces and constraints are intelligently arranged.
⠀
𝗦𝗶𝗺𝗽𝗹𝗲 𝗺𝗮𝘁𝗲𝗿𝗶𝗮𝗹𝘀.
𝗜𝗻𝘁𝗲𝗹𝗹𝗶𝗴𝗲𝗻𝘁 𝗴𝗲𝗼𝗺𝗲𝘁𝗿𝘆.
𝗣𝗼𝘄𝗲𝗿𝗳𝘂𝗹 𝘀𝘁𝗿𝘂𝗰𝘁𝘂𝗿𝗮𝗹 𝗽𝗿𝗶𝗻𝗰𝗶𝗽𝗹𝗲𝘀.
⠀
hashtag #StructuralEngineering hashtag #LeonardoDaVinci hashtag #BridgeEngineering hashtag #CivilEngineering hashtag #StructuralDesign hashtag #EngineeringInnovation hashtag #Mechanics hashtag #TimberStructures hashtag #Architecture hashtag #EngineeringHistory …more   
￼
   
￼
   
￼
   Activate to view larger image,   
￼
3 2 comments 1 repost   Like  Comment      Repost       Send           
 Feed post number 61 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 3w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟲
𝗦𝗲𝗰𝘂𝗿𝗶𝗻𝗴 𝗠𝘂𝗹𝘁𝗶-𝗔𝗴𝗲𝗻𝘁 𝗔𝗜: 𝗜𝗱𝗲𝗻𝘁𝗶𝘁𝘆, 𝗔𝘂𝘁𝗵𝗲𝗻𝘁𝗶𝗰𝗮𝘁𝗶𝗼𝗻 & 𝗔𝘂𝘁𝗵𝗼𝗿𝗶𝘇𝗮𝘁𝗶𝗼𝗻
⠀
In a multi-agent AI solution, agents may communicate with other agents, tools, APIs, databases, and enterprise resources.

But one fundamental question remains:

𝗪𝗵𝗼 𝗶𝘀 𝘁𝗵𝗲 𝗮𝗴𝗲𝗻𝘁, 𝗮𝗻𝗱 𝘄𝗵𝗮𝘁 𝗶𝘀 𝗶𝘁 𝗮𝗹𝗹𝗼𝘄𝗲𝗱 𝘁𝗼 𝗱𝗼?
⠀
𝗜𝗱𝗲𝗻𝘁𝗶𝘁𝘆
⠀
Each agent should have a distinct identity rather than sharing broad credentials.

In Azure, 𝗠𝗶𝗰𝗿𝗼𝘀𝗼𝗳𝘁 𝗘𝗻𝘁𝗿𝗮 𝗜𝗗 and 𝗠𝗮𝗻𝗮𝗴𝗲𝗱 𝗜𝗱𝗲𝗻𝘁𝗶𝘁𝗶𝗲𝘀 can provide workload identities for agents.
⠀
𝗔𝘂𝘁𝗵𝗲𝗻𝘁𝗶𝗰𝗮𝘁𝗶𝗼𝗻 𝘃𝘀 𝗔𝘂𝘁𝗵𝗼𝗿𝗶𝘇𝗮𝘁𝗶𝗼𝗻
⠀
𝗔𝘂𝘁𝗵𝗲𝗻𝘁𝗶𝗰𝗮𝘁𝗶𝗼𝗻 → "Who are you?"
𝗔𝘂𝘁𝗵𝗼𝗿𝗶𝘇𝗮𝘁𝗶𝗼𝗻 → "What are you allowed to do?"
⠀
An authenticated agent should not automatically receive unrestricted access.
⠀
𝗢𝗔𝘂𝘁𝗵 𝟮.𝟬
⠀
OAuth 2.0 is an authorization framework commonly used to obtain access tokens for protected resources.

Agent → Authorization Server → Access Token → Protected Resource
⠀
𝗠𝗮𝗻𝗮𝗴𝗲𝗱 𝗜𝗱𝗲𝗻𝘁𝗶𝘁𝘆
⠀
For Azure workloads, managed identities can avoid storing application credentials in code or configuration.
⠀
𝗢𝗻-𝗕𝗲𝗵𝗮𝗹𝗳-𝗢𝗳 (𝗢𝗕𝗢)
⠀
Sometimes an agent acts on behalf of a signed-in user.

User → Agent → Downstream API

The OBO flow can propagate delegated user context to a downstream API so access can be evaluated against the user's permissions.
⠀
𝗟𝗲𝗮𝘀𝘁 𝗣𝗿𝗶𝘃𝗶𝗹𝗲𝗴𝗲
⠀
Give each agent only the permissions it actually needs.

For example, a reporting agent may need read access to a database but should not automatically be able to modify or delete data.
⠀
𝗥𝗕𝗔𝗖
⠀
Azure RBAC can control which identities can perform which operations on Azure resources.

𝗜𝗱𝗲𝗻𝘁𝗶𝘁𝘆 → 𝗔𝘂𝘁𝗵𝗲𝗻𝘁𝗶𝗰𝗮𝘁𝗶𝗼𝗻 → 𝗔𝘂𝘁𝗵𝗼𝗿𝗶𝘇𝗮𝘁𝗶𝗼𝗻 → 𝗟𝗲𝗮𝘀𝘁 𝗣𝗿𝗶𝘃𝗶𝗹𝗲𝗴𝗲
⠀
𝗦𝗲𝗰𝘂𝗿𝗶𝗻𝗴 𝘁𝗵𝗲 𝗔𝗴𝗲𝗻𝘁 𝗡𝗲𝘁𝘄𝗼𝗿𝗸
⠀
Security also requires:
⠀
• Network boundaries
• Lateral movement prevention
• Secrets management
• Tenant isolation
• Encryption
• Monitoring and auditing
⠀
𝗞𝗲𝘆 𝗩𝗮𝘂𝗹𝘁 can manage secrets, certificates, and keys rather than embedding sensitive credentials in applications.
⠀
𝗔𝗜-𝟱𝟬𝟬 𝗘𝘅𝗮𝗺 𝗧𝗶𝗽
⠀
For a multi-agent security scenario, ask:
⠀
What identity does each agent use?
How is it authenticated?
What resource is it accessing?
What permissions does it have?
Is it acting as itself or for a user?
Can access be restricted to the minimum required?
⠀
The key idea:
⠀
𝗦𝗲𝗰𝘂𝗿𝗲 𝗺𝘂𝗹𝘁𝗶-𝗮𝗴𝗲𝗻𝘁 𝗔𝗜 𝗿𝗲𝗾𝘂𝗶𝗿𝗲𝘀 𝗸𝗻𝗼𝘄𝗻 𝗶𝗱𝗲𝗻𝘁𝗶𝘁𝗶𝗲𝘀, 𝘀𝘁𝗿𝗼𝗻𝗴 𝗮𝘂𝘁𝗵𝗲𝗻𝘁𝗶𝗰𝗮𝘁𝗶𝗼𝗻, 𝗽𝗿𝗲𝗰𝗶𝘀𝗲 𝗮𝘂𝘁𝗵𝗼𝗿𝗶𝘇𝗮𝘁𝗶𝗼𝗻, 𝗮𝗻𝗱 𝗹𝗲𝗮𝘀𝘁 𝗽𝗿𝗶𝘃𝗶𝗹𝗲𝗴𝗲.
⠀
hashtag #ArtificialIntelligence hashtag #GenerativeAI hashtag #AgenticAI hashtag #AIAgents hashtag #MultiAgentAI hashtag #ZeroTrust hashtag #OAuth2 hashtag #MicrosoftEntraID hashtag #AzureAI hashtag #MicrosoftAI hashtag #AI500 hashtag #EnterpriseAI hashtag #AIEngineering …more   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
2 1 repost   Like  Comment      Repost       Send           
 Feed post number 62 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 3w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 | 𝗣𝗮𝗿𝘁 𝟱
⠀
𝗔𝟮𝗔 𝗖𝗼𝗺𝗺𝘂𝗻𝗶𝗰𝗮𝘁𝗶𝗼𝗻 & 𝗔𝗴𝗲𝗻𝘁 𝗘𝗰𝗼𝘀𝘆𝘀𝘁𝗲𝗺𝘀 𝗮𝘁 𝗦𝗰𝗮𝗹𝗲
⠀
In a multi-agent AI solution, agents need to communicate and collaborate. But when the number of agents grows, simply hardcoding agent endpoints does not scale.
⠀
How do we discover the right agent, route a task, handle failures, and scale the ecosystem?
⠀
This is where 𝗔𝟮𝗔 (𝗔𝗴𝗲𝗻𝘁𝟮𝗔𝗴𝗲𝗻𝘁) and dynamic agent discovery become important.
⠀
𝗙𝗿𝗼𝗺 𝗦𝘁𝗮𝘁𝗶𝗰 𝘁𝗼 𝗗𝘆𝗻𝗮𝗺𝗶𝗰 𝗗𝗶𝘀𝗰𝗼𝘃𝗲𝗿𝘆
⠀
A simple design might hardcode:
⠀
Orchestrator → Agent A → Endpoint
⠀
But what happens if Agent A is unavailable, moved, upgraded, or scaled?
⠀
A scalable A2A ecosystem can use a 𝗱𝗶𝘀𝗰𝗼𝘃𝗲𝗿𝘆 𝗿𝗲𝗴𝗶𝘀𝘁𝗿𝘆.
⠀
𝗔𝗴𝗲𝗻𝘁 → 𝗥𝗲𝗴𝗶𝘀𝘁𝗲𝗿 → 𝗗𝗶𝘀𝗰𝗼𝘃𝗲𝗿 → 𝗥𝗼𝘂𝘁𝗲
⠀
The registry can maintain information such as:
• Agent identity
• Endpoint
• Capabilities
• Version
• Health status
• Last heartbeat
⠀
𝗖𝗮𝗽𝗮𝗯𝗶𝗹𝗶𝘁𝘆-𝗕𝗮𝘀𝗲𝗱 𝗥𝗼𝘂𝘁𝗶𝗻𝗴
⠀
Instead of asking:
"Which endpoint should I call?"
⠀
the system can ask:
"Which available agent can perform this task?"
⠀
Routing can consider capability, specialization, geography, version, latency, capacity, and health.
⠀
𝗦𝗰𝗮𝗹𝗶𝗻𝗴 𝗮𝗻𝗱 𝗙𝗮𝗶𝗹𝗼𝘃𝗲𝗿
⠀
A production system may have multiple instances of the same agent.
⠀
For example:
⠀
Risk Agent
├── Instance 1
├── Instance 2
└── Instance 3
⠀
Requests can be distributed across healthy instances.
⠀
Agents can also send periodic 𝗵𝗲𝗮𝗿𝘁𝗯𝗲𝗮𝘁𝘀. If an instance stops responding, its registry entry can expire using a 𝗧𝗧𝗟 (Time-To-Live), allowing another healthy instance to receive work.
⠀
𝗔𝗴𝗲𝗻𝘁 𝗟𝗶𝗳𝗲𝗰𝘆𝗰𝗹𝗲
⠀
𝗦𝘁𝗮𝗿𝘁 → 𝗥𝗲𝗴𝗶𝘀𝘁𝗲𝗿 → 𝗛𝗲𝗮𝗿𝘁𝗯𝗲𝗮𝘁 → 𝗥𝘂𝗻 → 𝗗𝗿𝗮𝗶𝗻 → 𝗦𝗵𝘂𝘁𝗱𝗼𝘄𝗻
⠀
This allows agents to be added, removed, upgraded, and scaled without manually updating every client.
⠀
𝗔𝟮𝗔 𝗮𝗻𝗱 𝗔𝗜-𝟱𝟬𝟬
⠀
For AI-500, don't think of A2A simply as:
⠀
𝗔𝗴𝗲𝗻𝘁 𝗔 → 𝗔𝗴𝗲𝗻𝘁 𝗕
⠀
At enterprise scale, think:
⠀
𝗗𝗶𝘀𝗰𝗼𝘃𝗲𝗿𝘆 + 𝗖𝗮𝗽𝗮𝗯𝗶𝗹𝗶𝘁𝘆 𝗠𝗮𝘁𝗰𝗵𝗶𝗻𝗴 + 𝗥𝗼𝘂𝘁𝗶𝗻𝗴 + 𝗛𝗲𝗮𝗹𝘁𝗵 + 𝗦𝗰𝗮𝗹𝗶𝗻𝗴 + 𝗙𝗮𝗶𝗹𝗼𝘃𝗲𝗿 + 𝗟𝗶𝗳𝗲𝗰𝘆𝗰𝗹𝗲 𝗠𝗮𝗻𝗮𝗴𝗲𝗺𝗲𝗻𝘁
⠀
Microsoft's AI-500 learning content covers designing A2A agent ecosystems with discovery registries and dynamic capability-based routing.
⠀
The key idea:
⠀
𝗦𝗰𝗮𝗹𝗮𝗯𝗹𝗲 𝗔𝟮𝗔 𝗶𝘀 𝗻𝗼𝘁 𝗷𝘂𝘀𝘁 𝗮𝗯𝗼𝘂𝘁 𝗮𝗴𝗲𝗻𝘁𝘀 𝗰𝗼𝗺𝗺𝘂𝗻𝗶𝗰𝗮𝘁𝗶𝗻𝗴. 𝗜𝘁 𝗶𝘀 𝗮𝗯𝗼𝘂𝘁 𝗱𝗶𝘀𝗰𝗼𝘃𝗲𝗿𝗶𝗻𝗴, 𝗿𝗼𝘂𝘁𝗶𝗻𝗴, 𝘀𝗰𝗮𝗹𝗶𝗻𝗴, 𝗮𝗻𝗱 𝗺𝗮𝗻𝗮𝗴𝗶𝗻𝗴 𝗮𝗴𝗲𝗻𝘁𝘀 𝗮𝘀 𝗮 𝗱𝘆𝗻𝗮𝗺𝗶𝗰 𝗲𝗻𝘁𝗲𝗿𝗽𝗿𝗶𝘀𝗲 𝗲𝗰𝗼𝘀𝘆𝘀𝘁𝗲𝗺.
⠀
hashtag #ArtificialIntelligence hashtag #GenerativeAI hashtag #A2A hashtag #Agent2Agent hashtag #AgenticAI hashtag #MultiAgentAI hashtag #AzureAI hashtag #MicrosoftAI hashtag #AI500 hashtag #EnterpriseAI hashtag #AIEngineering …more   Activate to view larger image, 
￼
    Activate to view larger image,   1 repost   Like  Comment      Repost       Send           
 Feed post number 63 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 3w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 – 𝗣𝗮𝗿𝘁 𝟰
⠀
𝗠𝗼𝗱𝗲𝗹 𝗖𝗼𝗻𝘁𝗲𝘅𝘁 𝗣𝗿𝗼𝘁𝗼𝗰𝗼𝗹 (𝗠𝗖𝗣) – 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗶𝗻𝗴 𝗔𝗜 𝘁𝗼 𝗧𝗼𝗼𝗹𝘀 𝗮𝗻𝗱 𝗗𝗮𝘁𝗮
⠀
AI agents become much more useful when they can interact with external tools, data, and services.
⠀
But this creates an important challenge:
⠀
𝗛𝗼𝘄 𝗰𝗮𝗻 𝘄𝗲 𝘀𝘁𝗮𝗻𝗱𝗮𝗿𝗱𝗶𝘇𝗲 𝘁𝗵𝗲 𝘄𝗮𝘆 𝗔𝗜 𝗮𝗽𝗽𝗹𝗶𝗰𝗮𝘁𝗶𝗼𝗻𝘀 𝗰𝗼𝗻𝗻𝗲𝗰𝘁 𝘁𝗼 𝗲𝘅𝘁𝗲𝗿𝗻𝗮𝗹 𝘁𝗼𝗼𝗹𝘀 𝗮𝗻𝗱 𝗱𝗮𝘁𝗮?
⠀
This is where the 𝗠𝗼𝗱𝗲𝗹 𝗖𝗼𝗻𝘁𝗲𝘅𝘁 𝗣𝗿𝗼𝘁𝗼𝗰𝗼𝗹 (𝗠𝗖𝗣) becomes important.
⠀
MCP is an open protocol that provides a standardized way for AI applications to connect with external tools and contextual data.
⠀
𝗔 𝗦𝗶𝗺𝗽𝗹𝗶𝗳𝗶𝗲𝗱 𝗠𝗖𝗣 𝗔𝗿𝗰𝗵𝗶𝘁𝗲𝗰𝘁𝘂𝗿𝗲
⠀
𝗔𝗜 𝗔𝗽𝗽𝗹𝗶𝗰𝗮𝘁𝗶𝗼𝗻
↓
𝗠𝗖𝗣 𝗖𝗹𝗶𝗲𝗻𝘁
↓
𝗠𝗖𝗣 𝗦𝗲𝗿𝘃𝗲𝗿
↓
𝗧𝗼𝗼𝗹𝘀 / 𝗗𝗮𝘁𝗮 / 𝗦𝗲𝗿𝘃𝗶𝗰𝗲𝘀
⠀
The 𝗠𝗖𝗣 𝗖𝗹𝗶𝗲𝗻𝘁 enables the AI application to communicate with an MCP server.
⠀
The 𝗠𝗖𝗣 𝗦𝗲𝗿𝘃𝗲𝗿 exposes capabilities such as tools and contextual information that the AI application can use.
⠀
𝗪𝗵𝘆 𝗶𝘀 𝗠𝗖𝗣 𝗨𝘀𝗲𝗳𝘂𝗹?
⠀
Without a standardized approach, AI applications may require separate custom integrations for different tools and data sources.
⠀
MCP provides a common protocol that can make these integrations more reusable, consistent, and easier to manage.
⠀
For example, an AI application could use MCP to access:
⠀
• Enterprise databases
• Search services
• REST APIs
• Business applications
• Files and other contextual data
⠀
𝗠𝗖𝗣 𝗮𝗻𝗱 𝗧𝗼𝗼𝗹 𝗖𝗮𝗹𝗹𝗶𝗻𝗴
⠀
This distinction is important:
⠀
𝗧𝗼𝗼𝗹 𝗖𝗮𝗹𝗹𝗶𝗻𝗴 does 𝗻𝗼𝘁 require MCP.
⠀
An AI application can use Tool Calling to invoke functions or tools that are directly implemented or integrated into the application.
⠀
MCP provides a 𝘀𝘁𝗮𝗻𝗱𝗮𝗿𝗱𝗶𝘇𝗲𝗱 𝗽𝗿𝗼𝘁𝗼𝗰𝗼𝗹 for AI applications to discover and interact with tools and other contextual capabilities.
⠀
Therefore:
⠀
𝗧𝗼𝗼𝗹 𝗖𝗮𝗹𝗹𝗶𝗻𝗴 = 𝗖𝗮𝗽𝗮𝗯𝗶𝗹𝗶𝘁𝘆
⠀
𝗠𝗖𝗣 = 𝗦𝘁𝗮𝗻𝗱𝗮𝗿𝗱𝗶𝘇𝗲𝗱 𝗣𝗿𝗼𝘁𝗼𝗰𝗼𝗹
⠀
MCP can therefore make tool integration more standardized and reusable, but it is not a prerequisite for Tool Calling.
⠀
𝗔𝗜-𝟱𝟬𝟬 𝗘𝘅𝗮𝗺 𝗧𝗶𝗽
⠀
Remember:
⠀
• 𝗠𝗖𝗣 → Model Context Protocol
⠀
• 𝗠𝗖𝗣 𝗖𝗹𝗶𝗲𝗻𝘁 → Communicates with an MCP server.
⠀
• 𝗠𝗖𝗣 𝗦𝗲𝗿𝘃𝗲𝗿 → Exposes tools and contextual capabilities.
⠀
• 𝗧𝗼𝗼𝗹 𝗖𝗮𝗹𝗹𝗶𝗻𝗴 → Enables an AI system to invoke tools.
⠀
• 𝗧𝗼𝗼𝗹 𝗖𝗮𝗹𝗹𝗶𝗻𝗴 𝗰𝗮𝗻 𝗲𝘅𝗶𝘀𝘁 𝘄𝗶𝘁𝗵 𝗼𝗿 𝘄𝗶𝘁𝗵𝗼𝘂𝘁 𝗠𝗖𝗣.
⠀
The current Microsoft AI-500 study guide includes designing and building MCP servers and clients, as well as integrating existing agents using MCP and/or A2A.
⠀
The key idea:
⠀
𝗠𝗖𝗣 𝗱𝗼𝗲𝘀 𝗻𝗼𝘁 𝗿𝗲𝗽𝗹𝗮𝗰𝗲 𝗧𝗼𝗼𝗹 𝗖𝗮𝗹𝗹𝗶𝗻𝗴. 𝗜𝘁 𝗽𝗿𝗼𝘃𝗶𝗱𝗲𝘀 𝗮 𝘀𝘁𝗮𝗻𝗱𝗮𝗿𝗱𝗶𝘇𝗲𝗱 𝘄𝗮𝘆 𝗳𝗼𝗿 𝗔𝗜 𝗮𝗽𝗽𝗹𝗶𝗰𝗮𝘁𝗶𝗼𝗻𝘀 𝘁𝗼 𝗰𝗼𝗻𝗻𝗲𝗰𝘁 𝘄𝗶𝘁𝗵 𝘁𝗼𝗼𝗹𝘀 𝗮𝗻𝗱 𝗰𝗼𝗻𝘁𝗲𝘅𝘁𝘂𝗮𝗹 𝗰𝗮𝗽𝗮𝗯𝗶𝗹𝗶𝘁𝗶𝗲𝘀.

hashtag #MCP hashtag #AgenticAI hashtag #MultiAgentAI hashtag #ToolCalling hashtag #AI500 …more   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
4 4 comments 1 repost   Like  Comment      Repost       Send           
 Feed post number 64 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 4w •        𝗣𝗲𝗻𝗿𝗼𝘀𝗲 𝗧𝗶𝗹𝗶𝗻𝗴𝘀 𝗮𝗻𝗱 𝗔𝗻𝗱𝗵𝗿𝗮 𝗠𝘂𝗴𝗴𝘂 (ఆంధ్ర ముగ్గు): 𝗜𝘀 𝗧𝗵𝗲𝗿𝗲 𝗮 𝗠𝗮𝘁𝗵𝗲𝗺𝗮𝘁𝗶𝗰𝗮𝗹 𝗦𝗶𝗺𝗶𝗹𝗮𝗿𝗶𝘁𝘆?

While writing my recent series on 𝗧𝗲𝘀𝘀𝗲𝗹𝗹𝗮𝘁𝗶𝗼𝗻𝘀, 𝗤𝘂𝗮𝘀𝗶𝗽𝗲𝗿𝗶𝗼𝗱𝗶𝗰 𝗧𝗶𝗹𝗶𝗻𝗴𝘀, 𝗣𝗲𝗻𝗿𝗼𝘀𝗲 𝗧𝗶𝗹𝗶𝗻𝗴𝘀, and 𝗤𝘂𝗮𝘀𝗶𝗰𝗿𝘆𝘀𝘁𝗮𝗹𝘀, I noticed something that caught my attention.

Some patterns reminded me of 𝗔𝗻𝗱𝗵𝗿𝗮 𝗠𝘂𝗴𝗴𝘂 (ఆంధ్ర ముగ్గు). So I became curious:

𝗜𝘀 𝘁𝗵𝗲𝗿𝗲 𝗮𝗻𝘆 𝗺𝗮𝘁𝗵𝗲𝗺𝗮𝘁𝗶𝗰𝗮𝗹 𝗼𝗿 𝗴𝗲𝗼𝗺𝗲𝘁𝗿𝗶𝗰 𝘀𝗶𝗺𝗶𝗹𝗮𝗿𝗶𝘁𝘆 𝗯𝗲𝘁𝘄𝗲𝗲𝗻 𝗣𝗲𝗻𝗿𝗼𝘀𝗲 𝗧𝗶𝗹𝗶𝗻𝗴𝘀 𝗮𝗻𝗱 𝗔𝗻𝗱𝗵𝗿𝗮 𝗠𝘂𝗴𝗴𝘂 (ఆంధ్ర ముగ్గు)?

𝗪𝗵𝗮𝘁 𝗶𝘀 𝗔𝗻𝗱𝗵𝗿𝗮 𝗠𝘂𝗴𝗴𝘂 (ఆంధ్ర ముగ్గు)?

For those unfamiliar with it, 𝗔𝗻𝗱𝗵𝗿𝗮 𝗠𝘂𝗴𝗴𝘂 (ఆంధ్ర ముగ్గు) is a traditional decorative floor-art practice from Andhra Pradesh, India. It is commonly drawn near the entrance of homes using rice flour, chalk powder, or colored powders.

𝗔𝗻𝗱𝗵𝗿𝗮 𝗠𝘂𝗴𝗴𝘂 (ఆంధ్ర ముగ్గు) often uses:
=> 𝗗𝗼𝘁𝘀 arranged in geometric grids.
=> 𝗟𝗶𝗻𝗲𝘀 𝗮𝗻𝗱 𝗰𝘂𝗿𝘃𝗲𝘀 drawn around or through the dots.
=> 𝗥𝗲𝗽𝗲𝗮𝘁𝗶𝗻𝗴 𝗺𝗼𝘁𝗶𝗳𝘀 and symmetry.
=> Carefully followed 𝗴𝗲𝗼𝗺𝗲𝘁𝗿𝗶𝗰 𝗿𝘂𝗹𝗲𝘀.

𝗣𝗲𝗻𝗿𝗼𝘀𝗲 𝗧𝗶𝗹𝗶𝗻𝗴𝘀
Penrose tilings use specially designed tiles and matching rules to create patterns that:
=> Cover a surface without gaps or overlaps.
=> Have 𝗹𝗼𝗻𝗴-𝗿𝗮𝗻𝗴𝗲 𝗼𝗿𝗱𝗲𝗿.
=> 𝗡𝗲𝘃𝗲𝗿 𝗿𝗲𝗽𝗲𝗮𝘁 𝗽𝗲𝗿𝗶𝗼𝗱𝗶𝗰𝗮𝗹𝗹𝘆.
=> Can exhibit 𝗳𝗶𝘃𝗲-𝗳𝗼𝗹𝗱 𝗿𝗼𝘁𝗮𝘁𝗶𝗼𝗻𝗮𝗹 𝘀𝘆𝗺𝗺𝗲𝘁𝗿𝘆.

Looking at certain Penrose tilings alongside some intricate Andhra Muggu (ఆంధ్ర ముగ్గు) designs, I could see similarities in:
𝗚𝗲𝗼𝗺𝗲𝘁𝗿𝘆 → 𝗦𝘆𝗺𝗺𝗲𝘁𝗿𝘆 → 𝗠𝗼𝘁𝗶𝗳𝘀 → 𝗖𝗼𝗺𝗽𝗹𝗲𝘅 𝗣𝗮𝘁𝘁𝗲𝗿𝗻𝘀

But there is an important distinction:
𝗩𝗶𝘀𝘂𝗮𝗹 𝘀𝗶𝗺𝗶𝗹𝗮𝗿𝗶𝘁𝘆 𝗱𝗼𝗲𝘀 𝗻𝗼𝘁 𝗻𝗲𝗰𝗲𝘀𝘀𝗮𝗿𝗶𝗹𝘆 𝗺𝗲𝗮𝗻 𝗺𝗮𝘁𝗵𝗲𝗺𝗮𝘁𝗶𝗰𝗮𝗹 𝗲𝗾𝘂𝗶𝘃𝗮𝗹𝗲𝗻𝗰𝗲.
Penrose tilings and traditional Andhra Muggu (ఆంధ్ర ముగ్గు) have different construction principles and historical origins.

Penrose tilings are specifically 𝗾𝘂𝗮𝘀𝗶𝗽𝗲𝗿𝗶𝗼𝗱𝗶𝗰 𝗮𝗻𝗱 𝗻𝗼𝗻-𝗽𝗲𝗿𝗶𝗼𝗱𝗶𝗰, whereas many Andhra Muggu (ఆంధ్ర ముగ్గు) designs use regular dot grids, repeated motifs, and conventional symmetries.

So I am not suggesting that Andhra Muggu (ఆంధ్ర ముగ్గు) is a Penrose tiling—or that Penrose tiling was derived from it.

Rather, the visual and geometric resemblance in some patterns is fascinating enough to investigate further.

Perhaps the more interesting question is:

𝗖𝗮𝗻 𝗔𝗻𝗱𝗵𝗿𝗮 𝗠𝘂𝗴𝗴𝘂 (ఆంధ్ర ముగ్గు) 𝗯𝗲 𝗮𝗻𝗮𝗹𝘆𝘇𝗲𝗱 𝘂𝘀𝗶𝗻𝗴 𝗴𝗿𝗮𝗽𝗵 𝘁𝗵𝗲𝗼𝗿𝘆, 𝘁𝗼𝗽𝗼𝗹𝗼𝗴𝘆, 𝘀𝘆𝗺𝗺𝗲𝘁𝗿𝘆, 𝗮𝗻𝗱 𝗰𝗼𝗺𝗽𝘂𝘁𝗮𝘁𝗶𝗼𝗻𝗮𝗹 𝗴𝗲𝗼𝗺𝗲𝘁𝗿𝘆?

That, to me, is where the real fascination begins.

𝗠𝗮𝘁𝗵𝗲𝗺𝗮𝘁𝗶𝗰𝘀 𝗺𝗮𝘆 𝗯𝗲 𝗳𝗼𝘂𝗻𝗱 𝗻𝗼𝘁 𝗼𝗻𝗹𝘆 𝗶𝗻 𝗲𝗾𝘂𝗮𝘁𝗶𝗼𝗻𝘀, 𝗯𝘂𝘁 𝗮𝗹𝘀𝗼 𝗶𝗻 𝘁𝗵𝗲 𝗽𝗮𝘁𝘁𝗲𝗿𝗻𝘀 𝘄𝗲 𝗰𝗿𝗲𝗮𝘁𝗲 𝗮𝗻𝗱 𝘁𝗵𝗲 𝘁𝗿𝗮𝗱𝗶𝘁𝗶𝗼𝗻𝘀 𝘄𝗲 𝗽𝗿𝗲𝘀𝗲𝗿𝘃𝗲. …more   Activate to view larger image, 
￼
    Activate to view larger image,   1 repost   Like  Comment      Repost       Send           
 Feed post number 65 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 4w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 – 𝗣𝗮𝗿𝘁 𝟯
⠀
𝗧𝗼𝗼𝗹 𝗖𝗮𝗹𝗹𝗶𝗻𝗴 𝗶𝗻 𝗔𝗜 𝗔𝗴𝗲𝗻𝘁𝘀 – 𝗙𝗿𝗼𝗺 𝗥𝗲𝗮𝘀𝗼𝗻𝗶𝗻𝗴 𝘁𝗼 𝗔𝗰𝘁𝗶𝗼𝗻
⠀
In Part 1, I discussed 𝗠𝘂𝗹𝘁𝗶-𝗔𝗴𝗲𝗻𝘁 𝗔𝗜 𝗦𝗼𝗹𝘂𝘁𝗶𝗼𝗻𝘀.
⠀
In Part 2, I discussed 𝗔𝗴𝗲𝗻𝘁 𝗢𝗿𝗰𝗵𝗲𝘀𝘁𝗿𝗮𝘁𝗶𝗼𝗻 and how an Orchestrator coordinates specialized agents.
⠀
Now comes an important question:
⠀
𝗛𝗼𝘄 𝗱𝗼𝗲𝘀 𝗮𝗻 𝗔𝗜 𝗮𝗴𝗲𝗻𝘁 𝗶𝗻𝘁𝗲𝗿𝗮𝗰𝘁 𝘄𝗶𝘁𝗵 𝘁𝗵𝗲 𝗿𝗲𝗮𝗹 𝘄𝗼𝗿𝗹𝗱?
⠀
The answer is 𝗧𝗼𝗼𝗹 𝗖𝗮𝗹𝗹𝗶𝗻𝗴.
⠀
An AI model can understand a request and generate text, but it does not inherently have access to your organization's databases, APIs, applications, or business systems.
⠀
𝗧𝗼𝗼𝗹 𝗖𝗮𝗹𝗹𝗶𝗻𝗴 provides the bridge between the AI agent and these external capabilities.
⠀
𝗛𝗼𝘄 𝗱𝗼𝗲𝘀 𝗶𝘁 𝘄𝗼𝗿𝗸?
⠀
𝗨𝘀𝗲𝗿 𝗥𝗲𝗾𝘂𝗲𝘀𝘁
↓
𝗔𝗜 𝗔𝗴𝗲𝗻𝘁
↓
𝗧𝗼𝗼𝗹 𝗖𝗮𝗹𝗹
↓
𝗘𝘅𝘁𝗲𝗿𝗻𝗮𝗹 𝗦𝘆𝘀𝘁𝗲𝗺
↓
𝗧𝗼𝗼𝗹 𝗥𝗲𝘀𝘂𝗹𝘁
↓
𝗔𝗜 𝗔𝗴𝗲𝗻𝘁
↓
𝗙𝗶𝗻𝗮𝗹 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲
⠀
𝗘𝗻𝘁𝗲𝗿𝗽𝗿𝗶𝘀𝗲 𝗘𝘅𝗮𝗺𝗽𝗹𝗲
⠀
A customer asks:
⠀
"Where is my order #12345?"
⠀
The AI agent determines that it needs an 𝗢𝗿𝗱𝗲𝗿 𝗦𝘁𝗮𝘁𝘂𝘀 𝗧𝗼𝗼𝗹.
⠀
The tool calls the organization's order-management API, retrieves the current status, and returns the result to the agent.
⠀
The agent then uses that information to formulate the response.
⠀
The AI has therefore moved from simply generating text to 𝗽𝗲𝗿𝗳𝗼𝗿𝗺𝗶𝗻𝗴 𝗮𝗻 𝗮𝗰𝘁𝗶𝗼𝗻 𝘂𝘀𝗶𝗻𝗴 𝗲𝘅𝘁𝗲𝗿𝗻𝗮𝗹 𝗰𝗮𝗽𝗮𝗯𝗶𝗹𝗶𝘁𝗶𝗲𝘀.
⠀
𝗪𝗵𝗮𝘁 𝗰𝗮𝗻 𝗯𝗲 𝘂𝘀𝗲𝗱 𝗮𝘀 𝗧𝗼𝗼𝗹𝘀?
⠀
• REST APIs
• SQL databases
• Search services
• Calculators
• Business applications
• Custom functions
⠀
𝗔𝗜-𝟱𝟬𝟬 𝗘𝘅𝗮𝗺 𝗧𝗶𝗽
⠀
Remember this distinction:
⠀
• 𝗟𝗟𝗠 → Understands and generates language.
⠀
• 𝗧𝗼𝗼𝗹 → Provides an external capability.
⠀
• 𝗧𝗼𝗼𝗹 𝗖𝗮𝗹𝗹𝗶𝗻𝗴 → Enables the AI system to invoke that capability.
⠀
• 𝗔𝗴𝗲𝗻𝘁 → Can reason about a task, decide when a tool is needed, use it, and continue toward the goal.
⠀
For production AI systems, tools should have clearly defined inputs and outputs, appropriate permissions, and suitable error handling.
⠀
𝗧𝗼𝗼𝗹 𝗖𝗮𝗹𝗹𝗶𝗻𝗴 is a key capability that transforms an AI application from a system that only generates responses into one that can interact with real-world data and business processes.
⠀
hashtag #ArtificialIntelligence hashtag #GenerativeAI hashtag #ToolCalling hashtag #FunctionCalling hashtag #AgenticAI hashtag #AIAgents hashtag #MultiAgentAI hashtag #AzureAI hashtag #MicrosoftAI hashtag #AI500 hashtag #EnterpriseAI hashtag #LLM hashtag #AIEngineering hashtag #MCP …more   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
3 1 repost   Like  Comment      Repost       Send           
 Feed post number 66 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 4w •        𝗔𝗜-𝟱𝟬𝟬 𝗦𝘁𝘂𝗱𝘆 𝗦𝗲𝗿𝗶𝗲𝘀 – 𝗣𝗮𝗿𝘁 𝟮
⠀
𝗔𝗴𝗲𝗻𝘁 𝗢𝗿𝗰𝗵𝗲𝘀𝘁𝗿𝗮𝘁𝗶𝗼𝗻 – 𝗧𝗵𝗲 𝗕𝗿𝗮𝗶𝗻 𝗕𝗲𝗵𝗶𝗻𝗱 𝗠𝘂𝗹𝘁𝗶-𝗔𝗴𝗲𝗻𝘁 𝗔𝗜
⠀
In Part 1, I discussed how a 𝗠𝘂𝗹𝘁𝗶-𝗔𝗴𝗲𝗻𝘁 𝗔𝗜 𝗦𝗼𝗹𝘂𝘁𝗶𝗼𝗻 uses multiple specialized AI agents to solve complex business problems.
⠀
A natural question follows:
⠀
𝗛𝗼𝘄 𝗱𝗼 𝘁𝗵𝗲𝘀𝗲 𝘀𝗽𝗲𝗰𝗶𝗮𝗹𝗶𝘇𝗲𝗱 𝗮𝗴𝗲𝗻𝘁𝘀 𝘄𝗼𝗿𝗸 𝘁𝗼𝗴𝗲𝘁𝗵𝗲𝗿 𝗮𝘀 𝗼𝗻𝗲 𝗶𝗻𝘁𝗲𝗹𝗹𝗶𝗴𝗲𝗻𝘁 𝘀𝘆𝘀𝘁𝗲𝗺?
⠀
The answer is 𝗔𝗴𝗲𝗻𝘁 𝗢𝗿𝗰𝗵𝗲𝘀𝘁𝗿𝗮𝘁𝗶𝗼𝗻.
⠀
Agent Orchestration is the intelligence layer that coordinates multiple AI agents, ensuring they collaborate efficiently to accomplish a common goal.
⠀
Think of an orchestra.
⠀
Each musician is highly skilled, but without a conductor they may not perform in harmony.
⠀
Similarly, specialized AI agents require an 𝗢𝗿𝗰𝗵𝗲𝘀𝘁𝗿𝗮𝘁𝗼𝗿 to plan, coordinate, and manage their work so they deliver a single, accurate response.
⠀
𝗪𝗵𝗮𝘁 𝗱𝗼𝗲𝘀 𝘁𝗵𝗲 𝗢𝗿𝗰𝗵𝗲𝘀𝘁𝗿𝗮𝘁𝗼𝗿 𝗱𝗼?
⠀
• Understands the user's request.
⠀
• Breaks complex tasks into smaller subtasks.
⠀
• Selects the appropriate specialized agents.
⠀
• Decides whether tasks should execute sequentially or in parallel.
⠀
• Coordinates communication between agents.
⠀
• Aggregates and validates their outputs.
⠀
• Produces a unified response for the user.
⠀
𝗘𝗻𝘁𝗲𝗿𝗽𝗿𝗶𝘀𝗲 𝗘𝘅𝗮𝗺𝗽𝗹𝗲
⠀
Imagine a customer asks:
⠀
"Where is my order, can I return one item, and do you have similar products in stock?"
⠀
The Orchestrator coordinates:
⠀
• Order Management Agent
⠀
• Policy Agent
⠀
• Inventory Agent
⠀
• Recommendation Agent
⠀
Many of these tasks can execute in parallel.
⠀
The Orchestrator then validates and combines the outputs into a single response for the customer.
⠀
𝗪𝗵𝘆 𝗶𝘀 𝗔𝗴𝗲𝗻𝘁 𝗢𝗿𝗰𝗵𝗲𝘀𝘁𝗿𝗮𝘁𝗶𝗼𝗻 𝗜𝗺𝗽𝗼𝗿𝘁𝗮𝗻𝘁?
⠀
• Efficient task coordination.
⠀
• Better scalability.
⠀
• Parallel task execution.
⠀
• Improved response quality.
⠀
• Easier maintenance.
⠀
• Better resource utilization.
⠀
• Reduced latency for complex enterprise workflows.
⠀
𝗔𝗜-𝟱𝟬𝟬 𝗘𝘅𝗮𝗺 𝗧𝗶𝗽
⠀
For the AI-500 exam, remember these key responsibilities of an Orchestrator:
⠀
• Planning.
⠀
• Task decomposition.
⠀
• Agent selection.
⠀
• Workflow coordination.
⠀
• State management.
⠀
• Result aggregation.
⠀
• Error handling and retries when appropriate.
⠀
Understanding Agent Orchestration is essential for designing scalable, production-ready Multi-Agent AI systems. It is also an important architectural concept for the 𝗠𝗶𝗰𝗿𝗼𝘀𝗼𝗳𝘁 𝗔𝗜-𝟱𝟬𝟬 certification exam.
⠀
How would you design an Orchestrator for your organization's AI applications?
⠀
hashtag #ArtificialIntelligence hashtag #GenerativeAI hashtag #MultiAgentAI hashtag #AgentOrchestration hashtag #AgenticAI hashtag #AIAgents hashtag #AzureAI hashtag #AzureOpenAI hashtag #MicrosoftAI hashtag #AI500 hashtag #EnterpriseAI hashtag #LLM hashtag #AIEngineering hashtag #SoftwareArchitecture hashtag #ResponsibleAI …more   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
2 1 repost   Like  Comment      Repost       Send           
 Feed post number 67 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 4w •        In my previous post, we explored 𝗣𝗲𝗻𝗿𝗼𝘀𝗲 𝗧𝗶𝗹𝗶𝗻𝗴𝘀—beautiful mathematical patterns that are perfectly ordered, yet never repeat. For years, they were considered nothing more than a mathematical curiosity. Then came a discovery that changed everything.

𝗪𝗵𝗮𝘁 𝗮𝗿𝗲 𝗤𝘂𝗮𝘀𝗶𝗰𝗿𝘆𝘀𝘁𝗮𝗹𝘀?

Until the early 1980s, scientists believed that all crystals had one essential property:

𝗧𝗵𝗲𝘆 𝗺𝘂𝘀𝘁 𝗯𝗲 𝗽𝗲𝗿𝗶𝗼𝗱𝗶𝗰.

In other words, the atoms in a crystal were thought to repeat in a regular, predictable pattern throughout the material.

That belief was challenged in 1982, when materials scientist Professor 𝗗𝗮𝗻 𝗦𝗵𝗲𝗰𝗵𝘁𝗺𝗮𝗻 observed an unusual aluminum-manganese alloy.

Its atomic arrangement was highly ordered, but did not repeat periodically.

Even more surprising, its electron diffraction pattern displayed 𝗳𝗶𝘃𝗲-𝗳𝗼𝗹𝗱 𝗿𝗼𝘁𝗮𝘁𝗶𝗼𝗻𝗮𝗹 𝘀𝘆𝗺𝗺𝗲𝘁𝗿𝘆—something that classical crystallography considered impossible.

This led to the discovery of a completely new class of materials:

𝗤𝘂𝗮𝘀𝗶𝗰𝗿𝘆𝘀𝘁𝗮𝗹𝘀

A 𝗾𝘂𝗮𝘀𝗶𝗰𝗿𝘆𝘀𝘁𝗮𝗹 is a solid whose atoms are arranged in a highly ordered but non-periodic pattern.

Unlike ordinary crystals, quasicrystals do not have a repeating unit cell, yet they still exhibit long-range order across the entire material.

Remarkably, their atomic arrangement closely resembles the mathematics behind 𝗣𝗲𝗻𝗿𝗼𝘀𝗲 𝗧𝗶𝗹𝗶𝗻𝗴𝘀.

Quasicrystals possess several unusual properties:
=> 𝗛𝗶𝗴𝗵 𝗵𝗮𝗿𝗱𝗻𝗲𝘀𝘀 and excellent wear resistance.
=> 𝗟𝗼𝘄 𝗳𝗿𝗶𝗰𝘁𝗶𝗼𝗻, making them suitable for protective coatings.
=> 𝗛𝗶𝗴𝗵 𝗰𝗼𝗿𝗿𝗼𝘀𝗶𝗼𝗻 𝗿𝗲𝘀𝗶𝘀𝘁𝗮𝗻𝗰𝗲.
=> 𝗟𝗼𝘄 𝘁𝗵𝗲𝗿𝗺𝗮𝗹 𝗮𝗻𝗱 𝗲𝗹𝗲𝗰𝘁𝗿𝗶𝗰𝗮𝗹 𝗰𝗼𝗻𝗱𝘂𝗰𝘁𝗶𝘃𝗶𝘁𝘆 compared with many conventional metallic alloys.

Today, quasicrystals are used in applications such as:
𝗗𝘂𝗿𝗮𝗯𝗹𝗲 𝗽𝗿𝗼𝘁𝗲𝗰𝘁𝗶𝘃𝗲 𝗰𝗼𝗮𝘁𝗶𝗻𝗴𝘀
𝗡𝗼𝗻-𝘀𝘁𝗶𝗰𝗸 𝗰𝗼𝗼𝗸𝘄𝗮𝗿𝗲 𝘀𝘂𝗿𝗳𝗮𝗰𝗲𝘀
𝗣𝗿𝗲𝗰𝗶𝘀𝗶𝗼𝗻 𝗶𝗻𝘀𝘁𝗿𝘂𝗺𝗲𝗻𝘁𝘀
𝗦𝗽𝗲𝗰𝗶𝗮𝗹𝘁𝘆 𝗺𝗲𝘁𝗮𝗹𝗹𝗶𝗰 𝗮𝗹𝗹𝗼𝘆𝘀

For this groundbreaking discovery, Professor 𝗗𝗮𝗻 𝗦𝗵𝗲𝗰𝗵𝘁𝗺𝗮𝗻 was awarded the 2011 Nobel Prize in Chemistry.

𝗧𝗵𝗲 𝗯𝗶𝗴 𝗶𝗱𝗲𝗮:

A mathematical concept that once seemed purely theoretical became the key to understanding an entirely new form of matter.

It is a powerful reminder that curiosity-driven mathematics often becomes tomorrow's scientific breakthrough.

This concludes my five-part series on 𝗧𝗲𝘀𝘀𝗲𝗹𝗹𝗮𝘁𝗶𝗼𝗻𝘀, 𝗤𝘂𝗮𝘀𝗶𝗽𝗲𝗿𝗶𝗼𝗱𝗶𝗰 𝗧𝗶𝗹𝗶𝗻𝗴𝘀, 𝗣𝗲𝗻𝗿𝗼𝘀𝗲 𝗧𝗶𝗹𝗶𝗻𝗴𝘀, and 𝗤𝘂𝗮𝘀𝗶𝗰𝗿𝘆𝘀𝘁𝗮𝗹𝘀.

I hope this journey has shown how elegant mathematical ideas can inspire discoveries that reshape our understanding of the physical world.

What other mathematical concepts would you like to see explored in a future series?

hashtag #Mathematics hashtag #Geometry hashtag #Quasicrystals hashtag #PenroseTiling hashtag #Crystallography hashtag #MaterialsScience hashtag #STEM hashtag #Engineering hashtag #Science hashtag #Learning hashtag #Innovation …more   
￼
   
￼
   
￼
   Activate to view larger image,   
￼
3 1 repost   Like  Comment      Repost       Send           
 Feed post number 68 
￼
   K V N Ramesh Ph.D.    • Following Microsoft Certified Agentic AI Expert | Ph.D. 4w •        𝗠𝘂𝗹𝘁𝗶-𝗔𝗴𝗲𝗻𝘁 𝗔𝗜 𝗦𝗼𝗹𝘂𝘁𝗶𝗼𝗻𝘀 are becoming a cornerstone of modern enterprise AI applications.
⠀
If you're preparing for the 𝗠𝗶𝗰𝗿𝗼𝘀𝗼𝗳𝘁 𝗔𝗜-𝟱𝟬𝟬 certification exam, understanding 𝗠𝘂𝗹𝘁𝗶-𝗔𝗴𝗲𝗻𝘁 𝗔𝗜 architecture is an important topic.
⠀
Rather than relying on a single AI agent to solve every problem, a 𝗠𝘂𝗹𝘁𝗶-𝗔𝗴𝗲𝗻𝘁 𝗔𝗜 𝗦𝗼𝗹𝘂𝘁𝗶𝗼𝗻 consists of several specialized AI agents that collaborate to accomplish a common goal.
⠀
Each agent focuses on a specific responsibility, making the overall solution more scalable, accurate, maintainable, and easier to extend.
⠀
𝗔 𝗦𝗮𝗺𝗽𝗹𝗲 𝗠𝘂𝗹𝘁𝗶-𝗔𝗴𝗲𝗻𝘁 𝗔𝗿𝗰𝗵𝗶𝘁𝗲𝗰𝘁𝘂𝗿𝗲
⠀
𝗨𝘀𝗲𝗿
⠀
↓
⠀
𝗢𝗿𝗰𝗵𝗲𝘀𝘁𝗿𝗮𝘁𝗼𝗿
⠀
Receives the user's request, creates an execution plan, delegates tasks to the appropriate agents, coordinates their work, and combines the results.
⠀
↓
⠀
𝗦𝗽𝗲𝗰𝗶𝗮𝗹𝗶𝘇𝗲𝗱 𝗔𝗜 𝗔𝗴𝗲𝗻𝘁𝘀
⠀
• 𝗣𝗿𝗼𝗱𝘂𝗰𝘁 𝗦𝗲𝗮𝗿𝗰𝗵 𝗔𝗴𝗲𝗻𝘁 → Retrieves product information.
⠀
• 𝗢𝗿𝗱𝗲𝗿 𝗠𝗮𝗻𝗮𝗴𝗲𝗺𝗲𝗻𝘁 𝗔𝗴𝗲𝗻𝘁 → Checks order status, shipment, and delivery details.
⠀
• 𝗣𝗼𝗹𝗶𝗰𝘆 𝗔𝗴𝗲𝗻𝘁 → Validates return and refund policies.
⠀
• 𝗜𝗻𝘃𝗲𝗻𝘁𝗼𝗿𝘆 𝗔𝗴𝗲𝗻𝘁 → Confirms product availability.
⠀
• 𝗥𝗲𝗰𝗼𝗺𝗺𝗲𝗻𝗱𝗮𝘁𝗶𝗼𝗻 𝗔𝗴𝗲𝗻𝘁 → Suggests alternative or complementary products.
⠀
↓
⠀
𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲 𝗔𝗴𝗲𝗻𝘁
⠀
Generates a clear and natural-language response for the user.
⠀
𝗪𝗵𝘆 𝘂𝘀𝗲 𝗠𝘂𝗹𝘁𝗶-𝗔𝗴𝗲𝗻𝘁 𝗔𝗜?
⠀
• Agents specialize in different business functions.
⠀
• Independent tasks can execute in parallel.
⠀
• New agents can be added without redesigning the entire solution.
⠀
• Individual agents can be updated independently.
⠀
• Complex workflows become easier to manage.
⠀
• The solution is more scalable and resilient.
⠀
𝗔𝗜-𝟱𝟬𝟬 𝗘𝘅𝗮𝗺 𝗧𝗶𝗽
⠀
• Use a single AI agent for straightforward, well-defined tasks.
⠀
• Use a 𝗠𝘂𝗹𝘁𝗶-𝗔𝗴𝗲𝗻𝘁 𝗔𝗜 𝗦𝗼𝗹𝘂𝘁𝗶𝗼𝗻 when different skills or business functions are required.
⠀
• The 𝗢𝗿𝗰𝗵𝗲𝘀𝘁𝗿𝗮𝘁𝗼𝗿 is responsible for planning, delegation, coordination, and aggregation. It enables specialized AI agents to collaborate effectively and produce a unified response.
⠀
• Each specialized agent should have a clearly defined responsibility and access only to the tools it requires.
⠀
• Evaluate the overall solution for 𝗮𝗰𝗰𝘂𝗿𝗮𝗰𝘆, 𝗴𝗿𝗼𝘂𝗻𝗱𝗲𝗱𝗻𝗲𝘀𝘀, 𝗿𝗲𝗹𝗲𝘃𝗮𝗻𝗰𝗲, 𝘀𝗮𝗳𝗲𝘁𝘆, and 𝗲𝗳𝗳𝗶𝗰𝗶𝗲𝗻𝗰𝘆.
⠀
𝗠𝘂𝗹𝘁𝗶-𝗔𝗴𝗲𝗻𝘁 𝗔𝗜 is more than multiple AI models working together. It is a coordinated architecture where specialized AI agents collaborate under an 𝗢𝗿𝗰𝗵𝗲𝘀𝘁𝗿𝗮𝘁𝗼𝗿 to solve complex real-world business problems.

⠀
Have you explored building a 𝗠𝘂𝗹𝘁𝗶-𝗔𝗴𝗲𝗻𝘁 𝗔𝗜 𝗦𝗼𝗹𝘂𝘁𝗶𝗼𝗻? Which orchestration framework or platform have you found most effective?
⠀
hashtag #ArtificialIntelligence hashtag #GenerativeAI hashtag #MultiAgentAI hashtag #AgenticAI hashtag #AIAgents hashtag #Orchestrator hashtag #AzureAI hashtag #AzureOpenAI hashtag #MicrosoftAI hashtag #AI500   Activate to view larger image, 
￼
    Activate to view larger image,   
￼
2
