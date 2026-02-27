<script>
/** Default and minimum grid size for this widget. */
export const gridDefaults = { w: 2, h: 3, minW: 1, minH: 2 };

/** Metadata for the widget selector (friendly name, description, icon, group). */
export const widgetMeta = {
  friendlyName: "Audio Player",
  description:
    "Plays audio from media URLs, internet radio, or music tracks with album art and controls.",
  icon: "fa-solid fa-music",
  group: "Media",
};

/** Full property metadata for AudioPlayerWidget. */
export const PROP_SCHEMA = {
  uniqueName: {
    type: "string",
    default: "",
    control: "text",
    label: "Unique Name",
    description:
      "Unique identifier for this widget (used for data binding and scripting)",
  },
  description: {
    type: "string",
    default: "",
    control: "text",
    label: "Description",
    description: "Optional description or notes for this widget",
  },
  mediaUrl: {
    type: "string",
    default: "",
    control: "text",
    label: "Media URL",
    description: "Single media URL",
  },
  mediaUrls: {
    type: "string",
    default: "",
    control: "text",
    label: "Playlist URLs",
    description: "Comma-separated list of media URLs (overrides Media URL)",
  },
  trackTitle: {
    type: "string",
    default: "Track Title",
    control: "text",
    label: "Track Title",
    description: "Title of the current track",
  },
  trackArtist: {
    type: "string",
    default: "Artist",
    control: "text",
    label: "Track Artist",
    description: "Artist of the current track",
  },
  albumArtUrl: {
    type: "string",
    default: "",
    control: "text",
    label: "Album Art URL",
    description: "URL of the album art for the current track",
  },
  layout: {
    type: "string",
    default: "Vertical",
    control: "select",
    options: ["Vertical", "Horizontal", "Nano", "Shuffle"],
    label: "Layout",
    description: "Layout of the audio player",
  },
  showVisualizer: {
    type: "boolean",
    default: true,
    control: "switch",
    label: "Show Visualizer",
    description: "Show the audio visualizer",
  },
  showPlaybackControls: {
    type: "boolean",
    default: true,
    control: "switch",
    label: "Show Playback Controls",
    description: "Show play, pause, previous, and next buttons",
  },
  showAudioControls: {
    type: "boolean",
    default: true,
    control: "switch",
    label: "Show Audio Controls",
    description: "Show volume slider (vertical and horizontal layouts only)",
  },
  showProgressBar: {
    type: "boolean",
    default: true,
    control: "switch",
    label: "Show Progress Bar",
    description: "Show progress bar and time display",
  },
  showTrackInfo: {
    type: "boolean",
    default: true,
    control: "switch",
    label: "Show Track Info",
    description: "Show track title and artist",
  },
  accentColor: {
    type: "string",
    default: "#1db954",
    control: "colorPure",
    label: "Accent Color",
    description:
      "Primary accent color for buttons, progress bar, and highlights",
  },
  backgroundColor: {
    type: "string",
    default: "",
    control: "colorBoth",
    label: "Background Color",
    description: "Background color or gradient for the widget card",
  },
  borderLeftColor: {
    type: "string",
    default: "",
    control: "colorPure",
    label: "Border Left",
    description: "Left border color",
  },
  borderTopColor: {
    type: "string",
    default: "",
    control: "colorPure",
    label: "Border Top",
    description: "Top border color",
  },
  borderRightColor: {
    type: "string",
    default: "",
    control: "colorPure",
    label: "Border Right",
    description: "Right border color",
  },
  borderBottomColor: {
    type: "string",
    default: "",
    control: "colorPure",
    label: "Border Bottom",
    description: "Bottom border color",
  },
  cardPaddingAll: {
    type: "number",
    default: 0.5,
    control: "number",
    label: "Padding All (rem)",
    description: "Uniform padding around the widget content in rem units",
    min: 0,
    max: 5,
    step: 0.1,
  },
  overflow: {
    type: "string",
    default: "Hidden",
    control: "select",
    options: ["Hidden", "Visible", "Auto", "Scroll"],
    label: "Overflow",
    description:
      "How overflowed content is handled (hidden, visible, auto, scroll)",
  },
};

/** Prop names grouped by category. */
export const CONFIGURABLE_PROPS_BY_GROUP = {
  general: ["uniqueName", "description"],
  media: ["mediaUrl", "mediaUrls", "trackTitle", "trackArtist", "albumArtUrl"],
  appearance: [
    "layout",
    "showVisualizer",
    "showPlaybackControls",
    "showAudioControls",
    "showProgressBar",
    "showTrackInfo",
    "accentColor",
    "backgroundColor",
    "borderLeftColor",
    "borderTopColor",
    "borderRightColor",
    "borderBottomColor",
    "cardPaddingAll",
    "overflow",
  ],
};

