// K-Merge geometry study deck: "How Much Is Really New?" (pptxgenjs, structured deck, same theme as Phase 3)
const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");
const { setTheme } = require("../theme.js");

const HERE = __dirname;
const IMG = (n) => path.join(HERE, "..", "img", n + "_3d.png");
const D = JSON.parse(fs.readFileSync(path.join(HERE, "deck_data.json"), "utf8"));

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
  lightCoral: "E8A0A8", white: "FFFFFF", slate: "8A96A3",
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
pres.author = "Ankit Raj Choudhary";
pres.title = "How Much Is Really New? LoRA geometry and K-Merge";
pres.subject = "Geometry study for Prof. Divya Saxena, IIT Jodhpur";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;
const W = 13.333, X0 = 0.6, CW = W - 2 * X0;

// ---------------- layouts ----------------
pres.defineSlideMaster({
  title: "TITLE_DARK",
  background: { color: HEX.navy },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: X0, y: 1.6, w: 7.9, h: 1.6, fontSize: 46, bold: true, color: C.background1, valign: "bottom", align: "left", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: X0, y: 3.35, w: 7.9, h: 1.2, fontSize: 20, color: C.background2, valign: "top", margin: 0 }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: HEX.white },
  margin: [0.4, 0.6, 0.6, 0.6],
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: X0, y: 0.35, w: CW, h: 0.8, fontSize: 30, bold: true, color: C.text1, valign: "middle", align: "left", margin: 0 }, text: "" } },
    { text: { text: "K-Merge geometry study  ·  Ankit Raj Choudhary  ·  IIT Jodhpur", options: { x: X0, y: 7.02, w: 7, h: 0.3, fontSize: 10, color: C.accent5, margin: 0 } } },
  ],
  slideNumber: { x: 12.15, y: 7.02, w: 0.6, h: 0.3, fontSize: 10, color: C.accent5, align: "right" },
});
pres.defineSlideMaster({
  title: "CLOSING_DARK",
  background: { color: HEX.navy },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: X0, y: 0.45, w: CW, h: 0.9, fontSize: 34, bold: true, color: C.background1, valign: "middle", align: "left", margin: 0 }, text: "" } },
  ],
  slideNumber: { x: 12.15, y: 7.02, w: 0.6, h: 0.3, fontSize: 10, color: C.background2, align: "right" },
});

// ---------------- helpers ----------------
let nObj = 0;
const nm = (s) => `${s}-${++nObj}`;
function card(slide, x, y, w, h, fill = C.background2, extra = {}) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0 }, rectRadius: 0.12, objectName: nm("card"), ...extra });
}
function outline(slide, x, y, w, h, col = C.accent5, width = 1) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: C.background1 }, line: { color: col, width }, rectRadius: 0.12, objectName: nm("outline") });
}
function iconCircle(slide, name, x, y, d, fill = C.background1) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill, width: 0 }, objectName: nm("icon-bg") });
  const p = d * 0.16;
  slide.addImage({ path: IMG(name), x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p, objectName: nm("icon-" + name), altText: name.replace(/_/g, " ") + " illustration" });
}
function numCircle(slide, n, x, y, d = 0.55, fill = C.accent1) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill, width: 0 }, objectName: nm("num") });
  slide.addText(String(n), { isTextBox: true, x, y, w: d, h: d, margin: 0, align: "center", valign: "middle", fontSize: 18, bold: true, color: C.background1, fontFace: "Cambria", objectName: nm("num-t") });
}
function txt(slide, text, o) {
  slide.addText(text, { isTextBox: true, margin: 0, valign: "top", fontSize: 16, color: C.text1, objectName: nm("text"), ...o });
}
function caption(slide, text, y = 6.45, h = 0.48) {
  txt(slide, text, { x: X0, y, w: CW, h, fontSize: 12, italic: true, color: C.text1 });
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
const R = (text, options = {}) => ({ text, options });
const sub = (t, o = {}) => R(t, { subscript: true, ...o });
const sup = (t, o = {}) => R(t, { superscript: true, ...o });
const MINUS = "−";
const sgn = (v, nd = 2) => (v > 0 ? "+" : v < 0 ? MINUS : "") + Math.abs(v).toFixed(nd);
const num = (v, nd = 2) => (v < 0 ? MINUS : "") + Math.abs(v).toFixed(nd);
const fmtb = (v, nd = 2) => (Math.abs(v) < 0.0005 ? (0).toFixed(nd) : Math.abs(v) < 0.005 && nd === 2 ? sgn(v, 3) : sgn(v, nd));
const ci = (lo, hi, nd = 2) => `${fmtb(lo, nd)} to ${fmtb(hi, nd)}`;
const Hc = (t, o = {}) => ({ text: t, options: { bold: true, color: HEX.white, fill: { color: HEX.ink }, fontSize: 14, valign: "middle", ...o } });
const Tc = (t, o = {}) => ({ text: t, options: { fontSize: 14, valign: "middle", color: HEX.ink, ...o } });

const OS = Object.fromEntries(D.overlap_sets.map((o) => [o.key, o]));
const RH = D.rho;
const lab05 = RH["lab05_pairs"], lab15 = RH["lab15_pairs"], real = RH["real_slots"];
const lab05t = RH["lab05_pairs+triples"], lab15t = RH["lab15_pairs+triples"];
const RP = D.real_partial;
const ex = D.examples;
const N = JSON.parse(fs.readFileSync(path.join(HERE, "oct17.json"), "utf8"));
const median = (a) => { const b = [...a].sort((x, y) => x - y); const m = Math.floor(b.length / 2); return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };

// ============================ SECTION 1: the question ============================
pres.addSection({ title: "Your question" });

// ---- 1. Title
{
  const s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: "Your question" });
  s.addText("How Much Is Really New?", { placeholder: "title" });
  s.addText([R("Overlap and residual of every incoming LoRA,", { breakLine: true }), R("and whether new-direction demand predicts", { breakLine: true }), R("K-Merge's failures better than cosine")], { placeholder: "body" });
  txt(s, "Geometry study  ·  updated 17 October 2026", { x: X0, y: 4.9, w: 7.9, h: 0.4, fontSize: 16, color: C.accent1, bold: true });
  txt(s, "Ankit Raj Choudhary\nSupervisor: Prof. Divya Saxena  ·  School of AI and Data Science, IIT Jodhpur", { x: X0, y: 5.55, w: 8.2, h: 0.8, fontSize: 15, color: C.background2, paraSpaceAfter: 4 });
  s.addShape(pres.shapes.OVAL, { x: 8.75, y: 1.15, w: 4.0, h: 4.0, fill: { color: "13304A" }, line: { color: "13304A", width: 0 }, objectName: "halo" });
  s.addImage({ path: IMG("magnifying_glass_tilted_left"), x: 9.5, y: 1.9, w: 2.5, h: 2.5, objectName: "lens", altText: "magnifying glass illustration" });
  s.addImage({ path: IMG("puzzle_piece"), x: 8.55, y: 4.25, w: 1.05, h: 1.05, objectName: "adapter", altText: "puzzle piece illustration" });
  s.addImage({ path: IMG("sparkles"), x: 11.95, y: 1.0, w: 0.95, h: 0.95, objectName: "new", altText: "sparkles illustration" });
  notes(s, "Good morning Ma'am. Last time you suggested that we study the geometry of the LoRA updates and ask a more direct question: how much genuinely new information does an incoming adapter bring? I ran that experiment the way you described it. I took the SVD of every update, measured the overlap and the residual between the new adapter and the slot it joins, and tested whether this new-direction demand predicts K-Merge's failures better than cosine. Everything ran on the CPU from the adapters we already had, so no new GPU time was needed. I will show the measurements first, then the answer to your question, and then what I think it means for your capacity-aware idea.");
}

// ---- 2. The question and the plan
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Your question" });
  s.addText("Your question, and how we tested it", { placeholder: "title" });
  card(s, X0, 1.35, 5.3, 4.45);
  iconCircle(s, "memo", X0 + 0.3, 1.55, 0.9, C.background1);
  txt(s, "Your message", { x: X0 + 1.4, y: 1.6, w: 3.6, h: 0.8, fontSize: 21, bold: true, fontFace: "Cambria", valign: "middle" });
  txt(s, [
    R("“…study the geometry of the LoRA updates and ask a more direct question: how much genuinely new information does the incoming adapter bring?”", { breakLine: true }),
    R("“…measure the overlap and residual between the incoming LoRA and the current slot, and check whether this ‘new-direction demand’ predicts when K-Merge fails better than simple cosine similarity.”"),
  ], { x: X0 + 0.35, y: 2.65, w: 4.6, h: 3.0, fontSize: 16, italic: true, paraSpaceAfter: 12 });
  const steps = [
    ["Decompose", "SVD of every LoRA update ΔW = BA, in every layer and module"],
    ["Compare", "Split the newcomer into overlap (already in the slot) and residual (new)"],
    ["Test", "Does demand (the new share) predict the damage better than cosine does?"],
    ["Then", "Only if yes: store just the new directions (capacity-aware slots)"],
  ];
  const sx = 6.25, sw = W - X0 - sx, rh = 0.98, gap = 0.17;
  steps.forEach(([h, b], i) => {
    const y = 1.35 + i * (rh + gap);
    card(s, sx, y, sw, rh);
    numCircle(s, i + 1, sx + 0.25, y + (rh - 0.55) / 2);
    txt(s, h, { x: sx + 1.05, y, w: 1.55, h: rh, fontSize: 19, bold: true, fontFace: "Cambria", color: C.accent1, valign: "middle" });
    txt(s, b, { x: sx + 2.6, y, w: sw - 2.85, h: rh, fontSize: 15, valign: "middle" });
  });
  outline(s, X0, 6.05, CW, 0.78, C.accent1, 1.25);
  txt(s, [
    R("Pass rule, fixed before looking at results: ", { bold: true }),
    R("demand must beat cosine with a 95% interval above zero on both lab models and on the real tasks.", { breakLine: true }),
    R("No new GPU runs: ", { bold: true }),
    R("48 saved adapters and the damage K-Merge caused in Phase 3."),
  ], { x: X0 + 0.25, y: 6.05, w: CW - 0.5, h: 0.78, fontSize: 14, valign: "middle" });
  notes(s, "On the left are your own words. I turned them into four steps. Step one: decompose every LoRA update with SVD into its important directions. Step two: compare the new adapter with the slot it joins and split it into two parts: the overlap, which the slot already covers, and the residual, which is new. Step three: test whether this new-direction demand ranks K-Merge's damage better than cosine. Step four, only if it does: design slots that store just the new directions. Before I looked at any result, I fixed a pass rule: demand must beat cosine, with a confidence interval above zero, on both lab models and on the real tasks. No new training was needed: we already had 48 saved adapters and the damage K-Merge caused in Phase 3.");
}

