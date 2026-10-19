// K-Merge Phase 3 explainer deck (pptxgenjs, structured: theme + layouts + sections)
const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");
const { setTheme } = require("../theme.js");

const HERE = __dirname;
const IMG = (n) => path.join(HERE, "..", "img", n + "_3d.png");
const D = JSON.parse(fs.readFileSync(path.join(HERE, "data.json"), "utf8"));

const THEME = {
  name: "Share the Slot",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1B263B", lt1: "FFFFFF", dk2: "0B2135", lt2: "EEF3F6",
    accent1: "0E7C86", accent2: "D1495B", accent3: "E9A23B", accent4: "5FA97E",
    accent5: "8A96A3", accent6: "7D6B91", hlink: "0E7C86", folHlink: "3D5A80",
  },
};
const HEX = {
  ink: "1B263B", navy: "0B2135", card: "EEF3F6", teal: "0E7C86", coral: "D1495B", amber: "E9A23B",
  green: "5FA97E", grey: "A3ADB8", purple: "7D6B91", muted: "6B7785", grid: "E6EBF0", ice: "CFE3E8",
  lightCoral: "E8A0A8", white: "FFFFFF",
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
pres.author = "Ankit Raj Choudhary";
pres.title = "K-Merge Phase 3: Don't Average, Share";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;
const W = 13.333, X0 = 0.6, CW = W - 2 * X0;

// ---------------- layouts ----------------
pres.defineSlideMaster({
  title: "TITLE_DARK",
  background: { color: HEX.navy },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: X0, y: 1.75, w: 7.9, h: 1.5, fontSize: 48, bold: true, color: C.background1, valign: "bottom", align: "left", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: X0, y: 3.35, w: 7.9, h: 1.2, fontSize: 21, color: C.background2, valign: "top", margin: 0 }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: HEX.white },
  margin: [0.4, 0.6, 0.6, 0.6],
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: X0, y: 0.35, w: CW, h: 0.8, fontSize: 32, bold: true, color: C.text1, valign: "middle", align: "left", margin: 0 }, text: "" } },
    { text: { text: "K-Merge Phase 3  ·  Ankit Raj Choudhary  ·  IIT Jodhpur", options: { x: X0, y: 7.02, w: 7, h: 0.3, fontSize: 10, color: C.accent5, margin: 0 } } },
  ],
  slideNumber: { x: 12.15, y: 7.02, w: 0.6, h: 0.3, fontSize: 10, color: C.accent5, align: "right" },
});
pres.defineSlideMaster({
  title: "CLOSING_DARK",
  background: { color: HEX.navy },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: X0, y: 0.45, w: CW, h: 0.9, fontSize: 36, bold: true, color: C.background1, valign: "middle", align: "left", margin: 0 }, text: "" } },
  ],
  slideNumber: { x: 12.15, y: 7.02, w: 0.6, h: 0.3, fontSize: 10, color: C.background2, align: "right" },
});

// ---------------- helpers ----------------
let nObj = 0;
const nm = (s) => `${s}-${++nObj}`;
function card(slide, x, y, w, h, fill = C.background2, extra = {}) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0 }, rectRadius: 0.12, objectName: nm("card"), ...extra });
}
function iconCircle(slide, name, x, y, d, fill = C.background1) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill, width: 0 }, objectName: nm("icon-bg") });
  const p = d * 0.16;
  slide.addImage({ path: IMG(name), x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p, objectName: nm("icon-" + name) , altText: (name).replace(/_/g, " ") + " illustration" });
}
function txt(slide, text, o) {
  slide.addText(text, { isTextBox: true, margin: 0, valign: "top", fontSize: 16, color: C.text1, objectName: nm("text"), ...o });
}
function caption(slide, text, y = 6.5) {
  txt(slide, text, { x: X0, y, w: CW, h: 0.48, fontSize: 12, italic: true, color: C.text1 });
}
function chartBase(extra = {}) {
  return {
    catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", dataLabelFontFace: "+mn-lt", legendFontFace: "+mn-lt",
    titleFontFace: "+mn-lt", catAxisTitleFontFace: "+mn-lt", valAxisTitleFontFace: "+mn-lt",
    catAxisLabelColor: HEX.ink, valAxisLabelColor: HEX.muted, dataLabelColor: HEX.ink, titleColor: HEX.ink,
    catAxisLabelFontSize: 13, valAxisLabelFontSize: 12, dataLabelFontSize: 13, legendFontSize: 13, titleFontSize: 14,
    valGridLine: { color: HEX.grid, size: 0.75 }, catGridLine: { style: "none" },
    catAxisLineShow: false, valAxisLineShow: false, showTitle: true,
    ...extra,
  };
}
const notes = (slide, s) => slide.addNotes(s);
const pct1 = (v) => Math.round(v * 1000) / 10; // 0.989 -> 98.9

// ============================ SECTION 1: the story ============================
pres.addSection({ title: "The story" });

// ---- 1. Title
{
  const s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: "The story" });
  s.addText("Don't Average, Share", { placeholder: "title" });
  s.addText("What breaks K-Merge, and a storage-fair way to keep every task", { placeholder: "body" });
  txt(s, "Phase 3 results  ·  5 October 2026", { x: X0, y: 4.55, w: 7.9, h: 0.4, fontSize: 16, color: C.accent1, bold: true });
  txt(s, "Ankit Raj Choudhary\nSupervisor: Prof. Divya Saxena  ·  School of AI and Data Science, IIT Jodhpur", { x: X0, y: 5.55, w: 8.2, h: 0.8, fontSize: 15, color: C.background2, paraSpaceAfter: 4 });
  // phone with slots + arriving adapters
  s.addShape(pres.shapes.OVAL, { x: 8.75, y: 1.15, w: 4.0, h: 4.0, fill: { color: "13304A" }, line: { color: "13304A", width: 0 }, objectName: "halo" });
  s.addImage({ path: IMG("mobile_phone"), x: 9.55, y: 1.85, w: 2.5, h: 2.5, objectName: "phone" , altText: "mobile phone illustration" });
  s.addImage({ path: IMG("puzzle_piece"), x: 8.55, y: 4.25, w: 1.05, h: 1.05, objectName: "adapter-1" , altText: "puzzle piece illustration" });
  s.addImage({ path: IMG("books"), x: 11.95, y: 4.3, w: 1.0, h: 1.0, objectName: "adapter-2" , altText: "books illustration" });
  s.addImage({ path: IMG("key"), x: 11.95, y: 1.0, w: 0.95, h: 0.95, objectName: "adapter-3" , altText: "key illustration" });
  notes(s, "Good morning Ma'am. Today I will show what we found in Phase 3. In one line: K-Merge loses quality mainly because it averages adapters, not because it picks the wrong partner. If we share the slot instead of averaging, almost all the quality comes back; the simplest version, split, uses exactly the same storage.");
}

// ---- 2. The answer in one slide
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "The story" });
  s.addText("The answer in one slide", { placeholder: "title" });
  const stats = [
    { big: [["98.9%", C.accent1], [" vs ", C.accent5], ["90.8%", C.accent2]], label: "of single-adapter quality kept on 12 real tasks: sharing vs K-Merge (K = 2 slots)" },
    { big: [["96%", C.accent1], [" vs ", C.accent5], ["64%", C.accent2]], label: "of what the adapters learned beyond the base model is still there: sharing vs K-Merge" },
    { big: [["+17.6", C.accent1], [" vs ", C.accent5], ["+4.5", C.accent2]], label: "points on the weakest language: change HOW the slot stores tasks vs WHO gets merged" },
  ];
  const cw = 3.85, gap = 0.29;
  stats.forEach((st, i) => {
    const x = X0 + i * (cw + gap), y = 1.55;
    card(s, x, y, cw, 2.75);
    txt(s, st.big.map(([t, c]) => ({ text: t, options: { color: c, bold: true } })), { x: x + 0.25, y: y + 0.35, w: cw - 0.5, h: 0.95, fontSize: 31, fontFace: "Cambria", valign: "middle" });
    txt(s, st.label, { x: x + 0.25, y: y + 1.45, w: cw - 0.5, h: 1.1, fontSize: 16, color: C.text1 });
  });
  card(s, X0, 4.65, CW, 1.45, C.text1);
  iconCircle(s, "bullseye", X0 + 0.35, 4.85, 1.05, C.background1);
  txt(s, [{ text: "In our tests, similarity was not the main problem; averaging was.", options: { bold: true, breakLine: true } }, { text: "Keep each task's own directions inside the slot (\"sharing\") and almost nothing is lost; split does it with exactly the same storage.", options: { fontSize: 16, color: C.background2 } }],
    { x: X0 + 1.65, y: 4.85, w: CW - 2.0, h: 1.1, fontSize: 22, color: C.background1, valign: "middle", fontFace: "Calibri" });
  caption(s, "Real benchmark: Qwen2.5-1.5B-Instruct, grammar correction + summarisation + QA in EN/DE/ES/IT, 2 seeds. Weakest-language test: synthetic, Qwen2.5-0.5B-Instruct, 24 arrival orders x 3 seeds.", 6.3);
  notes(s, "Three numbers. First: on 12 real tasks, sharing keeps 98.9 percent of each task's own quality; K-Merge keeps 90.8. The simplest sharing method, split, does this with exactly the same storage as K-Merge. Second: if we only count what the adapters learned beyond the base model, K-Merge keeps 64 percent of it and sharing 96. Third: choosing a better merge partner improves the weakest language by at most 4.5 points, but changing how the slot stores tasks improves it by 17.6. So the main problem is averaging, not similarity.");
}

