# Last Mile Prep App

Prototype web application for CAT aspirants (Phase 1 user-testing prototype).

## Getting Started

### Install Dependencies
```bash
npm install
```

### Development
Start the local development server:
```bash
npm run dev
```

### Verification Commands
Run the suite of automated checks:
- Type check: `npm run typecheck`
- Lint: `npm run lint`
- Tests: `npm test`
- Content validation: `npm run validate:content`
- Build production bundle: `npm run build`

### Deployment
Configured for deployment on Vercel with the Vite preset:
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Security and robot headers are defined in `vercel.json`.

### Fonts Note
Self-hosted fonts (`Manrope` and `Newsreader`) are linked conditionally in `public/fonts/fonts.css`. By default `assets.selfHostedFonts` is set to `false` in `public/config/app.json`, falling back gracefully to system sans-serif and serif fonts without 404 network errors.