// ---- 3. The answer in one slide
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Your question" });
  s.addText("The answer in one slide", { placeholder: "title" });
  const stats = [
    { big: "≈ 90%", col: C.accent1, label: `of each incoming adapter is new to its slot. On the real tasks only ${OS.real_slots.overlap}% of its energy lies in the slot's important directions; at least ${Math.floor(D.dem_min_all)}% was new in all ${D.n_total} cases.` },
    { big: "1 of 3", col: C.accent2, label: `test beds where demand beat cosine: yes on the 0.5B lab (ρ ${num(lab05.demand2.rho)} vs ${num(lab05.neg_cos.rho)}); no on the 1.5B lab or the 12 real tasks.` },
    { big: "≈ 0", col: C.text1, label: `left for either score on the real tasks once task type and slot size are held fixed (ρ ${num(RP.demand2.partial_n_type)} for demand, ${num(RP.neg_cos.partial_n_type)} for cosine).` },
  ];
  const cw = 3.85, gap = 0.29;
  stats.forEach((st, i) => {
    const x = X0 + i * (cw + gap), y = 1.5;
    card(s, x, y, cw, 2.9);
    txt(s, st.big, { x: x + 0.25, y: y + 0.3, w: cw - 0.5, h: 0.9, fontSize: 36, bold: true, fontFace: "Cambria", color: st.col, valign: "middle" });
    txt(s, st.label, { x: x + 0.25, y: y + 1.3, w: cw - 0.5, h: 1.5, fontSize: 15 });
  });
  card(s, X0, 4.7, CW, 1.5, C.text1);
  iconCircle(s, "light_bulb", X0 + 0.35, 4.92, 1.05, C.background1);
  txt(s, [
    R("Your capacity-aware direction holds, with one change: measure what a direction does, not how much energy it holds.", { bold: true, breakLine: true }),
    R(`With about 3 directions per task, split kept ${(D.split_11.split_avg_11[0] * 100).toFixed(1)}–${(D.split_11.split_avg_11[1] * 100).toFixed(1)}% of quality, though those directions hold only about ${Math.round(D.energy[1].pct)}% of each task's energy.`, { fontSize: 15, color: C.background2 }),
  ], { x: X0 + 1.65, y: 4.8, w: CW - 1.95, h: 1.3, fontSize: 19, color: C.background1, valign: "middle", paraSpaceAfter: 4 });
  caption(s, [R("Test beds: synthetic grammar correction in 4 languages on Qwen2.5-0.5B and 1.5B (the lab), and 12 real tasks on Qwen2.5-1.5B.", { breakLine: true }), R("ρ = Spearman rank correlation with the damage K-Merge caused. Same answer at 80%, 95% and 100% energy cut-offs.")], 6.4);
  notes(s, "Here is the answer first, in three numbers. One: almost everything in a new adapter is new. On the real tasks only about 11 percent of its energy lies in the slot's important directions, and in all 221 cases at least 80 percent was new. Two: demand predicted K-Merge's damage better than cosine on the 0.5B lab model, but not on the 1.5B model and not on the 12 real tasks, so the pass rule is not met. Three: on the real tasks, both scores mostly reflect the task type and how crowded the slot is. Once we hold those two fixed, neither score predicts anything. But your capacity-aware direction still holds, with one change: we should measure what each direction does to the outputs, not how much energy it holds. With about 3 directions per task, split kept about 99 percent of quality.");
}

// ============================ SECTION 2: how we measured ============================
pres.addSection({ title: "How we measured" });

// ---- 4. The idea in one picture
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "How we measured" });
  s.addText("Overlap and residual in one picture", { placeholder: "title" });
  // plane = slot's important directions
  s.addShape(pres.shapes.PARALLELOGRAM, { x: 0.75, y: 3.85, w: 5.65, h: 1.8, fill: { color: HEX.ice }, line: { color: HEX.teal, width: 1.25 }, objectName: "slot-plane" });
  txt(s, [R("Slot's important directions", { bold: true, color: C.accent1, breakLine: true }), R("top SVD directions holding 90% of the slot's energy", { fontSize: 12 })],
    { x: 1.35, y: 4.98, w: 4.3, h: 0.6, fontSize: 14 });
  const O = [1.9, 4.75], T = [4.75, 1.75], F = [4.75, 4.45];
  // newcomer arrow O -> T
  s.addShape(pres.shapes.LINE, { x: O[0], y: T[1], w: T[0] - O[0], h: O[1] - T[1], flipV: true, line: { color: HEX.ink, width: 3, endArrowType: "triangle" }, objectName: "newcomer" });
  // overlap arrow O -> F
  s.addShape(pres.shapes.LINE, { x: O[0], y: F[1], w: F[0] - O[0], h: O[1] - F[1], flipV: true, line: { color: HEX.teal, width: 4.5, endArrowType: "triangle" }, objectName: "overlap" });
  // residual F -> T (dashed)
  s.addShape(pres.shapes.LINE, { x: F[0], y: T[1], w: 0, h: F[1] - T[1], flipV: true, line: { color: HEX.purple, width: 3, dashType: "dash", endArrowType: "triangle" }, objectName: "residual" });
  s.addShape(pres.shapes.RECTANGLE, { x: F[0] - 0.22, y: F[1] - 0.22, w: 0.22, h: 0.22, fill: { color: HEX.ice }, line: { color: HEX.muted, width: 1 }, objectName: "right-angle" });
  txt(s, [R("Incoming adapter ", { bold: true }), R("ΔW"), sub("t")], { x: 2.0, y: 1.45, w: 2.55, h: 0.4, fontSize: 16, align: "right" });
  txt(s, [R("Residual", { bold: true, breakLine: true }), R("= genuinely new")], { x: 4.95, y: 2.55, w: 1.75, h: 0.75, fontSize: 15, color: C.accent6 });
  txt(s, [R("Overlap", { bold: true, breakLine: true }), R("= already covered")], { x: 2.98, y: 3.88, w: 1.65, h: 0.5, fontSize: 13, color: C.accent1 });
  // definitions
  const dx = 7.05, dw = W - X0 - dx;
  card(s, dx, 1.35, dw, 1.5);
  txt(s, [R("Overlap", { bold: true, color: C.accent1, fontSize: 18, breakLine: true }), R("share of the newcomer's energy that lies inside the slot's important directions", { breakLine: true }),
    R("overlap = ||U", { fontFace: "Cambria" }), sub("k", { fontFace: "Cambria" }), sup("T", { fontFace: "Cambria" }), R(" ΔW", { fontFace: "Cambria" }), sub("t", { fontFace: "Cambria" }), R(" V", { fontFace: "Cambria" }), sub("k", { fontFace: "Cambria" }), R("||² ÷ ||ΔW", { fontFace: "Cambria" }), sub("t", { fontFace: "Cambria" }), R("||²", { fontFace: "Cambria" })],
    { x: dx + 0.3, y: 1.45, w: dw - 0.6, h: 1.3, fontSize: 15, valign: "middle", paraSpaceAfter: 3 });
  card(s, dx, 3.0, dw, 1.05);
  txt(s, [R("New-direction demand = 1 − overlap", { bold: true, color: C.accent6, fontSize: 18, breakLine: true }), R("the share of the newcomer that is genuinely new")],
    { x: dx + 0.3, y: 3.0, w: dw - 0.6, h: 1.05, fontSize: 15, valign: "middle", paraSpaceAfter: 3 });
  card(s, dx, 4.2, dw, 1.3);
  txt(s, [R("k", { bold: true, fontSize: 18, color: C.text1 }), sub("new", { bold: true, fontSize: 18 }), R(" vs k", { bold: true, fontSize: 18 }), sub("self", { bold: true, fontSize: 18, breakLine: true }),
    R("new directions the slot would need to cover 90% of the newcomer, against the directions the newcomer needs on its own")],
    { x: dx + 0.3, y: 4.2, w: dw - 0.6, h: 1.3, fontSize: 15, valign: "middle", paraSpaceAfter: 3 });
  outline(s, dx, 5.65, dw, 0.8, C.accent6, 1.25);
  txt(s, [R("Real example: ", { bold: true }), R(`Italian grammar joining an 11-task slot: overlap ${Math.round(ex[2].overlap)}%, new ${Math.round(ex[2].new)}%; K-Merge's damage ${Math.round(ex[2].damage)}%.`)],
    { x: dx + 0.25, y: 5.65, w: dw - 0.5, h: 0.8, fontSize: 14, valign: "middle" });
  caption(s, [R("U"), sub("k"), R(", V"), sub("k"), R(": the slot's top output and input directions from its SVD. Pooled over all layers and modules, weighted by energy.")], 6.6, 0.35);
  notes(s, "This picture shows the idea. The flat shape is the set of important directions already in the slot. To get it, we take the slot's update, do an SVD, and keep the top directions that hold 90 percent of its energy. The black arrow is the new adapter. Its shadow on the shape, the teal arrow, is the overlap: the part the slot already covers. The dashed part that sticks out is the residual: what is genuinely new. New-direction demand is simply one minus the overlap. On the right is the formula: we project the new update onto the slot's top directions on both sides and see how much energy survives. We also count directions: k-new is how many new directions the slot would need to cover 90 percent of the newcomer, and k-self is how many the newcomer needs on its own. For example, Italian grammar joining a crowded slot had only 8 percent overlap, so 92 percent of it was new.");
}

// ---- 5. What we measured, on what
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "How we measured" });
  s.addText("What we measured, and on what", { placeholder: "title" });
  const rows = [
    [Hc("Test bed"), Hc("Model and LoRA"), Hc("Adapters"), Hc("Cases measured"), Hc("Damage")],
    [Tc("0.5B lab: synthetic grammar correction, EN DE FR HI"), Tc("Qwen2.5-0.5B, rank 8, q and v, 24 layers"), Tc("12 (4 languages × 3 seeds)"), Tc(`${D.ranges.lab05_pairs.n} in pairs + ${D.ranges.lab05_triples.n} in 3-task slots`), Tc("1 − score ÷ own adapter's score", { rowspan: 3 })],
    [Tc("1.5B lab: same task"), Tc("Qwen2.5-1.5B, rank 8, q and v, 28 layers"), Tc("12"), Tc(`${D.ranges.lab15_pairs.n} in pairs + ${D.ranges.lab15_triples.n} in 3-task slots`)],
    [Tc("Real benchmark: grammar, summaries, QA × EN DE ES IT"), Tc("Qwen2.5-1.5B, rank 32, q k v o, 28 layers"), Tc("24 (12 tasks × 2 seeds)"), Tc(`${D.ranges.real_slots.n} in K-Merge's slots + ${D.ranges.real_stress.n} in the one-slot stress test`)],
  ];
  s.addTable(rows, { x: X0, y: 1.3, w: CW, colW: [3.0, 2.95, 1.95, 2.55, 1.683], fontFace: "Calibri", color: HEX.ink, border: { type: "solid", pt: 0.75, color: "D5DCE3" }, fill: { color: HEX.white }, rowH: [0.42, 0.78, 0.6, 0.78], margin: 0.08, objectName: "testbeds" });
  txt(s, [R(`Total: 48 adapters, ${D.n_total} cases where K-Merge put a task into a shared slot and we know how much it lost.`, { bold: true })], { x: X0, y: 4.0, w: CW, h: 0.35, fontSize: 15 });
  const steps = [
    "Rebuild each slot as Eq. 8 stores it: the equal average of the other tasks' A and B",
    "SVD of the slot; keep its top directions holding 90% of its energy",
    "Project the newcomer on both sides; pool over all layers and modules by energy",
    "Spearman ρ with the damage K-Merge caused; cluster bootstrap with 1,000 draws",
  ];
  const cw = (CW - 3 * 0.25) / 4;
  steps.forEach((t, i) => {
    const x = X0 + i * (cw + 0.25), y = 4.5;
    card(s, x, y, cw, 1.8);
    numCircle(s, i + 1, x + 0.22, y + 0.18, 0.5);
    txt(s, t, { x: x + 0.22, y: y + 0.78, w: cw - 0.4, h: 0.95, fontSize: 14 });
  });
  caption(s, "All on CPU from the saved Phase 3 adapters and result tables (Kaggle notebooks: merge lab v4–v5, real benchmark v8). No new training and no GPU time.", 6.45, 0.4);
  notes(s, "We used the same three test beds as in Phase 3. The two lab models run the synthetic grammar task in four languages. The real benchmark is the 12 real tasks with the same model and LoRA settings as the K-Merge paper. In total that is 48 adapters and 221 cases where K-Merge put a task into a shared slot and we already know how much it lost. For each case I did four things. I rebuilt the slot exactly as K-Merge stores it: the average of the other tasks' A and B matrices. I took its SVD and kept the directions holding 90 percent of its energy. I projected the new task's update onto those directions and pooled over all layers and modules. Finally I checked with a rank correlation whether a higher demand goes with more damage, and used a bootstrap to get confidence intervals.");
}

