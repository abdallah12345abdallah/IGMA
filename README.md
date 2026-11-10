# IGMA

The IGMA company website: software solutions and business automation for Egypt and Saudi Arabia.

The home page is a 3D gallery. Each of the six IGMA systems (ERP, Logistics, Restaurant, Gym, HR, Learning) stands on its own pedestal with real photo-scanned objects, and the camera travels from one system to the next as the visitor scrolls.

## Run it

```bash
npm install
npm run dev       # development server
npm run build     # production build in dist/
npm run preview   # serve the production build
```

## Where to change things

| What | File |
|---|---|
| All page text, contact details, system descriptions | `src/content/site.ts` |
| Colours and fonts | `src/styles/tokens.css` |
| Objects on each pedestal, camera angle and text layout per system | `src/three/stations.ts` |
| 3D scene, lighting, camera movement | `src/three/Showroom.tsx` |
| Scroll speed between systems | `SEGMENT_SVH` in `src/components/Tour.tsx` |
| Opening loader | `src/components/IntroLoader.tsx` |

## Assets

- 3D models in `public/models` come from [Poly Haven](https://polyhaven.com) under the CC0 licence, compressed to GLB with WebP textures and meshopt.
- Still images in `public/stops` are shown while the 3D loads and when WebGL is unavailable. Regenerate them from `/?capture=<stop>` (add `&m=1` for the phone version) after changing the scene.

## Stack

React 19, Vite, TypeScript, Three.js with React Three Fiber and Drei, Lenis for smooth scrolling.
