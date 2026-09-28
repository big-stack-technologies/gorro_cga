# Daily Field Reports — Frontend Guide

The form CGAs fill in at the end of each day. **The backend is live** — only the form is missing.

**Base URL:** `https://gorro.online`
**Auth:** `Authorization: Bearer <token>` — the **CGA's own token**, not an admin's.

> **Nothing has ever been filed.** All 7 CGAs currently show 0% reporting compliance on the marketing dashboard, which is generating 7 false alerts a day. Those stop the moment this form exists.

---

## Who can use it

Only a user with the **CGA badge**. Anyone else gets:

```json
403  { "message": "Field reports are for CGAs." }
```

The CGA logs in as themselves and files their own report. They cannot see or edit anyone else's. Admins read everyone's through a separate endpoint (bottom of this doc).

---

## 1. File today's report

```http
POST /field-reports
```

```json
{
  "reportDate": "2026-09-25",
  "communityId": "uuid-of-community-visited",
  "location": "Watt Market, Calabar",

  "prospectsApproached": 24,
  "customerEngagements": 12,
  "productDemonstrations": 5,
  "newRegistrations": 3,
  "kycFollowUps": 4,
  "groupLeadersContacted": 2,
  "groupsIdentified": 1,
  "followUpsConducted": 6,

  "customerObjections": "Two traders said the fee was why they would not join.",
  "customerComplaints": null,
  "opportunitiesIdentified": "Market association meets Thursdays — the chairman offered a slot.",
  "nextAction": "Attend Thursday meeting with the chairman."
}
```