// ============================ SECTION 3: what we found ============================
pres.addSection({ title: "What we found" });

// ---- 6. Result 1: ~90% new
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "What we found" });
  s.addText("Result 1: about 90% of every adapter is new", { placeholder: "title" });
  const labels = D.overlap_sets.map((o) => `${o.label} (${o.n})`);
  s.addChart(pres.charts.BAR, [
    { name: "Overlap: already in the slot", labels, values: D.overlap_sets.map((o) => o.overlap) },
    { name: "Residual: new", labels, values: D.overlap_sets.map((o) => o.new) },
  ], chartBase({
    x: X0, y: 1.3, w: 7.2, h: 5.0, barDir: "bar", barGrouping: "stacked", catAxisOrientation: "maxMin", barGapWidthPct: 45,
    chartColors: [HEX.teal, HEX.purple], showValue: true, dataLabelPosition: "ctr", dataLabelColor: HEX.white, dataLabelFormatCode: '0.0"%"', dataLabelFontSize: 12,
    valAxisMinVal: 0, valAxisMaxVal: 100, valAxisHidden: true, valGridLine: { style: "none" }, catAxisLabelFontSize: 12,
    showLegend: true, legendPos: "b", title: "Share of the incoming adapter's energy (mean over cases)",
  }));
  const rx = 8.05, rw = W - X0 - rx;
  card(s, rx, 1.35, rw, 2.2);
  txt(s, [R("k", { bold: true, color: C.accent1 }), sub("new", { bold: true, color: C.accent1 }), R(" ≈ k", { bold: true, color: C.accent1 }), sub("self", { bold: true, color: C.accent1 })],
    { x: rx + 0.25, y: 1.45, w: rw - 0.5, h: 0.55, fontSize: 26, fontFace: "Cambria", valign: "middle" });
  txt(s, [R("Directions the slot would still need to cover 90% of a newcomer, against what it needs alone:", { breakLine: true }),
    R(`real ${OS.real_slots.knew} vs ${OS.real_slots.kself} of 32  ·  lab 4.4–4.6 vs 4.3–4.5 of 8`, { bold: true, breakLine: true }),
    R("The slot's directions save almost no room.")],
    { x: rx + 0.25, y: 2.0, w: rw - 0.5, h: 1.45, fontSize: 14, paraSpaceAfter: 4 });
  card(s, rx, 3.7, rw, 2.6);
  txt(s, "Three real arrivals", { x: rx + 0.25, y: 3.8, w: rw - 0.5, h: 0.4, fontSize: 16, bold: true, fontFace: "Cambria" });
  const er = [
    [Hc("Arrival", { fontSize: 12 }), Hc("Overlap", { fontSize: 12, align: "center" }), Hc("K-Merge damage", { fontSize: 12, align: "center" })],
    [Tc("Spanish summary → 3 summaries", { fontSize: 12 }), Tc(`${ex[0].overlap}%`, { fontSize: 13, bold: true, align: "center" }), Tc(`${ex[0].damage}%`, { fontSize: 13, align: "center" })],
    [Tc("German QA → 4 QA tasks", { fontSize: 12 }), Tc(`${ex[1].overlap}%`, { fontSize: 13, bold: true, align: "center" }), Tc(`${MINUS}${Math.abs(ex[1].damage)}% (gained)`, { fontSize: 13, align: "center", color: HEX.teal })],
    [Tc("Italian grammar → 11 tasks", { fontSize: 12 }), Tc(`${ex[2].overlap}%`, { fontSize: 13, bold: true, align: "center" }), Tc(`${ex[2].damage}%`, { fontSize: 13, align: "center", color: HEX.coral, bold: true })],
  ];
  s.addTable(er, { x: rx + 0.2, y: 4.25, w: rw - 0.4, colW: [2.05, 0.85, rw - 0.4 - 2.9], fontFace: "Calibri", border: { type: "solid", pt: 0.75, color: "D5DCE3" }, fill: { color: HEX.white }, rowH: [0.46, 0.5, 0.5, 0.5], margin: 0.05, objectName: "arrivals" });
  caption(s, "Overlap pooled over all layers and modules, weighted by energy. The three arrivals were chosen to show the range; the bars are the averages.", 6.45, 0.4);
  notes(s, "This is the first output you asked for: the overlap and the residual. In every test bed only 6 to 11 percent of the incoming adapter lies in the directions already in the slot; around 90 percent is new. Even the most covered case we found was still 80 percent new. Counting directions tells the same story. To cover 90 percent of a newcomer, the slot would still need about 17.5 new directions on the real tasks, while the newcomer needs about 17 on its own. So the directions already in the slot save almost no room. On the right are three real arrivals: a Spanish summary joining other summaries had the highest overlap, about 20 percent, and lost little; German QA joining other QA tasks even gained; Italian grammar joining a crowded 11-task slot had low overlap and lost 41 percent.");
}

// ---- 7. Result 2: overlap map
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "What we found" });
  s.addText("Result 2: task type, not language, decides overlap", { placeholder: "title" });
  const tasks = D.overlap_matrix.tasks;
  const short = (t) => { const [a, b] = t.split("_"); return [a.toUpperCase(), b.toUpperCase()]; };
  const lo = 4, hi = 16;
  const mix = (t) => {
    const a = [0xFF, 0xFF, 0xFF], b = [0x0E, 0x7C, 0x86];
    return a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("").toUpperCase();
  };
  txt(s, "Rows: the incoming adapter  ·  Columns: the adapter already in the slot  ·  Cell: overlap, %", { x: X0, y: 1.22, w: 7.7, h: 0.32, fontSize: 12, color: C.text1, italic: true });
  const head = [{ text: "", options: { fill: { color: HEX.white } } }].concat(tasks.map((t) => { const [a, b] = short(t); return { text: `${a}\n${b}`, options: { bold: true, fontSize: 10, align: "center", valign: "middle", color: HEX.ink, fill: { color: HEX.card } } }; }));
  const body = D.overlap_matrix.values.map((row, i) => {
    const [a, b] = short(tasks[i]);
    return [{ text: `${a}-${b}`, options: { bold: true, fontSize: 11, valign: "middle", color: HEX.ink, fill: { color: HEX.card } } }].concat(row.map((v) => {
      if (v === null) return { text: "–", options: { align: "center", valign: "middle", fontSize: 11, color: HEX.muted, fill: { color: "F4F6F8" } } };
      const t = Math.max(0, Math.min(1, (v - lo) / (hi - lo)));
      return { text: v.toFixed(1), options: { align: "center", valign: "middle", fontSize: 11, color: t > 0.55 ? HEX.white : HEX.ink, fill: { color: mix(t) } } };
    }));
  });
  s.addTable([head].concat(body), { x: X0, y: 1.6, w: 0.95 + 12 * 0.56, colW: [0.95].concat(Array(12).fill(0.56)), fontFace: "Calibri", border: { type: "solid", pt: 0.5, color: "FFFFFF" }, rowH: [0.46].concat(Array(12).fill(0.345)), margin: 0.02, objectName: "overlap-map" });
  const g = D.overlap_groups;
  const rx = 8.55, rw = W - X0 - rx;
  const groups = [
    [`${g.same_type.overlap}%`, C.accent1, `same task type (cosine ${g.same_type.cos.toFixed(2)})`],
    [`${g.same_language.overlap}%`, C.text1, `same language, different task (cosine ${g.same_language.cos.toFixed(2)})`],
    [`${g.neither.overlap}%`, C.text1, `different task and language (cosine ${g.neither.cos.toFixed(2)})`],
  ];
  groups.forEach(([big, col, lab], i) => {
    const y = 1.35 + i * 1.12;
    card(s, rx, y, rw, 0.98);
    txt(s, big, { x: rx + 0.25, y, w: 1.35, h: 0.98, fontSize: 26, bold: true, fontFace: "Cambria", color: col, valign: "middle" });
    txt(s, lab, { x: rx + 1.65, y, w: rw - 1.85, h: 0.98, fontSize: 14, valign: "middle" });
  });
  outline(s, rx, 4.8, rw, 1.45, C.accent1, 1.25);
  txt(s, [R("Same language adds almost nothing ", { bold: true }), R(`over unrelated pairs (${g.same_language.overlap}% vs ${g.neither.overlap}%). Closest pair: Spanish → Italian summaries, ${D.overlap_max}%. Part answer to your RQ7: the geometry is organised by task, not language.`)],
    { x: rx + 0.22, y: 4.85, w: rw - 0.44, h: 1.35, fontSize: 14, valign: "middle" });
  caption(s, "Real adapters, seed 0, all 28 layers × q, k, v, o; 132 ordered pairs. GEC = grammar correction, SUM = summaries, QA = question answering.", 6.45, 0.4);
  notes(s, "This map shows the overlap between every pair of the 12 real adapters. Read a row as: if this adapter arrives in a slot that already holds that one, how much of it is already covered. The three darker blocks along the diagonal are the task types: grammar with grammar, summaries with summaries, QA with QA. Adapters of the same task type share about 10 percent. Adapters of the same language but a different task share about 5 percent, which is the same as two unrelated adapters. So the geometry is organised by task, not by language, which also answers part of your RQ7 on cross-lingual geometry. Even the closest pair, Spanish and Italian summaries, shares only 16 percent.");
}

