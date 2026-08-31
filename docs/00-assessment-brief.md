# Technical Assessment Brief — Betway Nigeria Integration

## 1. Scope
* **Application**: Web product + Flutter view.
* **Expected Duration**: 1–2 days.
* **Delivery**: Public live URL and clean Git repository history.

---

## 2. Core Functionality

1. **Resolve / Decode**
   * Paste an existing Betway Nigeria booking code.
   * Resolve and display:
     * matches / events;
     * markets;
     * selections;
     * odds.

2. **Create / Encode**
   * Accept user selections.
   * Generate a valid Betway Nigeria booking code.

3. **Convert**
   * Take an existing Betway slip/code.
   * Produce another Betway booking code representing the same bet.

4. **Verification**
   * Generated and converted booking codes must be loaded on the public Betway website.
   * Demonstrate that the resulting slip corresponds directly to the expected bet.

---

## 3. Flutter Delivery
* **Scope**: Same slip view (rough one-screen version is sufficient).
* **Android Distribution**: APK delivered via Firebase App Distribution.
* **iOS Distribution**: Short note describing the iOS IPA distribution path.

---

## 4. Engineering & Documentation Deliverables
* **Live Web URL**: Publicly accessible deployment of the web product.
* **Source Code**: Complete repository with clean, structured codebase.
* **Git History**: Meaningful, logical commit sequence.
* **Mermaid Architecture Diagrams**: Visual overview of system components and data flows.
* **Architecture Explanation**: Textual documentation describing the design decisions.
* **Loom Walkthrough**: ~5-minute video walkthrough demonstrating functionality and manual verification on Betway.
* **Solution Summary**: Concise explanation of how the integration and solution work.
