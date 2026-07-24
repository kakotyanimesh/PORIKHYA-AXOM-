// Seeds N copies of a mock-test JSON as separate Exams (e.g. "Mock Test 1".."Mock Test 5").
// Usage: node prisma/seed-mock-tests.cjs <path-to-json> [count]
//
// JSON shape expected (see guide/03-DOMAIN-MODEL.md for schema):
//   { exam: { name, subject, category, series_name, duration_minutes,
//             negative_marking, pass_score_percent }, questions: [...] }
// `exam.category` must map to the ExamCategory enum (ASSAM_TET / ASSAM_POLICE
// / APSC / ADRE / OTHER) — non-enum values like "STATE_EXAM" are coerced below.
// Extra JSON fields the schema doesn't store (description, exam-level
// marks_per_question, question difficulty_level) are read and dropped —
// schema doesn't have columns for them and nothing in guide/ spec's them.

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

const CATEGORY_ALIASES = {
  STATE_EXAM: "ASSAM_TET",
};

function resolveCategory(raw) {
  const enumValues = ["ASSAM_TET", "ASSAM_POLICE", "APSC", "ADRE", "OTHER"];
  if (enumValues.includes(raw)) return raw;
  if (CATEGORY_ALIASES[raw]) return CATEGORY_ALIASES[raw];
  throw new Error(`Unmapped exam category "${raw}" — add it to CATEGORY_ALIASES or the enum.`);
}

const OPTION_POSITION_ORDER = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };

async function seedOne(examJson, questionsJson, mockNumber) {
  const category = resolveCategory(examJson.category);
  const name = examJson.name.replace(/\bMock Test\b\s*\d*/i, "").trim();
  const examName = `${name} Mock Test ${mockNumber}`;

  const sectionNames = [...new Set(questionsJson.map((q) => q.section))];

  const exam = await prisma.exam.create({
    data: {
      series_name: examJson.series_name,
      name: examName,
      subject: examJson.subject,
      category,
      duration_minutes: examJson.duration_minutes,
      total_questions: questionsJson.length,
      negative_marking: examJson.negative_marking,
      pass_score_percent: examJson.pass_score_percent,
    },
  });

  const subsectionIdByName = {};
  for (let i = 0; i < sectionNames.length; i++) {
    const subsection = await prisma.subsection.create({
      data: { exam_id: exam.id, name: sectionNames[i], order: i },
    });
    subsectionIdByName[sectionNames[i]] = subsection.id;
  }

  for (const q of questionsJson) {
    await prisma.question.create({
      data: {
        exam_id: exam.id,
        subsection_id: subsectionIdByName[q.section],
        content: q.content,
        content_assamese: q.content_assamese ?? null,
        solution_text: q.solution_text ?? null,
        solution_text_assamese: q.solution_text_assamese ?? null,
        order: q.question_number,
        options: {
          create: q.options.map((opt) => ({
            text: opt.text,
            text_assamese: opt.text_assamese ?? null,
            is_correct: opt.is_correct,
            order: OPTION_POSITION_ORDER[opt.position] ?? 0,
          })),
        },
      },
    });
  }

  console.log(`seeded "${examName}" (${exam.id}) — ${questionsJson.length} questions, ${sectionNames.length} sections`);
}

async function withRetry(fn, label, attempts = 5) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === attempts) throw err;
      const delayMs = attempt * 2000;
      console.error(`${label} failed (attempt ${attempt}/${attempts}): ${err.message.split("\n")[0]} — retrying in ${delayMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function main() {
  const jsonPath = process.argv[2];
  const count = parseInt(process.argv[3] ?? "5", 10);
  if (!jsonPath) {
    console.error("Usage: node prisma/seed-mock-tests.cjs <path-to-json> [count]");
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(path.resolve(jsonPath), "utf-8"));
  for (let i = 1; i <= count; i++) {
    const exists = await withRetry(
      () => prisma.exam.findFirst({ where: { name: `${raw.exam.name.replace(/\bMock Test\b\s*\d*/i, "").trim()} Mock Test ${i}` } }),
      `check mock ${i} exists`,
    );
    if (exists) {
      console.log(`skipping mock ${i} — already seeded (${exists.id})`);
      continue;
    }
    const examName = `${raw.exam.name.replace(/\bMock Test\b\s*\d*/i, "").trim()} Mock Test ${i}`;
    await withRetry(async () => {
      try {
        await seedOne(raw.exam, raw.questions, i);
      } catch (err) {
        // clean up a partially-created exam so the next retry attempt doesn't duplicate it
        await prisma.exam.deleteMany({ where: { name: examName } }).catch(() => {});
        throw err;
      }
    }, `seed mock ${i}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