/** Builds property schema for PropertyGridWidget from widget props. */
export function buildPropertySchema(props = {}) {
  const children = Object.entries(CONFIGURABLE_PROPS_BY_GROUP).map(
    ([groupName, keys]) => ({
      label: groupName.charAt(0).toUpperCase() + groupName.slice(1),
      children: keys
        .filter((key) => PROP_SCHEMA[key])
        .map((key) => {
          const schema = PROP_SCHEMA[key];
          let current = props[key];
          if (key === "layout" && current) {
            const v = String(current).toLowerCase();
            if (v === "vertical") current = "Vertical";
            else if (v === "horizontal") current = "Horizontal";
            else if (v === "nano") current = "Nano";
            else if (v === "shuffle") current = "Shuffle";
          }
          if (key === "overflow" && current) {
            const v = String(current).toLowerCase();
            if (v === "hidden") current = "Hidden";
            else if (v === "visible") current = "Visible";
            else if (v === "auto") current = "Auto";
            else if (v === "scroll") current = "Scroll";
          }
          const value =
            current === undefined || current === null
              ? schema.default
              : current;
          return {
            key,
            label: schema.label ?? key,
            value,
            type: schema.type,
            default: schema.default,
            control: schema.control ?? "text",
            options: schema.options ?? null,
            min: schema.min,
            max: schema.max,
            step: schema.step,
            description: schema.description ?? null,
            children: [],
          };
        }),
    }),
  );

  return {
    label: "Audio Player Settings",
    children,
  };
}
</script>

<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  inject,
  nextTick,
} from "vue";

const props = defineProps({
  openPropertyEditor: { type: Function, default: null },
  removeWidget: { type: Function, default: null },
  editMode: { type: Boolean, default: false },
  uniqueName: { type: String, default: "" },
  description: { type: String, default: "" },
  mediaUrl: { type: String, default: "" },
  mediaUrls: { type: String, default: "" },
  trackTitle: { type: String, default: "Track Title" },
  trackArtist: { type: String, default: "Artist" },
  albumArtUrl: { type: String, default: "" },
  layout: { type: String, default: "Vertical" },
  showVisualizer: { type: [Boolean, String], default: true },
  showPlaybackControls: { type: [Boolean, String], default: true },
  showAudioControls: { type: [Boolean, String], default: true },
  showProgressBar: { type: [Boolean, String], default: true },
  showTrackInfo: { type: [Boolean, String], default: true },
  accentColor: { type: String, default: "#1db954" },
  backgroundColor: { type: String, default: "" },
  borderLeftColor: { type: String, default: "" },
  borderTopColor: { type: String, default: "" },
  borderRightColor: { type: String, default: "" },
  borderBottomColor: { type: String, default: "" },
  cardPaddingAll: { type: [Number, String], default: 0.5 },
  overflow: { type: String, default: "Hidden" },
});

const audioRef = ref(null);
const titleRef = ref(null);
const artistRef = ref(null);
const shuffleTitleRef = ref(null);
const shuffleArtistRef = ref(null);
const titleScrolls = ref(false);
const artistScrolls = ref(false);
const shuffleTitleScrolls = ref(false);
const shuffleArtistScrolls = ref(false);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(0.7);
const volumeBeforeMute = ref(0.7);
const currentTrackIndex = ref(0);

const progressBarRef = ref(null);
const volumeBarRef = ref(null);
const progressHandleActive = ref(false);
const progressHandleHover = ref(false);
const volumeHandleActive = ref(false);
const volumeHandleHover = ref(false);
let handleMoveRaf = 0;
let lastPointerPos = { x: 0, y: 0 };

const visualizerCanvasRef = ref(null);
let visualizerResizeObserver = null;
let audioCtx = null;
let analyserNode = null;
let analyserSourceNode = null;
let analyserData = null;
let visualizerRaf = 0;

const injectedOpenPropertyEditor = inject("openPropertyEditor", null);
const openPropertyEditor = computed(
  () => props.openPropertyEditor ?? injectedOpenPropertyEditor,
);

