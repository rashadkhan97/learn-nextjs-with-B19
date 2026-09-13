# learn-nextjs-b19

Personal Next.js (App Router) learning project. One folder per concept, kept small and commented so each topic is easy to revisit. Updated continuously as new topics get covered — this file grows alongside the code.

## Stack

- Next.js 16 (App Router)
- React 19
- Plain CSS, no UI library

## Setup

```bash
npm install
npm run dev
```

Runs on [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — run production build

## Project structure

```
app/
  page.jsx              → route "/" (home)
  layout.jsx            → root layout, wraps every page
  index/                → nav page linking to every topic below
  create-component/     → creating & reusing components
  jsx-syntax/            → JSX rules (className, htmlFor, {} interpolation, &&)
  rendering-lists/        → map() + key, add/remove list items (useState)
  events/                → event handling (onClick, onChange, onSubmit, etc.)
components/
  PageHeader.jsx         → shared page header (title + optional description)
  WelcomeCard.jsx        → example reusable component with props
```

Each topic page is self-contained and commented in place — read the file itself for the explanation, not a separate doc.

## Topics covered so far

1. Creating components
2. Using components (props)
3. JSX syntax rules
4. Rendering lists (map + key)
5. Event handling

## Topics planned (per full course outline)

- Sibling components
- Fragments
- Conditional rendering
- Hooks: useState, useEffect, useRouter, useParams, useRef, useCallback, useMemo, useContext, useReducer

## Notes

- This is the standalone "learning pages" part of a larger course monorepo (which also has an Express + MySQL backend and a full Next.js frontend with auth/RBAC). This folder only covers isolated React/Next.js concepts, no backend here.
- Every page/component file has inline comments explaining the non-obvious JSX/React rule it demonstrates — kept minimal, not verbose.