// ---- 3. Problem
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "The story" });
  s.addText("A phone has room for only K skill packs", { placeholder: "title" });
  iconCircle(s, "mobile_phone", X0 + 0.15, 1.6, 2.4, C.background2);
  txt(s, "One base model on the phone (e.g. Qwen2.5-1.5B)", { x: X0, y: 4.1, w: 2.75, h: 0.7, fontSize: 14, align: "center", color: C.text1 });
  // storage box
  const bx = 3.85, by = 1.6, bw = 4.6, bh = 3.05;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx, y: by, w: bw, h: bh, fill: { color: C.background1 }, line: { color: C.accent5, width: 1.5, dashType: "dash" }, rectRadius: 0.12, objectName: "storage" });
  txt(s, "Storage: K = 2 slots", { x: bx + 0.25, y: by + 0.15, w: bw - 0.5, h: 0.4, fontSize: 15, bold: true, color: C.accent5 });
  [["Slot 1:  English grammar", C.accent1], ["Slot 2:  German summary", C.accent4]].forEach(([t, c], i) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx + 0.3, y: by + 0.75 + i * 1.05, w: bw - 0.6, h: 0.85, fill: { color: c }, line: { color: c, width: 0 }, rectRadius: 0.1, objectName: nm("slot") });
    txt(s, t, { x: bx + 0.55, y: by + 0.75 + i * 1.05, w: bw - 1.1, h: 0.85, fontSize: 17, bold: true, color: C.background1, valign: "middle" });
  });
  // arriving adapters
  s.addShape(pres.shapes.LEFT_ARROW, { x: 8.7, y: 2.75, w: 0.85, h: 0.6, fill: { color: C.accent2 }, line: { color: C.accent2, width: 0 }, objectName: "arrive-arrow" });
  ["French grammar", "Italian QA", "Spanish summary"].forEach((t, i) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.75, y: 1.75 + i * 0.95, w: 2.95, h: 0.72, fill: { color: C.background2 }, line: { color: C.accent2, width: 1.25 }, rectRadius: 0.1, objectName: nm("newcomer") });
    txt(s, t, { x: 9.95, y: 1.75 + i * 0.95, w: 2.6, h: 0.72, fontSize: 15, bold: true, color: C.text1, valign: "middle" });
  });
  txt(s, "New adapters keep arriving", { x: 9.75, y: 4.6, w: 2.95, h: 0.35, fontSize: 13, italic: true, color: C.accent2, align: "center" });
  card(s, X0, 5.2, CW, 1.25);
  txt(s, [
    { text: "LoRA adapter", options: { bold: true, color: C.accent1 } }, { text: " = a small add-on that teaches the base model one task in one language (here under 1% of the model's size).", options: { breakLine: true } },
    { text: "The problem: ", options: { bold: true, color: C.accent2 } }, { text: "when all K slots are full, a new adapter must share a slot with an old one. How should two tasks share one slot?" },
  ], { x: X0 + 0.3, y: 5.32, w: CW - 0.6, h: 1.05, fontSize: 16, valign: "middle", paraSpaceAfter: 6 });
  notes(s, "The phone keeps one base model and small add-ons called LoRA adapters, one per task and language, for example English grammar correction or German summaries. Storage is limited to K adapters. When a new adapter arrives and all slots are full, it has to share a slot. That is the problem K-Merge solves.");
}

// ---- 4. K-Merge
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "The story" });
  s.addText("How K-Merge makes room", { placeholder: "title" });
  const steps = [
    ["magnifying_glass_tilted_left", "1. Compare", "Cosine similarity between the newcomer and every slot (Eq. 5)"],
    ["bullseye", "2. Pick", "Choose the most similar slot"],
    ["artist_palette", "3. Average", "Blend with history weights:\nslot = (n × slot + new) / (n + 1)\nn = tasks already in the slot\n(Eq. 8)"],
  ];
  const cw = 3.55, gap = 0.75, y = 1.6;
  steps.forEach(([img, head, body], i) => {
    const x = X0 + i * (cw + gap);
    card(s, x, y, cw, 3.05);
    iconCircle(s, img, x + 0.25, y + 0.25, 1.05);
    txt(s, head, { x: x + 1.45, y: y + 0.38, w: cw - 1.6, h: 0.75, fontSize: 22, bold: true, fontFace: "Cambria", valign: "middle" });
    txt(s, body, { x: x + 0.3, y: y + 1.5, w: cw - 0.6, h: 1.4, fontSize: 16 });
    if (i < 2) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + cw + 0.13, y: y + 1.25, w: 0.5, h: 0.45, fill: { color: C.accent5 }, line: { color: C.accent5, width: 0 }, objectName: nm("arrow") });
  });
  card(s, X0, 4.95, CW, 1.45, C.background1, { line: { color: C.accent5, width: 1 } });
  txt(s, [
    { text: "Example: ", options: { bold: true } },
    { text: "French grammar arrives. The most similar slot holds English grammar. That slot becomes half English, half French, and both tasks now use the blend.", options: { breakLine: true } },
    { text: "The paper treats a LoRA as its pair of matrices (A, B), so A and B each become half-half; their product then gains cross terms (slide 8).", options: { color: HEX.muted, fontSize: 14 } },
  ], { x: X0 + 0.3, y: 5.05, w: CW - 0.6, h: 1.25, fontSize: 16, valign: "middle", paraSpaceAfter: 4 });
  notes(s, "K-Merge does three things. It compares the new adapter with each stored one using cosine similarity. It picks the most similar slot. Then it averages them, giving weight to how many tasks the slot already holds. For example, if French arrives and English grammar is most similar, the slot becomes half English and half French.");
}

// ---- 5. What Phases 1-2 told us
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "The story" });
  s.addText("What Phases 1–2 already told us", { placeholder: "title" });
  const items = [
    ["0.145", "EN-HI was the most similar pair, yet the result was lopsided: Hindi +0.04 to +0.16, English −0.03 to +0.02"],
    ["rank 4 vs 32", "DE-FR similarity highest at rank 4 (0.134): no net gain. Lowest at rank 32 (0.067): +0.135 combined"],
    ["2 of 3 seeds", "DE-FR merged well as a pair, but EN + DE + FR hurt all three languages"],
    ["layers 17–21", "Analysis 4: keeping French's weights there recovered French from 0.860 to 0.944 (seed 0)"],
  ];
  const cw = 5.85, ch = 1.9, gx = 0.43, gy = 0.3;
  items.forEach(([big, body], i) => {
    const x = X0 + (i % 2) * (cw + gx), y = 1.55 + Math.floor(i / 2) * (ch + gy);
    card(s, x, y, cw, ch);
    txt(s, big, { x: x + 0.3, y: y + 0.2, w: cw - 0.6, h: 0.65, fontSize: 28, bold: true, fontFace: "Cambria", color: C.accent1 });
    txt(s, body, { x: x + 0.3, y: y + 0.9, w: cw - 0.6, h: 0.95, fontSize: 16 });
  });
  iconCircle(s, "open_book", X0 + 0.05, 5.95, 0.75, C.background2);
  txt(s, [{ text: "Lesson so far: ", options: { bold: true } }, { text: "similarity is not the same as compatibility. But why do merges fail, and what is the fix?" }],
    { x: X0 + 1.0, y: 6.0, w: CW - 1.1, h: 0.65, fontSize: 17, valign: "middle" });
  notes(s, "From the earlier phases we knew that similarity does not guarantee a good merge. English and Hindi were the most similar pair but the result was one-sided. At rank 4 the German-French pair's similarity was highest, yet there was no net gain; at rank 32 it was lowest and both languages gained. And Analysis 4 showed that layers 17 to 21 matter for French. The open question was: why do merges fail, and what is the fix?");
}