const playlist = computed(() => {
  const urls = String(props.mediaUrls || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (urls.length) return urls;
  const single = String(props.mediaUrl || "").trim();
  return single ? [single] : [];
});

const currentUrl = computed(() => {
  const list = playlist.value;
  if (!list.length) return "";
  const idx = Math.max(0, Math.min(currentTrackIndex.value, list.length - 1));
  return list[idx];
});

const layout = computed(() => {
  const v = String(props.layout || "Vertical").trim();
  return v.toLowerCase();
});

const showVisualizerBool = computed(() => {
  const v = props.showVisualizer;
  if (typeof v === "boolean") return v;
  return String(v).toLowerCase() !== "false";
});

const showVisualizerEnabled = computed(
  () => showVisualizerBool.value && layout.value !== "nano" && layout.value !== "shuffle",
);

const showWaveform = computed(
  () => showVisualizerEnabled.value && !!currentUrl.value && isSameOriginUrl(currentUrl.value),
);

function isSameOriginUrl(url) {
  try {
    const u = new URL(url, window.location.href);
    return u.origin === window.location.origin;
  } catch {
    // If it's not a valid absolute/relative URL, just treat as same-origin-ish.
    return true;
  }
}


const showPlaybackControlsBool = computed(() => {
  const v = props.showPlaybackControls;
  if (typeof v === "boolean") return v;
  return String(v).toLowerCase() !== "false";
});

const showAudioControlsBool = computed(() => {
  const v = props.showAudioControls;
  if (typeof v === "boolean") return v;
  return String(v).toLowerCase() !== "false";
});

const showProgressBarBool = computed(() => {
  const v = props.showProgressBar;
  if (typeof v === "boolean") return v;
  return String(v).toLowerCase() !== "false";
});

const showTrackInfoBool = computed(() => {
  const v = props.showTrackInfo;
  if (typeof v === "boolean") return v;
  return String(v).toLowerCase() !== "false";
});

/** Controls row is shown only when playback controls are shown; audio controls require both. */
const showControlsRowBool = computed(() => showPlaybackControlsBool.value);

const cardStyle = computed(() => {
  const style = {
    maxHeight: "100%",
    height: "100%",
    overflow: (props.overflow || "Hidden").toLowerCase(),
    minHeight: 0,
    padding: `${Number(props.cardPaddingAll) || 0.5}rem`,
  };
  if (props.backgroundColor) {
    const bg = props.backgroundColor.trim();
    if (/^linear-gradient\(|^radial-gradient\(/i.test(bg))
      style.background = bg;
    else style.backgroundColor = bg;
  }
  const width = "3px solid ";
  if (props.borderLeftColor) style.borderLeft = width + props.borderLeftColor;
  if (props.borderTopColor) style.borderTop = width + props.borderTopColor;
  if (props.borderRightColor)
    style.borderRight = width + props.borderRightColor;
  if (props.borderBottomColor)
    style.borderBottom = width + props.borderBottomColor;
  return style;
});

const accentStyle = computed(() => ({
  "--accent-color": props.accentColor || "#1db954",
}));

const defaultAlbumArt =
  "https://images.unsplash.com/photo-1564419431636-fe02f0eff7aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400";

const displayAlbumArt = computed(() => {
  const url = String(props.albumArtUrl || "").trim();
  return url || defaultAlbumArt;
});

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function togglePlay() {
  const audio = audioRef.value;
  if (!audio) return;
  resumeAudioContextIfNeeded();
  if (isPlaying.value) {
    audio.pause();
  } else {
    audio.play().catch(() => {});
  }
  isPlaying.value = !isPlaying.value;
}

function resumeAudioContextIfNeeded() {
  try {
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume?.().catch?.(() => {});
    }
  } catch {}
}

function seek(e) {
  const audio = audioRef.value;
  const bar = e.currentTarget;
  if (!audio || !bar) return;
  resumeAudioContextIfNeeded();
  const rect = bar.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const d = Number(audio.duration) || 0;
  if (Number.isFinite(d) && d > 0) audio.currentTime = pct * d;
}

function seekAtClientX(clientX, barEl) {
  const audio = audioRef.value;
  if (!audio || !barEl) return;
  const rect = barEl.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const d = Number(audio.duration) || 0;
  if (d) audio.currentTime = pct * d;
}

function setVolume(e) {
  const bar = e.currentTarget;
  if (!bar) return;
  resumeAudioContextIfNeeded();
  const rect = bar.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  volume.value = pct;
  if (pct > 0) volumeBeforeMute.value = pct;
  if (audioRef.value) audioRef.value.volume = pct;
}

function setVolumeAtClientX(clientX, barEl) {
  const audio = audioRef.value;
  if (!audio || !barEl) return;
  const rect = barEl.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  volume.value = pct;
  if (pct > 0) volumeBeforeMute.value = pct;
  audio.volume = pct;
}

function updateProgressHandleProximity(clientX, clientY) {
  const el = progressBarRef.value;
  if (!el || !showProgressBarBool.value) {
    progressHandleActive.value = false;
    return;
  }
  const rect = el.getBoundingClientRect();
  const padX = 10;
  const padY = 10;
  const near =
    clientX >= rect.left - padX &&
    clientX <= rect.right + padX &&
    clientY >= rect.top - padY &&
    clientY <= rect.bottom + padY;
  progressHandleActive.value = near;
}

function updateVolumeHandleProximity(clientX, clientY) {
  const el = volumeBarRef.value;
  const volumeEnabled =
    showAudioControlsBool.value &&
    showPlaybackControlsBool.value &&
    layout.value !== "nano" &&
    layout.value !== "shuffle";
  if (!el || !volumeEnabled) {
    volumeHandleActive.value = false;
    return;
  }
  const rect = el.getBoundingClientRect();
  const padX = 10;
  const padY = 10;
  const near =
    clientX >= rect.left - padX &&
    clientX <= rect.right + padX &&
    clientY >= rect.top - padY &&
    clientY <= rect.bottom + padY;
  volumeHandleActive.value = near;
}

function onDocumentPointerMove(e) {
  lastPointerPos = { x: e.clientX, y: e.clientY };
  if (handleMoveRaf) return;
  handleMoveRaf = requestAnimationFrame(() => {
    handleMoveRaf = 0;
    updateProgressHandleProximity(lastPointerPos.x, lastPointerPos.y);
    updateVolumeHandleProximity(lastPointerPos.x, lastPointerPos.y);
  });
}

function onProgressEnter() {
  progressHandleHover.value = true;
}
function onProgressLeave() {
  progressHandleHover.value = false;
  updateProgressHandleProximity(-99999, -99999);
}
function onVolumeEnter() {
  volumeHandleHover.value = true;
}
function onVolumeLeave() {
  volumeHandleHover.value = false;
  updateVolumeHandleProximity(-99999, -99999);
}

function onSeekPointerDown(e) {
  const bar = e.currentTarget;
  if (!bar) return;
  resumeAudioContextIfNeeded();
  progressHandleActive.value = true;
  if (typeof bar.setPointerCapture === "function") {
    try {
      bar.setPointerCapture(e.pointerId);
    } catch {}
  }
  seekAtClientX(e.clientX, bar);
  const onMove = (ev) => seekAtClientX(ev.clientX, bar);
  const onUp = (ev) => {
    bar.removeEventListener("pointermove", onMove);
    bar.removeEventListener("pointerup", onUp);
    bar.removeEventListener("pointercancel", onUp);
    if (typeof bar.releasePointerCapture === "function") {
      try {
        bar.releasePointerCapture(ev.pointerId);
      } catch {}
    }
    updateProgressHandleProximity(ev.clientX ?? -99999, ev.clientY ?? -99999);
  };
  bar.addEventListener("pointermove", onMove);
  bar.addEventListener("pointerup", onUp);
  bar.addEventListener("pointercancel", onUp);
}

function onVolumePointerDown(e) {
  const bar = e.currentTarget;
  if (!bar) return;
  resumeAudioContextIfNeeded();
  volumeHandleActive.value = true;
  if (typeof bar.setPointerCapture === "function") {
    try {
      bar.setPointerCapture(e.pointerId);
    } catch {}
  }
  setVolumeAtClientX(e.clientX, bar);
  const onMove = (ev) => setVolumeAtClientX(ev.clientX, bar);
  const onUp = (ev) => {
    bar.removeEventListener("pointermove", onMove);
    bar.removeEventListener("pointerup", onUp);
    bar.removeEventListener("pointercancel", onUp);
    if (typeof bar.releasePointerCapture === "function") {
      try {
        bar.releasePointerCapture(ev.pointerId);
      } catch {}
    }
    updateVolumeHandleProximity(ev.clientX ?? -99999, ev.clientY ?? -99999);
  };
  bar.addEventListener("pointermove", onMove);
  bar.addEventListener("pointerup", onUp);
  bar.addEventListener("pointercancel", onUp);
}

function toggleMute() {
  resumeAudioContextIfNeeded();
  if (volume.value > 0) {
    volumeBeforeMute.value = volume.value;
    volume.value = 0;
    if (audioRef.value) audioRef.value.volume = 0;
  } else {
    volume.value = volumeBeforeMute.value || 0.7;
    if (audioRef.value) audioRef.value.volume = volume.value;
  }
}

function prev() {
  if (currentTrackIndex.value > 0) {
    currentTrackIndex.value--;
    nextTick(() => {
      if (audioRef.value) audioRef.value.play().catch(() => {});
    });
  } else if (audioRef.value) {
    audioRef.value.currentTime = 0;
  }
}

function next() {
  const list = playlist.value;
  if (currentTrackIndex.value < list.length - 1) {
    currentTrackIndex.value++;
    nextTick(() => {
      if (audioRef.value) audioRef.value.play().catch(() => {});
    });
  } else if (audioRef.value) {
    const d = Number(audioRef.value.duration) || 0;
    if (Number.isFinite(d) && d > 0) audioRef.value.currentTime = d;
  }
}

function onTimeUpdate() {
  if (audioRef.value) currentTime.value = audioRef.value.currentTime;
}

function onLoadedMetadata() {
  if (audioRef.value) duration.value = audioRef.value.duration;
}

function onEnded() {
  const list = playlist.value;
  if (currentTrackIndex.value < list.length - 1) {
    currentTrackIndex.value++;
    nextTick(() => {
      if (audioRef.value) audioRef.value.play().catch(() => {});
    });
  } else {
    isPlaying.value = false;
    currentTime.value = 0;
  }
}

function onError() {
  isPlaying.value = false;
}

function setCanvasSizeFromCss() {
  const canvas = visualizerCanvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const w = Math.max(1, Math.floor(rect.width * dpr));
  const h = Math.max(1, Math.floor(rect.height * dpr));
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
}

function stopVisualizer() {
  if (visualizerRaf) cancelAnimationFrame(visualizerRaf);
  visualizerRaf = 0;
}

function drawVisualizerFrame() {
  const canvas = visualizerCanvasRef.value;
  if (!canvas || !analyserNode || !analyserData || !showWaveform.value) {
    stopVisualizer();
    return;
  }
  setCanvasSizeFromCss();
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    stopVisualizer();
    return;
  }

  analyserNode.getByteTimeDomainData(analyserData);

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Subtle baseline
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = Math.max(1, Math.floor((window.devicePixelRatio || 1)));
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();

  // Waveform
  const accent = (props.accentColor || "#1db954").trim() || "#1db954";
  ctx.strokeStyle = accent;
  ctx.lineWidth = Math.max(1, Math.floor((window.devicePixelRatio || 1)));
  ctx.beginPath();
  const len = analyserData.length;
  for (let i = 0; i < len; i++) {
    const v = (analyserData[i] - 128) / 128; // [-1..1]
    const x = (i / (len - 1)) * w;
    const y = h / 2 + v * (h * 0.42);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  visualizerRaf = requestAnimationFrame(drawVisualizerFrame);
}

function startVisualizer() {
  if (visualizerRaf) return;
  visualizerRaf = requestAnimationFrame(drawVisualizerFrame);
}

function initVisualizerIfPossible() {
  if (!showWaveform.value) return;
  const audio = audioRef.value;
  const canvas = visualizerCanvasRef.value;
  if (!audio || !canvas) return;

  // If we already initialized for this element, just ensure drawing is running.
  if (audioCtx && analyserNode && analyserData) {
    startVisualizer();
    return;
  }

  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = new Ctx();
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 2048;
    analyserData = new Uint8Array(analyserNode.fftSize);

    // MediaElementSource can only be created once per <audio> element.
    analyserSourceNode = audioCtx.createMediaElementSource(audio);
    analyserSourceNode.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);

    startVisualizer();
  } catch {
    // If the source is cross-origin without CORS, or the browser blocks it,
    // we gracefully skip visualization (audio still works).
    stopVisualizer();
  }
}

