# Image shot list: IronRidge Roofing

Based on `IronRidge Roofing Homepage Mockup.png` and the photography direction in the brand guide (p. 6).

**Drop every file into `assets/images/` using the exact file name below.** I handle all resizing, cropping, compression (AVIF/WebP at several widths) and retina versions. You only need to supply good sources.

## Rules for every image

- **Download the largest size the stock site offers.** The sizes below are minimums. Never upscale a small image.
- JPG or PNG, no watermark (watermarked previews can't be used), with a license that allows commercial website use. Unsplash and Pexels are free for this; Adobe Stock and Shutterstock work if paid.
- **Look (brand guide):** real American homes, warm natural light, deep/dark roof tones, believable craftsmanship.
- **Avoid:** generic hard-hat stock poses, overprocessed HDR, fake before/after, visible house numbers or company logos, other roofers' branded trucks or shirts.
- Keep one consistent mood across all photos: warm, golden-hour or soft daylight, not cold blue.

## Why these resolutions

- **Desktop** sizes cover 2× retina screens up to 1920 px wide.
- **Mobile** sizes cover 3× iPhones (390 pt wide × 3 = 1170 px).
- One file covers both screens for every slot except the hero, which needs its own vertical crop on phones.

---

## Required: 10 photos (11 files)

| # | File name | Section | Desktop (min) | Mobile (min) |
|---|---|---|---|---|
| 1 | `hero-desktop.jpg` | Hero, main image | **3840 × 2160** (16:9 landscape) | — |
| 2 | `hero-mobile.jpg` | Hero on phones | — | **1440 × 1800** (4:5 portrait) |
| 3 | `service-inspection.jpg` | Service card: Inspections | 1600 × 1000 (16:10) | same file |
| 4 | `service-replacement.jpg` | Service card: Replacements | 1600 × 1000 (16:10) | same file |
| 5 | `service-repair.jpg` | Service card: Repairs | 1600 × 1000 (16:10) | same file |
| 6 | `project-01.jpg` | Recent Projects: Full Roof Replacement | 1600 × 1000 (16:10) | same file |
| 7 | `project-02.jpg` | Recent Projects: Storm Damage Repair | 1600 × 1000 (16:10) | same file |
| 8 | `project-03.jpg` | Recent Projects: Premium Metal Roof | 1600 × 1000 (16:10) | same file |
| 9 | `project-04.jpg` | Recent Projects: Leak Repair | 1600 × 1000 (16:10) | same file |
| 10 | `financing.jpg` | Financing band (dark green) | 2400 × 1200 (2:1) | same file (I crop it) |
| 11 | `estimate-texture.jpg` | "Request a Free Estimate" background | 3200 × 2400 (4:3) | same file (I crop it) |

**Hero shortcut:** if your hero photo is **5000 px wide or more** and the whole house fits in a vertical crop, skip `hero-mobile.jpg` and I'll cut it from the desktop file.

---

## 1–2. The hero: this one has to be stunning

It's the first thing a roofer sees in the pitch. What makes it work:

- **The roof is the star.** It should fill at least 40% of the frame: big, dark, clean architectural shingles with crisp ridgelines. Not a lawn photo with a house in it.
- **Golden hour or dusk**, with **warm lights glowing in the windows**. This matches the limestone and copper palette perfectly.
- **Upscale but believable home:** Craftsman or modern-farmhouse style, stone + wood or brick, with mature trees. Think "nice Nashville suburb", not a mega-mansion.
- **Low three-quarter angle** (shot from the corner of the yard, slightly below the roofline) so the roof looks strong.
- **Desktop composition:** house in the **right 60%**, calmer area (sky, trees, soft lawn) on the **left 40%**, where the headline sits. I add a soft limestone fade on that side, like in the mockup.
- **Mobile composition (4:5 vertical):** the same house or same style, roof in the **upper-middle**, with some breathing room at the top.
- No people, cars, visible house numbers or construction mess.

**Search terms:** `craftsman house golden hour stone`, `modern farmhouse exterior dusk`, `luxury home exterior twilight shingle roof`, `house exterior warm window lights evening`, `stone and wood house exterior sunset`, `suburban home dark roof golden hour`.

👉 **Send me 2–3 hero candidates.** I'll drop each into the real layout at desktop and mobile size and we pick the winner.

**Optional hero extra:** `hero-video.mp4`, for the "See Our Work" card in the mockup. 1920 × 1080, 15–45 seconds, under 25 MB. A slow drone pass over a finished roof, or a crew laying shingles (no logos). Search: `drone roof house`, `roofer installing shingles`. If you don't find one, I'll swap that card for a project photo, which looks just as good.

---

## 3–5. Service cards

| File | What to look for | Search terms |
|---|---|---|
| `service-inspection.jpg` | Someone **on a roof** checking shingles with a tablet or clipboard, plain clothing, natural light. Hands-on, not posed. | `roof inspection`, `roofer inspecting shingles tablet`, `home inspector on roof` |
| `service-replacement.jpg` | A **finished home with a crisp new dark roof**, slightly elevated angle so the whole roof shows. | `new roof house aerial`, `asphalt shingle roof home exterior`, `drone view house roof` |
| `service-repair.jpg` | **Close-up of gloved hands** nailing or placing shingles. Texture and craft. | `roofer hands shingles`, `nailing roof shingles close up`, `roof repair hands` |

All three should sit centered enough to survive a crop to a wide 2:1 card on desktop and 16:10 on mobile.

---

## 6–9. Recent Projects

Each card shows a different **home style** so the carousel feels varied. All exterior shots, roof clearly visible, daylight or golden hour.

| File | Caption in mockup | What to look for | Search terms |
|---|---|---|---|
| `project-01.jpg` | Full Roof Replacement, Franklin TN | Stone/brick two-story with a dark shingle roof | `stone house exterior dark roof`, `two story brick home exterior` |
| `project-02.jpg` | Storm Damage Repair, Brentwood TN | Grey/white siding colonial with a fresh roof (no actual storm damage visible) | `colonial house grey siding exterior`, `white house dark shingle roof` |
| `project-03.jpg` | Premium Metal Roof, Nashville TN | **Modern farmhouse with a black standing-seam metal roof** | `black metal roof farmhouse`, `standing seam metal roof house` |
| `project-04.jpg` | Leak Repair, Murfreesboro TN | Red-brick traditional home | `red brick house exterior roof`, `traditional brick home` |

**Nice to have:** `project-05.jpg` and `project-06.jpg` (any other style: ranch, cedar shake, Tudor) so the carousel has more to scroll through.

> The brand guide says real client sites must use genuine project photos. For the demo these are stand-ins, and the captions stay in `site.ts` where each real roofer swaps them.

---

## 10. Financing band (`financing.jpg`)

The mockup shows a **stone gable roof corner against dark trees**, moody and slightly dark, placed on the right side of a dark-green band. Look for: a roof edge or gable detail, low light, subject on the **right half**. I'll tint it green to blend with the band.

**Search terms:** `roof gable detail`, `stone house roof corner`, `house roofline dusk`, `shingle roof edge trees`.

---

## 11. Estimate background (`estimate-texture.jpg`)

A **close-up of dark asphalt shingles** filling the whole frame. Even texture, no sky. I darken it under the form, so any clean shingle texture works.

**Search terms:** `dark asphalt shingles texture`, `roof shingles close up`, `black roof shingle pattern`.

---

## What you DON'T need to find (I make these)

- **Logo + favicon:** I draw a custom SVG roofline emblem from the brand guide.
- **Service-area map:** I build an SVG of Middle Tennessee with the city pins.
- **Icons:** one line-icon set (Lucide), as the brand guide asks.
- **Apple Pay / Google Pay / Klarna / Afterpay / Splitit marks:** official assets or text. The brand guide warns against implying they're guaranteed, so they appear with a "subject to eligibility" note.
- **Review avatars:** I'll use initials instead of stock faces. Fake faces look staged, and the brand guide asks for verified reviews only. Tell me if you'd rather have photos (400 × 400 square, 3 of them).
- **Social share image (1200 × 630):** I generate it from the hero.