// ---- 6. WHO or HOW
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "The story" });
  s.addText("Phase 3 asked: WHO or HOW?", { placeholder: "title" });
  txt(s, "Your Insight 3: a failure can come from grouping the wrong tasks (who) or from the averaging rule (how). We tested both, changing one at a time.",
    { x: X0, y: 1.3, w: CW, h: 0.75, fontSize: 17, color: C.text1 });
  const panels = [
    ["compass", "WHO gets merged", C.accent2, ["Better similarity scores", "A global partner rule: the best pair overall, not just for the newcomer", "Even an oracle that uses labelled validation data"]],
    ["books", "HOW the slot is built", C.accent1, ["Keep K-Merge's partner choice", "Smarter merge (RegMean-style)", "Or do not merge at all: share the slot"]],
  ];
  const cw = 5.85;
  panels.forEach(([img, head, col, lines], i) => {
    const x = X0 + i * (cw + 0.43), y = 2.25;
    card(s, x, y, cw, 4.1);
    iconCircle(s, img, x + 0.3, y + 0.3, 1.2);
    txt(s, head, { x: x + 1.7, y: y + 0.45, w: cw - 1.9, h: 0.9, fontSize: 26, bold: true, fontFace: "Cambria", color: col, valign: "middle" });
    txt(s, lines.map((l, j) => ({ text: l, options: { bullet: true, breakLine: j < lines.length - 1 } })), { x: x + 0.4, y: y + 1.8, w: cw - 0.8, h: 2.1, fontSize: 18, paraSpaceAfter: 10 });
  });
  notes(s, "Professor, your Insight 3 said a merge can fail because the wrong tasks are grouped, or because the averaging rule damages them. So we separated the two. On the left, we change who is merged: better similarity, a global choice, even an oracle using labelled data. On the right, we keep the partner and change how the slot is built.");
}

// ============================ SECTION 2: what we did ============================
pres.addSection({ title: "What we did" });

// ---- 7. Three test beds
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "What we did" });
  s.addText("What we built: three test beds", { placeholder: "title" });
  const beds = [
    ["test_tube", "Merge lab (synthetic)", ["Grammar correction (templated errors): EN, DE, FR, HI", "Qwen2.5-0.5B and 1.5B-Instruct", "25 methods, 3 seeds", "Every pair, every set, all 24 arrival orders"]],
    ["globe_with_meridians", "Real benchmark", ["12 real tasks: grammar, summaries, QA", "EN, DE, ES, IT (summaries and QA translated)", "Qwen2.5-1.5B-Instruct, LoRA rank 32 (as in K-Merge)", "11 methods, 2 seeds, K = 2 and 4"]],
    ["high_voltage", "Stress test", ["All 12 real tasks in ONE slot", "Slot of 16, 8 or 4 directions", "How does each method cope with crowding?", "1 seed so far"]],
  ];
  const cw = 3.85, gap = 0.29;
  beds.forEach(([img, head, lines], i) => {
    const x = X0 + i * (cw + gap), y = 1.5;
    card(s, x, y, cw, 4.45);
    iconCircle(s, img, x + (cw - 1.2) / 2, y + 0.2, 1.2);
    txt(s, head, { x: x + 0.25, y: y + 1.5, w: cw - 0.5, h: 0.55, fontSize: 21, bold: true, fontFace: "Cambria", align: "center" });
    txt(s, lines.map((l, j) => ({ text: l, options: { bullet: true, breakLine: j < lines.length - 1 } })), { x: x + 0.3, y: y + 2.15, w: cw - 0.5, h: 2.2, fontSize: 14.5, paraSpaceAfter: 5 });
  });
  txt(s, [{ text: "Built from the papers' equations ", options: { bold: true } }, { text: "(K-Merge's code is not public). All runs on Kaggle's free T4 GPU; every prediction and score was saved." }],
    { x: X0, y: 6.15, w: CW, h: 0.5, fontSize: 15, color: C.text1 });
  notes(s, "We built three test beds. The merge lab uses synthetic grammar errors in four languages and two model sizes, with 25 methods. The real benchmark uses real datasets: learner essays for grammar, dialogue summaries and question answering, in four languages, with the same model and LoRA settings as the K-Merge paper. Summaries and QA in German, Spanish and Italian are machine-translated from English. The stress test forces all 12 tasks into one small slot.");
}

// ---- 8. Why averaging hurts
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "What we did" });
  s.addText("Why averaging hurts", { placeholder: "title" });
  card(s, X0, 1.5, 3.7, 4.75);
  iconCircle(s, "artist_palette", X0 + 0.95, 1.75, 1.8, C.background1);
  txt(s, [{ text: "Like mixing paint", options: { bold: true, breakLine: true, fontSize: 20, fontFace: "Cambria" } }, { text: "Blue + yellow gives green. You cannot get the blue back out. Averaging two adapters works the same way." }],
    { x: X0 + 0.3, y: 3.75, w: 3.1, h: 2.3, fontSize: 16, paraSpaceAfter: 6 });
  const rows = [
    ["Dilution", C.accent2, "Averaging n adapters leaves each task only about 1/n of its own update. The model gets timid and leaves errors unfixed."],
    ["Interference", C.accent3, "The other tasks' updates leak in as noise: wrong edits, changed meaning."],
    ["Cross terms", C.accent6, "K-Merge averages A and B separately, so the product mixes English's B with French's A (and vice versa): changes no task ever learned."],
  ];
  rows.forEach(([head, col, body], i) => {
    const y = 1.5 + i * 1.62;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 4.6, y, w: 8.13, h: 1.42, fill: { color: C.background1 }, line: { color: col, width: 1.5 }, rectRadius: 0.1, objectName: nm("why") });
    txt(s, head, { x: 4.85, y, w: 2.2, h: 1.42, fontSize: 21, bold: true, color: col, fontFace: "Cambria", valign: "middle" });
    txt(s, body, { x: 7.05, y, w: 5.5, h: 1.42, fontSize: 16, valign: "middle" });
  });
  caption(s, "Measured (synthetic pairs, 0.5B): K-Merge left 10.4% of outputs unchanged, sharing 1.6%. Plain averaging of the full updates beat K-Merge's A/B averaging: 94.1% vs 92.4%.", 6.45);
  notes(s, "Why does averaging hurt? Like mixing paint, once two adapters are blended you cannot separate them. Three things go wrong. Dilution: each task keeps only part of its own update, so the model leaves errors unfixed. Interference: other tasks' updates leak in. And K-Merge averages the A and B matrices separately, which creates cross terms that no task learned.");
}

// ---- 9. Our idea: share
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "What we did" });
  s.addText("The fix we test: share the slot, don't blend it", { placeholder: "title" });
  txt(s, [{ text: "A rank-R slot holds R directions (think: R shelves).", options: { bold: true, breakLine: true } }, { text: "Split uses exactly one LoRA's storage; K-Share adds a small core per task (2–8% extra in our runs).", options: { breakLine: true } }, { text: "As in K-Merge, the task is known at inference, so each task reads only its own part." }],
    { x: X0, y: 1.25, w: CW, h: 0.95, fontSize: 16 });
  // split panel
  const py = 2.3, ph = 3.55, pw = 5.85;
  card(s, X0, py, pw, ph);
  txt(s, "Split: each task gets its own shelves", { x: X0 + 0.3, y: py + 0.2, w: pw - 0.6, h: 0.5, fontSize: 18, bold: true, fontFace: "Cambria", color: C.accent4 });
  for (let k = 0; k < 8; k++) {
    const col = k < 4 ? C.accent4 : C.accent3;
    s.addShape(pres.shapes.RECTANGLE, { x: X0 + 0.45 + k * 0.62, y: py + 0.95, w: 0.54, h: 1.0, fill: { color: col }, line: { color: C.background1, width: 1 }, objectName: nm("shelf") });
  }
  txt(s, "Task A's top 4 directions", { x: X0 + 0.4, y: py + 2.05, w: 2.5, h: 0.35, fontSize: 12, bold: true, color: C.accent4, align: "center" });
  txt(s, "Task B's top 4 directions", { x: X0 + 2.88, y: py + 2.05, w: 2.5, h: 0.35, fontSize: 12, bold: true, color: HEX.amber, align: "center" });
  txt(s, "Nothing is mixed. But with more tasks than shelves, some tasks get none.", { x: X0 + 0.3, y: py + 2.55, w: pw - 0.6, h: 0.9, fontSize: 15 });
  // kshare panel
  const kx = X0 + pw + 0.43;
  card(s, kx, py, pw, ph);
  txt(s, "K-Share: shared shelves + a key per task", { x: kx + 0.3, y: py + 0.2, w: pw - 0.6, h: 0.5, fontSize: 18, bold: true, fontFace: "Cambria", color: C.accent1 });
  for (let k = 0; k < 8; k++) {
    s.addShape(pres.shapes.RECTANGLE, { x: kx + 0.45 + k * 0.42, y: py + 0.95, w: 0.36, h: 1.0, fill: { color: C.accent1 }, line: { color: C.background1, width: 1 }, objectName: nm("shared") });
  }
  s.addImage({ path: IMG("key"), x: kx + 4.05, y: py + 0.85, w: 0.6, h: 0.6, objectName: "key-a" , altText: "key illustration" });
  s.addImage({ path: IMG("key"), x: kx + 4.75, y: py + 1.35, w: 0.6, h: 0.6, objectName: "key-b" , altText: "key illustration" });
  txt(s, "core A", { x: kx + 3.9, y: py + 1.5, w: 0.9, h: 0.3, fontSize: 12, color: HEX.muted, align: "center" });
  txt(s, "core B", { x: kx + 4.6, y: py + 2.0, w: 0.9, h: 0.3, fontSize: 12, color: HEX.muted, align: "center" });
  txt(s, "One set of directions serves all tasks; each task keeps a tiny R×R core. Every task keeps something, even in a crowded slot.", { x: kx + 0.3, y: py + 2.55, w: pw - 0.6, h: 0.9, fontSize: 15 });
  caption(s, "Prior work: split is close to TSV-C (CVPR 2025); K-Share is close to JD-Full in Compress then Serve (ICML 2025). New, to our knowledge: testing them inside K-Merge's continual setting.", 6.05);
  notes(s, "Our idea is to share the slot instead of blending it. Think of the slot as a bookcase with R shelves, one per direction. Split gives each task its own shelves with its most important directions, so nothing is mixed. K-Share builds one set of shelves that all tasks can use, plus a tiny personal key for each task. Split uses exactly the storage of one LoRA; K-Share adds a small core per task, 2 to 8 percent extra in our runs. These two building blocks exist in recent papers; what is new, as far as we found, is testing them in K-Merge's continual setting.");
}