// ---- 8. Result 3: demand vs cosine
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "What we found" });
  s.addText("Result 3: demand vs cosine as a damage predictor", { placeholder: "title" });
  const cats = ["0.5B lab", "1.5B lab", "12 real tasks"];
  s.addChart(pres.charts.BAR, [
    { name: "Cosine, sign flipped (K-Merge's score)", labels: cats, values: [lab05.neg_cos.rho, lab15.neg_cos.rho, real.neg_cos.rho] },
    { name: "New-direction demand", labels: cats, values: [lab05.demand2.rho, lab15.demand2.rho, real.demand2.rho] },
  ], chartBase({
    x: X0, y: 1.3, w: 7.25, h: 5.0, barDir: "col", barGapWidthPct: 70, chartColors: [HEX.coral, HEX.teal],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.00", dataLabelFontSize: 13,
    valAxisMinVal: -0.6, valAxisMaxVal: 0.8, valAxisMajorUnit: 0.2, valAxisLabelFormatCode: "0.0",
    showLegend: true, legendPos: "b", title: "How well each score ranks K-Merge's damage (Spearman ρ)",
  }));
  const rx = 8.2, rw = W - X0 - rx;
  txt(s, "Demand minus cosine (95% interval)", { x: rx, y: 1.35, w: rw, h: 0.4, fontSize: 16, bold: true, fontFace: "Cambria" });
  const verdict = [
    ["0.5B lab", lab05.demand2, "Better", C.accent1],
    ["1.5B lab", lab15.demand2, "Not significant", C.accent5],
    ["12 real tasks", real.demand2, "Not better", C.accent2],
  ];
  verdict.forEach(([name, r, v, col], i) => {
    const y = 1.85 + i * 1.0;
    card(s, rx, y, rw, 0.88);
    txt(s, [R(name, { bold: true, breakLine: true }), R(`${sgn(r.d)}  (${ci(r.dlo, r.dhi)})`)], { x: rx + 0.22, y, w: 2.75, h: 0.88, fontSize: 15, valign: "middle" });
    txt(s, v, { x: rx + 2.95, y, w: rw - 3.1, h: 0.88, fontSize: 15, bold: true, color: col, valign: "middle", align: "right" });
  });
  outline(s, rx, 4.95, rw, 0.62, C.accent2, 1.5);
  txt(s, "Pass rule: not met", { x: rx + 0.22, y: 4.95, w: rw - 0.44, h: 0.62, fontSize: 18, bold: true, color: C.accent2, valign: "middle" });
  txt(s, `With the 3-task slots added: 0.5B ${sgn(lab05t.demand2.d)} (${ci(lab05t.demand2.dlo, lab05t.demand2.dhi)}); 1.5B ${sgn(lab15t.demand2.d)} (${ci(lab15t.demand2.dlo, lab15t.demand2.dhi)}).`,
    { x: rx, y: 5.7, w: rw, h: 0.6, fontSize: 13 });
  caption(s, `Cosine enters with its sign flipped, so for both scores a higher value should mean more damage. Intervals: cluster bootstrap, 1,000 draws, both tasks of a merge resampled together. Cases: ${D.ranges.lab05_pairs.n}, ${D.ranges.lab15_pairs.n}, ${D.ranges.real_slots.n}.`, 6.42, 0.5);
  notes(s, "This is the main test you asked for. The bars show how well each score ranks K-Merge's damage; higher is better. For cosine I flipped the sign, so that for both scores 'higher' should mean 'more damage'. On the 0.5B lab model, demand is better than cosine: 0.58 against 0.44, and the confidence interval of the gain stays just above zero. On the 1.5B model both scores point the wrong way, as cosine already did in Phase 3, and the difference is not significant. There, K-Merge's damage is tiny, about 1 percent on average, so there is almost nothing to predict. On the 12 real tasks, demand is very slightly worse than cosine. So the pass rule we fixed in advance is not met: demand does not reliably beat cosine.");
}

// ---- 8b. Robustness: the cut-off
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "What we found" });
  s.addText("Check: the 90% cut-off does not change the answer", { placeholder: "title" });
  const cuts = [["demand2_0.8", "80%", "0.8"], ["demand2_0.9", "90% (used)", "0.9"], ["demand2_0.95", "95%", "0.95"], ["demand_full", "100% (all directions)", null]];
  const rb = (set, cut) => N.robust.find((r) => r.set === set && r.cut === cut);
  const dcell = (r) => {
    const col = r.lo > 0 ? HEX.teal : r.hi < 0 ? HEX.coral : HEX.muted;
    return { text: [R(fmtb(r.d), { bold: true, color: col, fontSize: 15, breakLine: true }), R(`(${ci(r.lo, r.hi)})`, { fontSize: 11, color: HEX.muted })], options: { align: "center", valign: "middle" } };
  };
  const hc = (t) => Hc(t, { fontSize: 13, align: "center" });
  const head = [Hc("Energy cut-off", { fontSize: 13 }), hc("New share, real tasks"), hc("Lowest new share, all 221 cases"), hc("k_new vs k_self, real tasks"), hc("Demand − cosine: 0.5B lab"), hc("1.5B lab"), hc("12 real tasks")];
  const body = cuts.map(([c, label, f]) => [
    Tc(label, { bold: true, fontSize: 14 }),
    Tc(`${(100 * (1 - N.robust_overlap_real[c])).toFixed(1)}%`, { align: "center" }),
    Tc(`${(100 * N.robust_min_new_all[c]).toFixed(1)}%`, { align: "center" }),
    Tc(f ? `${N.robust_knew_kself_real[f][0].toFixed(1)} vs ${N.robust_knew_kself_real[f][1].toFixed(1)}` : "–", { align: "center" }),
    dcell(rb("lab05_pairs", c)), dcell(rb("lab15_pairs", c)), dcell(rb("real_slots", c)),
  ]);
  s.addTable([head].concat(body), { x: X0, y: 1.3, w: CW, colW: [2.0, 1.55, 1.65, 1.65, 1.76, 1.76, 1.763], fontFace: "Calibri", color: HEX.ink, border: { type: "solid", pt: 0.75, color: "D5DCE3" }, fill: { color: HEX.white }, rowH: [0.62, 0.72, 0.72, 0.72, 0.72], margin: 0.06, objectName: "cutoff-table" });
  const pr = Object.values(N.robust_partial_real);
  card(s, X0, 5.0, CW, 1.3);
  iconCircle(s, "check_mark_button", X0 + 0.25, 5.15, 1.0, C.background1);
  txt(s, [R("Same answer at every cut-off. ", { bold: true }),
    R(`On real tasks ${Math.round(100 * (1 - N.robust_overlap_real.demand_full))}–${Math.round(100 * (1 - N.robust_overlap_real["demand2_0.8"]))}% of each adapter is new, the slot saves almost no room, and demand never beats cosine on all three test beds. At 95–100% it is even slightly worse on real tasks, and with task type and slot size held fixed it predicts nothing (ρ between ${num(Math.min(...pr))} and ${num(Math.max(...pr))}).`)],
    { x: X0 + 1.5, y: 5.05, w: CW - 1.75, h: 1.2, fontSize: 15, valign: "middle" });
  caption(s, "Teal: demand better than cosine; red: worse; grey: no clear difference (95% interval includes 0). Each cut-off sets how many of the slot's top directions count as ‘important’; 100% uses all of them.", 6.42, 0.5);
  notes(s, "You may ask whether the result depends on the 90 percent cut-off I used for the important directions. So I redid everything at 80, 95 and 100 percent, where 100 means all of the slot's directions. The answer does not change. On the real tasks, between 84 and 92 percent of each adapter is new, depending on the cut-off. The slot still saves almost no room: k-new stays about equal to k-self. And demand never beats cosine on all three test beds. On the 0.5B lab it is better at 80 and 90 percent, but not significantly at 95 or 100. On the real tasks it is never better and even slightly worse at 95 and 100 percent. With task type and slot size held fixed, it predicts nothing at any cut-off.");
}

// ---- 9. Result 4: confounds on real data
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "What we found" });
  s.addText("Result 4: task type and slot size explain both scores", { placeholder: "title" });
  const cats = ["As measured", "Slot size held fixed", "Slot size and task type held fixed"];
  s.addChart(pres.charts.BAR, [
    { name: "Cosine, sign flipped", labels: cats, values: [RP.neg_cos.raw, RP.neg_cos.partial_n, RP.neg_cos.partial_n_type] },
    { name: "New-direction demand", labels: cats, values: [RP.demand2.raw, RP.demand2.partial_n, RP.demand2.partial_n_type] },
  ], chartBase({
    x: X0, y: 1.3, w: 6.9, h: 5.0, barDir: "col", barGapWidthPct: 70, chartColors: [HEX.coral, HEX.teal],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.00", dataLabelFontSize: 13,
    valAxisMinVal: 0, valAxisMaxVal: 0.8, valAxisMajorUnit: 0.2, valAxisLabelFormatCode: "0.0", catAxisLabelFontSize: 12,
    showLegend: true, legendPos: "b", title: `Rank correlation with K-Merge's damage, ${D.ranges.real_slots.n} real cases`,
  }));
  const rx = 7.85, rw = W - X0 - rx;
  const tm = D.type_means;
  const rows = [
    [Hc("Task type", { fontSize: 13 }), Hc("Damage", { fontSize: 13, align: "center" }), Hc("Cosine", { fontSize: 13, align: "center" }), Hc("Demand", { fontSize: 13, align: "center" })],
    [Tc("Grammar"), Tc(`${tm.gec.damage}%`, { align: "center", bold: true, color: HEX.coral }), Tc(tm.gec.cos.toFixed(2), { align: "center" }), Tc(`${tm.gec.demand.toFixed(1)}%`, { align: "center" })],
    [Tc("Summaries"), Tc(`${tm.sum.damage}%`, { align: "center", bold: true }), Tc(tm.sum.cos.toFixed(2), { align: "center" }), Tc(`${tm.sum.demand.toFixed(1)}%`, { align: "center" })],
    [Tc("QA"), Tc(`${tm.qa.damage}%`, { align: "center", bold: true }), Tc(tm.qa.cos.toFixed(2), { align: "center" }), Tc(`${tm.qa.demand.toFixed(1)}%`, { align: "center" })],
  ];
  s.addTable(rows, { x: rx, y: 1.4, w: rw, colW: [1.5, 1.2, 1.0, rw - 3.7], fontFace: "Calibri", border: { type: "solid", pt: 0.75, color: "D5DCE3" }, fill: { color: HEX.white }, rowH: [0.42, 0.48, 0.48, 0.48], margin: 0.06, objectName: "by-type" });
  card(s, rx, 3.45, rw, 2.85);
  txt(s, [
    R("Grammar adapters are the least similar and the most fragile, ", { bold: true }),
    R("so any ‘difference’ score looks predictive when task types are mixed.", { breakLine: true }),
    R("Inside one task type and slot size, neither score predicts damage.", { bold: true, color: C.accent2, breakLine: true }),
    R(`Slot size alone: ρ = ${num(D.real_rho_n_damage)} with damage (bigger slots lose more).`),
  ], { x: rx + 0.25, y: 3.55, w: rw - 0.5, h: 2.65, fontSize: 15, paraSpaceAfter: 8, valign: "middle" });
  caption(s, "Partial Spearman correlation: ranks of score and damage after removing what slot size (tasks in the slot) and task type explain. Real benchmark: K = 2 and 4, 2 seeds, random and clustered orders.", 6.42, 0.5);
  notes(s, "Why does a score look good on the real data? Because of two things that have nothing to do with the adapter's directions. The table shows the first one: grammar adapters have the lowest similarity and the highest demand, and they are also the most fragile task. Grammar loses 19 percent on average under K-Merge, while QA loses almost nothing. The second one is slot size: bigger slots lose more. When I remove the effect of slot size, the correlations stay around 0.6. When I also remove the task type, both fall to zero. So on real data, neither cosine nor demand tells us more than 'this is a grammar task in a crowded slot'.");
}

