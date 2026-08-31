# Technical Assessment Brief — Betway Nigeria Booking Code Product

> **Original Specification PDF**: [`docs/resources/Technical_Assessment.pdf`](resources/Technical_Assessment.pdf)  
> **Operator**: Betway Nigeria | [https://www.betway.com.ng](https://www.betway.com.ng)  
> **Scope**: Web product + Flutter view  
> **Expected Duration**: 1–2 days  
> **Delivery**: Live URL + Git history  

---

## 1. Objective

Build and deploy a small product that works with Betway Nigeria. The solution must include a **UI, backend, and a database if required**, and it must be available on a **public URL**.

---

## 2. Core Functionality

1. **Decode / Resolve**
   * Allow a user to paste a Betway booking code.
   * Resolve and display the slip: **matches, markets, selections, and odds**.

2. **Encode / Create**
   * Take user selections and generate a new Betway booking code.

3. **Convert**
   * Take an existing slip and produce a new Betway booking code for the same bet.

4. **Verification**
   * Load each generated or converted code on Betway's own site and demonstrate that the resulting slip matches the expected bet.

---

## 3. Flutter Delivery

* Implement the same slip view as a Flutter build. A **rough one-screen version is sufficient**.
* Deliver the Android build as an **APK via Firebase App Distribution**.
* Briefly explain what would change for the **iOS IPA distribution path**.

---

## 4. Engineering and Documentation

* Use any development tools, AI tools, IDEs, or models you consider appropriate.
* Be prepared to explain the complete solution and architecture.
* Include **Mermaid diagrams** covering the solution architecture.
* Provide 100% of the source code and documentation, preferably in a Git repository.
* Include the **full Git history**. Commit as you work; the development process is part of the assessment, not only the final result.
* Provide a **5-minute Loom walkthrough** covering your architecture and the **trickiest technical decision you made**.

---

## 5. Required Deliverables Checklist

- [ ] **Live public URL**
- [ ] **Git repository with full commit history**
- [ ] **Complete source code and documentation**
- [ ] **Mermaid architecture diagrams**
- [ ] **Flutter APK via Firebase App Distribution**
- [ ] **Short note describing the iOS IPA path**
- [ ] **5-minute Loom walkthrough** (including architecture explanation & trickiest technical decision)
- [ ] **Short note explaining how the solution works**

---

## 6. Process and Timing

* **Expected completion time**: 1–2 days.
* Reply in the chat when you start the task.
* Reply again when the solution is ready for review.
* If you have technical questions, send them for clarification with the CTO.
