# Practical Work #2 — Building the App Knowledge Base in Obsidian

Result: vault repository [goals_achiever-vault](https://github.com/Sofiia13/goals_achiever-vault), separate from the app repository.

| Section | Notes |
|---|---|
| `Concepts/` | 13 — Goal, Task, Station, Daily Task, AI Plan Generation, Plan Adaptation, Streak, Coins, Experience Points, Level, Achievement, Progress Analytics, Roadmap |
| `Components/` | 11 — Auth Module, Auth Middleware, User Module, Goal Module, Task Module, AI Module, Streak Service, Prisma Data Layer, Frontend API Layer, Auth Context, Roadmap View |
| `Decisions/` | 5 ADRs — Gemini, JWT, PostgreSQL + Prisma, separate KB repository, single Task table |
| `Glossary/` | 1 — domain and technical terms |
| `Templates/` | 4 frontmatter templates (concept, component, decision, glossary) |
| Hub | `MOC Goals Achiever.md` links every note; `README.md` documents conventions |

All notes are reachable from the MOC; there are no unresolved links.

## Answers to review questions

**1. What is an Obsidian vault and what does it consist of technically?**
A vault is an ordinary directory of Markdown (`.md`) files. Each note can contain YAML frontmatter (metadata), tags (`#tag`) and wiki links (`[[Note]]`). Obsidian stores its own settings in the hidden `.obsidian/` folder. There is no database: the link graph and backlinks are computed from the files.

**2. Why does Obsidian need no server infrastructure, unlike Neo4j or Chroma?**
Neo4j (graph DB) and Chroma (vector DB) are database servers that must be deployed, kept running and queried over a network. An Obsidian vault is just local files. Obsidian is a desktop client that indexes them in memory, and any other program can read the same files directly from disk.

**3. What are the benefits of versioning the knowledge base with git in a separate repository?**
Full change history, the ability to diff or revert any note, and syncing between machines through GitHub. A separate repository keeps the history of knowledge apart from the history of code, can have its own access rules, and can be connected to several tools or projects. Without version control, edits are irreversible and there is no record of why the knowledge changed.

**4. What is the purpose of YAML frontmatter in an Obsidian note?**
It holds structured, machine-readable metadata: `type`, `created`, `status`, `tags`, `related`, `path`. A human reads the body of the note, while an agent or connector can filter and route by these fields (for example, "all components with `status: partial`") without parsing free text.

**5. How does a `[[wiki link]]` differ from a plain-text mention of a concept?**
A wiki link is an explicit, machine-resolvable edge to a specific note. Obsidian shows it in the graph and backlinks and can update it when a note is renamed. A plain-text mention is ambiguous, invisible to the graph, and an agent can only guess that it refers to a note.

**6. Which functional sections should a vault for a software project have, and why these?**
- `Concepts/` — domain meaning (what the app is about);
- `Components/` — where things live in the code and what they are responsible for;
- `Decisions/` — why the architecture is the way it is (ADRs), which prevents the agent from "fixing" deliberate choices;
- `Glossary/` — shared terminology between the developer and the agent.
Together they cover *what*, *where* and *why*, which are the questions an agent asks before changing code.

**7. What is a Map of Content and what problem does it solve for an agent?**
A MOC is a hub note with no knowledge of its own. It only organizes links into a navigable structure. It gives the agent a single entry point from which any relevant note is reachable in a few hops, instead of searching blindly across dozens of files. `MOC Goals Achiever.md` also lists typical routes, such as "coin/streak bug → Coins → Streak → Task Module → Streak Service".

**8. Why is it important to follow explicit naming and linking conventions?**
They make the vault predictable for programs. A connector can rely on the file name being the concept name, on `type` always being present, and on relations always being wiki links. Without conventions, duplicates appear (`Goal.md` vs `goals.md`), links break, and the agent cannot parse notes reliably. The conventions are documented in the vault's `README.md`.

**9. How does Obsidian's graph view help verify the knowledge base's connectivity?**
It visualizes notes as nodes and links as edges. Orphan nodes (unlinked notes) and disconnected clusters are immediately visible, as are unresolved links (notes referenced but not created). A healthy vault is one connected cluster with the MOC at its center. Color groups by folder (configured in this vault) also show whether concepts are linked to the components that implement them.

**10. How will the results of this work be used in Practical Work #3?**
The vault becomes the data source for connectors that give the agent access to the knowledge base. The fixed folder structure, mandatory `type` frontmatter and wiki-link conventions let a connector list notes by type, follow links from the MOC and return only relevant notes into the agent's context.
