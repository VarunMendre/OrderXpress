# VeoLMS V1 Product Requirements Document

**Status:** Founder-approved baseline
**Date:** July 2026
**Release:** V1

## 1. Purpose

This document is the source of truth for what VeoLMS V1 must deliver. Architecture documents decide how to deliver it. Product background and long-term ideas are kept in [product discovery](product-discovery.md).

Priorities:

- **Must:** Launch blocker
- **Should:** Strong V1 target; moving it requires founder approval
- **Stretch:** Valuable but not required for launch

## 2. V1 outcome

V1 succeeds when an independent educator can operate a white-label academy, publish a paid recorded course, accept a Razorpay payment, grant access exactly once, and provide fast, secure learning—and when ProCodrr can replace its existing LMS without material loss.

### Primary users

- Platform owner: configures and operates one academy
- Student: discovers, buys, and learns inside that academy
- VeoLMS support operator: helps diagnose a deployment only through explicit, temporary, audited access

### Product shape

| Product | V1 commitment |
| --- | --- |
| VeoLMS Core | Open-source, self-hosted, fully white-label, one creator per deployment, creator-owned payment account and infrastructure, no artificial software limits |
| Public identity | Each academy looks independent; there is no shared course marketplace or global student identity |

## 3. Product invariants

These rules must be enforced regardless of implementation:

1. One Academy Runtime serves exactly one creator or creator organization.
2. A student identity belongs to one academy.
3. One academy cannot access another academy's users, content, commerce, secrets, or operations.
4. Purchase, access grant, and enrollment are separate records.
5. Replayed payment callbacks cannot duplicate purchases, access grants, enrollments, refunds, or notifications.
6. A confirmed payment, access change, refund, or privileged action is acknowledged only after its critical record is durable.
7. Paid content requires an active access grant; public content and previews are explicit exceptions.
8. Platform owners always complete two-step verification.
9. VeoLMS staff never silently impersonate a creator or student.
10. Privileged, support, and moderation actions are attributable and auditable.
11. Creator-owned data and assets are exportable.
12. Core applies no artificial limits to students, courses, or storage.
13. Refunds revoke related access grants by default unless the creator explicitly preserves them.

## 4. Golden journeys

### Creator and student

1. The owner configures academy branding and a homepage.
2. The owner creates, previews, and publishes a paid self-paced course.
3. A visitor views the course page and public trailer.
4. The student authenticates, applies a coupon, and pays through Razorpay.
5. The verified payment creates one purchase, one access grant, and one enrollment.
6. The student receives confirmation, watches adaptive video, and resumes later.
7. The student uses progress, captions, transcripts, notes, bookmarks, comments, and Q&A.
8. The owner moderates, answers questions, reviews analytics, and can issue a refund.

### Migration

1. An authorized operator provides a source access token or JSON export.
2. A dry run maps source data to the canonical VeoLMS import model and reports differences.
3. Financial and access records are reconciled separately from content counts.
4. The restartable import runs without duplicating critical records.
5. Sampled students verify their courses, validity, progress, interactions, assets, and invoices.
6. The founder approves cutover before the previous LMS is disabled.

## 5. Functional requirements

### 5.1 Academy and identity

| ID | Priority | Requirement |
| --- | --- | --- |
| FR-ACA-001 | Must | Configure academy name, logo, description, colors, images, basic theme tokens, and navigation links. |
| FR-ACA-002 | Must | Edit a homepage using reorderable text, image, CTA, and featured-course blocks without code. |
| FR-ACA-003 | Must | Core displays no required VeoLMS attribution. |
| FR-ACA-004 | Must | Every production deployment supports a creator-controlled custom domain. |
| FR-IAM-001 | Must | Accounts and sessions are academy-local. |
| FR-IAM-002 | Must | Students can first sign in with Google or a single-use email code or link. |
| FR-IAM-003 | Must | After first sign-in, students can set a password and later use email/password; secure email reset is required. |
| FR-IAM-004 | Must | Owners use Google or single-use email authentication and must then pass TOTP before receiving owner privileges. |
| FR-IAM-005 | Must | Owners receive single-use recovery codes; recovery cannot bypass two-step verification. |
| FR-IAM-006 | Must | Authentication tokens expire, are single-use, are stored safely, and are rate-limited; high-risk actions require recent authentication. |
| FR-IAM-007 | Must | Security-sensitive authentication and recovery events generate email and in-app notifications. |
| FR-IAM-008 | Must | Authorization uses extendable capabilities so future default and creator-defined roles do not require rewriting use cases. |