watch(currentUrl, (url) => {
  duration.value = 0;
  currentTime.value = 0;
  stopVisualizer();
  nextTick(() => {
    if (audioRef.value) audioRef.value.volume = volume.value;
    if (showWaveform.value) initVisualizerIfPossible();
  });
});

watch(
  () => volume.value,
  (v) => {
    if (audioRef.value) audioRef.value.volume = v;
  },
);

function checkTrackOverflow() {
  nextTick(() => {
    let anySet = false;
    const check = (el, flag) => {
      if (!el) return;
      const inner = el.querySelector(
        ".track-title__inner, .track-artist__inner",
      );
      const overflow = inner && el.scrollWidth > el.clientWidth;
      if (overflow && !flag.value) anySet = true;
      flag.value = overflow;
    };
    check(titleRef.value, titleScrolls);
    check(artistRef.value, artistScrolls);
    check(shuffleTitleRef.value, shuffleTitleScrolls);
    check(shuffleArtistRef.value, shuffleArtistScrolls);
    if (anySet) nextTick(checkTrackOverflow);
  });
}

watch(
  () => [
    props.trackTitle,
    props.trackArtist,
    props.layout,
    showTrackInfoBool.value,
  ],
  checkTrackOverflow,
  { immediate: true },
);

let trackResizeObserver = null;
function observeTrackElements() {
  trackResizeObserver?.disconnect();
  trackResizeObserver = new ResizeObserver(checkTrackOverflow);
  [titleRef, artistRef, shuffleTitleRef, shuffleArtistRef].forEach((r) => {
    if (r.value) trackResizeObserver.observe(r.value);
  });
}