// ---- 10. Result 5: partner rule
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "What we found" });
  s.addText("Result 5: as a partner rule, demand changes nothing", { placeholder: "title" });
  const w5 = D.who.lab05, w15 = D.who.lab15;
  const cats = ["0.5B: average", "0.5B: weakest language", "1.5B: average", "1.5B: weakest language"];
  s.addChart(pres.charts.BAR, [
    { name: "Cosine rule (K-Merge)", labels: cats, values: [w5.km_avg, w5.km_worst, w15.km_avg, w15.km_worst] },
    { name: "Lowest-demand rule", labels: cats, values: [w5.dm_avg, w5.dm_worst, w15.dm_avg, w15.dm_worst] },
  ], chartBase({
    x: X0, y: 1.3, w: 7.45, h: 5.0, barDir: "col", barGapWidthPct: 60, chartColors: [HEX.coral, HEX.teal],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0", dataLabelFontSize: 12,
    valAxisMinVal: 0, valAxisMaxVal: 110, valAxisHidden: true, valGridLine: { style: "none" }, catAxisLabelFontSize: 12,
    showLegend: true, legendPos: "b", title: "Quality kept, % of each language's own adapter",
  }));
  const rx = 8.35, rw = W - X0 - rx;
  const ws = D.who_same;
  card(s, rx, 1.35, rw, 1.6);
  txt(s, [R(`${ws.lab05.same} of ${ws.lab05.runs}  ·  ${ws.lab15.same} of ${ws.lab15.runs}`, { bold: true, color: C.accent1, fontSize: 25, fontFace: "Cambria", breakLine: true }), R("runs where the demand rule built exactly the same slots as cosine (0.5B · 1.5B)")],
    { x: rx + 0.25, y: 1.4, w: rw - 0.5, h: 1.5, fontSize: 14, valign: "middle", paraSpaceAfter: 4 });
  card(s, rx, 3.1, rw, 1.45);
  txt(s, [R(`${sgn(w5.d_worst, 1)} points`, { bold: true, color: C.accent2, fontSize: 25, fontFace: "Cambria", breakLine: true }), R(`weakest language on 0.5B (95% CI ${ci(w5.lo, w5.hi, 1)}); identical on 1.5B`)],
    { x: rx + 0.25, y: 3.15, w: rw - 0.5, h: 1.35, fontSize: 14, valign: "middle", paraSpaceAfter: 4 });
  outline(s, rx, 4.7, rw, 1.6, C.accent5, 1);
  txt(s, [R("Phase 3, for comparison: ", { bold: true }), R("changing HOW the slot is built gained +17.6 points on the weakest language; changing WHO is merged, at most +4.5.")],
    { x: rx + 0.25, y: 4.75, w: rw - 0.5, h: 1.5, fontSize: 14, valign: "middle" });
  caption(s, `K-Merge's online procedure replayed for all 24 arrival orders × 3 seeds (4 languages, K = 2). Each grouping was scored with the quality measured in Phase 3; runs whose grouping was never measured are left out (${ws.lab05.missing} on 0.5B, ${ws.lab15.missing} on 1.5B).`, 6.42, 0.5);
  notes(s, "I also tried demand the way K-Merge would use it: put the newcomer into the slot where it needs the fewest new directions. I replayed K-Merge's online procedure for all 24 arrival orders and 3 seeds. The demand rule built exactly the same slots as cosine in 60 of 70 runs on 0.5B and 64 of 68 on 1.5B. Where it differed, it was not better: the weakest language changed by minus 0.4 points, well within noise, and on 1.5B nothing changed. This agrees with Phase 3: who you merge with is not the big lever; how the slot stores the tasks is.");
}

// ============================ SECTION 4: what we learned ============================
pres.addSection({ title: "What we learned" });

// ---- 11. Identity
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "What we learned" });
  s.addText("Lesson 1: cosine already contains the overlap", { placeholder: "title" });
  card(s, X0, 1.35, 7.0, 2.35, C.text1);
  txt(s, "cosine = √overlap × agreement", { x: X0 + 0.35, y: 1.5, w: 6.3, h: 0.85, fontSize: 28, bold: true, fontFace: "Cambria", color: C.background1, valign: "middle" });
  txt(s, [
    R("√overlap: ", { bold: true, color: "9FD3D6" }), R("how much of the newcomer lies in the slot's directions", { breakLine: true }),
    R("agreement: ", { bold: true, color: "F2C46D" }), R("inside that shared part, does it point the same way as the slot?"),
  ], { x: X0 + 0.35, y: 2.45, w: 6.3, h: 1.1, fontSize: 15, color: C.background1, paraSpaceAfter: 6 });
  card(s, X0, 3.9, 7.0, 2.4);
  const sc = D.spearman_cos_demand;
  txt(s, [
    R("An exact identity, ", { bold: true }), R("in every module and for the whole adapter. Checked on all 221 cases: error below 10"), sup(`${MINUS}15`), R(".", { breakLine: true }),
    R("So demand (= 1 − overlap) is cosine's first factor, and the two rank the cases almost identically:", { breakLine: true }),
    R(`ρ = ${num(sc.lab05_pairs)} (0.5B)  ·  ${num(sc.lab15_pairs)} (1.5B)  ·  ${num(sc.real_slots)} (real)`, { bold: true, color: C.accent1, fontSize: 17 }),
  ], { x: X0 + 0.3, y: 4.0, w: 6.4, h: 2.2, fontSize: 15, paraSpaceAfter: 8, valign: "middle" });
  const rx = 7.9, rw = W - X0 - rx;
  card(s, rx, 1.35, rw, 4.95);
  iconCircle(s, "compass", rx + 0.25, 1.55, 0.95, C.background1);
  txt(s, "What demand adds: direction", { x: rx + 1.35, y: 1.6, w: rw - 1.55, h: 0.85, fontSize: 19, bold: true, fontFace: "Cambria", valign: "middle" });
  const d5 = D.direction["lab05_pairs|demand2"], d15 = D.direction["lab15_pairs|demand2"];
  txt(s, [
    R("Cosine gives both tasks of a pair the same number. Demand differs, so it can say which task will be hurt.", { breakLine: true }),
    R(`${d5.right} of ${d5.right + d5.wrong}`, { bold: true, color: C.accent1, fontSize: 30, fontFace: "Cambria", breakLine: true }),
    R(`0.5B pairs where the task with the higher demand was the one hurt more (sign test p = ${d5.sign_p.toFixed(3)})`, { breakLine: true }),
    R(`1.5B pairs: ${d15.right} of ${d15.right + d15.wrong} (p = ${d15.sign_p.toFixed(2)}), so this may not hold on larger models.`, { color: C.text1 }),
  ], { x: rx + 0.3, y: 2.65, w: rw - 0.6, h: 3.5, fontSize: 15, paraSpaceAfter: 8 });
  caption(s, "Here overlap uses all of the slot's directions. Agreement = cosine between the newcomer's covered part and the slot itself.", 6.45, 0.4);
  notes(s, "Here is why demand cannot be very different from cosine. Cosine splits exactly into two factors: the square root of the overlap, and an agreement term that says whether the shared part points the same way as the slot. This is an identity, not an approximation; I checked it on all 221 cases. So K-Merge's cosine already contains your overlap, mixed with agreement, and in our data the two scores rank the cases almost the same way. But demand has one property cosine does not have: it is directional. Cosine gives both tasks of a pair the same number, while demand gives each task its own number. On the 0.5B model, the task with the higher demand was the one that got hurt in 16 of 18 pairs. That is where demand's advantage on 0.5B comes from. On 1.5B it was 10 of 16, which could be chance.");
}

// ---- 12. A vs B
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "What we learned" });
  s.addText("Lesson 2: the task lives in B; A is almost shared", { placeholder: "title" });
  const a = D.asym;
  const cats = ["0.5B lab", "1.5B lab", "12 real tasks"];
  s.addChart(pres.charts.BAR, [
    { name: "A matrices (read the input)", labels: cats, values: [a.lab05.A_cos, a.lab15.A_cos, a.real.A_cos] },
    { name: "B matrices (write the output)", labels: cats, values: [a.lab05.B_cos, a.lab15.B_cos, a.real.B_cos] },
  ], chartBase({
    x: X0, y: 1.3, w: 6.5, h: 5.0, barDir: "col", barGapWidthPct: 70, chartColors: [HEX.slate, HEX.teal],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.00", dataLabelFontSize: 13,
    valAxisMinVal: 0, valAxisMaxVal: 1.1, valAxisHidden: true, valGridLine: { style: "none" },
    showLegend: true, legendPos: "b", title: "Cosine between two different tasks' matrices",
  }));
  const rx = 7.4, rw = W - X0 - rx, hw = (rw - 0.25) / 2;
  const inc = D.overlap_sets.map((o) => o.in_cov), outc = D.overlap_sets.map((o) => 100 - o.out_new);
  const rng = (v) => `${Math.round(Math.min(...v))}–${Math.round(Math.max(...v))}%`;
  card(s, rx, 1.35, hw, 1.9);
  txt(s, [R(rng(inc), { bold: true, color: C.text1, fontSize: 30, fontFace: "Cambria", breakLine: true }), R("of the newcomer's input side is already in the slot")], { x: rx + 0.2, y: 1.4, w: hw - 0.4, h: 1.8, fontSize: 14, valign: "middle", paraSpaceAfter: 4 });
  card(s, rx + hw + 0.25, 1.35, hw, 1.9);
  txt(s, [R(rng(outc), { bold: true, color: C.accent1, fontSize: 30, fontFace: "Cambria", breakLine: true }), R("of its output side is already in the slot")], { x: rx + hw + 0.45, y: 1.4, w: hw - 0.4, h: 1.8, fontSize: 14, valign: "middle", paraSpaceAfter: 4 });
  card(s, rx, 3.4, rw, 1.45);
  txt(s, [R("Why: ", { bold: true }), R("all our adapters started from the same random A, and A barely moves in training (Zhu et al., ICML 2024). The task's information sits in B.")],
    { x: rx + 0.25, y: 3.45, w: rw - 0.5, h: 1.35, fontSize: 15, valign: "middle" });
  outline(s, rx, 5.0, rw, 1.3, C.accent1, 1.25);
  txt(s, [R("Storage hint: ", { bold: true, color: C.accent1 }), R("one shared A per slot plus a B per task (the HydraLoRA design, NeurIPS 2024) is worth testing here.")],
    { x: rx + 0.25, y: 5.05, w: rw - 0.5, h: 1.2, fontSize: 15, valign: "middle" });
  caption(s, `Mean over modules; lab pairs and ${a.real.pairs} ordered real pairs (real A: lowest ${a.real.A_min.toFixed(3)}). Input and output side: one-sided overlap with the slot's top input or output directions.`, 6.42, 0.5);
  notes(s, "Second lesson. A LoRA update has two matrices: A reads the input and B writes the output. Between different tasks, the A matrices are almost identical, with cosine 0.97 to 0.99, while the B matrices are very different, 0.06 to 0.15. The reason is that all our adapters started from the same random A, and A hardly moves during training, which Zhu and colleagues showed in 2024. So on the input side most of a newcomer is already covered, 65 to 81 percent, but on the output side only 7 to 13 percent. The genuinely new information is in B. If adapters started from different random A matrices, the input side would look different, so the output side is the robust result. This also gives a storage idea: a slot could keep one shared A and a separate B for each task, which is how HydraLoRA is built.");
}

