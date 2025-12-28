# 🛰️ DorkForge
**Tactical OSINT Query Compiler**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![Status](https://img.shields.io/badge/Status-Active_Development-amber)
![OSINT](https://img.shields.io/badge/Domain-OSINT-blue)
![Security](https://img.shields.io/badge/Use%20Case-Security_Research-red)
![Built with React](https://img.shields.io/badge/Built_with-React+TypeScript-cyan)
![Vite](https://img.shields.io/badge/Bundler-Vite-purple)
![AST](https://img.shields.io/badge/Core-AST_Compiler-orange)

> **DorkForge** is a tactical OSINT web application for crafting, visualizing, and operationalizing advanced search engine dorks used in security research and reconnaissance.

Think **Burp Suite — but for search engines**.

---

## 🎯 Purpose

Search engine dorking is powerful—but fragile, error-prone, and hard to reason about at scale.

DorkForge eliminates syntax memorization and implicit logic by treating dorks as **compiled queries**, not ad-hoc strings.

**Key goals:**
- Visualize intent, not just syntax
- Make complex dorks repeatable and auditable
- Normalize queries across multiple search engines
- Reduce operator error during OSINT and recon workflows

---

## 🧠 How It Works (Conceptual)

Instead of concatenating strings, DorkForge builds an **Abstract Syntax Tree (AST)** representing query intent.  
Each engine renderer then compiles the AST into valid, optimized syntax.

---

## 🏗️ Application Architecture

| Component | Description |
|--------|-------------|
| **Left Panel** | Structured inputs for domains, filetypes, URL paths, titles, phrases, exclusions |
| **Center Panel** | Live **AST visualization** showing logical query structure |
| **Right Panel** | Engine-specific outputs (Google / Bing / DuckDuckGo) with copy & direct-search |
| **Bottom Panel** | Status bar with contextual controls |
| **Suggestions Panel** | Embedded dork reference & documentation drawer |

---

## ⚙️ Technical Stack

### Frontend
- **React** + **TypeScript**
- **Vite** (fast dev + build)
- Modular component architecture

### Core Logic
- Custom **AST engine**
  - `lib/ast.ts` — node definitions & tree structure
  - `lib/compiler.ts` — engine-aware compilation
- Deterministic query rendering
- Explicit operator compatibility handling

### UI / UX
- Tactical HUD aesthetic (amber / cyan)
- Topographic map backgrounds
- OSINT-inspired layout prioritizing clarity over decoration

### Typography
- **Absans** — display / headings
- **Whois Mono** — code & query rendering

---

## 📚 Built-In Knowledge Base

DorkForge ships with an embedded reference system:

- **49 search operators**
  - `site:`, `filetype:`, `inurl:`, `intitle:`, `AROUND()`, etc.
- **461 curated example dorks**
- **25+ OSINT & security categories**
- **8 external resources**
  - GHDB
  - Shodan
  - Censys
  - Additional OSINT tooling references

Includes explicit notes on:
- Engine-specific behavior differences
- Operator incompatibilities
- False positives & edge cases

---

## 🎨 Design Philosophy

DorkForge is intentionally **not** a consumer app.

The interface adopts a **military / satellite HUD aesthetic** to reinforce:
- Situational awareness
- Analytical precision
- Tool-first mindset

Every visual element exists to reduce ambiguity and improve operator confidence during reconnaissance.

---

## 🧪 Intended Users

- OSINT analysts  
- Red teamers / blue teamers  
- Security researchers  
- Journalists & investigators  
- Threat intelligence practitioners  

---

## 🚧 Project Status

- Core AST compiler: **Implemented**
- Multi-engine output: **Implemented**
- Documentation database: **Implemented**
- UI/UX polish: **Ongoing**
- Preset libraries & export workflows: **Planned**

This project is under **active development** and evolving rapidly.

---

## ⚠️ Legal & Ethical Notice

DorkForge is provided **for educational and defensive security research purposes only**.

Users are responsible for complying with:
- Search engine terms of service
- Local and international laws
- Ethical OSINT guidelines

The author assumes **no liability** for misuse.

---

## 📄 License

Released under the **MIT License**.  
See [`LICENSE`](LICENSE) for details.

---

## 🛰️ Philosophy

> *"Search engines already expose the attack surface.  
> DorkForge simply makes it visible."*