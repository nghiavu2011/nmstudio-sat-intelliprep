# SAT IntelliPrep — Visual Asset Integration Prompt for Antigravity

**Date:** 2026-10-04  
**Project root:** `D:\antigravity_scratch\real_estate_scoring\sql\SAT`  
**Source asset folder:** `D:\antigravity_scratch\real_estate_scoring\sql\SAT\assets`

## Objective

Integrate the finalized visual assets into SAT IntelliPrep without changing the SAT engine, question logic, scoring logic, adaptive routing, diagnostic logic, SRS behavior, or learning-state data model.

The visual language must remain **Calm Academic Intelligence**: bright, airy, premium, editorial, academically trustworthy, with restrained pastel accents and consistent Lucide outline icons.

---

# 1. First: inventory the asset folder

Recursively scan:

```text
D:\antigravity_scratch\real_estate_scoring\sql\SAT\assets
```

For every image, collect:

- filename
- extension
- pixel dimensions
- aspect ratio
- transparency / alpha availability
- approximate visual role based on image content

Do **not** assume current filenames are final.

Create an internal mapping before editing HTML/CSS.

---

# 2. Canonical asset structure

Reorganize/copy the selected final files into:

```text
assets/
  visual/
    hero/
      landing-hero-desktop.webp
      landing-hero-mobile.webp
      today-student-cutout.webp

    editorial/
      strategy-review.webp
      diagnostic-start.webp

    domains/
      rw-information-ideas.webp
      rw-craft-structure.webp
      rw-expression-ideas.webp
      rw-standard-conventions.webp

      math-algebra.webp
      math-advanced.webp
      math-psda.webp
      math-geometry-trig.webp

    mock/
      mock-test.webp

    empty/
      review-complete.webp
      mistakes-empty.webp
      diagnostic-empty.webp
```

If a canonical image is not available, do **not** invent a stock placeholder. Use the existing pastel card + Lucide icon system as a graceful fallback.

---

# 3. Asset-role mapping

## Hero

### `landing-hero-desktop.webp`
Use the wide group-study image with:

- students concentrated on the right,
- strong negative space on the left,
- bright academic setting,
- 16:9 / wide crop.

Placement:

- Landing page only.
- Real headline and CTA remain HTML, never baked into the image.

### `landing-hero-mobile.webp`
Use the dedicated vertical group-study image.

Placement:

- Mobile landing page through `<picture>`.
- Do not derive this by blindly center-cropping the desktop hero.

### `today-student-cutout.webp`
Use the transparent student cutout.

Placement:

- Right side of Today personalized hero.
- Maximum visual occupancy about 25–35% of the hero card on desktop.
- Reduce or hide on narrow mobile layouts.

---

# 4. Editorial support imagery

### `strategy-review.webp`
Use the single-student image reviewing a difficult problem with notebook, calculator/laptop, and focused study posture.

Suitable placements:

- Today strategy card,
- Resources / study-method section,
- Landing “How it works”.

Do not place it inside active question-taking screens.

### `diagnostic-start.webp`
Use the student beginning a digital assessment on laptop.

Suitable placements:

- Diagnostic onboarding panel,
- Diagnostic CTA on Landing,
- Diagnostic intro state.

---

# 5. Domain cards

The 8 domain images are supporting imagery, not the main navigation system.

Keep the existing domain identity driven by:

```text
pastel surface + Lucide icon + title + mastery/progress + CTA
```

Use the image as a subtle top/side visual region only.

Recommended mapping:

| Canonical asset | SAT domain |
|---|---|
| `rw-information-ideas.webp` | Information and Ideas |
| `rw-craft-structure.webp` | Craft and Structure |
| `rw-expression-ideas.webp` | Expression of Ideas |
| `rw-standard-conventions.webp` | Standard English Conventions |
| `math-algebra.webp` | Algebra |
| `math-advanced.webp` | Advanced Math |
| `math-psda.webp` | Problem-Solving and Data Analysis |
| `math-geometry-trig.webp` | Geometry and Trigonometry |

## Domain-card rules

- Avoid turning the Practice page into a photo gallery.
- Image area should be secondary to skill identity and progress.
- Use consistent crop ratio across all 8 cards.
- Prefer `object-fit: cover` with controlled `object-position`.
- Keep domain color visible even when image exists.
- On mobile, simplify or reduce imagery if it harms scanning speed.

---

# 6. Mock Test visual

### `mock-test.webp`
Use the focused exam-mode image with laptop, study setup, timer/clock cue where available.

Placement:

- Mock Test landing/selection card only.

Do **not** use photography inside:

- active timed exam,
- adaptive transition,
- 10-minute break,
- results question review.

The actual exam flow must remain visually restrained and distraction-free.

---

# 7. Empty states

### `review-complete.webp`
Use for:

- no reviews currently due,
- completed review queue,
- calm positive completion state.

