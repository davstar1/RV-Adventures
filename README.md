# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Admin media deletion

The Site Manager uploads media through `upload-github-photo` and permanently deletes uploaded media through `delete-github-media`. Both Supabase Edge Functions use these Supabase secrets:

- `GITHUB_TOKEN` with read/write access to repository contents
- `GITHUB_OWNER` (defaults to `davstar1`)
- `GITHUB_REPO` (defaults to `rv-adventures`)
- `GITHUB_BRANCH` (defaults to `main`)

Deploy the functions from the project directory:

```sh
supabase functions deploy upload-github-photo
supabase functions deploy delete-github-media
```

The deletion function requires a signed-in Supabase user and only permits image or audio files below `public/photos/`. In the Site Manager, **Remove** only detaches a URL from the current form. **Delete permanently** removes the corresponding file from GitHub and then detaches it from the form.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
