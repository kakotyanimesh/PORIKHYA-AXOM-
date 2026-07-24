# Prompt: extract mock-test PDF into seed JSON

Paste this into Claude (with the mock-test PDF attached) to get a JSON file
in the exact shape `packages/db/prisma/seed-mock-tests.cjs` expects.

---

You are converting a mock-test PDF into a JSON file for a seed script. Output
ONLY the JSON, no commentary, no markdown fences.

Shape (exact keys, exact nesting):

```json
{
  "exam": {
    "name": "Assam Police SI Mock Test 1",
    "subject": "General Studies",
    "category": "ASSAM_POLICE",
    "series_name": "Assam Police SI 2024",
    "duration_minutes": 120,
    "negative_marking": 0.25,
    "pass_score_percent": 40
  },
  "questions": [
    {
      "question_number": 1,
      "section": "General Knowledge",
      "content": "question text in English",
      "content_assamese": "question text in Assamese (translate if PDF is English-only, else transcribe as-is)",
      "options": [
        { "text": "option text", "text_assamese": "option text in Assamese", "position": "A", "is_correct": true },
        { "text": "...", "text_assamese": "...", "position": "B", "is_correct": false },
        { "text": "...", "text_assamese": "...", "position": "C", "is_correct": false },
        { "text": "...", "text_assamese": "...", "position": "D", "is_correct": false }
      ],
      "solution_text": "explanation / correct-answer justification, in English",
      "solution_text_assamese": "same explanation in Assamese"
    }
  ]
}
```

Rules:

- `category` must be exactly one of: `ASSAM_TET`, `ASSAM_POLICE`, `APSC`,
  `ADRE`, `OTHER` — pick based on which exam the PDF is for. Never invent a
  new value.
- `section` = the subject/topic heading the question falls under in the PDF
  (e.g. "General Knowledge", "Reasoning", "Assamese Language", "Mathematics").
  Keep section names short and consistent across all questions in the file —
  they become groupable subsections.
- `question_number` is 1-indexed, sequential, matches PDF order.
- Exactly one option per question has `is_correct: true`.
- `position` is always one of `A`/`B`/`C`/`D` (or `E`/`F` if the PDF has more
  than 4 options), matching the PDF's own lettering.
- If the PDF has no Assamese text, translate `content`/option `text`/
  `solution_text` into Assamese yourself for the `_assamese` fields — don't
  leave them null unless truly untranslatable (e.g. a pure number/formula).
  If the PDF already has both languages, transcribe each into its matching field, don't translate again.
- If the PDF has no explanation/solution section, write a short one-line
  justification yourself for `solution_text`/`solution_text_assamese` rather
  than leaving it null.
- `duration_minutes`, `negative_marking`, `pass_score_percent` — read from the
  PDF's instructions page if present; otherwise use these exam-type defaults:
  Assam Police SI/Constable: 120 min, 0.25 negative, 40% pass.
  APSC (prelims-style): 120 min, 0.33 negative, 40% pass.
  ADRE: 90 min, 0.25 negative, 40% pass.
- Extract every question in the PDF — don't sample or truncate.
- Validate before returning: question count in `questions` array must equal
  the highest `question_number`, every question has exactly 4 (or however
  many the PDF uses) options, exactly one `is_correct: true` per question.

After you have the JSON, save it to a file and run:

```
node prisma/seed-mock-tests.cjs <path-to-json> 5
```

from `packages/db/`, to create 5 numbered mock-test copies
(`<name> Mock Test 1`..`5`) in the database.