onMounted(() => {
  checkTrackOverflow();
  nextTick(() => observeTrackElements());
  document.addEventListener("pointermove", onDocumentPointerMove, { passive: true });
  nextTick(() => {
    initVisualizerIfPossible();
    visualizerResizeObserver?.disconnect();
    visualizerResizeObserver = new ResizeObserver(() => {
      setCanvasSizeFromCss();
    });
    if (visualizerCanvasRef.value) visualizerResizeObserver.observe(visualizerCanvasRef.value);
    setCanvasSizeFromCss();
  });
});

watch(
  () => props.layout,
  () => nextTick(observeTrackElements),
);

// Note: waveform is intentionally limited to same-origin URLs to avoid CORS console errors.

onBeforeUnmount(() => {
  trackResizeObserver?.disconnect();
  document.removeEventListener("pointermove", onDocumentPointerMove);
  if (handleMoveRaf) cancelAnimationFrame(handleMoveRaf);
  visualizerResizeObserver?.disconnect();
  stopVisualizer();
  try {
    analyserSourceNode?.disconnect?.();
  } catch {}
  try {
    analyserNode?.disconnect?.();
  } catch {}
  analyserSourceNode = null;
  analyserNode = null;
  analyserData = null;
  try {
    audioCtx?.close?.();
  } catch {}
  audioCtx = null;
  if (audioRef.value) audioRef.value.pause();
});

function buildPropertySchemaFromProps() {
  return buildPropertySchema(props);
}

function onClick() {
  const fn = openPropertyEditor.value;
  if (fn) fn(buildPropertySchemaFromProps());
}

const progressPct = computed(() => {
  if (!duration.value) return 0;
  return (currentTime.value / duration.value) * 100;
});

const progressHandleStyle = computed(() => ({
  left: `${progressPct.value}%`,
}));

const volumeHandleStyle = computed(() => ({
  left: `${Math.max(0, Math.min(1, Number(volume.value) || 0)) * 100}%`,
}));

const progressTooltipText = computed(() => {
  const e = formatTime(currentTime.value);
  const r = formatTime(Math.max(0, (duration.value || 0) - (currentTime.value || 0)));
  return `${e} • ${r}`;
});

const showProgressTooltip = computed(
  () => showProgressBarBool.value && (progressHandleActive.value || progressHandleHover.value),
);

const volumeTooltipText = computed(() => `${Math.round((Number(volume.value) || 0) * 100)}%`);

const showVolumeTooltip = computed(() => {
  const volumeEnabled =
    showAudioControlsBool.value &&
    showPlaybackControlsBool.value &&
    layout.value !== "nano" &&
    layout.value !== "shuffle";
  return volumeEnabled && (volumeHandleActive.value || volumeHandleHover.value);
});
</script>

