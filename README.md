# Mohamed Sahal — Portfolio

Personal portfolio for Mohamed Sahal, AI Engineer & Data Scientist. Built with Vite, React 19 and TypeScript. It's a static site with no backend.

## Run it

```bash
npm install
npm run dev       # local dev server with hot reload
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build locally
```

Requires Node 20 or newer.

## Edit the content

Everything you'd normally change lives in two files:

| File | What's in it |
| --- | --- |
| `src/data/site.ts` | Name, email, LinkedIn, GitHub, CV file, availability line, profile photo, custom-cursor toggle |
| `src/data/content.ts` | Projects (with full case studies), experience timeline, skills, certificates, research board, About stats |

**Before publishing, replace the placeholders in `src/data/site.ts`.** The email (`mohamed.sahal@example.com`) and the LinkedIn/GitHub URLs are stand-ins carried over from the design.

Optional fields in `content.ts`. Their buttons only appear once they're filled in:

- `projects[].links.github`: per-project repo. Falls back to the profile GitHub link.
- `projects[].links.demo`: shows the **Demo** button on the card and **Live Demo** in the case study.
- `projects[].screenshots`: shows a Screenshots section in the case study. Put images in `public/` and reference them as `` `${import.meta.env.BASE_URL}my-shot.png` ``.
- `certificates[].url`: shows the **View Certificate** link.
- `certificates[].year`: shows the year when non-empty.

To change the profile photo, replace `public/profile-photo.png`. A portrait around 4:5 works best.

**CV download:** put your CV PDF in `public/` and set `resume` in `src/data/site.ts` (for example `` `${import.meta.env.BASE_URL}Mohamed-Sahal-CV.pdf` ``). A **Download CV** button then appears in the hero and the contact section.

## Deploy

`npm run build` produces a self-contained `dist/` folder with relative asset paths, so it works at a domain root or under a sub-path.

- **Netlify / Vercel / Cloudflare Pages:** build command `npm run build`, output directory `dist`.
- **GitHub Pages:** publish the contents of `dist/` (for example with the `actions/deploy-pages` workflow).

## How it's put together

```
src/
  App.tsx              page shell, modal + mobile-menu state
  styles.css           imports the design system in styles/ (tokens + base, sections, projects, modal + responsive)
  three/               page-wide 3D particle scene (Three.js, lazy-loaded):
                       Scene3D.tsx morphing particle cloud + readout, shaders.ts GLSL
  lib/motion.ts        scroll reveal, headline reveal trigger, scroll lock, media queries
  components/
    Header.tsx         nav, scroll progress, active section, mobile menu
    Hero.tsx           headline entrance (NeuralCanvas.tsx is the 2D fallback without WebGL)
    About.tsx          profile card, count-up stats
    Experience.tsx     pinned horizontal timeline (vertical list on phones)
    Projects.tsx       project cards  ·  ProjectModal.tsx  case-study dialog
    Skills.tsx         category filter + inspector
    SplitText.tsx      word-by-word headline reveal with serif accent phrases
    Marquee.tsx, Certificates.tsx, Exploring.tsx, Contact.tsx, Footer.tsx, Cursor.tsx
```

**Design:** cinematic black and crimson. Near-black background lit in red, wide Archivo display caps over Geist, dark glass panels, centred section titles with a short red rule. The red is set once as `--red` / `--c1`–`--c3` in `src/styles/base.css` and `C1`–`C3` in `src/three/shaders.ts`.

**3D scene:** one particle cloud behind the whole page that re-forms into a different machine-learning structure for each section: a latent sphere (hero), neural layers (About), a growth helix (Experience), k-means clusters (Projects), a loss landscape with a gradient-descent path (Skills), an orbit ring (Certificates, Exploring) and an embedding galaxy (Contact). The morph runs on the GPU, the pointer parts the cloud, clicking empty space sends a shockwave through it, and the readout on the right names the current structure. Section → shape mapping is `STOPS` in `src/three/Scene3D.tsx`.

**Scroll motion:** the hero answers "Who is Mohamed Sahal?" token by token like a streaming LLM; Experience pins and scrolls sideways; Projects keeps a live "stage" pinned on the left that cross-fades to whichever case is in focus and lights its pipeline step by step; the About paragraph inks in word by word (`ScrubText.tsx`); the marquee follows scroll speed and direction.

Motion respects `prefers-reduced-motion`: the particle cloud still changes shape per section but doesn't drift or react to the pointer, Experience becomes a plain list, the hero answer appears in full, headline and scroll reveals are skipped, and the marquee stops. The contact form validates its fields, then opens the visitor's email client with the message pre-filled.