// ============================ SECTION 3: results ============================
pres.addSection({ title: "Results" });

// ---- 10. WHO vs HOW chart
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Results" });
  s.addText("Test 1: WHO vs HOW", { placeholder: "title" });
  const o = D.syn05.online4;
  const labels = ["K-Merge (cosine partner + average)", "Global partner rule, same average", "Validation-guided partner (oracle), same average", "Same partner, smarter merge (RegMean-style)", "Same partner, share the slot (K-Share)"];
  const vals = [o["kmerge|kmerge"][1], o["kmerge|global_cos"][1], o["kmerge|oracle"][1], o["gramU|kmerge"][1], o["kshare|kmerge"][1]].map(pct1);
  s.addChart(pres.charts.BAR, [{ name: "Weakest language", labels, values: vals }], chartBase({
    x: X0, y: 1.35, w: 8.3, h: 4.95, barDir: "bar", catAxisOrientation: "maxMin", barGapWidthPct: 45,
    chartColors: [HEX.coral, HEX.lightCoral, HEX.lightCoral, HEX.amber, HEX.teal],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0", valAxisMinVal: 0, valAxisMaxVal: 110, valAxisHidden: true, valGridLine: { style: "none" },
    title: "Weakest language, % of its own adapter", catAxisLabelFontSize: 13,
  }));
  const cx = 9.25, cwid = 3.48;
  card(s, cx, 1.45, cwid, 2.05);
  txt(s, [{ text: "+4.5", options: { bold: true, color: C.accent2, fontSize: 40, fontFace: "Cambria", breakLine: true } }, { text: "best gain from choosing a better partner" }], { x: cx + 0.25, y: 1.55, w: cwid - 0.5, h: 1.85, fontSize: 15 });
  card(s, cx, 3.7, cwid, 2.05);
  txt(s, [{ text: "+17.6", options: { bold: true, color: C.accent1, fontSize: 40, fontFace: "Cambria", breakLine: true } }, { text: "gain from sharing the slot, same partner" }], { x: cx + 0.25, y: 3.8, w: cwid - 0.5, h: 1.85, fontSize: 15 });
  caption(s, "4 languages into K = 2 slots, all 24 arrival orders x 3 seeds, Qwen2.5-0.5B. On 1.5B: K-Merge 96.1, global partner 95.7, oracle 97.2, smarter merge 98.1, sharing 99.4.", 6.45);
  notes(s, "This is the key experiment. We ran K-Merge on all 24 arrival orders, three seeds, and changed one thing at a time. The weakest language with K-Merge keeps 81 percent. A global partner rule gets it to about 86, and even an oracle that uses labelled data reaches only about 85. A smarter merge gets 95. Sharing the slot gets 98.8. So how we store the tasks matters far more than who we merge.");
}

// ---- 11. Why not a better similarity score
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Results" });
  s.addText("Why not a better similarity score?", { placeholder: "title" });
  const items = [
    ["+0.44  →  −0.34", "On 0.5B, more similar pairs were damaged less (ρ = +0.44); on 1.5B, more (ρ = −0.34)"],
    ["11 of 12", "Real tasks the cosine rule packed into ONE slot (K = 2, clustered order, both seeds). There K-Merge kept 89–90%, sharing about 99%"],
    ["≤ 3.7 points", "The most an oracle partner choice with labelled data added to the weakest language"],
    ["4.8%  ·  53.3%", "Kept by a merge that used only LoRA weights as its statistics (0.5B · 1.5B): LoRA's A matrices mostly reflect their random start"],
  ];
  const cw = 5.85, ch = 1.85, gx = 0.43, gy = 0.28;
  items.forEach(([big, body], i) => {
    const x = X0 + (i % 2) * (cw + gx), y = 1.5 + Math.floor(i / 2) * (ch + gy);
    card(s, x, y, cw, ch);
    txt(s, big, { x: x + 0.3, y: y + 0.18, w: cw - 0.6, h: 0.65, fontSize: 30, bold: true, fontFace: "Cambria", color: C.accent2 });
    txt(s, body, { x: x + 0.3, y: y + 0.88, w: cw - 0.6, h: 0.9, fontSize: 15 });
  });
  iconCircle(s, "crystal_ball", X0 + 0.05, 5.82, 0.8, C.background2);
  txt(s, [{ text: "Similarity only picks partners. Averaging does the damage. ", options: { bold: true } }, { text: "We do not claim cosine is useless in general; here it was neither stable nor the lever that mattered." }],
    { x: X0 + 1.05, y: 5.85, w: CW - 1.1, h: 0.75, fontSize: 16, valign: "middle" });
  notes(s, "Why not just find a better similarity measure? Four reasons from our data. First, cosine's relation to damage even changes sign: on the small model, more similar pairs were damaged less; on the larger one, more. Second, on real data, the cosine rule packed 11 of 12 tasks into one slot. Third, an oracle with labelled data added at most 3.7 points. Fourth, a merge that used only the LoRA weights as its statistics kept 4.8 percent on 0.5B and 53 percent on 1.5B, because LoRA's A matrices stay close to their random start.");
}

// ---- 12. Real benchmark
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Results" });
  s.addText("Test 2: 12 real tasks, same slots", { placeholder: "title" });
  const order = ["kmerge", "linear", "dare_ties", "ties", "regmean", "split", "kshare"];
  const names = ["K-Merge", "Plain avg", "DARE+TIES", "TIES", "RegMean", "Split", "K-Share"];
  const cols = [HEX.coral, HEX.grey, HEX.grey, HEX.grey, HEX.amber, HEX.green, HEX.teal];
  const k2 = D.real_K2;
  const common = { barDir: "col", chartColors: cols, showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0", dataLabelFontSize: 12, valAxisMinVal: 0, valAxisMaxVal: 110, valAxisHidden: true, valGridLine: { style: "none" }, barGapWidthPct: 35, catAxisLabelFontSize: 12 };
  s.addChart(pres.charts.BAR, [{ name: "Average", labels: names, values: order.map((m) => pct1(k2[m].mean)) }], chartBase({ x: X0, y: 1.25, w: 6.0, h: 4.2, title: "Average over 12 tasks, % of own adapter", ...common }));
  s.addChart(pres.charts.BAR, [{ name: "Weakest task", labels: names, values: order.map((m) => pct1(k2[m].worst)) }], chartBase({ x: X0 + 6.13, y: 1.25, w: 6.0, h: 4.2, title: "Weakest task, % of own adapter", ...common }));
  card(s, X0, 5.55, CW, 0.78);
  txt(s, [{ text: "Split vs K-Merge: ", options: { bold: true } }, { text: "+8.1 on average, +28.9 on the weakest task.   " }, { text: "Split vs RegMean (best merge): ", options: { bold: true } }, { text: "+3.3 and +16.0.   All p < 0.001 (paired bootstrap, Holm). K = 4 shows the same." }],
    { x: X0 + 0.3, y: 5.55, w: CW - 0.6, h: 0.78, fontSize: 15, valign: "middle" });
  caption(s, "RegMean, TIES, DARE: standard merging methods. Scores: edit F0.5 (grammar), ROUGE-L (summaries), token F1 (QA). K = 2 slots; Qwen2.5-1.5B-Instruct; 2 seeds x 2 arrival orders; every method uses K-Merge's own slot grouping.", 6.42);
  notes(s, "Now real data: 12 tasks, real learner essays, dialogue summaries and questions. All methods use the same slots that K-Merge chose, so only the way of building the slot changes. K-Merge keeps 90.8 percent on average and only 65.7 on its weakest task. The best merging method, RegMean, keeps 95.6 and 78.6. Sharing keeps 98.9 and about 94.6, and split does it with exactly the same storage. RegMean and TIES tie on average at 95.6; the best weakest task among the merges is DARE plus TIES at 83.5. These differences are statistically strong.");
}