V1 exposes platform-owner and student roles. Separate instructor, administrator, teaching-assistant, finance, support-agent, and moderator roles are deferred.

### 5.2 Catalogue, authoring, and assessment

| ID | Priority | Requirement |
| --- | --- | --- |
| FR-CRS-001 | Must | Provide a public homepage, course catalogue, visual course cards, and expandable curriculum. |
| FR-CRS-002 | Must | A course page shows title, thumbnail, description, price, total and section durations, lecture list, and trailer. |
| FR-CRS-003 | Must | The trailer works without login. Creator-selected preview lectures require login but no purchase. Paid URLs are never exposed by discovery. |
| FR-CRS-004 | Must | Build self-paced courses using ordered sections and ordered lectures of type video, rich text, simple quiz, or text assignment. |
| FR-CRS-005 | Must | Every lecture can include downloadable resources. |
| FR-CRS-006 | Must | Courses and lectures support draft, preview, publish, edit-after-publish, revision history, and rollback. |
| FR-CRS-007 | Must | Configure access validity, previews, quiz passing thresholds, and assignment completion conditions. |
| FR-CRS-008 | Must | Generate completion certificates as downloadable PDF or image with a public share link. Certificates confirm completion, not verified mastery. |

### 5.3 Video and Learning Workspace

| ID | Priority | Requirement |
| --- | --- | --- |
| FR-VID-001 | Must | Creators upload videos through VeoLMS directly to configured private S3-compatible storage. |
| FR-VID-002 | Must | Original and processed video remain private and are delivered through an edge/CDN layer. |
| FR-VID-003 | Must | Generate or deliver adaptive HLS with multiple quality levels and a low-bandwidth-friendly startup profile. |
| FR-VID-004 | Must | Authorize playback using short-lived signed URLs, cookies, tokens, or an equivalent mechanism. |
| FR-VID-005 | Must | Allow optional commercial streaming DRM per course or video through an external DRM provider. |
| FR-VID-006 | Must | One course can mix uploaded video, YouTube embeds, and Vimeo embeds. |
| FR-VID-007 | Must | Player controls include speed, manual and adaptive quality, captions, transcript, transcript search, picture-in-picture, keyboard control, and resume. |
| FR-VID-008 | Must | Students can create lecture notes and bookmarks; timestamp links seek to the referenced moment. |
| FR-VID-009 | Must | Creators can define named timestamp-based video chapters. |
| FR-VID-010 | Should | Add visible watermarking only if it does not block launch. |
| FR-VID-011 | Stretch | Generate transcripts and captions automatically with creator review and correction. |
| FR-VID-012 | Stretch | Generate a lecture summary only from a creator-approved transcript. |

### 5.4 Progress, PWA, comments, and Q&A

| ID | Priority | Requirement |
| --- | --- | --- |
| FR-LRN-001 | Must | Mark video completion at a creator-configured watched percentage; students cannot manually complete a video. |
| FR-LRN-002 | Must | Quiz and assignment completion requires the configured condition. |
| FR-LRN-003 | Must | Course and lecture progress synchronizes across authenticated sessions, with documented tolerance for temporary connectivity loss. |
| FR-LRN-004 | Must | Provide an excellent responsive web application and installable PWA. |
| FR-LRN-005 | Must | Ship the interface in English while allowing course content in any language and keeping product text ready for localization. |
| FR-COM-001 | Must | Lecture comments support plain text, nested replies, safe mentions, and timestamp links. |
| FR-COM-002 | Must | Q&A belongs to a lecture or assignment and supports rich text or Markdown, images, links, screenshots, allowed code files, and timestamps. |
| FR-COM-003 | Must | The Student Dashboard lists the student's comments and Q&A with reply, like, read, and interaction status when available. |
| FR-COM-004 | Must | Students can report content; owners can hide or delete it, lock Q&A, and suspend commenting or Q&A participation. |
| FR-COM-005 | Must | Attachments enforce type, size, and safety rules; interactions and mentions are rate-limited. |
| FR-COM-006 | Must | Moderation actions are written to the audit trail. |