<template>
  <div
    class="card h-100 d-flex flex-column position-relative audio-player-widget"
    :class="{ 'edit-mode': editMode }"
    :style="{ ...cardStyle, ...accentStyle }"
    :role="openPropertyEditor ? 'button' : undefined"
    tabindex="0"
    @dblclick.stop
  >
    <div
      v-if="editMode"
      class="widget-actions btn-group btn-group-sm"
      role="group"
      @click.stop
    >
      <button
        v-if="removeWidget"
        type="button"
        class="btn btn-outline-danger btn-sm"
        title="Delete"
        @click.stop="removeWidget"
      >
        <i class="fa-solid fa-trash"></i>
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary btn-sm"
        title="Settings"
        @click.stop="onClick"
      >
        <i class="fa-solid fa-gear"></i>
      </button>
    </div>

    <div
      class="audio-player h-100"
      :style="{ overflow: (props.overflow || 'Hidden').toLowerCase() }"
      :class="{
        'audio-player--vertical': layout === 'vertical',
        'audio-player--horizontal': layout === 'horizontal',
        'audio-player--nano': layout === 'nano',
        'audio-player--shuffle': layout === 'shuffle',
      }"
    >
      <!-- Shuffle: album art left of track info -->
      <div v-if="layout === 'shuffle'" class="shuffle-track-row">
        <div class="album-art album-art--shuffle">
          <img
            :src="displayAlbumArt"
            alt="Album Art"
            loading="lazy"
            @error="$event.target.src = defaultAlbumArt"
          />
        </div>
        <div v-if="showTrackInfoBool" class="track-info track-info--shuffle">
          <div
            class="track-title"
            ref="shuffleTitleRef"
            :title="trackTitle || 'Track Title'"
          >
            <span
              class="track-title__inner"
              :class="{ 'track-title__inner--scroll': shuffleTitleScrolls }"
            >
              {{ trackTitle || "Track Title"
              }}{{
                shuffleTitleScrolls
                  ? "  •  " + (trackTitle || "Track Title")
                  : ""
              }}
            </span>
          </div>
          <div
            class="track-artist"
            ref="shuffleArtistRef"
            :title="trackArtist || 'Artist'"
          >
            <span
              class="track-artist__inner"
              :class="{ 'track-artist__inner--scroll': shuffleArtistScrolls }"
            >
              {{ trackArtist || "Artist"
              }}{{
                shuffleArtistScrolls ? "  •  " + (trackArtist || "Artist") : ""
              }}
            </span>
          </div>
        </div>
      </div>

      <!-- Non-shuffle: album art -->
      <div
        v-else
        class="album-art"
        :class="{
          'album-art--horizontal': layout === 'horizontal',
          'album-art--nano': layout === 'nano',
        }"
      >
        <img
          :src="displayAlbumArt"
          alt="Album Art"
          loading="lazy"
          @error="$event.target.src = defaultAlbumArt"
        />
      </div>

      <div class="audio-player-main">
        <div class="audio-player-bottom">
          <div
            v-if="showWaveform"
            class="visualizer"
            :class="{ 'visualizer--horizontal': layout === 'horizontal' }"
            title="Audio visualizer"
            aria-label="Audio visualizer"
          >
            <canvas ref="visualizerCanvasRef" class="visualizer-canvas" aria-hidden="true" />
          </div>

          <div
            v-if="layout !== 'shuffle' && showTrackInfoBool"
            class="track-info"
            :class="{
              'track-info--horizontal': layout === 'horizontal',
              'track-info--nano': layout === 'nano',
            }"
          >
            <div class="track-title" ref="titleRef" :title="trackTitle || 'Track Title'">
              <span
                class="track-title__inner"
                :class="{ 'track-title__inner--scroll': titleScrolls }"
              >
                {{ trackTitle || "Track Title"
                }}{{
                  titleScrolls ? "  •  " + (trackTitle || "Track Title") : ""
                }}
              </span>
            </div>
            <div class="track-artist" ref="artistRef" :title="trackArtist || 'Artist'">
              <span
                class="track-artist__inner"
                :class="{ 'track-artist__inner--scroll': artistScrolls }"
              >
                {{ trackArtist || "Artist"
                }}{{ artistScrolls ? "  •  " + (trackArtist || "Artist") : "" }}
              </span>
            </div>
          </div>

          <div
            v-if="showProgressBarBool"
            class="progress-container"
            :class="{
              'progress-container--nano': layout === 'nano',
              'progress-container--shuffle': layout === 'shuffle',
            }"
          >
            <div
              class="progress-bar"
              @click="seek"
              @pointerdown.prevent="onSeekPointerDown"
              ref="progressBarRef"
              :class="{ 'progress-bar--active': progressHandleActive }"
              @pointerenter="onProgressEnter"
              @pointerleave="onProgressLeave"
            >
              <div class="progress" :style="{ width: `${progressPct}%` }"></div>
              <div class="progress-handle" :style="progressHandleStyle"></div>
              <div
                v-if="showProgressTooltip"
                class="progress-tooltip"
                :style="progressHandleStyle"
                aria-hidden="true"
              >
                {{ progressTooltipText }}
              </div>
            </div>
            <div class="time-info">
              <span title="Time elapsed">{{ formatTime(currentTime) }}</span>
              <span title="Time remaining">
                {{ formatTime(Math.max(0, duration - currentTime)) }}
              </span>
            </div>
          </div>

          <div
            v-if="showControlsRowBool"
            class="controls-row"
            :class="{
              'controls-row--horizontal': layout === 'horizontal',
              'controls-row--nano': layout === 'nano',
              'controls-row--shuffle': layout === 'shuffle',
            }"
          >
          <div v-if="showPlaybackControlsBool" class="controls">
            <button
              type="button"
              class="control-btn"
              :disabled="!currentUrl"
                title="Previous"
                aria-label="Previous"
              @click="prev"
            >
              <i class="fa-solid fa-backward"></i>
            </button>
            <button
              type="button"
              class="control-btn play-pause"
              :disabled="!currentUrl"
                :title="isPlaying ? 'Pause' : 'Play'"
                :aria-label="isPlaying ? 'Pause' : 'Play'"
              @click="togglePlay"
            >
              <i
                :class="isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'"
              ></i>
            </button>
            <button
              type="button"
              class="control-btn"
              :disabled="!currentUrl"
                title="Next"
                aria-label="Next"
              @click="next"
            >
              <i class="fa-solid fa-forward"></i>
            </button>
          </div>
          <div
            v-if="
              showPlaybackControlsBool &&
              showAudioControlsBool &&
              layout !== 'nano' &&
              layout !== 'shuffle'
            "
            class="volume-container"
          >
            <i
              :class="
                volume > 0 ? 'fa-solid fa-volume-up' : 'fa-solid fa-volume-mute'
              "
              class="volume-icon"
              role="button"
              tabindex="0"
                :title="volume > 0 ? 'Mute' : 'Unmute'"
              :aria-label="volume > 0 ? 'Mute' : 'Unmute'"
              @click="toggleMute"
              @keydown.enter="toggleMute"
              @keydown.space.prevent="toggleMute"
            ></i>
            <div
              class="volume-slider"
              @click="setVolume"
              @pointerdown.prevent="onVolumePointerDown"
              ref="volumeBarRef"
              :class="{ 'volume-slider--active': volumeHandleActive }"
                :title="`Volume: ${Math.round(volume * 100)}%`"
              @pointerenter="onVolumeEnter"
              @pointerleave="onVolumeLeave"
            >
              <div
                class="volume-level"
                :style="{ width: `${volume * 100}%` }"
              ></div>
              <div class="volume-handle" :style="volumeHandleStyle" aria-hidden="true"></div>
              <div
                v-if="showVolumeTooltip"
                class="volume-tooltip"
                :style="volumeHandleStyle"
                aria-hidden="true"
              >
                {{ volumeTooltipText }}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>

    <audio
      v-if="currentUrl"
      ref="audioRef"
      :src="currentUrl"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onEnded"
      @play="isPlaying = true"
      @pause="isPlaying = false"
      @error="onError"
    />
  </div>