// ---- 13. Gain retained
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Results" });
  s.addText("How much of the learning survives", { placeholder: "title" });
  const order = ["kmerge", "linear", "dare_ties", "ties", "regmean", "split", "kshare"];
  const names = ["K-Merge", "Plain average", "DARE + TIES", "TIES", "RegMean (best merge)", "Split (sharing)", "K-Share (sharing)"];
  const g = D.real_gain_retained_mean.K2;
  s.addChart(pres.charts.BAR, [{ name: "Gain kept", labels: names, values: order.map((m) => Math.round(g[m] * 100)) }], chartBase({
    x: X0, y: 1.35, w: 7.6, h: 4.95, barDir: "bar", catAxisOrientation: "maxMin", barGapWidthPct: 40,
    chartColors: [HEX.coral, HEX.grey, HEX.grey, HEX.grey, HEX.amber, HEX.green, HEX.teal],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0"%"', valAxisMinVal: 0, valAxisMaxVal: 115, valAxisHidden: true, valGridLine: { style: "none" },
    title: "Share of each task's gain over the base model that survives (K = 2)",
  }));
  const bt = D.real_gain_retained_K2_by_type;
  card(s, 8.55, 1.45, 4.18, 2.35);
  txt(s, [{ text: "Grammar correction", options: { bold: true, breakLine: true } }, { text: `${Math.round(bt.kmerge.gec * 100)}%`, options: { bold: true, color: C.accent2, fontSize: 36, fontFace: "Cambria" } }, { text: "  K-Merge", options: { fontSize: 14, breakLine: true } }, { text: `${Math.round(bt.kshare.gec * 100)}–${Math.round(bt.split.gec * 100)}%`, options: { bold: true, color: C.accent1, fontSize: 36, fontFace: "Cambria" } }, { text: "  sharing", options: { fontSize: 14 } }],
    { x: 8.8, y: 1.6, w: 3.75, h: 2.1, fontSize: 17, valign: "middle" });
  card(s, 8.55, 4.0, 4.18, 2.3, C.background1, { line: { color: C.accent5, width: 1 } });
  txt(s, [{ text: "Why this measure? ", options: { bold: true } }, { text: "The base model alone already reaches 79% of the adapters' scores, so \"% of own adapter\" flatters every method. Counting only the gain shows the real gap." }],
    { x: 8.8, y: 4.12, w: 3.75, h: 2.05, fontSize: 15 });
  caption(s, "Gain kept = (score after building the slot − base model) / (own adapter − base model), averaged over tasks, seeds and orders. Computed afterwards from the saved scores.", 6.45);
  notes(s, "Here is a fairer way to see it. The base model without any adapter already gets 79 percent of the adapters' scores, so percentages of the own adapter look high for everyone. If we count only what the adapters added, K-Merge keeps 64 percent of it and sharing 96. For grammar correction, K-Merge keeps only 36 percent of the learning, sharing 93 to 94.");
}

// ---- 14. Same sentence, different method
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Results" });
  s.addText("Same sentence, different method", { placeholder: "title" });
  const H = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text1 }, fontSize: 14 } });
  const bad = (t) => ({ text: t, options: { color: C.accent2, bold: true } });
  const good = (t) => ({ text: t, options: { color: C.accent1, bold: true } });
  const p = (t) => ({ text: t });
  const cell = (runs, extra = {}) => ({ text: runs, options: { fontSize: 13, valign: "middle", ...extra } });
  const rows = [
    [H("Lang"), H("Learner sentence"), H("K-Merge output"), H("K-Share output")],
    [cell([p("EN")], { bold: true }), cell([p("… soon and I'll be "), bad("capable of talking"), p(" to you about this experience.")]), cell([p("… soon, and I'll be "), bad("capable of talking"), p(" to you about this experience.")]), cell([p("… soon and I'll be "), good("able to talk"), p(" to you about this experience.")])],
    [cell([p("DE")], { bold: true }), cell([p("Wie oft hat die heutige Jugend "), bad("diese Satz"), p(" gehört?")]), cell([p("Wie oft hat die heutige Jugend "), bad("diese Satz"), p(" gehört?  (unchanged)")]), cell([p("Wie oft hat die heutige Jugend "), good("diesen Satz"), p(" gehört?")])],
    [cell([p("ES")], { bold: true }), cell([p("El "), bad("dia"), p(" era muy terrible y yo estaba muy triste.")]), cell([p("El día era muy "), bad("triste"), p(" y yo estaba muy triste.  (meaning changed)")]), cell([p("El "), good("día"), p(" era muy terrible y yo estaba muy triste.")])],
    [cell([p("IT")], { bold: true }), cell([p("Mi piace "), bad("di"), p(" rivedervi e "), bad("di"), p(" festeggiare insieme.")]), cell([p("Mi piace "), bad("di"), p(" rivedervi e "), bad("di"), p(" festeggiare insieme.  (unchanged)")]), cell([p("Mi piace "), good("rivedervi"), p(" e "), good("festeggiare"), p(" insieme.")])],
  ];
  s.addTable(rows, { x: X0, y: 1.35, w: CW, colW: [0.75, 3.85, 3.9, 3.63], fontFace: "Calibri", color: HEX.ink, border: { type: "solid", pt: 0.75, color: "D5DCE3" }, fill: { color: HEX.white }, rowH: [0.45, 0.95, 0.8, 0.8, 0.8], margin: 0.08, objectName: "examples" });
  card(s, X0, 5.4, CW, 0.9);
  txt(s, [{ text: "Fully correct sentences (all 4 grammar tasks, K = 2):  ", options: { bold: true } }, { text: "own adapter 34.6%  ·  K-Share 33.9%  ·  RegMean 28.9%  ·  " }, { text: "K-Merge 24.1%", options: { color: C.accent2, bold: true } }],
    { x: X0 + 0.3, y: 5.4, w: CW - 0.6, h: 0.9, fontSize: 16, valign: "middle" });
  caption(s, "Real learner sentences (W&I+LOCNESS, Falko-MERLIN, COWS-L2H, MERLIN) from the run where 11 tasks share one slot (seed 0). Examples chosen to illustrate; the rates are the evidence.", 6.45);
  notes(s, "Here are real learner sentences. In German, K-Merge leaves 'diese Satz' unchanged; K-Share writes 'diesen Satz'. In Spanish, K-Merge even changes the meaning: 'terrible' becomes 'triste'. These are examples I picked to show the problem, so the rate at the bottom is what counts: K-Merge fully fixes 24 percent of sentences, K-Share 34, almost the same as each task's own adapter.");
}

// ---- 15. Stress test
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Results" });
  s.addText("Test 3: one slot, all 12 tasks", { placeholder: "title" });
  const r = ["4", "8", "16"];
  const st = D.stress.mean;
  const ser = [["K-Share", "kshare"], ["Split", "split"], ["RegMean", "regmean"], ["K-Merge", "kmerge"]].map(([n, k]) => ({ name: n, labels: r, values: st[k].map(pct1) }));
  s.addChart(pres.charts.LINE, ser, chartBase({
    x: X0, y: 1.35, w: 7.7, h: 4.95, chartColors: [HEX.teal, HEX.green, HEX.amber, HEX.coral], lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 9,
    valAxisMinVal: 80, valAxisMaxVal: 100, valAxisMajorUnit: 5, valAxisLabelFormatCode: "0",
    showValAxisTitle: true, valAxisTitle: "average over 12 tasks, % of own adapter", valAxisTitleFontSize: 12, valAxisTitleColor: HEX.muted,
    showCatAxisTitle: true, catAxisTitle: "directions (rank) available in the one slot", catAxisTitleFontSize: 12, catAxisTitleColor: HEX.muted,
    showLegend: true, legendPos: "b", title: "When tasks outnumber directions, split collapses; K-Share holds (1 seed)",
  }));
  const cx = 8.6, cwid = 4.13;
  const call = [
    [[{ text: "94.4%", options: { bold: true, color: C.accent1, fontSize: 30, fontFace: "Cambria", breakLine: true } }, { text: "K-Share with only 4 directions. More room did less for the others: split 91.0% with 8; RegMean 92.0% and K-Merge 88.4% with 16." }]],
    [[{ text: "+7.3 points", options: { bold: true, color: C.accent1, fontSize: 26, fontFace: "Cambria", breakLine: true } }, { text: "At 4 directions: K-Share 94.4%, split 87.1%.", options: { breakLine: true } }, { text: "p < 0.001. At 16 directions they tie." }]],
    [[{ text: "87.6% vs 64.8%", options: { bold: true, color: C.accent1, fontSize: 24, fontFace: "Cambria", breakLine: true } }, { text: "Weakest task, 8 directions:", options: { breakLine: true } }, { text: "K-Share vs K-Merge" }]],
  ];
  const hs = [1.95, 1.45, 1.35];
  let y = 1.4;
  call.forEach(([runs], i) => {
    card(s, cx, y, cwid, hs[i]);
    txt(s, runs, { x: cx + 0.25, y: y + 0.1, w: cwid - 0.5, h: hs[i] - 0.2, fontSize: 14, valign: "middle" });
    y += hs[i] + 0.15;
  });
  caption(s, "Stress test: Qwen2.5-1.5B, seed 0 only (seeds 1–2 are next). K-Share's extra storage here: 2% at 4 directions, 3.9% at 8, 7.9% at 16.", 6.45);
  notes(s, "In the stress test all 12 real tasks must live in a single slot. With only 4 directions, split has to give 8 tasks nothing, so it collapses. K-Share still keeps 94.4 percent, which is better than split with twice the room and better than RegMean and K-Merge with four times the room. This is one seed so far, so we will repeat it.");
}