// ---- 13. Energy is not function
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "What we learned" });
  s.addText("Lesson 3: energy is not function", { placeholder: "title" });
  const ks = D.energy.map((e) => String(e.k)), vs = D.energy.map((e) => e.pct);
  s.addChart(pres.charts.BAR, [{ name: "Energy kept", labels: ks, values: vs }], chartBase({
    x: X0, y: 1.3, w: 6.6, h: 5.0, barDir: "col", barGapWidthPct: 45,
    chartColors: [HEX.grey, HEX.teal, HEX.grey, HEX.grey, HEX.amber, HEX.grey],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0"%"', dataLabelFontSize: 13,
    valAxisMinVal: 0, valAxisMaxVal: 110, valAxisHidden: true, valGridLine: { style: "none" },
    showCatAxisTitle: true, catAxisTitle: "top k directions kept (of 32)", catAxisTitleFontSize: 12, catAxisTitleColor: HEX.muted,
    title: "Share of a real adapter's energy in its top k directions",
  }));
  const rx = 7.5, rw = W - X0 - rx;
  card(s, rx, 1.35, rw, 1.15);
  txt(s, [R(`~${Math.round(OS.real_slots.kself)} of 32`, { bold: true, color: "B7791F", fontSize: 26, fontFace: "Cambria" }), R("   directions a real adapter needs to keep 90% of its energy")],
    { x: rx + 0.25, y: 1.35, w: rw - 0.5, h: 1.15, fontSize: 15, valign: "middle" });
  card(s, rx, 2.65, rw, 1.5);
  txt(s, [R("~3 of 32", { bold: true, color: C.accent1, fontSize: 26, fontFace: "Cambria", breakLine: true }),
    R(`directions per task that kept ${(D.split_11.split_avg_11[0] * 100).toFixed(1)}–${(D.split_11.split_avg_11[1] * 100).toFixed(1)}% of quality (split, 11 tasks in one slot, 2 seeds), though they hold only ~${Math.round(D.energy[1].pct)}% of the energy`)],
    { x: rx + 0.25, y: 2.7, w: rw - 0.5, h: 1.4, fontSize: 14, valign: "middle", paraSpaceAfter: 2 });
  outline(s, rx, 4.3, rw, 1.25, C.accent5, 1);
  txt(s, [R("Phase 3 tried allocating by energy: ", { bold: true }), R("it helped in a crowded slot (4 directions: 90.7% vs split's 87.1%) but lost with more room (16: 96.0% vs 98.2%).")],
    { x: rx + 0.25, y: 4.35, w: rw - 0.5, h: 1.15, fontSize: 14, valign: "middle" });
  card(s, rx, 5.7, rw, 0.62, C.accent1);
  txt(s, "Capacity should be measured by a direction's effect on outputs.", { x: rx + 0.2, y: 5.7, w: rw - 0.4, h: 0.62, fontSize: 15, bold: true, color: C.background1, valign: "middle" });
  caption(s, "Energy: real adapters (seed 0, 12 tasks), pooled over all 112 modules. Split and energy-based allocation: Phase 3 real benchmark and stress test (1 seed).", 6.45, 0.4);
  notes(s, "Third lesson, and I think the most useful one for your capacity-aware idea. If we define 'important directions' by energy, a real adapter needs about 17 of its 32 directions to keep 90 percent of its energy. But in Phase 3, when 11 tasks shared one slot, split gave each task only about 3 directions. Those 3 directions hold just 55 percent of the energy, and still the tasks kept 98.5 to 98.9 percent of their quality. Phase 3 also tried giving directions to tasks by energy, and that did not beat a simple equal split once there was enough room. So energy overstates what a task needs. The room a task needs should be measured by what its directions do to the outputs.");
}

// ---- 14. Layers and modules
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "What we learned" });
  s.addText("Where the new directions sit: layers and modules", { placeholder: "title" });
  const lp = D.layer_profiles;
  const L = lp.real_slots.map((_, i) => String(i));
  s.addChart(pres.charts.LINE, [
    { name: "12 real tasks", labels: L, values: lp.real_slots },
    { name: "1.5B lab", labels: L, values: lp.lab15_pairs },
  ], chartBase({
    x: X0, y: 1.3, w: 7.6, h: 5.0, chartColors: [HEX.teal, HEX.purple], lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 6,
    valAxisMinVal: 0, valAxisMaxVal: 20, valAxisMajorUnit: 5, valAxisLabelFormatCode: "0",
    showValAxisTitle: true, valAxisTitle: "overlap, % of the newcomer's energy", valAxisTitleFontSize: 12, valAxisTitleColor: HEX.muted,
    showCatAxisTitle: true, catAxisTitle: "layer", catAxisTitleFontSize: 12, catAxisTitleColor: HEX.muted, catAxisLabelFrequency: 3, catAxisLabelFontSize: 12,
    showLegend: true, legendPos: "b", title: "Overlap layer by layer (Qwen2.5-1.5B, 28 layers)",
  }));
  const rx = 8.5, rw = W - X0 - rx;
  const maxReal = Math.max(...lp.real_slots), maxIdx = lp.real_slots.indexOf(maxReal);
  const last3 = lp.real_slots.slice(-3);
  const lt = D.layer_test;
  const items = [
    [R("Middle layers share the most ", { bold: true }), R(`(real: up to ${Math.round(maxReal)}% at layer ${maxIdx}); the last layers the least (${Math.floor(Math.min(...last3))}–${Math.floor(Math.max(...last3))}%), so they hold the most task-specific directions.`)],
    [R("Per layer and module, ", { bold: true }), R(`demand tracked how much merging changed the module's output, but cosine tracked it a bit better: ρ ${lt["lab05|demand"].pooled.toFixed(2)} vs ${lt["lab05|neg_cos"].pooled.toFixed(2)} (0.5B), ${lt["lab15|demand"].pooled.toFixed(2)} vs ${lt["lab15|neg_cos"].pooled.toFixed(2)} (1.5B).`)],
    [R("Fits Phase 3: ", { bold: true }), R("layer analysis is a probe, not a merge rule.")],
  ];
  const hs = [1.75, 1.95, 0.95];
  let y = 1.35;
  items.forEach((runs, i) => {
    card(s, rx, y, rw, hs[i]);
    txt(s, runs, { x: rx + 0.25, y: y + 0.05, w: rw - 0.5, h: hs[i] - 0.1, fontSize: 14, valign: "middle" });
    y += hs[i] + 0.15;
  });
  caption(s, `Overlap per layer: energy-weighted over modules and cases (86 real, 36 lab). Module test: Phase 3 layer diagnostics, ${lt["lab05|demand"].n.toLocaleString("en-US")} (0.5B) and ${lt["lab15|demand"].n.toLocaleString("en-US")} (1.5B) layer-module cases.`, 6.42, 0.5);
  notes(s, "Here is the same overlap, layer by layer. On the real tasks the middle layers share the most, up to 17 percent, and the last layers share the least, about 6 to 8 percent. So the last layers hold the most task-specific, genuinely new directions. The 1.5B lab shows the same shape at a lower level. I also tested demand at the level of single modules, against how much merging changed that module's output on the task's own inputs, which we measured in Phase 3. Demand does track it, but cosine tracks it slightly better on both models. This fits Phase 3: layer analysis is useful as a probe, but not as a rule for merging.");
}

// ============================ SECTION 5: what it means ============================
pres.addSection({ title: "What it means" });

// ---- 15. Answer table
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "What it means" });
  s.addText("The answer to your question", { placeholder: "title" });
  const H = (t) => Hc(t, { fontSize: 14 });
  const q = (t) => Tc(t, { bold: true, fontSize: 13 });
  const T = (t, o = {}) => Tc(t, { fontSize: 13, ...o });
  const n0 = N.need97.filter((d) => d.seed === 0).map((d) => d.need);
  const rows = [
    [H("Your question"), H("What we found"), H("Evidence")],
    [q("How much genuinely new information does an incoming adapter bring?"), T("Most of it: about 90% of its energy is new to the slot."), T(`Overlap 6–11% by test bed; at least ${Math.floor(D.dem_min_all)}% new in all ${D.n_total} cases`)],
    [q("If most directions are covered, does it need less room?"), T("Almost nothing is covered, so it needs about its full budget."), T(`k_new ${OS.real_slots.knew} vs k_self ${OS.real_slots.kself} of 32 (real)`)],
    [q("Does demand predict K-Merge's failure better than cosine?"), T("Only on the 0.5B lab. Not on 1.5B or on real tasks: the pass rule is not met.", { color: HEX.coral, bold: true }), T(`ρ ${num(lab05.demand2.rho)} vs ${num(lab05.neg_cos.rho)}  ·  ${num(lab15.demand2.rho)} vs ${num(lab15.neg_cos.rho)}  ·  ${num(real.demand2.rho)} vs ${num(real.neg_cos.rho)}`)],
    [q("Why not?"), T("Demand is cosine's overlap factor, and on real tasks task type and slot size drive both."), T(`ρ(cosine, demand) = ${num(D.spearman_cos_demand.real_slots)}; controlled ρ ≈ 0`)],
    [q("Does the 90% cut-off matter?"), T("No: the same answer at 80%, 95% and 100%."), T("Demand never beats cosine on all three test beds")],
    [q("How much room does a task really need?"), T(`By function, little: about 1–4 own directions keep ≥ 97% (median ${median(n0)}), not the ~17 that energy suggests.`), T("Measured from the saved Phase 3 split results")],
    [q("Does demand work as K-Merge's partner rule?"), T("No change in quality."), T(`Same slots in ${D.who_same.lab05.same}/${D.who_same.lab05.runs} and ${D.who_same.lab15.same}/${D.who_same.lab15.runs} runs`)],
  ];
  s.addTable(rows, { x: X0, y: 1.25, w: CW, colW: [4.0, 4.5, 3.633], fontFace: "Calibri", color: HEX.ink, border: { type: "solid", pt: 0.75, color: "D5DCE3" }, fill: { color: HEX.white }, rowH: [0.4, 0.62, 0.58, 0.62, 0.62, 0.5, 0.62, 0.5], margin: 0.06, objectName: "answer-table" });
  card(s, X0, 6.05, CW, 0.75, C.text1);
  txt(s, [R("In one line: ", { bold: true, color: "9FD3D6" }), R("almost everything in a new adapter is new, but that does not tell us when K-Merge fails (task type and crowding do), and each task needs only a few of its own directions.")],
    { x: X0 + 0.3, y: 6.05, w: CW - 0.6, h: 0.75, fontSize: 15, color: C.background1, valign: "middle" });
  notes(s, "This table answers your question point by point. How much is new? Most of it, about 90 percent. Does a well-covered adapter need less room? Almost nothing is covered, so every newcomer needs about its full budget of directions. Does demand predict K-Merge's failures better than cosine? Only on the small lab model; not on 1.5B and not on the real tasks, so the pass rule is not met. Why not? Because demand is really one factor of cosine, and on real tasks both scores mostly reflect the task type and the slot size. And as a partner rule it gives the same slots as cosine almost every time. Two rows are new since last time: the result does not depend on the 90 percent cut-off, and by function each task needs only about one to four of its own directions. In one line: almost everything in a new adapter is new, but that does not tell us when K-Merge fails; task type and crowding do. And each task needs only a few of its own directions.");
}

