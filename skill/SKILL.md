---
name: luma-control
description: Use when the user asks to start, stop, pause, or remotely control Luma, change its LAN settings, list or edit Library recordings, call /api/v1 or OpenAPI, or mentions X-Record-Key, port 18765, or LAN access.
---

# Luma Control

Control a running Luma instance only through the shipped LAN API. Do not invent routes, named pipes, or UI Automation.

## When to Use

- User wants Luma to start, pause, stop, change settings, or manage finished recordings
- User mentions the LAN web app, OpenAPI, `/api/v1`, or LAN access

**Do not use** to redesign the recorder, add HTTP routes, or drive the WinUI window when the server is down.

## Steps

1. **Probe.** `GET {base}/api/v1`. Default `base` is `http://127.0.0.1:18765`. Use a URL the user pasted, or the address in settings, if different.
2. **LAN off.** Connection refused or timeout: tell the user to enable LAN access. Stop. Do not click the desktop, send hotkeys, or claim success.
3. **Unlock.** `401`: send `X-Record-Key` (or Bearer) from the user, or from `%LOCALAPPDATA%/Record/settings.json` → `lanPlayback.accessKey` if empty key is not enough. Never print the key.
4. **See state.** `GET {base}/api/v1/session` before changing anything.
5. **Record.** For region, window, or game: list targets, `PUT {base}/api/v1/target`, then `POST {base}/api/v1/session/start`. Fullscreen or audio-only still `PUT` the mode first. If start fails, report the API error. Do not retry blindly.
6. **Pause / stop.** `POST .../session/pause` or `.../session/stop`. Confirm with `GET .../session`.
7. **Settings.** `PATCH {base}/api/v1/settings` with only the fields asked. `POST .../settings/reset` and turning LAN off only when the user explicitly asked.
8. **Library.** `GET {base}/api/v1/library`. Delete only after the user confirmed, with `?confirm=true`.

Before any PUT/PATCH/POST body: `GET /skill/reference.md` (same file as `reference.md` in this folder). Nested fields: `GET /openapi.json` (same document as `/skill/openapi.json` and `/api/docs`). Do not guess field names.

## Example

User: "Record the window titled Notes"

```powershell
$base = "http://127.0.0.1:18765"
Invoke-RestMethod "$base/api/v1"
$windows = Invoke-RestMethod "$base/api/v1/targets/windows"
# pick the item whose title matches Notes
Invoke-RestMethod -Method Put "$base/api/v1/target" -ContentType "application/json" -Body '{"mode":"window","windowId":"<id>"}'
Invoke-RestMethod -Method Post "$base/api/v1/session/start"
Invoke-RestMethod "$base/api/v1/session"
```

## Common Mistakes

| Excuse | Reality |
|--------|---------|
| "I'll add a /record route" | Only shipped `/api/v1` paths. |
| "LAN is off, I'll click Start" | Fail closed. Ask to enable LAN access. |
| "Start first, pick the window later" | `PUT /target` then start. |
| "Delete it, they implied it" | No `confirm=true` until they confirm. |
| "Reset is safer than a patch" | Patch the one field. |
| "Show the key so they can check" | Never echo the access key. |

## Red Flags

- New URL that is not listed in `/skill/reference.md`
- UI Automation, hotkeys, or CaptureReadme used as a control fallback
- `POST /session/start` with no prior `PUT /target` for region/window/game
- `DELETE /library/{id}` without `confirm=true`
- Printing `accessKey` in the reply
- Guessing body fields instead of reading reference.md or `/openapi.json`