// ---- 16. More tasks per slot
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Results" });
  s.addText("More tasks per slot: averaging falls apart", { placeholder: "title" });
  const M = ["2", "3", "4"];
  const cap = D.syn05.capacity_worst;
  const ser = [["K-Share", "kshare"], ["Split", "split"], ["RegMean", "regmean_cf"], ["K-Merge", "kmerge"]].map(([n, k]) => ({ name: n, labels: M, values: cap[k].map(pct1) }));
  s.addChart(pres.charts.LINE, ser, chartBase({
    x: X0, y: 1.35, w: 7.7, h: 4.95, chartColors: [HEX.teal, HEX.green, HEX.amber, HEX.coral], lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 9,
    valAxisMinVal: 60, valAxisMaxVal: 100, valAxisMajorUnit: 10, valAxisLabelFormatCode: "0",
    showValAxisTitle: true, valAxisTitle: "weakest language, % of own adapter", valAxisTitleFontSize: 12, valAxisTitleColor: HEX.muted,
    showCatAxisTitle: true, catAxisTitle: "tasks sharing one slot", catAxisTitleFontSize: 12, catAxisTitleColor: HEX.muted,
    showLegend: true, legendPos: "b", title: "Synthetic grammar correction, Qwen2.5-0.5B, 3 seeds",
  }));
  const cx = 8.6, cwid = 4.13;
  card(s, cx, 1.4, cwid, 2.15);
  txt(s, [{ text: "88.2 → 70.2", options: { bold: true, color: C.accent2, fontSize: 30, fontFace: "Cambria", breakLine: true } }, { text: "K-Merge's weakest language as the slot grows from 2 to 4 tasks. Sharing stays at 97.5% or more." }],
    { x: cx + 0.25, y: 1.5, w: cwid - 0.5, h: 1.95, fontSize: 15, valign: "middle" });
  card(s, cx, 3.7, cwid, 1.25);
  txt(s, [{ text: "1.5B weakest language: ", options: { bold: true } }, { text: "K-Merge 91.6% vs K-Share 99.3% with 4 tasks in a slot." }], { x: cx + 0.25, y: 3.75, w: cwid - 0.5, h: 1.15, fontSize: 15, valign: "middle" });
  card(s, cx, 5.1, cwid, 1.2, C.background1, { line: { color: C.accent5, width: 1 } });
  txt(s, [{ text: "Your RQ2: ", options: { bold: true } }, { text: "pairs that merge well do not compose under averaging; under sharing they do." }], { x: cx + 0.25, y: 5.15, w: cwid - 0.5, h: 1.1, fontSize: 15, valign: "middle" });
  notes(s, "This answers your question about pairwise versus set-wise merging. As more tasks share one slot, K-Merge's weakest language falls from 88 to 70 percent. RegMean falls more slowly. Split and K-Share stay at about 97.5 to 99 percent. So averaging does not compose, but sharing does.");
}

// ---- 17. Layer-selective lesson
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Results" });
  s.addText("Lesson: layer-selective merging", { placeholder: "title" });
  const cats = ["0.5B average", "0.5B weakest", "1.5B average", "1.5B weakest"];
  const km = [D.syn05.pairs.kmerge[0], D.syn05.pairs.kmerge[1], D.syn15.pairs.kmerge[0], D.syn15.pairs.kmerge[1]].map(pct1);
  const ls = [D.syn05.pairs.layer_sel[0], D.syn05.pairs.layer_sel[1], D.syn15.pairs.layer_sel[0], D.syn15.pairs.layer_sel[1]].map(pct1);
  s.addChart(pres.charts.BAR, [{ name: "K-Merge (merge every layer)", labels: cats, values: km }, { name: "Layer-selective (keep stored adapter in conflicting layers)", labels: cats, values: ls }], chartBase({
    x: X0, y: 1.35, w: 7.7, h: 4.95, barDir: "col", chartColors: [HEX.coral, HEX.purple], barGapWidthPct: 60,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0", dataLabelFontSize: 12, valAxisMinVal: 0, valAxisMaxVal: 110, valAxisHidden: true, valGridLine: { style: "none" },
    showLegend: true, legendPos: "b", legendFontSize: 12, title: "6 language pairs x 3 seeds, % of own adapter",
  }));
  const cx = 8.6, cwid = 4.13;
  const lines = [
    [{ text: "Analysis 4 measured French only. ", options: { bold: true } }, { text: "Here we measured both languages: the protected one recovers, the other pays." }],
    [{ text: "The gap between the two languages grew: ", options: { bold: true } }, { text: "8.3 → 15.3 points (0.5B), 1.7 → 11.4 (1.5B). Worst pair, EN-HI (1.5B): 54%." }],
    [{ text: "Conflict layers move ", options: { bold: true } }, { text: "with model and pair (1.5B: layer 27 for DE-FR, layer 8 for EN-FR)." }],
  ];
  let y = 1.4;
  lines.forEach((runs, i) => {
    card(s, cx, y, cwid, 1.45);
    txt(s, runs, { x: cx + 0.25, y: y + 0.08, w: cwid - 0.5, h: 1.3, fontSize: 14, valign: "middle" });
    y += 1.6;
  });
  txt(s, [{ text: "Use layer analysis as a probe (your RQ5), not as a merge rule.", options: { bold: true, color: C.accent1 } }], { x: cx, y: 6.2, w: cwid, h: 0.4, fontSize: 15 });
  notes(s, "This result changed our plan. After Analysis 4 we proposed merging only some layers. In the lab we tested that idea on 6 pairs, 3 seeds, both models, and we measured both languages. It loses to plain K-Merge, because protecting one language in those layers takes them away from the other. So the layer analysis is a good diagnostic tool, as your RQ5 says, but not a merging method.");
}

// ============================ SECTION 4: what it means ============================
pres.addSection({ title: "What it means" });

// ---- 18. How sure are we
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "What it means" });
  s.addText("How sure are we?", { placeholder: "title" });
  card(s, X0, 1.4, 4.6, 4.95);
  iconCircle(s, "microscope", X0 + 0.3, 1.6, 1.1, C.background1);
  txt(s, "Three safeguards", { x: X0 + 1.6, y: 1.75, w: 2.9, h: 0.8, fontSize: 21, bold: true, fontFace: "Cambria", valign: "middle" });
  const guards = [
    ["Paired bootstrap: ", "re-score every method on resampled test examples, 2,000 times (real data) or 4,000 (synthetic); the 95% interval is the middle 95% of those re-scores."],
    ["Holm correction: ", "stricter p-values because we make many comparisons."],
    ["Fair setup: ", "same slots for every method; tuning only on validation data (synthetic lab); every prediction saved."],
  ];
  txt(s, guards.map(([a, b], j) => [{ text: a, options: { bold: true, bullet: true } }, { text: b, options: { breakLine: j < guards.length - 1 } }]).flat(), { x: X0 + 0.3, y: 2.85, w: 4.0, h: 3.35, fontSize: 15, paraSpaceAfter: 10 });
  const Hc = (t) => ({ text: t, options: { bold: true, color: HEX.white, fill: { color: HEX.ink }, fontSize: 14 } });
  const c = (t, o = {}) => ({ text: t, options: { fontSize: 14, valign: "middle", ...o } });
  const rows = [
    [Hc("Comparison"), Hc("Gain, points (95% CI)"), Hc("p")],
    [c("Split − K-Merge, average (real, K = 2)"), c("+8.1  (+6.3 to +9.8)", { bold: true, color: HEX.teal }), c("< 0.001")],
    [c("Split − K-Merge, weakest task"), c("+28.9  (+19.3 to +37.7)", { bold: true, color: HEX.teal }), c("< 0.001")],
    [c("Split − RegMean, average (real, K = 2)"), c("+3.3  (+1.8 to +4.6)", { bold: true, color: HEX.teal }), c("< 0.001")],
    [c("K-Share − split, 4 directions (stress, 1 seed)"), c("+7.3  (+5.2 to +9.2)", { bold: true, color: HEX.teal }), c("< 0.001")],
    [c("K-Share − split, real benchmark"), c("+0.0  (−0.4 to +0.5)"), c("1.0 (tie)")],
  ];
  s.addTable(rows, { x: 5.55, y: 1.4, w: 7.18, colW: [3.5, 2.48, 1.2], fontFace: "Calibri", color: HEX.ink, border: { type: "solid", pt: 0.75, color: "D5DCE3" }, rowH: 0.62, margin: 0.08, objectName: "proof-table" });
  txt(s, "On synthetic pairs (0.5B) K-Share fixed 270 sentences that K-Merge got wrong and lost 21 (McNemar p < 0.001).", { x: 5.55, y: 5.4, w: 7.18, h: 0.8, fontSize: 14, color: C.text1 });
  notes(s, "How sure are we? We used a paired bootstrap: we re-scored all methods on resampled test examples, 2,000 times on real data and 4,000 on synthetic data, and the confidence intervals come from that. We corrected the p-values for many comparisons. The main gains have intervals far from zero. One honest point: on the main real benchmark, K-Share and split tie, so K-Share's extra value shows only in crowded slots.");
}