</template>

<style scoped>
.card[role="button"] {
  cursor: default;
}
.card[role="button"].edit-mode {
  cursor: pointer;
}

.widget-actions {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  z-index: 10;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
}
.card.edit-mode:hover .widget-actions {
  opacity: 1;
  pointer-events: auto;
}
.widget-actions .btn {
  padding: 0.15rem 0.35rem;
  font-size: 0.7rem;
}

/* ✅ Remove the "inner rounded white panel" + allow full-height stretching */
.audio-player {
  width: 100%;
  max-width: 100%;

  /* was: background:white; border-radius:12px; padding:12px */
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  padding: 0;

  margin: 0;

  /* key: fill the card's available height */
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
}

.audio-player--vertical {
  flex-direction: column;
  justify-content: center;
}

.audio-player--horizontal {
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

/* ✅ Make main column fill height so controls can pin to bottom */
.audio-player-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  width: 100%;
  max-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.audio-player-bottom {
  margin-top: auto;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.album-art {
  width: 120px;
  max-width: 100%;
  aspect-ratio: 1;
  height: auto;
  border-radius: 10px;
  margin: 0 auto 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.album-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-art--horizontal {
  width: 64px;
  max-width: 100%;
  aspect-ratio: 1;
  height: auto;
  min-width: 0;
  margin: 0;
}

.album-art--nano {
  width: 48px;
  max-width: 100%;
  aspect-ratio: 1;
  height: auto;
  min-width: 0;
  margin: 0 auto 8px;
  border-radius: 6px;
}

.track-info {
  text-align: center;
  margin-bottom: 12px;
  flex-shrink: 0;
  min-width: 0;
  max-width: 100%;
}

.track-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 2px;
  overflow: hidden;
  white-space: nowrap;
}

.track-title__inner {
  display: inline-block;
  padding-right: 0;
}

.track-title__inner--scroll {
  animation: track-marquee 8s linear infinite;
}

.track-artist {
  color: #666;
  font-size: 0.85rem;
  overflow: hidden;
  white-space: nowrap;
}

.track-artist__inner {
  display: inline-block;
  padding-right: 0;
}

.track-artist__inner--scroll {
  animation: track-marquee 8s linear infinite;
}

@keyframes track-marquee {
  0% {
    transform: translateX(0);
  }
  10% {
    transform: translateX(0);
  }
  90% {
    transform: translateX(-50%);
  }
  100% {
    transform: translateX(-50%);
  }
}

.track-info--horizontal {
  text-align: left;
  margin-bottom: 0;
}

.track-info--nano {
  text-align: center;
  margin-bottom: 0;
}

.track-info--nano .track-title {
  font-size: 0.8rem;
  font-weight: 600;
}

.track-info--nano .track-artist {
  font-size: 0.7rem;
}

.progress-container {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin-bottom: 0;
  padding: 0 8px;
  box-sizing: border-box;
  flex-shrink: 0;
  align-self: stretch;
}

/* ✅ Pin playback controls to the bottom (when there's extra height) */
.controls-row {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 11;

  margin-top: auto; /* <-- key line */
}

.controls-row--horizontal {
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  gap: 16px;
  margin-top: 0;
}

/* Nano layout - fills card, no nested card */
.audio-player--nano {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  max-width: 100%;
  margin: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
}

.audio-player--nano .audio-player-main {
  width: 100%;
  max-width: min(160px, 100%);
  margin: 0 auto;
  gap: 6px;
}

.progress-container--nano .progress-bar {
  height: 3px;
}

.progress-container--nano .time-info {
  font-size: 0.65rem;
  margin-top: 2px;
}

.controls-row--nano {
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.controls-row--nano .control-btn {
  width: 28px;
  height: 28px;
  min-width: 28px;
  min-height: 28px;
  font-size: 0.65rem;
}

.controls-row--nano .control-btn.play-pause {
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  font-size: 0.75rem;
}

/* Shuffle layout: fills card, no nested card */
.audio-player--shuffle {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  max-width: 100%;
  margin: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
}

.audio-player--shuffle .audio-player-main {
  width: 100%;
  max-width: min(200px, 100%);
  margin: 0 auto;
  gap: 8px;
  padding: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
}

.shuffle-track-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: min(200px, 100%);
  margin: 0 auto 8px;
  flex-shrink: 0;
}

.album-art--shuffle {
  width: 36px;
  max-width: 100%;
  aspect-ratio: 1;
  height: auto;
  min-width: 0;
  margin: 0;
  border-radius: 4px;
  flex-shrink: 0;
}

.track-info--shuffle {
  text-align: left;
  margin-bottom: 0;
  min-width: 0;
  flex: 1;
}

.track-info--shuffle .track-title {
  font-size: 0.7rem;
  font-weight: 600;
}

.track-info--shuffle .track-artist {
  font-size: 0.6rem;
}

.progress-container--shuffle .progress-bar {
  height: 2px;
}

.progress-container--shuffle .time-info {
  font-size: 0.55rem;
  margin-top: 1px;
}

.controls-row--shuffle {
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
}

.controls-row--shuffle .control-btn {
  width: 24px;
  height: 24px;
  font-size: 0.55rem;
  background: #e0e0e0;
  color: #333;
}

.controls-row--shuffle .control-btn:hover:not(:disabled) {
  background: #d0d0d0;
}

.controls-row--shuffle .control-btn {
  min-width: 24px;
  min-height: 24px;
}

.controls-row--shuffle .control-btn.play-pause {
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  font-size: 0.85rem;
  background: var(--accent-color, #1db954);
  color: white;
  margin: 0 2px;
}

.progress-bar {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  height: 5px;
  background: #e9ecef;
  border-radius: 5px;
  overflow: visible;
  position: relative;
  cursor: pointer;
}

.progress {
  height: 100%;
  background: var(--accent-color, #1db954);
  transition: width 0.1s linear;
}

.time-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #666;
  margin-top: 4px;
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  min-width: min-content;
}

.control-btn {
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  flex-shrink: 0;
  border-radius: 50%;
  border: none;
  background: #f8f9fa;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover:not(:disabled) {
  background: #e9ecef;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn.play-pause {
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 50%;
  border: none;

  /* Force fill to stay constant */
  background-color: var(--accent-color, #1db954) !important;
  color: #fff;

  position: relative;
  z-index: 1;

  transition: box-shadow 0.2s ease;
}

/* Hover = halo only, no fill change */
.control-btn.play-pause:hover:not(:disabled) {
  background-color: var(--accent-color, #1db954) !important;
  box-shadow:
    0 0 0 2px rgba(0, 0, 0, 0),
    0 0 4px var(--accent-color),
    0 0 8px var(--accent-color),
    0 0 12px var(--accent-color);
}

/* Active / Focus = keep fill same */
.control-btn.play-pause:active:not(:disabled),
.control-btn.play-pause:focus-visible:not(:disabled) {
  background-color: var(--accent-color, #1db954) !important;
  outline: none;
  box-shadow:
    0 0 10px var(--accent-color),
    0 0 18px var(--accent-color),
    0 0 26px var(--accent-color);
}

/* Disabled = still green (optional UX) */
.control-btn.play-pause:disabled {
  background-color: var(--accent-color, #1db954) !important;
  opacity: 1;
  box-shadow: none;
}

.volume-container {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 0;
  flex-shrink: 0;
}

.volume-icon {
  cursor: pointer;
  flex-shrink: 0;
  padding: 2px;
}

.audio-player--vertical .volume-container {
  margin-top: 4px;
}

.controls-row--horizontal .volume-container {
  flex: 1;
  min-width: 0;
}

.volume-slider {
  flex-grow: 1;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  position: relative;
  cursor: pointer;
  overflow: visible;
}

.volume-level {
  height: 100%;
  background: var(--accent-color, #1db954);
  border-radius: 2px;
  transition: width 0.1s linear;
}

.progress-handle,
.volume-handle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #adb5bd;
  border: 1px solid rgba(0, 0, 0, 0.18);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  pointer-events: none;
}

.progress-handle {
  opacity: 0;
  transition: opacity 0.12s ease;
}
.progress-bar:hover .progress-handle,
.progress-bar.progress-bar--active .progress-handle {
  opacity: 1;
}

.volume-handle {
  opacity: 0;
  transition: opacity 0.12s ease;
}
.volume-slider:hover .volume-handle,
.volume-slider.volume-slider--active .volume-handle {
  opacity: 1;
}

.progress-handle::after {
  content: "";
  position: absolute;
  inset: 0;
  margin: auto;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--accent-color, #1db954);
}

.volume-handle::after {
  content: "";
  position: absolute;
  inset: 0;
  margin: auto;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent-color, #1db954);
}

.progress-tooltip {
  position: absolute;
  top: -30px;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.82);
  color: #fff;
  font-size: 0.62rem;
  padding: 2px 6px;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 5;
}

.progress-tooltip::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -5px;
  transform: translateX(-50%);
  border-width: 5px 5px 0 5px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.82) transparent transparent transparent;
}

.volume-tooltip {
  position: absolute;
  top: -30px;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.82);
  color: #fff;
  font-size: 0.62rem;
  padding: 2px 6px;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 5;
}

.volume-tooltip::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -5px;
  transform: translateX(-50%);
  border-width: 5px 5px 0 5px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.82) transparent transparent transparent;
}

.visualizer {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 24px;
  gap: 2px;
  margin: 8px 0;
  flex-shrink: 0;
}

.visualizer-canvas {
  width: 100%;
  height: 24px;
  display: block;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
}

.visualizer--horizontal {
  height: 16px;
  margin: 0;
}

</style>