// ---- 16. What it means for the idea
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "What it means" });
  s.addText("What this means for your capacity-aware idea", { placeholder: "title" });
  const cw = (CW - 0.4) / 2;
  card(s, X0, 1.35, cw, 3.9);
  iconCircle(s, "check_mark_button", X0 + 0.3, 1.55, 0.9, C.background1);
  txt(s, "What holds", { x: X0 + 1.4, y: 1.6, w: cw - 1.6, h: 0.8, fontSize: 22, bold: true, fontFace: "Cambria", color: C.accent1, valign: "middle" });
  const holds = [
    "Store each task's own directions instead of averaging: that is what sharing does, and it kept 98.9% against K-Merge's 90.8% (Phase 3).",
    "Capacity is the right question: tasks differ in how much room they need, and crowding is what hurts.",
  ];
  txt(s, holds.map((t, j) => R(t, { bullet: true, breakLine: j < holds.length - 1 })), { x: X0 + 0.35, y: 2.65, w: cw - 0.7, h: 2.45, fontSize: 16, paraSpaceAfter: 12 });
  const x2 = X0 + cw + 0.4;
  card(s, x2, 1.35, cw, 3.9);
  iconCircle(s, "compass", x2 + 0.3, 1.55, 0.9, C.background1);
  txt(s, "What changes", { x: x2 + 1.4, y: 1.6, w: cw - 1.6, h: 0.8, fontSize: 22, bold: true, fontFace: "Cambria", color: C.accent2, valign: "middle" });
  const changes = [
    `Little is shared (about 10%, mostly within a task type), so storing only the new directions saves little room.`,
    "By function most tasks need only 1–4 directions, but giving unequal shares adds at most about 2 points; when crowded, a shared basis (K-Share) works better.",
  ];
  txt(s, changes.map((t, j) => R(t, { bullet: true, breakLine: j < changes.length - 1 })), { x: x2 + 0.35, y: 2.65, w: cw - 0.7, h: 2.45, fontSize: 16, paraSpaceAfter: 12 });
  card(s, X0, 5.45, CW, 1.05, C.text1);
  iconCircle(s, "bullseye", X0 + 0.25, 5.55, 0.85, C.background1);
  txt(s, [R("The rule that remains: ", { bold: true, color: "9FD3D6" }), R("keep each task's own directions while their needs fit the slot (about 9–10 tasks in 32 directions); beyond that, share a basis.")],
    { x: X0 + 1.35, y: 5.45, w: CW - 1.6, h: 1.05, fontSize: 17, color: C.background1, valign: "middle" });
  caption(s, "Closest prior work: Iso-CTS (ICML 2025), TSV-C (CVPR 2025), HydraLoRA (NeurIPS 2024).", 6.62, 0.3);
  notes(s, "What does this mean for your capacity-aware idea? Two things hold. First, storing each task's own directions instead of averaging complete adapters is right: that is exactly what sharing does, and in Phase 3 it kept 98.9 percent against K-Merge's 90.8. Second, capacity is the right question, because crowding is what hurts. Two things change. Because so little is shared, about 10 percent and mostly within the same task type, storing only the new directions saves little room compared with storing each task's own directions. And when we measure each task's need by function, it is small, about one to four directions, but giving tasks unequal shares adds at most about 2 points; when the slot is crowded, a shared basis like K-Share works better. So the rule that remains is simple: keep each task's own directions while their needs fit the slot, about 9 or 10 tasks in 32 directions, and share a basis beyond that. The closest prior work is listed at the bottom.");
}

// ---- 17a. Capacity by function: functional need
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "What it means" });
  s.addText("Capacity by function: each task needs few directions", { placeholder: "title" });
  const n0 = N.need97.filter((d) => d.seed === 0);
  const byType = (t) => n0.filter((d) => d.task.startsWith(t + "_"));
  const med = { gec: median(byType("gec").map((d) => d.need)), sum: median(byType("sum").map((d) => d.need)), qa: median(byType("qa").map((d) => d.need)) };
  const rngT = (t) => { const v = byType(t).map((d) => d.need); return `${Math.min(...v)}–${Math.max(...v)}`; };
  const cats = ["Grammar", "Summaries", "QA"];
  s.addChart(pres.charts.BAR, [
    { name: "To keep 90% of its energy", labels: cats, values: [N.kself_type.gec, N.kself_type.sum, N.kself_type.qa] },
    { name: "To keep ≥ 97% of its quality", labels: cats, values: [med.gec, med.sum, med.qa] },
  ], chartBase({
    x: X0, y: 1.3, w: 6.9, h: 5.0, barDir: "col", barGapWidthPct: 70, chartColors: [HEX.amber, HEX.teal],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0", dataLabelFontSize: 13,
    valAxisMinVal: 0, valAxisMaxVal: 20, valAxisHidden: true, valGridLine: { style: "none" },
    showLegend: true, legendPos: "b", title: "Directions a real task needs (median, out of 32)",
  }));
  const rx = 7.85, rw = W - X0 - rx;
  const e0 = n0.map((d) => d.energy);
  const sums = [0, 1].map((sd) => N.need97.filter((d) => d.seed === sd).reduce((a, d) => a + d.need, 0));
  const items = [
    [R("QA: 1 direction ", { bold: true, color: C.accent1 }), R(`for all four languages. Grammar: ${rngT("gec")} (median ${med.gec}). Summaries: ${rngT("sum")} (median ${med.sum}).`)],
    [R(`About ${Math.round(100 * median(e0))}% of the energy `, { bold: true, color: C.accent1 }), R(`is all those directions hold (range ${Math.round(100 * Math.min(...e0))}–${Math.round(100 * Math.max(...e0))}%). Counting by energy overstates the need about 5 to 18 times.`)],
    [R(`About ${Math.round((sums[0] + sums[1]) / 10) * 5} directions `, { bold: true, color: C.accent1 }), R(`for all 12 tasks together (${sums[0]} and ${sums[1]} in the two seeds), but one slot has 32. So a slot fits about 9–10 tasks with their own directions.`)],
  ];
  const hs = [1.35, 1.5, 1.65];
  let y = 1.35;
  items.forEach((runs, i) => {
    card(s, rx, y, rw, hs[i]);
    txt(s, runs, { x: rx + 0.25, y: y + 0.05, w: rw - 0.5, h: hs[i] - 0.1, fontSize: 14, valign: "middle" });
    y += hs[i] + 0.15;
  });
  caption(s, "Need = fewest own directions keeping ≥ 97% of the task's own-adapter quality. Measured, not estimated: under split a task's score depends only on its own number of directions, so the saved Phase 3 runs give it at 0, 1, 2, 3, 4 and 8 (seed 0; seed 1 agrees).", 6.42, 0.5);
  notes(s, "This is the first step of the capacity-by-function test, and I could do it without the GPU. Under split, each task reads only its own top directions, so its score depends only on how many directions it gets, not on the other tasks. The Phase 3 runs already gave each task 0, 1, 2, 3, 4 or 8 directions in different slots, so I could read off how many each task needs to keep 97 percent of its quality. The answer: QA needs just 1 direction, grammar about 3 and summaries about 3 to 4. If we count by energy instead, each task seems to need 16 to 18. All 12 tasks together need about 40 directions, a bit more than one slot of 32, so a slot fits about 9 or 10 tasks with their own directions.");
}

// ---- 17b. Allocation by need vs sharing
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "What it means" });
  s.addText("Giving directions by need adds little; sharing wins", { placeholder: "title" });
  const A = N.alloc;
  const L = A.map((a) => `${a.R}`);
  const pc = (v) => Math.round(v * 1000) / 10;
  s.addChart(pres.charts.LINE, [
    { name: "K-Share (shared basis)", labels: L, values: A.map((a) => pc(a.kshare)) },
    { name: "By need (best case)", labels: L, values: A.map((a) => pc(a.byneed)) },
    { name: "Equal split", labels: L, values: A.map((a) => pc(a.split)) },
    { name: "By energy (Phase 3)", labels: L, values: A.map((a) => pc(a.energy)) },
  ], chartBase({
    x: X0, y: 1.3, w: 7.3, h: 5.0, chartColors: [HEX.teal, HEX.purple, HEX.green, HEX.amber], lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 9,
    valAxisMinVal: 85, valAxisMaxVal: 100, valAxisMajorUnit: 5, valAxisLabelFormatCode: "0",
    showValAxisTitle: true, valAxisTitle: "average over 12 tasks, % of own adapter", valAxisTitleFontSize: 12, valAxisTitleColor: HEX.muted,
    showCatAxisTitle: true, catAxisTitle: "directions in the one slot", catAxisTitleFontSize: 12, catAxisTitleColor: HEX.muted,
    showLegend: true, legendPos: "b", title: "All 12 real tasks in one slot (seed 0)",
  }));
  const gain = Math.max(...A.map((a) => a.byneed - a.split));
  const a8 = A.find((a) => a.R === 8);
  const rx = 8.2, rw = W - X0 - rx;
  card(s, rx, 1.35, rw, 1.55);
  txt(s, [R(`+${(Math.round(gain * 1000 + 1e-6) / 10).toFixed(1)} points at most`, { bold: true, color: C.accent6, fontSize: 22, fontFace: "Cambria", breakLine: true }), R("from giving directions by need instead of equally, even with perfect knowledge of each task's need")],
    { x: rx + 0.25, y: 1.4, w: rw - 0.5, h: 1.45, fontSize: 14, valign: "middle", paraSpaceAfter: 2 });
  card(s, rx, 3.05, rw, 1.55);
  txt(s, [R(`${pc(a8.kshare).toFixed(1)}% vs ${pc(a8.byneed).toFixed(1)}%`, { bold: true, color: C.accent1, fontSize: 22, fontFace: "Cambria", breakLine: true }), R("K-Share vs the best by-need split at 8 directions: when tasks outnumber directions, a shared basis wins")],
    { x: rx + 0.25, y: 3.1, w: rw - 0.5, h: 1.45, fontSize: 14, valign: "middle", paraSpaceAfter: 2 });
  card(s, rx, 4.75, rw, 1.55, C.text1);
  txt(s, [R("No GPU needed for this test: ", { bold: true, color: "9FD3D6" }), R("its best case is already known and small. The GPU time is better spent on the missing seeds.")],
    { x: rx + 0.25, y: 4.8, w: rw - 0.5, h: 1.45, fontSize: 14, color: C.background1, valign: "middle" });
  caption(s, "Best case: each task's number of directions chosen with the same test scores (an upper bound), the same number in every layer. The energy-based method of Phase 3 varies the number per layer and module, which is why it can beat the best case when crowded.", 6.42, 0.5);
  notes(s, "Step two would be to give each task as many directions as it needs, instead of an equal share. I could estimate the best this can ever do, again from the saved results, by choosing each task's number of directions with perfect knowledge. That best case adds at most 1.9 points over an equal split, and when the slot is crowded it is clearly below K-Share: at 8 directions, K-Share keeps 96.7 percent and the best by-need split 92.9. So giving tasks unequal private shares is not where the gain is; when tasks outnumber directions, a shared basis is. Because this best case is already known, we don't need to spend GPU time on this test. I would rather use it for the missing seeds of the main results.");
}

