# Luma `/api/v1` verbs

Open this file before sending any JSON body. This page is `/skill/reference.md`. Field schemas: `/openapi.json` (same JSON as `/skill/openapi.json`; viewer `/api/docs`). Do not invent keys.

Default `{base}`: `http://127.0.0.1:18765`. All JSON is camelCase. Every response is:

```json
{"ok":true,"data":{},"error":null}
```

Failure: `ok` false, `data` null, `error` a string. HTTP 400 / 401 / 404 still use this envelope.

| Method | Path | Body |
|--------|------|------|
| GET | `/api/v1` | none → `{name,control}` |
| GET | `/api/v1/session` | none → `{session,target}` |
| POST | `/api/v1/session/start` | none; `data` null |
| POST | `/api/v1/session/pause` | none; toggle pause/resume |
| POST | `/api/v1/session/stop` | none; saves the file |
| GET | `/api/v1/targets/displays` | none; `id` → `displayId` |
| GET | `/api/v1/targets/windows` | none; `id` → `windowId` |
| GET | `/api/v1/targets/games` | none; `id` → `windowId` |
| GET | `/api/v1/targets/cameras` | none; `id` → `overlay.cameraDeviceId` |
| GET | `/api/v1/targets/microphones` | none; `id` → `audio.microphoneDeviceId` |
| PUT | `/api/v1/target` | required; see below |
| GET | `/api/v1/settings` | none |
| PATCH | `/api/v1/settings` | partial; unknown keys fail |
| POST | `/api/v1/settings/reset` | none; only if user asked |
| GET | `/api/v1/library` | none; `id` is the file name |
| PATCH | `/api/v1/library/{id}` | `{"name":"..."}` |
| DELETE | `/api/v1/library/{id}?confirm=true` | none; `confirm` must be true |
| POST | `/api/v1/library/{id}/compress` | none → `{jobId}` |
| POST | `/api/v1/library/{id}/trim` | `startSeconds`,`endSeconds` → `{jobId}` |
| POST | `/api/v1/library/{id}/repair` | none → `{jobId}` |
| GET | `/api/v1/jobs/{jobId}` | none |

Send `Content-Type: application/json` on PUT/PATCH/POST that have a body.

## Auth

If a key is set: `X-Record-Key: <key>` or `Authorization: Bearer <key>`. Empty key: omit both. Never print the key.

## `GET /session` `data`

```json
{
  "session": {"state":"idle","elapsed":"00:00:00","lastSaved":null,"requestedFps":0,"effectiveFps":0,"uniqueFps":0,"downgraded":false,"encoderName":null,"requestedWidth":0,"requestedHeight":0,"actualWidth":0,"actualHeight":0,"warning":null},
  "target": {"mode":"fullscreen","monitorIndex":0,"region":null,"windowId":null,"windowTitle":null}
}
```

`state`: `idle` | `recording` | `paused`. `lastSaved` is `{"name":"clip.mp4","warning":null}` or null. Live pace: `requestedFps`, `effectiveFps`, `uniqueFps`, `downgraded`, `encoderName`, `requestedWidth`/`requestedHeight`, `actualWidth`/`actualHeight`, `warning`. Fullscreen 60 drops to 30 when a 3s unique/s window stays below 50. A 4K request on a 1080p source keeps settings but session/warning name the actual encode size. PATCH `quality` while recording is saved for the next take; `data.warning` and `GET /session` say the current take is unchanged.

## `PUT /target`

Always PUT before start, including fullscreen and audio.

```json
{"mode":"fullscreen"}
{"mode":"audio"}
{"mode":"window","windowId":"<id>"}
{"mode":"game","windowId":"<id>"}
{"mode":"region","displayId":"0","region":{"x":0,"y":0,"width":800,"height":600}}
```

`mode`: `fullscreen` | `region` | `window` | `game` | `audio`. Region width/height must be > 1. Window and game need `windowId` from the list endpoints. Optional `windowTitle`.

## `PATCH /settings`

Send only the fields the user asked to change.

```json
{"silentMode":true}
{"theme":"dark"}
{"showRecordingBar":true}
{"saveFolder":"D:\\\\Videos\\\\Recordings"}
{"uiLanguage":"zh-Hans"}
{"quality":{"level":1,"frameRate":30,"bitrateKbps":8000,"hardwareEncoding":true}}
{"audio":{"captureSystem":true,"captureMicrophone":true,"microphoneDeviceId":"<id>","audioOnly":false}}
{"overlay":{"cameraEnabled":true,"cameraDeviceId":"<id>"}}
{"lanPlayback":{"enabled":true,"accessKey":"<new-key>"}}
```

Allowed top-level keys: `theme` (`light`/`dark` or 1/2), `saveFolder`, `showRecordingBar`, `silentMode`, `closeToTray`, `launchToTray`, `hideTrayIcon`, `monitorIndex`, `lastMode` (0 fullscreen, 1 region, 2 window, 3 game), `quality`, `audio`, `overlay`, `hotkeys`, `automation`, `lanPlayback`, `uiLanguage` (`system`/`en`/`zh-Hans`/`zh-Hant`/`ja`/`ko`).

`quality.level`: 0=SD, 1=HD, 2=1440p, 3=4K. GET masks `lanPlayback.accessKey` as `***`; do not PATCH `***` back as a real key.

## Library and jobs

`{id}` is `GET /library` → `id` (file name, e.g. `clip.mp4`).

```json
{"name":"meeting-notes"}
{"startSeconds":1.5,"endSeconds":12}
```

Compress / trim / repair `data`: `{"jobId":"a1b2c3d4e5f6"}`. Poll until `status` is `done` or `error`:

```json
{"id":"a1b2c3d4e5f6","kind":"trim","status":"done","result":"...\\clip-trim.mp4","error":null}
```
