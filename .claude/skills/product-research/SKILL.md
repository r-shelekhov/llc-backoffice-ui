---
name: product-research
description: Use when the user needs competitive analysis, UX research, or best-practice exploration for a feature before implementation. Also use when evaluating design approaches, comparing industry solutions, or deciding on UX patterns for a product.
---

# Product Research

## Overview

Act as a senior product designer and product owner. Conduct deep research on how competitors and industry leaders implement a given feature, identify best practices, and present 2-4 concrete options with pros/cons, ASCII wireframes, and a clear recommendation.

## When to Use

- User asks to research how a feature works in other products
- User wants competitive analysis or UX benchmarking
- User needs to decide between design approaches before implementation
- User asks for "best practices" for a feature or pattern
- User says "product research", "competitive analysis", "how do others do X"

## Process

### Phase 1: Clarify Scope

Ask the user ONE question at a time to understand:
1. **What feature/area** to research (e.g., "table filtering", "onboarding flow", "notification system")
2. **Product context** — what type of product is this for? (B2B SaaS, consumer app, admin panel, etc.)
3. **Key constraints** — target users, tech stack limitations, timeline, must-haves vs nice-to-haves
4. **Specific concerns** — anything they're already considering or worried about

HARD GATE: Do NOT proceed to research until you have a clear, specific feature scope. Vague requests like "make it better" must be narrowed down first.

### Phase 2: Competitive Research

Use WebSearch and WebFetch to find how 5-8 well-known products implement this feature:

1. Search for direct competitors and industry leaders
2. Search for both enterprise (Salesforce, HubSpot, Notion) and consumer (Stripe, Linear, Figma) examples
3. For each product found, document:
   - How they implement the feature (specific UX details)
   - What works well / what's clever
   - What's missing or problematic
4. Include links to sources

**Search strategy:**
- `"[feature] UX" site:nngroup.com OR site:baymard.com` — for research-backed best practices
- `"[feature] design pattern"` — for common approaches
- `"[feature]" [competitor1] OR [competitor2]` — for specific implementations
- `"[feature] UX case study"` — for detailed breakdowns

### Phase 3: Best Practices & Patterns

Synthesize research into identified patterns:
- What do most products have in common? (table stakes)
- What differentiates great implementations?
- Are there established UX patterns or anti-patterns?
- Any relevant A/B test results or usability studies?

### Phase 4: Present Options

Present 2-4 distinct approaches. For EACH option:

1. **Name** — short, descriptive label
2. **Description** — 2-3 sentences explaining the approach
3. **ASCII Wireframe** — visual representation of the UI/UX (use box-drawing characters)
4. **Who uses this** — which competitors/products use this approach (with links)
5. **Pros** — bullet list
6. **Cons** — bullet list
7. **Complexity** — Low / Medium / High estimate for implementation
8. **Best for** — what type of product/user this suits

Format as a structured comparison. Example wireframe style:

```
┌─────────────────────────────────┐
│ Search: [________________] [🔍] │
├─────────────────────────────────┤
│ ☐ Name    │ Status │ Date  │ ▼ │
│ ☐ Alice   │ Active │ Jan 5 │   │
│ ☐ Bob     │ Paused │ Feb 2 │   │
└─────────────────────────────────┘
```

### Phase 5: Recommendation

End with a clear recommendation:
1. **Recommended option** and WHY it fits the user's specific context
2. **What to validate** — key assumptions to test with real users
3. **Incremental path** — if applicable, suggest starting with a simpler version and evolving
4. **Quick wins** — low-effort improvements that apply regardless of chosen approach

## Output Format

Structure the final deliverable as:

```
## Research: [Feature Name]

### Competitive Landscape
[Table or list of products researched with key findings]

### Key Patterns & Best Practices
[Synthesized insights]

### Option 1: [Name]
[Description, wireframe, who uses it, pros, cons, complexity, best for]

### Option 2: [Name]
...

### Option 3: [Name] (if applicable)
...

### Recommendation
[Clear recommendation with rationale]

### Sources
[Numbered list of all links referenced]
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Researching too broadly | Narrow to specific feature, not entire product category |
| Listing products without UX details | Describe HOW they implement it, not just THAT they have it |
| All options look the same | Each option should represent a genuinely different approach |
| Recommendation without context | Tie recommendation to user's specific constraints and users |
| Skipping wireframes | Always include ASCII wireframes for UI features |
| No sources | Always include links to products and articles referenced |
