## Full AI Prompt (MediaMTX + FFmpeg, on‑demand, 1000 cameras, hybrid WebRTC/HLS)

You are a senior video streaming architect designing an enterprise‑grade PSIM restreaming platform for ~1000 ONVIF IP cameras plus miscellaneous radio/audio and MP4/MPEG sources. The frontend is a browser-based operator dashboard. Operators may open **up to 50 cameras each**. **Low latency is important**, but we must also support scalable viewing. We choose a **MediaMTX + FFmpeg** stack and want a **hybrid WebRTC/HLS** delivery model that is **configurable per camera / per dashboard** (or policy-based). The system must be **on-demand**: ingest/pull from cameras should start when viewers exist and stop after an idle TTL.

Produce a complete architecture + design document with the following requirements and constraints:

### 1) Goals & non-goals
- Goals: handle 1000 camera sources, on-demand ingest, low-latency viewing, scalable fan‑out for many viewers, operational reliability, auditability, and stable operator UX.
- Non-goals: no full NVR/VMS recording (unless explicitly added later), no heavy transcoding at scale unless absolutely required.

### 2) Source types
- ONVIF cameras (discovery/control) that provide RTSP URLs.
- RTSP streams directly (including non-ONVIF sources).
- MP4/MPEG sources (file or HTTP).
- Radio/audio streams (HTTP MP3/AAC) where waveform analysis may require CORS when played in browser; explain how restreaming via our domain solves this.

Clarify that ONVIF is discovery/control and that media typically flows over RTSP.

### 3) Delivery targets (browser)
Design for both:
- **WebRTC**: low latency, heavier per viewer.
- **HLS**: higher latency (but we want “low-latency HLS” as an option), highly scalable via HTTP caching.

Make hybrid configurable:
- For “operator wall” low-latency: WebRTC default.
- For “many viewers / incident sharing / low CPU”: HLS default.

Define a policy engine that picks WebRTC vs HLS based on camera priority, current load, operator role, and network conditions.

### 4) High-level architecture (microservices)
Propose a control-plane / data-plane split.

#### Control plane services
- **ONVIF Discovery & Camera Registry**: stores camera metadata, RTSP URLs, credentials, profiles (main/substream), and capabilities.
- **Stream Manager (On-demand Orchestrator)**: decides where a stream runs; starts/stops streams; TTL; health monitoring; retries; failover; rate limiting.
- **Session/Viewer Tracker**: counts viewers per camera, per tenant/site; informs start/stop decisions.
- **API Gateway**: single entry for the dashboard to request “play camera X” and get back a play URL (WebRTC or HLS).
- **Config/Policy Service**: per camera rules (use substream, target resolution/bitrate, preferred protocol, max viewers, priority tiers).

#### Data plane services
- **Media Nodes** (many instances): each runs MediaMTX and optional FFmpeg workers; pulls RTSP and serves WebRTC/HLS outputs.
- Optional **Edge Nodes** near cameras: reduce WAN traffic; aggregate RTSP locally; forward to core media nodes.

Describe how MediaMTX instances are not a “cluster” by themselves and need orchestration for scale-out.

### 5) On-demand strategy
Explain exactly how “on-demand” works:
- When first viewer requests camera: Stream Manager assigns a Media Node and triggers ingest.
- Maintain `cameraId → assignedNode` mapping with TTL and stickiness.
- Stop ingest after no viewers for N seconds.
- Prevent thundering herd on popular cameras.

Include pseudo-APIs:
- `POST /streams/{cameraId}/start?protocol=webrtc|hls`
- `POST /streams/{cameraId}/stop`
- `GET /streams/{cameraId}/endpoint` returns URL + protocol + node.

### 6) Load balancing & scaling strategies
Design for:
- **Balancing camera pulls** across nodes (primary scaling axis).
- **Balancing viewers** (secondary) via HLS caching and limiting WebRTC fan-out.

Recommendations:
- Consistent hashing of `cameraId` to nodes with override for hot cameras.
- Separate node pools: `webrtc-heavy` vs `hls-heavy`, or a single pool with capacity labels.
- Implement admission control: max concurrent WebRTC viewers per node and per camera; fallback to HLS when exceeded.
- Use LL-HLS with tuned segment sizes (if recommended) and CDN/HTTP caching.
- Use “substream” for multi-view grids, “main stream” for single-camera focus.

Include capacity planning heuristics (not exact numbers) and the key metrics to drive autoscaling:
- active camera pulls
- WebRTC peer count
- node CPU, memory, network egress
- per-camera bitrate estimates
- reconnect rate and packet loss

### 7) FFmpeg role (minimal transcoding)
Explain when to use FFmpeg:
- Normalize weird RTSP transports (TCP vs UDP), fix audio codecs, remux without re-encode when possible.
- Only transcode when necessary (e.g., camera outputs H.265 but target browsers cannot decode reliably).
- Use profiles: “copy”, “remux”, “transcode-lite”.

Warn that transcoding 1000 feeds is expensive; design for copy/remux.

### 8) Network/NAT considerations for WebRTC
Give concrete considerations:
- STUN/TURN requirements; TURN sizing (worst-case corporate networks).
- ICE candidate management.
- TLS/DTLS requirements.
- Firewall rules and port ranges.
- Multi-site deployments: edge nodes reduce TURN usage.

### 9) Reliability & failure handling
Design for:
- Node failure: reassignment of cameras; viewer reconnection behavior.
- Camera failure: exponential backoff; circuit breakers; alerts.
- Idempotent start/stop operations.
- Graceful degradation: WebRTC → HLS fallback; main stream → substream fallback.

### 10) Observability & operations
Provide:
- Logging strategy with correlation IDs (`cameraId`, `nodeId`, `sessionId`).
- Metrics and dashboards (Prometheus-style list).
- Health endpoints per service.
- Runbooks: “camera black”, “high latency”, “TURN overload”, “node saturated”.

### 11) Security
Include:
- Credential storage for cameras (vault/KMS).
- Multi-tenant isolation (if applicable).
- Signed playback URLs or tokens to prevent arbitrary access.
- Audit logs for who viewed what.
- CORS headers strategy (for audio/video analysis use cases) while avoiding open proxy risks.

### 12) Things to avoid (explicit anti-patterns)
List pitfalls:
- Letting every viewer pull RTSP directly.
- Per-viewer FFmpeg processes.
- WebRTC for massive fan-out without limits.
- Transcoding everything by default.
- No TTL / never stopping pulls.
- No backpressure/admission control.
- Using browser CORS probes that spam logs; prefer same-origin restream.

### 13) Implementation details (concrete)
Provide:
- Recommended containerization approach (Docker/K8s).
- Process supervision for FFmpeg workers.
- How Stream Manager triggers a media node (HTTP API, message bus).
- State store choice (Redis) for active streams/viewer counts.
- Example data model for cameras and active sessions.
- A clear sequence diagram text for:
  1) operator opens a 50-cam grid
  2) manager assigns cameras to nodes
  3) endpoints returned
  4) viewer connects
  5) viewer disconnects and TTL stop

### 14) Output
Deliver the architecture in:
- A written design doc with sections above
- A concise “MVP first milestone” plan
- A “phase 2/3” scale-hardening plan

Do not assume any proprietary services unless explicitly stated. Prefer open-source and enterprise-operable components.
