# Access matrix

One JSON file per passport, named by ISO alpha-2 code — `IN.json`, `PT.json`.
Each file maps a destination code to a cell:

```json
{
  "TH": { "level": "visa-on-arrival", "days": 15, "source": "https://www.mfa.go.th/...", "lastVerified": "2026-09-13" },
  "PT": { "level": "visa-required", "source": "https://vistos.mne.gov.pt/...", "lastVerified": "2026-09-13" }
}
```

`level` is one of `visa-free`, `eta`, `visa-on-arrival`, `e-visa`, `visa-required`,
`banned`. A destination that is simply absent is **unknown** — it is excluded
from the score rather than assumed to be visa-required, and it counts against
that passport's coverage.

A passport needs 80% verified coverage before it is given a score at all.
Below that it is published as "pending verification", which is the honest state
and the reason this index can be trusted where the old 15-row table could not.

Fill order: the ~60 passports XIPHIAS clients actually hold, starting with IN.
Every cell needs a `source` pointing at the destination government's own visa
page, and a `lastVerified` date. Never a third-party index.
