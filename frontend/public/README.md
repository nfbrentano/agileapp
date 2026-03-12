# Public Assets

This directory contains static assets that are served directly at the root of the application.

## Key Differences

| Feature | `frontend/public/` | `frontend/src/assets/` |
| :--- | :--- | :--- |
| **Referencing** | Can be referenced via absolute URL `/file.png`. | Must be imported in JS/TS files. |
| **Processing** | Served exactly as-is. Not processed by Vite/Rollup. | Processed (hashed, optimized, base64-inlined). |
| **Best For** | Favicons, manifests, marketing images for landing pages. | Icons and small images used inside components. |

## Contents

- `artifacts/`: Contains large static assets or generated marketing materials.
    - `login_marketing_image.png`: High-resolution visual used on the login/landing screens.
- `vite.svg`: Default Vite mascot icon.

## Developer Guidelines
When adding a new asset, choose the location based on whether you need Vite to transform it or if you just need a stable public URL.
