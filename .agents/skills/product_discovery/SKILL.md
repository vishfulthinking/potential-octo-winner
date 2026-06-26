---
name: product_discovery
description: Execute product discovery workflows using opportunity-solution trees and assumption mapping to validate features before building.
---

# Product Discovery (PM Skill)

Based on Paweł Huryn's PM Skills Marketplace (inspired by Teresa Torres and Marty Cagan).

## Workflow: The Discovery Loop
Before writing code for major new features, the agent should perform discovery:
1. **Identify the desired outcome:** (e.g., Increase user sign-ups by 20%).
2. **Map Opportunities:** What customer needs, pain points, or desires address this outcome?
3. **Generate Solutions:** Brainstorm multiple ways to address the chosen opportunity.
4. **Identify Assumptions:** What needs to be true for this solution to succeed? (Desirability, Viability, Feasibility, Usability).
5. **Design Experiments:** How can we test the riskiest assumptions with the least amount of code?

## Instructions for the Agent
When the user proposes a new feature, do not immediately write code. Instead:
- Ask clarifying questions about the underlying user need.
- Propose 2-3 alternative solutions to solve the same problem.
- Point out any hidden risks or assumptions (e.g., "Will users actually pay to unlock this?").
- Suggest a "painted door" or MVP test to validate the feature first.
