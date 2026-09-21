# Luma website

The standalone product website for [Luma](https://github.com/flydmonkey/luma).

This is a static site. Serve the repository root with any HTTP server, or deploy it with the included GitHub Pages workflow.

The repository also publishes the bundled documentation:

- `/skill/` — the `luma-control` AI Skill and its reference
- `/api/` — the OpenAPI reference rendered with the bundled RapiDoc
- `/openapi/openapi.json` — the raw OpenAPI specification

## Local preview

```powershell
python -m http.server 8766
```

Then open `http://127.0.0.1:8766/`.
