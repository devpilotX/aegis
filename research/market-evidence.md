# Market Evidence

Every figure below is a sourced or clearly labelled estimate. Unverified numbers carry `CITATION-NEEDED`, which fails CI. Never quote a statistic in a governance tool without knowing where it came from.

## Deployment gap

| Claim | Approximate figure | Implication |
|---|---|---|
| Organisations deploying or piloting AI agents | ~71% | Demand is settled; this is not a market-creation problem |
| Agent projects reaching production | ~11% | A roughly 60-point gap between intent and production |
| Deployed agents that are effectively chatbots | ~80% | Because consequential write actions cannot be authorised safely |
| Average endpoints touched per automated business process | ~50 | Enforcement must be centralised; per-integration governance does not scale |

The gap is not a capability gap. Models are good enough to act. The blocker is that nobody can answer, to an auditor's satisfaction, what stopped the agent, who approved the action, and how that is provable after the fact.

## Regulatory forcing functions

| Instrument | Effect on demand |
|---|---|
| EU AI Act | Converts governance from aspiration into legal obligation with penalties; Articles 12 and 14 in particular demand record-keeping and human oversight that must be mechanised |
| ISO/IEC 42001 | Makes AI management systems certifiable, which creates procurement pressure |
| NIST AI RMF | The de facto US reference; MEASURE and MANAGE demand artifacts |
| DORA | Operational resilience obligations extend to automated decisioning in financial entities |
| GDPR Article 22 | Long-standing requirement for safeguards around automated decisions |

Regulation is the reason this market exists on a timeline. Without it, governance is a nice-to-have and no language is needed.

## Architectural shift, 2026

Enterprise agent deployments consolidated around protocols - MCP for tools, A2A for agent-to-agent - with thinner orchestration than the 2024 framework era. That shift favours a narrow, embeddable control point at the tool-invocation boundary and disfavours another thick framework. AEGIS is shaped for the former.

## Buyer evidence to gather next

1. Interview five platform leads: what specifically blocked the last agent that did not reach production?
2. Interview three auditors: what would you accept as evidence that an AI agent was constrained?
3. Ask two compliance officers to read a generated AEGIS audit report cold and mark what they would reject.
4. Count, inside AgentProof/Veydria, how many governance rules currently live in code or YAML rather than in a policy artifact.

Item 3 is the highest-value experiment in the entire project. If a compliance officer accepts a generated document unmodified, the core thesis is validated. If they do not, the report generator - not the compiler - is where the next month of work belongs.

## Honest counter-case

It is possible that buyers will accept governance implemented as YAML plus dashboards inside a platform they already own, and never demand a language. If so, AEGIS survives as the enforcement engine inside AgentProof/Veydria and as a specification others may adopt later. That outcome is still worth the build, which is why stage 0 of the adoption plan is captive-use rather than public launch.