### 5.5 Commerce, access grants, and documents

| ID | Priority | Requirement |
| --- | --- | --- |
| FR-PAY-001 | Must | Publish free courses and sell courses through one-time Razorpay payments. |
| FR-PAY-002 | Must | Creators connect their own gateway account; funds go directly to the creator. |
| FR-PAY-003 | Must | A verified single-course payment creates at most one purchase, one access grant, and one enrollment. A bundle can create one access grant per course. |
| FR-PAY-004 | Must | Owners can create or revoke access grants without a payment; manual grants never create fake gateway transactions. |
| FR-PAY-005 | Must | Checkout supports coupon codes and course bundles. |
| FR-PAY-006 | Must | Owners can issue full and partial refunds. Refunds revoke related access grants by default with an explicit preserve-access option. |
| FR-PAY-007 | Must | Gateway callbacks are authenticated, replay-safe, idempotent, and reconciled. |
| FR-PAY-008 | Must | Generate downloadable invoices and receipts containing seller, buyer, line items, currency, amount, discount, payment reference, date, and refund state. |
| FR-PAY-009 | Should | Add GST fields and credit-note behavior after accounting requirements are approved. |
| FR-PAY-010 | Should | Let a creator enable a student refund-request action; email requests remain possible. |
| FR-PAY-011 | Should | A creator can show manual UPI/QR instructions. Approval creates an audited manual access grant, not a verified gateway payment. |

### 5.6 Notifications and analytics

| ID | Priority | Requirement |
| --- | --- | --- |
| FR-NOT-001 | Must | In-app and email notifications link to the relevant course, lecture, question, or transaction. |
| FR-NOT-002 | Must | Purchase, enrollment, authentication, and security notifications are automatic. |
| FR-NOT-003 | Must | The owner decides whether publication sends a course notification. |
| FR-NOT-004 | Must | Q&A replies create email and in-app notifications; comment replies and interactions create in-app notifications. |
| FR-NOT-005 | Should | Students control non-critical notification preferences. |
| FR-ANL-001 | Must | Commerce analytics cover revenue, sales, refunds, coupons, enrollments, and manual access grants. |
| FR-ANL-002 | Must | Learning analytics cover daily/monthly active students, course/lecture completion, watch time, and progress distribution. |
| FR-ANL-003 | Must | Funnel analytics cover course-page-to-checkout and checkout-to-purchase conversion. |
| FR-ANL-004 | Must | Video analytics cover startup time, playback errors, buffering, and quality behavior where measurable. |
| FR-ANL-005 | Must | Creator analytics are academy-isolated and owner-authorized. |

### 5.7 Operations, support, export, and AI boundaries

