---
schema: clarification-answers/v1
status: submitted
generated_at: "2026-10-27T16:55:02.141Z"
scope: [frontend, backend, generic]
questions_file: clarification-questions.json
---

# Rearchitecture Clarification Answers

## 🖥️ Frontend

- **F1** Which frontend framework and version should the refactored client target? The manifest currently uses React 18.3.1.
  - answer: React 18.3.1
  - source: user
- **F2** What component/UI library should the refactored frontend use? Current UI source uses custom React/CSS; RSuite is declared but no imports were found.
  - answer: No component library; preserve custom React/CSS
  - source: user
- **F3** Provide paths or URLs for screenshots/screen recordings of the existing UI to preserve during the refactor, or say none are available.
  - answer: _none_
  - source: skipped (required, no default — blocking gap)
- **F4** What design system, brand tokens, or visual reference should guide the refactor? You may identify existing source files or specify that the current appearance should be preserved.
  - answer: match existing pixel-by-pixel using extracted CSS custom properties
  - source: default applied
- **F5** What accessibility standard should the refactored frontend meet?
  - answer: WCAG 2.1 AA
  - source: user
- **F6** Which browsers/runtime versions must remain supported?
  - answer: modern evergreen (Chrome, Firefox, Safari, Edge — latest 2 major versions)
  - source: user
- **F7** What responsive layout or breakpoint strategy should be preserved or targeted?
  - answer: mobile-first using existing breakpoints detected from codebase
  - source: user
- **F8** Which locales/languages should remain in scope?
  - answer: preserve current locales; keep existing i18n library if present
  - source: default applied
- **F9** What client-side state-management approach should the refactor use?
  - answer: Preserve current component state and localStorage pattern
  - source: user
- **F10** Which routing strategy should the refactor preserve/use? The client currently uses React Router 7.17.
  - answer: React Router 7.17
  - source: user

## ⚙️ Backend

- **B1** Which backend frameworks and versions should the refactor target? The current stack is Spring Boot 4.1.0 / Java 17 plus a Node.js/Express 4.x Socket.IO server.
  - answer: Preserve Spring Boot 4.1.0 / Java 17 and Node.js/Express 4.x with Socket.IO
  - source: user
- **B2** What compatibility policy should apply to existing REST and Socket.IO contracts?
  - answer: must preserve
  - source: user
- **B3** Should this structural refactor change or migrate existing MongoDB data/schema?
  - answer: no migration
  - source: user
- **B4** What authentication/authorization mechanism should the refactor preserve or adopt? Current client auth state is stored in localStorage and sent as a bearer-style token.
  - answer: Preserve existing auth behavior
  - source: user
- **B5** What latency, throughput, availability, or other service-level targets should the refactor preserve?
  - answer: match current production baseline; no regression
  - source: default applied

## 📋 General

- **G1** Confirm the success criteria: preserve current behavior and API compatibility, keep each React component file below 100 lines, validate the available build/tests, and report any unfinished areas. Is anything missing?
  - answer: Preserve current user-visible behavior and APIs; every React component file must be fewer than 100 lines; perform available frontend/backend validation, report limitations and remaining work, keep changes surgical, and do not commit.
  - source: user
- **G2** Are any modules, behaviors, or changes explicitly out of scope beyond the repository boundary and no-commit instruction?
  - answer: New features, behavior/API changes, stack changes, and work outside this repository are out of scope; do not commit.
  - source: user
- **G3** How should existing tests be treated if a check fails?
  - answer: must pass
  - source: user
- **G5** Any additional requirements, exclusions, dependencies, compliance rules, or operational constraints not covered above?
  - answer: None beyond the decisions listed in this specification.
  - source: user