// ---- 19. New vs known
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "What it means" });
  s.addText("What is new, and what is not", { placeholder: "title" });
  const cw = 5.85;
  card(s, X0, 1.4, cw, 4.6);
  iconCircle(s, "open_book", X0 + 0.3, 1.6, 0.95, C.background1);
  txt(s, "Already known (we cite it)", { x: X0 + 1.4, y: 1.7, w: cw - 1.6, h: 0.75, fontSize: 21, bold: true, fontFace: "Cambria", valign: "middle" });
  const known = ["Split ≈ TSV-C (Gargiulo et al., CVPR 2025)", "K-Share ≈ JD-Full (Compress then Serve, ICML 2025)", "Our GRAM merge ≈ RegMean (ICLR 2023)", "Per-task pieces: TALL masks, EMR-Merging (2024)"];
  txt(s, known.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < known.length - 1 } })), { x: X0 + 0.35, y: 2.75, w: cw - 0.7, h: 3.0, fontSize: 16, paraSpaceAfter: 10 });
  const nx = X0 + cw + 0.43;
  card(s, nx, 1.4, cw, 4.6, C.text1);
  iconCircle(s, "light_bulb", nx + 0.3, 1.6, 0.95, C.background1);
  txt(s, "New, to our knowledge", { x: nx + 1.4, y: 1.7, w: cw - 1.6, h: 0.75, fontSize: 21, bold: true, fontFace: "Cambria", color: C.background1, valign: "middle" });
  const fresh = ["Sharing beats every merge we tested in K-Merge's setting on real tasks; split at exactly equal storage", "The WHO-vs-HOW test that separates partner choice from the slot rule", "The crowding map: split collapses, K-Share holds (1 seed so far)", "A diagnosis of why K-Merge fails: A/B averaging, lopsided slots, dilution + interference", "Weight-only statistics failed in our LoRA merges (4.8% on 0.5B, 53.3% on 1.5B), consistent with Zhu et al. 2024"];
  txt(s, fresh.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < fresh.length - 1 } })), { x: nx + 0.35, y: 2.75, w: cw - 0.7, h: 3.1, fontSize: 15, color: C.background1, paraSpaceAfter: 7 });
  txt(s, [{ text: "Scope: ", options: { bold: true } }, { text: "real-data slots were rebuilt from the original adapters; strictly online sharing was tested only in the synthetic lab. ", options: { breakLine: true } }, { text: "Our own method candidates ", options: { bold: true } }, { text: "(K-Share+ with shared and private directions; K-Share-fair) are designed but not yet tested on GPU." }], { x: X0, y: 6.1, w: CW, h: 0.75, fontSize: 14 });
  notes(s, "To be honest about novelty: splitting the slot and the shared basis already exist in 2025 papers, and our GRAM merge turned out to be essentially RegMean. What is new, as far as we found, is showing this inside K-Merge's continual setting on real tasks, with split at exactly equal storage, the who-versus-how test, the crowding map, and the diagnosis of why K-Merge fails. Our own new methods are designed but not tested yet.");
}

// ---- 20. Limits
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "What it means" });
  s.addText("Limits we must state", { placeholder: "title" });
  const lim = [
    "Stress test: 1 seed. Real benchmark: 2 seeds.",
    "One model family (Qwen2.5), 0.5B and 1.5B.",
    "12 tasks; the K-Merge paper used 40.",
    "Summaries and QA in DE/ES/IT are machine-translated; Hindi only in the synthetic lab.",
    "Grammar metric approximates ERRANT (edit-level F0.5).",
    "As in K-Merge, task identity is assumed known at inference.",
    "K-Share stores 2–8% extra (14.5% in an 11-task slot); split stores nothing extra.",
    "Real-data slots were rebuilt from the original adapters; strictly online sharing was tested only in the lab.",
  ];
  const cw = 5.85, ch = 0.98, gx = 0.43, gy = 0.15;
  lim.forEach((t, i) => {
    const x = X0 + (i % 2) * (cw + gx), y = 1.45 + Math.floor(i / 2) * (ch + gy);
    card(s, x, y, cw, ch);
    s.addImage({ path: IMG("warning"), x: x + 0.2, y: y + (ch - 0.55) / 2, w: 0.55, h: 0.55, objectName: nm("warn") , altText: "warning illustration" });
    txt(s, t, { x: x + 0.95, y, w: cw - 1.15, h: ch, fontSize: 15, valign: "middle" });
  });
  card(s, X0, 5.95, CW, 0.92, C.background1, { line: { color: C.accent2, width: 1.25 } });
  txt(s, [{ text: "Two corrections. ", options: { bold: true, color: C.accent2 } }, { text: "(1) Earlier notes put K-Share's extra storage at about 1–3%; that holds only at 4 directions (2.0%), and it grows with tasks × directions. (2) The Phase 2 report's text says English lost in 2 of 3 EN-HI seeds; its own table shows 1 of 3 (seed 0: −0.028)." }],
    { x: X0 + 0.25, y: 5.98, w: CW - 0.5, h: 0.86, fontSize: 13.5, valign: "middle" });
  notes(s, "These are the limits. The stress test has one seed and the real benchmark two. We used one model family. We have 12 tasks while the K-Merge paper had 40. Some data are machine-translated. And K-Share needs a little extra storage: 2 to 8 percent overall, and up to 14.5 percent in the most crowded slot, while split needs none. I also correct two earlier statements. I said K-Share costs 1 to 3 percent; that is true only at 4 directions. And the Phase 2 report says English lost in 2 of 3 EN-HI seeds, but its own table shows a loss in 1 of 3.");
}

// ============================ SECTION 5: next ============================
pres.addSection({ title: "What's next" });

// ---- 21. What is left
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "What's next" });
  s.addText("What is left (about 17–19 GPU hours)", { placeholder: "title" });
  const Hc = (t) => ({ text: t, options: { bold: true, color: HEX.white, fill: { color: HEX.ink }, fontSize: 14 } });
  const c = (t, o = {}) => ({ text: t, options: { fontSize: 14, valign: "middle", ...o } });
  const rows = [
    [Hc("Experiment"), Hc("Why"), Hc("GPU"), Hc("Status")],
    [c("Stress test, seeds 1 and 2"), c("Crowding result has 1 seed"), c("~5 h"), c("Ready", { color: HEX.teal, bold: true })],
    [c("Real benchmark, seed 2"), c("Third seed for main claims"), c("~4.5 h"), c("Ready", { color: HEX.teal, bold: true })],
    [c("Pilot of our own methods"), c("Could become our method"), c("~1 h"), c("In progress")],
    [c("Storage-exact K-Share, real data"), c("Equal-storage proof"), c("< 1 h"), c("Small change")],
    [c("Llama-3.2-1B (K-Merge's other model)"), c("Beyond one model family"), c("~5 h"), c("Small change")],
    [c("KnOTS baseline, real data"), c("Reviewers will ask"), c("< 1 h"), c("Code exists")],
    [c("Analysis 4 on 3 seeds"), c("Close Phase 2 item"), c("~1 h"), c("Not started")],
  ];
  s.addTable(rows, { x: X0, y: 1.4, w: 8.6, colW: [3.5, 2.85, 0.95, 1.3], fontFace: "Calibri", color: HEX.ink, border: { type: "solid", pt: 0.75, color: "D5DCE3" }, rowH: 0.56, margin: 0.08, objectName: "left-table" });
  card(s, 9.55, 1.4, 3.18, 4.5);
  iconCircle(s, "clipboard", 10.5, 1.6, 1.15, C.background1);
  txt(s, [{ text: "Also open", options: { bold: true, breakLine: true, fontSize: 18, fontFace: "Cambria" } }, { text: "On-device cost (phone)", options: { bullet: true, breakLine: true } }, { text: "Real Hindi grammar data", options: { bullet: true, breakLine: true } }, { text: "Phase 1 checks (your items 20–21)", options: { bullet: true, breakLine: true } }, { text: "Update your Google Doc", options: { bullet: true, breakLine: true } }, { text: "Paper draft", options: { bullet: true } }],
    { x: 9.8, y: 2.95, w: 2.75, h: 2.85, fontSize: 15, paraSpaceAfter: 4 });
  caption(s, "Kaggle's free quota is 30 GPU hours a week, so the GPU work fits in one week; we plan it over two weeks to leave room for reruns.", 6.05);
  notes(s, "This is what is left. About 17 to 19 GPU hours, which fits in one week of Kaggle's free quota; I plan it over two weeks so there is room to rerun anything that fails. First the extra seeds, then a pilot of our own new methods, then a second model family, Llama, which K-Merge also used. There are also a few open items: on-device cost, real Hindi data, the Phase 1 checks you asked for, and adding everything to your Google Doc.");
}