| ID | Priority | Requirement |
| --- | --- | --- |
| FR-OPS-001 | Must | Target a one-command or one-click self-hosted setup completing in roughly 10–15 minutes with cost-conscious defaults. |
| FR-OPS-002 | Should | Provide an advanced setup path for creator-selected infrastructure. |
| FR-OPS-003 | Must | Prompt self-hosters for updates rather than forcing them; every supported update has a documented rollback window and path. |
| FR-OPS-004 | Must | Export the complete database, configuration, and every creator-owned static asset. |
| FR-OPS-005 | Must | Self-hosted telemetry is anonymous, transparent, easy to disable, and excludes personal data and student content. |
| FR-OPS-006 | Must | Support starts with read-only diagnostics; interface access requires visible creator consent, automatic expiry, and auditing. |
| FR-OPS-007 | Must | Emergency access is tightly restricted, short-lived, audited, linked to an incident, and followed by creator notification. |
| FR-OPS-008 | Should | Deployment guidance explains expected infrastructure costs and major cost drivers. |
| FR-AI-001 | Must | Define safe interfaces and data boundaries for future course-aware AI without requiring those features in V1. |
| FR-AI-002 | Must | The creator controls whether questions, comments, replies, assignments, and learning activity may be used by AI. |
| FR-AI-003 | Must | Direct identifiers, authentication information, payment data, and unrelated private account data are never sent to AI providers. |
| FR-AI-004 | Must | Non-essential AI features can be disabled and disclose which academy data categories they use. |
| FR-AI-005 | Stretch | Self-hosters can supply their own provider key for supported V1 AI features. |

## 6. Quality requirements

### Capacity planning inputs

- 100,000 registered students
- A stress-planning case of 10,000 concurrent students for one large Academy Runtime
- About 10 courses per creator and up to 100 video hours per course as a planning case
- About 1,000 purchases per day

These are test inputs, not public product limits.

### Performance and accessibility

- Provisional p75 web targets: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.
- Cached interface feedback should usually appear within about 100 ms.
- Initial measured video targets: time to first frame ≤ 2 s on broadband and ≤ 4 s on constrained mobile at p75; rebuffer ratio below 0.5% and 2% respectively.
- Measure by device, network, geography, and Academy Runtime rather than relying only on laboratory tests.
- Core journeys must support keyboard access, visible focus, text scaling, labels, useful errors, accessible contrast, alternative text, captions, and transcripts.

### Availability and durability

- Reference production target: approximately 99.93% availability over six months when the operator uses the recommended highly available deployment profile.
- Catastrophic recovery target: restore service within 24 hours.
- Confirmed critical transactions survive process, server, and availability-zone failure without loss.
- Total-region loss uses a measured and documented near-zero recovery point; do not claim regional RPO zero without proof.
- Caches, indexes, analytics aggregates, transcripts, and summaries may be rebuilt from durable source data.

### Cost and portability

- Prefer cost-conscious self-hosting defaults. About ₹500/month for a small deployment with roughly 20 GB of course data is an aspiration, not a promise.
- Display or document storage, bandwidth, processing, database, email, DRM, and AI cost drivers separately.
- Support self-hosted and managed PostgreSQL through the same application contract.
- The normal database connection is PostgreSQL's network protocol. A Unix-domain socket may be an optional same-host deployment optimization, never an application dependency.
- Keep provider-specific code behind explicit adapters.

## 7. Security and privacy requirements

Priority threats are account takeover, privilege escalation, cross-academy leakage, personal-data exposure, insider misuse, commerce/access corruption, malicious attachments, authorization defects, future malicious plugins, and video piracy.

Minimum controls:

- Deny-by-default server-side authorization and resource ownership checks
- Mandatory owner TOTP, recovery codes, controlled recovery, and step-up authentication
- Secure sessions, CSRF protection, token expiry, rate limits, and account-enumeration resistance
- Private storage, short-lived playback authorization, and optional commercial DRM
- Verified callback signatures, unique provider events, state machines, and database constraints
- Attachment allowlists, size limits, inspection, safe Markdown/rich-text rendering, and malware-scanning boundary
- Encrypted secrets, TLS, rotation, and log redaction
- Protected audit events for identity, access, commerce, publication, deletion, export, support, moderation, migration, update, and rollback
- Tested backup, restoration, soft deletion, and recovery

The complete threat analysis and security gates are in the [threat model](../security/threat-model.md).

## 8. Data ownership and retention

The creator can export users, identity data, offerings, course structure, access grants, enrollments, commerce records, invoices, progress, community data, videos, images, files, resources, configuration, and branding.