// ---- 18. Closing
{
  const s = pres.addSlide({ masterName: "CLOSING_DARK", sectionTitle: "What it means" });
  s.addText("What I would like from you", { placeholder: "title" });
  const asks = [
    ["telescope", "Next GPU time", "Use it for the missing seeds (stress test, real seed 2)? The capacity test's best case adds under 2 points."],
    ["compass", "Demand's role", "Keep demand as a diagnostic of which task gets hurt, not as a partner rule?"],
    ["memo", "Write-up", "Add this study to the paper as the section on why similarity scores fail in K-Merge?"],
  ];
  const cw = (CW - 2 * 0.35) / 3;
  asks.forEach(([img, h, b], i) => {
    const x = X0 + i * (cw + 0.35);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.7, w: cw, h: 3.1, fill: { color: "13304A" }, line: { color: "13304A", width: 0 }, rectRadius: 0.12, objectName: nm("ask") });
    iconCircle(s, img, x + (cw - 1.1) / 2, 1.9, 1.1, C.background1);
    txt(s, h, { x: x + 0.25, y: 3.15, w: cw - 0.5, h: 0.5, fontSize: 21, bold: true, fontFace: "Cambria", color: C.background1, align: "center" });
    txt(s, b, { x: x + 0.3, y: 3.7, w: cw - 0.6, h: 1.0, fontSize: 15, color: C.background2, align: "center" });
  });
  txt(s, [R("How much is new? About 90%.", { bold: true, color: C.accent1, fontSize: 24, breakLine: true }),
    R("Each task needs only a few of its own directions; when they don't fit in the slot, a shared basis does the rest.")],
    { x: X0, y: 5.15, w: CW, h: 1.0, fontSize: 18, color: C.background1, fontFace: "Cambria", paraSpaceAfter: 4 });
  txt(s, "Every number in this deck comes from the saved Phase 3 adapters and result tables; the analysis can be rerun on CPU.", { x: X0, y: 6.35, w: CW, h: 0.4, fontSize: 13, color: C.background2 });
  notes(s, "Thank you, Ma'am. I would like your guidance on three things. First, the next GPU time: since the best case of the capacity test is already known and small, should I use the GPU for the missing seeds of the main results instead, the stress test and the third real seed? Second, should we keep demand as a diagnostic that tells us which task gets hurt, rather than as a partner rule? Third, could this study become the section of the paper that explains why similarity scores fail in K-Merge? To close: how much is new? About 90 percent. Each task needs only a few of its own directions, and when they do not fit in the slot, a shared basis does the rest.");
}

// ============================ SECTION 6: appendix ============================
pres.addSection({ title: "Appendix" });

// ---- 19. All scores table
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Appendix" });
  s.addText("Appendix: every score on every test bed", { placeholder: "title" });
  const preds = [
    ["neg_cos", "Cosine, sign flipped (K-Merge)"], ["demand2", "Demand, both sides (your measure)"], ["demand_out", "Demand, output side only"],
    ["demand_in", "Demand, input side only"], ["knew", "k_new: new directions needed"], ["conflict", "Conflict (−agreement)"],
  ];
  const setsA = [["lab05_pairs", "0.5B pairs"], ["lab05_pairs+triples", "0.5B + 3-task"], ["lab15_pairs", "1.5B pairs"], ["lab15_pairs+triples", "1.5B + 3-task"], ["real_slots", "Real slots"]];
  const NN = { "lab05_pairs": D.ranges.lab05_pairs.n, "lab05_pairs+triples": D.ranges.lab05_pairs.n + D.ranges.lab05_triples.n, "lab15_pairs": D.ranges.lab15_pairs.n, "lab15_pairs+triples": D.ranges.lab15_pairs.n + D.ranges.lab15_triples.n, "real_slots": D.ranges.real_slots.n };
  const head = [Hc("Score", { fontSize: 13 })].concat(setsA.map(([k, l]) => Hc(`${l} (${NN[k]})`, { fontSize: 13, align: "center" })));
  const body = preds.map(([p, label]) => [Tc(label, { fontSize: 12, bold: p === "demand2" })].concat(setsA.map(([k]) => {
    const r = RH[k][p];
    if (p === "neg_cos") return Tc(num(r.rho), { fontSize: 13, align: "center", bold: true });
    const good = r.dlo > 0, bad = r.dhi < 0;
    return { text: [R(num(r.rho), { bold: true, fontSize: 13, breakLine: true }), R(`Δ ${fmtb(r.d)} (${ci(r.dlo, r.dhi)})`, { fontSize: 11, color: good ? HEX.teal : bad ? HEX.coral : HEX.muted })], options: { align: "center", valign: "middle" } };
  })));
  s.addTable([head].concat(body), { x: X0, y: 1.3, w: CW, colW: [3.0, 1.83, 1.83, 1.83, 1.83, 1.813], fontFace: "Calibri", color: HEX.ink, border: { type: "solid", pt: 0.75, color: "D5DCE3" }, fill: { color: HEX.white }, rowH: [0.45].concat(Array(6).fill(0.66)), margin: 0.05, objectName: "all-scores" });
  txt(s, [R("How to read: ", { bold: true }), R("Spearman ρ with K-Merge's damage (higher = better); Δ = score minus cosine with its 95% interval (teal: better than cosine, red: worse, grey: no clear difference). "),
    R("k_new flips sign across test beds; on real data it mostly mirrors each task's own size, which differs by task type.")],
    { x: X0, y: 5.85, w: CW, h: 0.85, fontSize: 13 });
  notes(s, "This appendix table has every score we tested on every test bed, in case you want the details. Each cell gives the rank correlation with K-Merge's damage and, below it, the difference from cosine with its confidence interval. Teal means clearly better than cosine, red clearly worse. The input-side demand looks good on the lab but falls apart on real data; k-new even changes sign between test beds. Nothing passes on all three test beds.");
}

// ---- 20. Definitions and sources
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Appendix" });
  s.addText("Appendix: definitions, settings and sources", { placeholder: "title" });
  const defs = [
    ["Slot", "equal average of the other tasks' A and B in the same final slot (K-Merge Eq. 8); its SVD gives U, S, V"],
    ["Important directions", "the slot's top k directions holding 90% of its energy (k_slot)"],
    ["Overlap", [R("||U"), sub("k"), sup("T"), R(" ΔW"), sub("t"), R(" V"), sub("k"), R("||² ÷ ||ΔW"), sub("t"), R("||²; output or input side: project on one side only")]],
    ["k_self, k_new", "own directions for 90% of the newcomer's energy; extra directions the slot needs to reach 90%"],
    ["Damage", "1 − score after K-Merge ÷ the task's own adapter (exact match in the lab; F0.5, ROUGE-L, F1 on real tasks)"],
    ["Functional need", "fewest own directions that keep ≥ 97% of the task's own-adapter quality (Phase 3 split results)"],
    ["Statistics", "Spearman ρ; cluster bootstrap, 1,000 draws (seed 20261013); partial ρ removes slot size (rank) and task type"],
  ];
  const rows = defs.map(([a, b]) => [Tc(a, { bold: true, fontSize: 13 }), Array.isArray(b) ? { text: b.map((r) => ({ text: r.text, options: { fontSize: 13, ...r.options } })), options: { valign: "middle", color: HEX.ink } } : Tc(b, { fontSize: 13 })]);
  s.addTable(rows, { x: X0, y: 1.3, w: 7.6, colW: [1.95, 5.65], fontFace: "Calibri", color: HEX.ink, border: { type: "solid", pt: 0.75, color: "D5DCE3" }, fill: { color: HEX.white }, rowH: 0.64, margin: 0.07, objectName: "definitions" });
  const rx = 8.55, rw = W - X0 - rx;
  card(s, rx, 1.3, rw, 4.95);
  iconCircle(s, "books", rx + 0.25, 1.45, 0.8, C.background1);
  txt(s, "Sources", { x: rx + 1.2, y: 1.5, w: rw - 1.4, h: 0.7, fontSize: 19, bold: true, fontFace: "Cambria", valign: "middle" });
  const refs = [
    "Shenaj et al. K-Merge. ACL 2026 (arXiv 2510.13537)",
    "Zhu et al. Asymmetry in Low-Rank Adapters. ICML 2024",
    "Tian et al. HydraLoRA. NeurIPS 2024",
    "Marczak et al. Iso-CTS (No Task Left Behind). ICML 2025",
    "Gargiulo et al. Task Singular Vectors (TSV). CVPR 2025",
    "Our data: Kaggle runs, merge lab v4 and v5, real benchmark v8",
  ];
  txt(s, refs.map((t, j) => R(t, { bullet: true, breakLine: j < refs.length - 1 })), { x: rx + 0.25, y: 2.35, w: rw - 0.45, h: 3.8, fontSize: 13, paraSpaceAfter: 6 });
  caption(s, "3D illustrations: Microsoft Fluent Emoji (MIT License). The analysis ran on CPU in a Python workbench; every number is in one saved results file (geometry_results.json).", 6.45, 0.4);
  notes(s, "The last slide lists the exact definitions, the statistical settings and the sources, so every number can be checked.");
}

(async () => {
  const out = path.join(HERE, "K_Merge_Geometry_Study.pptx");
  await pres.writeFile({ fileName: out });
  await setTheme(out, THEME);
  console.log("wrote", out);
})();