// ---- 22. Next four weeks
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "What's next" });
  s.addText("The next four weeks", { placeholder: "title" });
  const steps = [
    ["Week 1", "After the GPU quota resets", ["Stress seeds 1–2", "Real seed 2", "Pilot of our methods", "Storage-exact K-Share"]],
    ["Week 2", "Generality", ["Llama-3.2-1B run", "KnOTS baseline", "Analysis 4 on 3 seeds"]],
    ["Weeks 3–4", "Write-up and device test", ["On-device timing", "Paper draft", "Update your Google Doc"]],
  ];
  s.addShape(pres.shapes.LINE, { x: X0 + 0.6, y: 2.25, w: CW - 1.2, h: 0, line: { color: C.accent5, width: 2 }, objectName: "timeline" });
  const cw = 3.85, gap = 0.29;
  steps.forEach(([wk, sub, items], i) => {
    const x = X0 + i * (cw + gap);
    s.addShape(pres.shapes.OVAL, { x: x + cw / 2 - 0.3, y: 1.95, w: 0.6, h: 0.6, fill: { color: i === 0 ? C.accent1 : C.background1 }, line: { color: C.accent1, width: 2.5 }, objectName: nm("milestone") });
    card(s, x, 2.85, cw, 3.4);
    txt(s, wk, { x: x + 0.3, y: 3.0, w: cw - 0.6, h: 0.55, fontSize: 24, bold: true, fontFace: "Cambria", color: C.accent1 });
    txt(s, sub, { x: x + 0.3, y: 3.55, w: cw - 0.6, h: 0.4, fontSize: 14, italic: true, color: C.accent5 });
    txt(s, items.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < items.length - 1 } })), { x: x + 0.3, y: 4.05, w: cw - 0.6, h: 2.05, fontSize: 18, paraSpaceAfter: 6 });
  });
  notes(s, "The plan for the next four weeks. Week one, when the GPU quota resets: the extra seeds and a pilot of our own methods. Week two: a second model family and the remaining baselines. Weeks three and four: on-device timing, the paper draft, and putting all results into your Google Doc.");
}

// ---- 23. Bigger ideas
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "What's next" });
  s.addText("Bigger ideas for new studies", { placeholder: "title" });
  card(s, X0, 1.4, CW, 1.75, C.accent1);
  iconCircle(s, "rocket", X0 + 0.3, 1.6, 1.3, C.background1);
  txt(s, [{ text: "A. How many tasks can one slot hold?", options: { bold: true, fontSize: 22, fontFace: "Cambria", breakLine: true } }, { text: "A capacity rule from directions per task and task overlap. It changes the question from \"which adapters are similar?\" to \"how much room does each task need?\"" }],
    { x: X0 + 1.85, y: 1.48, w: CW - 2.1, h: 1.6, fontSize: 16, color: C.background1, valign: "middle" });
  const ideas = [
    ["B. Truly on-device sharing", "Keep only the slot, never the originals; test long streams of 40+ tasks for drift."],
    ["C. No task label needed", "Pick each request's core with the shared basis itself (builds on Arrow routing, ICML 2024)."],
    ["D. A compatibility score", "Predict which tasks can share from a few unlabelled inputs. Best so far: input distortion, Spearman ρ ≈ 0.43–0.50 across methods; weak for K-Merge alone."],
    ["E. Real phone test", "Measure memory and latency on a real Android phone: does sharing stay cheap in practice?"],
  ];
  const cw = (CW - 3 * 0.25) / 4;
  ideas.forEach(([h, b], i) => {
    const x = X0 + i * (cw + 0.25);
    card(s, x, 3.4, cw, 2.95);
    txt(s, h, { x: x + 0.22, y: 3.55, w: cw - 0.44, h: 0.85, fontSize: 17, bold: true, fontFace: "Cambria", color: C.accent1 });
    txt(s, b, { x: x + 0.22, y: 4.4, w: cw - 0.44, h: 1.85, fontSize: 15 });
  });
  notes(s, "Beyond these checks, five ideas could each become a new study. The one I find most important is A: instead of asking which adapters are similar, ask how much room each task needs in a slot, and find a rule for it. The others: truly on-device sharing without keeping the original adapters, removing the need to know the task label, a better compatibility score, and a real phone test.");
}

// ---- 24. Closing
{
  const s = pres.addSlide({ masterName: "CLOSING_DARK", sectionTitle: "What's next" });
  s.addText("Thank you: what I would like from you", { placeholder: "title" });
  const asks = [
    ["compass", "Direction", "Which study (A–E) should come first?"],
    ["laptop", "Compute", "More GPU hours or lab GPU access for seeds and Llama"],
    ["memo", "Google Doc", "Edit access, so I can add these results"],
    ["globe_with_meridians", "Hindi data", "Help reaching authors of a Hindi grammar corpus"],
  ];
  const cw = (CW - 3 * 0.3) / 4;
  asks.forEach(([img, h, b], i) => {
    const x = X0 + i * (cw + 0.3);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.75, w: cw, h: 3.2, fill: { color: "13304A" }, line: { color: "13304A", width: 0 }, rectRadius: 0.12, objectName: nm("ask") });
    iconCircle(s, img, x + (cw - 1.1) / 2, 1.95, 1.1, C.background1);
    txt(s, h, { x: x + 0.2, y: 3.2, w: cw - 0.4, h: 0.5, fontSize: 20, bold: true, fontFace: "Cambria", color: C.background1, align: "center" });
    txt(s, b, { x: x + 0.2, y: 3.75, w: cw - 0.4, h: 1.05, fontSize: 15, color: C.background2, align: "center" });
  });
  txt(s, [{ text: "Don't average, share.", options: { bold: true, color: C.accent1, fontSize: 24, breakLine: true } }, { text: "Split keeps 98.9% vs K-Merge's 90.8% on 12 real tasks, with exactly the same storage." }], { x: X0, y: 5.2, w: CW, h: 0.95, fontSize: 19, color: C.background1, fontFace: "Cambria", paraSpaceAfter: 2 });
  txt(s, "Full report with every number, chart and source: \"K-Merge Phase 3: Share the Slot, Don't Average It\".", { x: X0, y: 6.3, w: CW, h: 0.4, fontSize: 14, color: C.background2 });
  notes(s, "Thank you, Ma'am. I would like your guidance on four things: which new study to start first, whether more GPU time is possible, edit access to your Google Doc, and help contacting authors of a Hindi grammar corpus. The full report has every number, chart and source.");
}

// ---- 25. References
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "What's next" });
  s.addText("References", { placeholder: "title" });
  const refs = [
    "Shenaj et al. K-Merge: Online Continual Merging of Adapters for On-device Large Language Models. ACL 2026 (arXiv 2510.13537)",
    "Hu et al. LoRA: Low-Rank Adaptation of Large Language Models. ICLR 2022",
    "Gargiulo et al. Task Singular Vectors: Reducing Task Interference in Model Merging. CVPR 2025",
    "Brüel-Gabrielsson et al. Compress then Serve: Serving Thousands of LoRA Adapters with Little Overhead. ICML 2025",
    "Jin et al. Dataless Knowledge Fusion by Merging Weights of Language Models (RegMean). ICLR 2023",
    "Yadav et al. TIES-Merging. NeurIPS 2023  ·  Yu et al. DARE. ICML 2024  ·  Ilharco et al. Task Arithmetic. ICLR 2023",
    "Huang et al. EMR-Merging. NeurIPS 2024  ·  Wang et al. TALL masks. ICML 2024  ·  Marczak et al. Iso-C. ICML 2025",
    "Stoica et al. KnOTS. ICLR 2025  ·  Marczak et al. MagMax. ECCV 2024  ·  Cheng et al. WUDI. ICML 2025",
    "Zhu et al. Asymmetry in Low-Rank Adapters of Foundation Models. ICML 2024",
    "Ostapenko et al. Towards Modular LLMs by Building and Reusing a Library of LoRAs (Arrow). ICML 2024",
    "Data: W&I+LOCNESS (BEA-2019), Falko-MERLIN, COWS-L2H, MERLIN, SAMSum, SQuAD; OPUS-MT translation; base models Qwen2.5-0.5B/1.5B-Instruct",
    "Our earlier work: Phase 1 report; Phase 2 report (K_Merge_Phase2_Report_Pro)",
  ];
  txt(s, refs.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < refs.length - 1 } })), { x: X0, y: 1.35, w: 10.2, h: 4.95, fontSize: 14, paraSpaceAfter: 5 });
  iconCircle(s, "books", 11.05, 1.5, 1.6, C.background2);
  caption(s, "3D illustrations: Microsoft Fluent Emoji (MIT License). Charts and tables: our Kaggle runs (merge lab v4–v5, real benchmark v8).", 6.45);
  notes(s, "These are the main references, with the datasets used.");
}

(async () => {
  const out = path.join(HERE, "K_Merge_Phase3_Explainer.pptx");
  await pres.writeFile({ fileName: out });
  await setTheme(out, THEME);
  console.log("wrote", out);
})();