**`communityId` is optional — omit the key entirely if you have none.** Get the
list from [`/field-reports/communities`](#3-communities-for-the-picker); it is
empty for most CGAs today, and a report with only a free-text `location` is valid.

**`reportDate` is the only required field.** Everything else is optional — a CGA who only spoke to people can send just `prospectsApproached` and leave the rest.

Response:

```json
{ "id": "uuid", "reportDate": "2026-09-25", "created": true, "message": "Report filed." }
```

### ⚠️ Re-submitting the same date UPDATES it

```json
{ "created": false, "message": "Report for that date updated." }
```

This is deliberate and it drives two things in the UI:

**Retry safely.** A CGA on bad signal in a market will hit send twice. A duplicate would make every total count that day twice, so the second submit overwrites instead. **Do not block or warn on retry** — just send it.

**Edit today's report by POSTing again.** There's no PATCH. Load their existing report for the date, let them change a number, POST the whole object back. Use `created` to decide whether to say "Report filed" or "Report updated".

---

## 2. Their own reports

```http
GET /field-reports/mine?from=2026-09-01&to=2026-09-30
```

Defaults to the current month. Returns newest first.

```json
[
  {
    "id": "uuid",
    "reportDate": "2026-09-25",
    "community": { "id": "uuid", "name": "Watt Market Traders", "type": "MARKET" },
    "location": "Watt Market, Calabar",
    "prospectsApproached": 24,
    "customerEngagements": 12,
    "productDemonstrations": 5,
    "newRegistrations": 3,
    "kycFollowUps": 4,
    "groupLeadersContacted": 2,
    "groupsIdentified": 1,
    "followUpsConducted": 6,
    "customerObjections": "…",
    "customerComplaints": null,
    "opportunitiesIdentified": "…",
    "nextAction": "…"
  }
]
```

Use this for a "my reports" list and to pre-fill the form when editing a past day.

---

## 3. Communities, for the picker

```http
GET /field-reports/communities
```

Returns only the communities **you** own. You cannot see another CGA's.

```json
[
  {
    "id": "bbbb2222-3333-4444-8555-666677778888",
    "name": "Watt Market Traders",
    "type": "MARKET",
    "location": "Watt Market, Calabar",
    "estimatedSize": 200
  }
]
```

### ⚠️ An empty array is the normal answer

Communities are recorded by an admin, not by CGAs, and **most CGAs have none
yet** — at the time of writing, 5 of our 7. Build the picker so that:

- an empty list renders as "No community" rather than an error or a spinner,
- `communityId` is never required to submit,
- `location` free text is the fallback and works on its own.

A report with a `location` and no `communityId` is completely valid.

`type` is one of `MARKET`, `CHURCH`, `SCHOOL`, `COOPERATIVE`, `ASSOCIATION`,
`ESTATE`, `WORKPLACE`, `OTHER`.

---

## Field reference

| Field | Type | Notes |
|---|---|---|
| `reportDate` | ISO date | **required** — `"2026-09-25"` |
| `communityId` | uuid | the main community visited; optional |
| `location` | string ≤255 | free text landmark |
| `prospectsApproached` | int 0–500 | people spoken to who aren't customers yet |
| `customerEngagements` | int 0–500 | conversations with existing customers |
| `productDemonstrations` | int 0–500 | app walkthroughs given |
| `newRegistrations` | int 0–500 | sign-ups they believe they caused — see below |
| `kycFollowUps` | int 0–500 | chased someone to finish verification |
| `groupLeadersContacted` | int 0–500 | chiefs, chairs, pastors, association heads |
| `groupsIdentified` | int 0–500 | new communities found |
| `followUpsConducted` | int 0–500 | return visits |
| `customerObjections` | text ≤2000 | **why people said no** |
| `customerComplaints` | text ≤2000 | |
| `opportunitiesIdentified` | text ≤2000 | |
| `nextAction` | text ≤2000 | |

**Counts are capped at 500/day.** A typo of 9999 would distort every report that reads them, so anything above 500 is rejected. Cap the stepper in the UI rather than letting the API reject it after they've typed everything.

---

## Three things to get right in the form

**The text fields are the valuable part.** Counts are easy to fake and easy to ignore; *"two traders said the fee was why they would not join"* is what a manager actually reads and acts on. Give `customerObjections` and `nextAction` real multi-line inputs, not single-line boxes squeezed under the numbers.

**Don't ask for Team Lead or territory.** Both are derived from the org chart server-side. If you send them they're ignored — a self-reported team is a field someone gets wrong, and the system already knows the answer.

**`newRegistrations` is a claim, not a fact.** The system separately counts sign-ups attributed to that CGA and shows admins both side by side. Label the field as what they *believe* they signed up rather than implying it's verified — it keeps the number honest.

---

## Admin views (already built, for the dashboard not the CGA app)

```http
GET /admin/marketing/field-reports?from=&to=&cgaUserId=&communityId=
GET /admin/marketing/field-reports/comparison?from=&to=
```

The comparison endpoint is the point of the whole feature — what each CGA *reported* against what actually happened:

```json
{
  "period": { "from": "2026-09-01", "to": "2026-09-30" },
  "workingDaysElapsed": 22,
  "cgas": [
    {
      "cgaUserId": "uuid", "name": "Ada Obi",
      "daysReported": 18, "reportingCompliancePct": 82,
      "prospectsApproached": 210, "engagements": 96, "demos": 41,
      "reportedRegistrations": 40, "actualSignups": 31, "variance": -9,
      "kycFollowUps": 22, "groupsIdentified": 3
    }
  ]
}
```

`reportingCompliancePct` counts **Monday–Saturday**. It's the figure driving the `REPORTING_GAP` alerts that are currently firing for everyone.

---

## Quick reference

| Endpoint | Method | Who |
|---|---|---|
| `/field-reports` | POST | CGA — file/update a day |
| `/field-reports/mine` | GET | CGA — their own history |
| `/field-reports/communities` | GET | CGA — their own communities, for the picker |
| `/admin/marketing/field-reports` | GET | admin — everyone's |
| `/admin/marketing/field-reports/comparison` | GET | admin — reported vs actual |

Full schemas in Swagger at `/api` under **Field Reports (CGA)** and **Admin - Marketing**.
