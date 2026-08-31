# Requirements Inventory

This document translates the assessment brief and confirmed scope into a structured inventory of functional and non-functional requirements.

---

## 1. Functional Requirements

| ID | Title | Description | Source |
| :--- | :--- | :--- | :--- |
| **FR-01** | **Resolve Booking Code** | Ingest a valid Betway Nigeria booking code and decode the underlying bet selections. | Brief |
| **FR-02** | **Display Resolved Slip** | Render decoded bet selections displaying event/match name, market name, outcome/selection name, and current odds. | Brief |
| **FR-03** | **Create Booking Code** | Accept structured selections or input legs and generate a new valid Betway Nigeria booking code. | Brief |
| **FR-04** | **Convert Code / Slip** | Ingest an existing Betway booking code/slip and emit a new Betway booking code representing the identical bet. | Brief |
| **FR-05** | **Verify Codes on Betway** | Ensure generated and converted codes can be loaded successfully into the official Betway Nigeria UI. | Brief |
| **FR-06** | **Flutter Slip View** | Provide a single-screen Flutter mobile view rendering the resolved slip information. | Brief |

---

## 2. Non-Functional & Delivery Requirements

| ID | Title | Description | Source |
| :--- | :--- | :--- | :--- |
| **NFR-01** | **Public Web Deployment** | Web application must be deployed and publicly accessible via a live URL. | Brief |
| **NFR-02** | **Backend Service** | Architecture must include a dedicated backend layer for Betway integration and conversion logic. | Brief |
| **NFR-03** | **Database Pragmatism** | Database should only be introduced if persistent state is genuinely required by an implementation need. | Clarification |
| **NFR-04** | **Full Source Code** | Complete codebase provided with all necessary build scripts and configurations. | Brief |
| **NFR-05** | **Meaningful Git History** | Clean, atomic commit log reflecting progressive engineering milestones. | Brief |
| **NFR-06** | **Architecture Documentation** | Clear architectural explanation accompanied by Mermaid diagrams. | Brief |
| **NFR-07** | **Firebase App Distribution** | Deliver the Flutter Android APK through Firebase App Distribution; include iOS IPA note. | Brief |
| **NFR-08** | **Loom Walkthrough** | 5-minute video walkthrough demonstrating the working product and Betway verification. | Brief |

---

## 3. Inferred Requirements

* **INF-01 (Stateless Conversion)**: *[Inference]* Because Betway booking codes carry their own server-side state on Betway's infrastructure, the core convert and resolve operations can be executed statelessly without requiring local relational persistence.
* **INF-02 (Canonical Data Model)**: *[Inference]* A normalized intermediate `BetSlip` model is necessary to decouple Betway's raw payload schema from the web and Flutter user interfaces.