| Data class | Recovery and retention rule |
| --- | --- |
| Comments, Q&A, and ordinary student data | Soft-deleted and recoverable for 30 days, subject to legal exceptions |
| Courses, sections, lectures, assignments, and videos | Soft-deleted and recoverable for 90 days |
| Payments, invoices, refunds, and access grants | Not removed through ordinary deletion; retained under approved accounting/legal policy |
| Security and privileged audit records | Retention must be approved before production |
| Caches and derived indexes | Disposable and rebuildable |
| AI outputs | Deletable and regenerable while source data exists |

Permanent deletion jobs must respect recovery windows, dependencies, legal holds, and backup propagation.

## 9. Migration requirements

The first adapter accepts an authorized API token and existing JSON/static assets from the current third-party LMS, maps them to a documented canonical import format, and is reusable by another authorized creator using the same source.

Required migrated data includes students, course structure, media, resources, purchases, access sources and validity, progress where available, comments, likes, Q&A, invoices, receipts, thumbnails, and other relevant assets.

| ID | Requirement |
| --- | --- |
| MIG-001 | Dry run writes no production records and reports source, imported, skipped, and failed counts. |
| MIG-002 | Import is restartable and repeatable without duplicating purchases, access grants, or enrollments. |
| MIG-003 | Imported records retain a source identifier or mapping reference. |
| MIG-004 | Commerce and access records are reconciled independently from general content counts. |
| MIG-005 | Validate asset availability and integrity where practical; one non-critical failure cannot silently discard unrelated records. |
| MIG-006 | Blocking failures are visible and actionable; cutover has a fallback plan. |
| MIG-007 | Existing students verify email and create a VeoLMS password; source passwords are never imported. |
| MIG-008 | Clean up temporary tokens and sensitive migration files safely. |
| MIG-009 | Production cutover requires founder-approved reconciliation and a documented exception list. |
| MIG-010 | The source adapter is reusable for other authorized migrations from the same LMS. |

## 10. Explicit V1 non-goals

- Cross-creator marketplace, global student account, or shared tenant database
- Multiple organizations, instructors, custom roles, departments, campuses, or enterprise SSO
- Native mobile applications, offline playback, or offline DRM
- Chat rooms, direct messages, forums, public feeds, or native live classes
- Cohorts, drip release, prerequisites, sequential completion, or scheduled publishing
- Subscriptions, installments, memberships, donations, regional pricing, or creator settlement
- Coding labs, automated code execution, peer review, plagiarism detection, or supervised mastery credentials
- Course-aware AI tutor, creator AI avatar, AI course/page builder, dubbing, or translation
- Third-party runtime plugins, marketplace, theme packages, arbitrary JavaScript, or custom React components
- General public API or general outbound webhooks
- Advanced analytics and enterprise administration
- Sellable Offering types other than courses
- Standalone video-hosting API

## 11. Launch acceptance

V1 is production-ready only when all of the following are demonstrated:

1. A creator configures an academy and publishes a paid course.
2. A student discovers it, authenticates, applies a coupon, pays through Razorpay, and receives exactly one purchase, access grant, and enrollment.
3. Signed adaptive playback, optional DRM, resume, progress, transcripts, video chapters, notes, bookmarks, comments, Q&A, notifications, certificates, and refunds meet their requirements.
4. Callback replay cannot duplicate business records, and refunds revoke access by default.
5. Owner MFA, authorization boundaries, support access, private media, and privileged auditing pass security tests.
6. ProCodrr migration reconciles critical data and has an approved exception list.
7. Self-hosting, update, rollback, backup restoration, export, telemetry controls, PWA installation, supported browsers, and performance monitoring are tested and documented.
8. ProCodrr operates on VeoLMS before the previous LMS is disabled.

All high-severity security findings must be fixed or explicitly accepted by the founder before production.

## 12. First 90-day indicators

- ProCodrr operates for 90 continuous days without a major security or reliability incident.
- Existing students continue learning without material migration errors.
- At least five external self-hosted installations succeed.
- Approximately 500–1,000 learners are active.
- External contributors participate and creator/student feedback is positive.