### `mistakes-empty.webp`
Use only if a dedicated image exists. Otherwise render a clean pastel empty-state panel using Lucide `CircleCheckBig` / `NotebookCheck`.

### `diagnostic-empty.webp`
Use only if a dedicated image exists. Otherwise render a clean pastel onboarding empty state using Lucide `ScanSearch` / `ClipboardList`.

Empty states must remain lightweight and never dominate the page.

---

# 8. Icon system

Do **not** generate raster icons from AI images.

Use **Lucide Icons** consistently.

Suggested mapping:

```text
Today                         Sun
Practice                      BookOpenCheck
Review                        RotateCcw
Mock Test                     ClipboardCheck
Progress                      TrendingUp
Diagnostic                    ScanSearch
Mistakes                      TriangleAlert
Vocabulary                    Languages
Grammar                       SpellCheck2
Math                          Sigma
Timer                         Timer
Target score                  Target
Study streak                  Flame
Readiness                     Gauge
Strategy                      Lightbulb
Information and Ideas         SearchCheck
Craft and Structure           Blocks
Expression of Ideas           PencilLine
Standard English Conventions  SpellCheck2
Algebra                       Variable
Advanced Math                 FunctionSquare
PSDA                          ChartNoAxesCombined
Geometry & Trigonometry       Shapes
```

Do not mix icon families.

---

# 9. Image processing

For photography:

- convert final production images to WebP,
- preserve enough visual quality for premium presentation,
- strip unnecessary metadata,
- avoid oversharpening,
- provide explicit width/height attributes in HTML,
- lazy-load below-the-fold imagery.

Targets:

```text
Landing hero desktop: ideally <= 450 KB
Landing hero mobile: ideally <= 300 KB
Supporting editorial: 150–300 KB
Domain cards: 80–180 KB each where practical
```

For transparent cutouts:

- preserve alpha,
- use WebP with alpha if browser/export quality is acceptable,
- otherwise retain optimized PNG.

---

# 10. Responsive implementation

Use `<picture>` for the Landing hero:

```html
<picture>
  <source media="(max-width: 767px)" srcset="assets/visual/hero/landing-hero-mobile.webp">
  <img
    src="assets/visual/hero/landing-hero-desktop.webp"
    alt="Vietnamese high-school students preparing for the Digital SAT together"
    width="..."
    height="..."
    fetchpriority="high"
  >
</picture>
```

Rules:

- `fetchpriority="high"` / eager loading only for primary landing hero.
- Below-the-fold images use `loading="lazy"`.
- Decorative images use `alt=""`.
- Content-bearing editorial images get concise meaningful alt text.

---

# 11. UX guardrails

Do not let the new imagery break the existing learning hierarchy.

Priority remains:

```text
What should I do now?
→ primary learning action
→ readiness / review status
→ practice choices
→ supporting imagery
```

Never allow:

- photography to compete with the primary CTA,
- text baked inside generated imagery,
- unreadable AI-generated formulas to become instructional content,
- image-only navigation,
- excessive imagery inside Review / Mock / Progress,
- decorative visuals inside active SAT question flow.

---

# 12. Do not change during this pass

Do not modify:

- question-bank answer keys,
- canonical SAT taxonomy,
- diagnostic scoring,
- adaptive routing,
- SAT score-band logic,
- SRS intervals,
- error classification logic,
- study-time tracking,
- test timers,
- Desmos logic,
- College Board disclaimer/compliance text.

This pass is **visual asset integration only**.

---

# 13. Final QA checklist

Before committing, verify:

- [ ] Desktop landing hero uses the correct wide image.
- [ ] Mobile landing hero uses the dedicated mobile image.
- [ ] Hero text/CTA are real HTML, not embedded in images.
- [ ] Today cutout transparency is clean.
- [ ] No image stretches or distorts.
- [ ] All 8 domain assets map to the correct SAT domain.
- [ ] Domain images remain secondary to labels/progress/actions.
- [ ] Mock Test image is absent from the active exam flow.
- [ ] Empty states have graceful icon-based fallbacks.
- [ ] Lucide is the only functional icon family.
- [ ] Above-the-fold hero is optimized and eagerly loaded.
- [ ] Supporting images are lazy-loaded.
- [ ] Mobile 390 px layout remains clean.
- [ ] Tablet 768 px layout remains clean.
- [ ] Desktop 1440 px layout remains clean.
- [ ] No SAT engine behavior changed.

---

# 14. Commit

After visual QA passes, commit separately from functional logic:

```text
feat(visual-assets): integrate finalized SAT IntelliPrep editorial imagery
```

In the completion report, provide:

1. exact source image → canonical asset mapping,
2. final production filenames and dimensions,
3. files modified,
4. before/after screenshot list by viewport,
5. image-size/performance summary,
6. confirmation that SAT engine logic was untouched.
