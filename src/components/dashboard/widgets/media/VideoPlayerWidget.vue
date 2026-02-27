<script>
/** Default and minimum grid size for this widget. */
export const gridDefaults = { w: 2, h: 3, minW: 1, minH: 2 };

/** Metadata for the widget selector (friendly name, description, icon, group). */
export const widgetMeta = {
  friendlyName: "Video Player",
  description:
    "Plays video from URLs with poster image, controls, and progress bar.",
  icon: "fa-solid fa-video",
  group: "Media",
};

/** Full property metadata for VideoPlayerWidget. */
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
  videoUrl: {
    type: "string",
    default: "",
    control: "text",
    label: "Video URL",
    description: "Single video URL",
  },
  videoUrls: {
    type: "string",
    default: "",
    control: "text",
    label: "Playlist URLs",
    description: "Comma-separated list of video URLs (overrides Video URL)",
  },
  videoTitle: {
    type: "string",
    default: "Video Title",
    control: "text",
    label: "Video Title",
    description: "Title of the current video",
  },
  videoDescription: {
    type: "string",
    default: "Description",
    control: "text",
    label: "Video Description",
    description: "Description of the current video",
  },
  posterUrl: {
    type: "string",
    default: "",
    control: "text",
    label: "Poster URL",
    description: "URL of the poster/thumbnail image for the video",
  },
  autoplay: {
    type: "boolean",
    default: false,
    control: "switch",
    label: "Autoplay",
    description: "Attempt to autoplay when the source changes (may require Muted=true in browsers)",
  },
  muted: {
    type: "boolean",
    default: false,
    control: "switch",
    label: "Muted",
    description: "Start muted (useful for autoplay policies and operator wall displays)",
  },
  loop: {
    type: "boolean",
    default: false,
    control: "switch",
    label: "Loop",
    description: "Loop the current video instead of advancing playlist",
  },
  preload: {
    type: "string",
    default: "Auto",
    control: "select",
    options: ["Auto", "Metadata", "None"],
    label: "Preload",
    description: "How aggressively the browser should preload video data",
  },
  liveui: {
    type: "boolean",
    default: true,
    control: "switch",
    label: "Live UI",
    description: "Enable video.js live UI (useful for live streams)",
  },
  useVideoJsControls: {
    type: "boolean",
    default: false,
    control: "switch",
    label: "Use video.js Controls",
    description: "Show the built-in video.js control bar instead of custom controls (advanced)",
  },
  playbackRates: {
    type: "string",
    default: "0.5,1,1.5,2",
    control: "text",
    label: "Playback Rates",
    description: "Comma-separated playback rates for video.js (e.g. 0.5,1,1.5,2)",
  },
  vhsOverrideNative: {
    type: "boolean",
    default: true,
    control: "switch",
    label: "VHS Override Native",
    description: "Force videojs-http-streaming (VHS) instead of native HLS/DASH where available",
  },
  vhsEnableLowInitialPlaylist: {
    type: "boolean",
    default: true,
    control: "switch",
    label: "VHS Low Initial Playlist",
    description: "Start with a low bitrate rendition to reduce startup time/stalls on live streams",
  },
  vhsLimitRenditionByPlayerDimensions: {
    type: "boolean",
    default: true,
    control: "switch",
    label: "VHS Limit Renditions By Size",
    description: "Limit renditions based on player size (helps avoid selecting too-large renditions)",
  },
  videoJsOptionsJson: {
    type: "string",
    default: "",
    control: "text",
    label: "video.js Options (JSON)",
    description:
      "Advanced: JSON object merged into video.js init options. Use to set any player/VHS options.",
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
    description: "Show volume slider",
  },
  showProgressBar: {
    type: "boolean",
    default: true,
    control: "switch",
    label: "Show Progress Bar",
    description: "Show progress bar and time display",
  },
  showElapsedTime: {
    type: "boolean",
    default: true,
    control: "switch",
    label: "Show Elapsed Time",
    description: "Show elapsed time label next to the progress bar",
  },
  showRemainingTime: {
    type: "boolean",
    default: true,
    control: "switch",
    label: "Show Remaining Time",
    description: "Show remaining time label next to the progress bar",
  },
  showTrackInfo: {
    type: "boolean",
    default: true,
    control: "switch",
    label: "Show Video Info",
    description: "Show video title and description",
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
  media: [
    "videoUrl",
    "videoUrls",
    "videoTitle",
    "videoDescription",
    "posterUrl",
  ],
  player: [
    "autoplay",
    "muted",
    "loop",
    "preload",
    "liveui",
    "useVideoJsControls",
    "playbackRates",
    "vhsOverrideNative",
    "vhsEnableLowInitialPlaylist",
    "vhsLimitRenditionByPlayerDimensions",
    "videoJsOptionsJson",
  ],
  appearance: [
    "showPlaybackControls",
    "showAudioControls",
    "showProgressBar",
    "showElapsedTime",
    "showRemainingTime",
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
          if (key === "overflow" && current) {
            const v = String(current).toLowerCase();
            if (v === "hidden") current = "Hidden";
            else if (v === "visible") current = "Visible";
            else if (v === "auto") current = "Auto";
            else if (v === "scroll") current = "Scroll";
          }
          if (key === "preload" && current) {
            const v = String(current).toLowerCase();
            if (v === "auto") current = "Auto";
            else if (v === "metadata") current = "Metadata";
            else if (v === "none") current = "None";
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
    label: "Video Player Settings",
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
import videojs from "video.js";
import "video.js/dist/video-js.css";

const props = defineProps({
  openPropertyEditor: { type: Function, default: null },
  removeWidget: { type: Function, default: null },
  editMode: { type: Boolean, default: false },
  uniqueName: { type: String, default: "" },
  description: { type: String, default: "" },
  videoUrl: { type: String, default: "" },
  videoUrls: { type: String, default: "" },
  videoTitle: { type: String, default: "Video Title" },
  videoDescription: { type: String, default: "Description" },
  posterUrl: { type: String, default: "" },
  autoplay: { type: [Boolean, String], default: false },
  muted: { type: [Boolean, String], default: false },
  loop: { type: [Boolean, String], default: false },
  preload: { type: String, default: "Auto" },
  liveui: { type: [Boolean, String], default: true },
  useVideoJsControls: { type: [Boolean, String], default: false },
  playbackRates: { type: String, default: "0.5,1,1.5,2" },
  vhsOverrideNative: { type: [Boolean, String], default: true },
  vhsEnableLowInitialPlaylist: { type: [Boolean, String], default: true },
  vhsLimitRenditionByPlayerDimensions: { type: [Boolean, String], default: true },
  videoJsOptionsJson: { type: String, default: "" },
  showPlaybackControls: { type: [Boolean, String], default: true },
  showAudioControls: { type: [Boolean, String], default: true },
  showProgressBar: { type: [Boolean, String], default: true },
  showElapsedTime: { type: [Boolean, String], default: true },
  showRemainingTime: { type: [Boolean, String], default: true },
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

const videoHostRef = ref(null);
let videoEl = null;
let player = null;
const videoElKey = ref(0);
const infoRef = ref(null);
const infoScrolls = ref(false);
const progressRowRef = ref(null);
const progressCompact = ref(false);
const showVolumePopup = ref(false);
const volumeContainerRef = ref(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(0.7);
const volumeBeforeMute = ref(0.7);
const currentTrackIndex = ref(0);

const progressBarRef = ref(null);
const progressHandleActive = ref(false);
const progressHandleHover = ref(false);
let progressMoveRaf = 0;
let lastPointerPos = { x: 0, y: 0 };

const widgetRootRef = ref(null);
const isTheaterFullscreen = ref(false);
const isVideoFullscreen = ref(false);

const injectedOpenPropertyEditor = inject("openPropertyEditor", null);
const openPropertyEditor = computed(
  () => props.openPropertyEditor ?? injectedOpenPropertyEditor,
);

const playlist = computed(() => {
  const urls = String(props.videoUrls || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (urls.length) return urls;
  const single = String(props.videoUrl || "").trim();
  return single ? [single] : [];
});

function toBool(v, fallback = false) {
  if (typeof v === "boolean") return v;
  if (v == null) return fallback;
  const s = String(v).toLowerCase().trim();
  if (s === "true" || s === "1" || s === "yes" || s === "on") return true;
  if (s === "false" || s === "0" || s === "no" || s === "off") return false;
  return fallback;
}

const currentUrl = computed(() => {
  const list = playlist.value;
  if (!list.length) return "";
  const idx = Math.max(0, Math.min(currentTrackIndex.value, list.length - 1));
  return list[idx];
});

const videoInfoText = computed(() => {
  const t = String(props.videoTitle || "").trim();
  const d = String(props.videoDescription || "").trim();
  if (t && d) return `${t} - ${d}`;
  if (t) return t;
  if (d) return d;
  return "Video Title - Description";
});

const autoplayBool = computed(() => toBool(props.autoplay, false));
const mutedBool = computed(() => toBool(props.muted, false));
const loopBool = computed(() => toBool(props.loop, false));
const liveuiBool = computed(() => toBool(props.liveui, true));
const useVideoJsControlsBool = computed(() =>
  toBool(props.useVideoJsControls, false),
);
const vhsOverrideNativeBool = computed(() =>
  toBool(props.vhsOverrideNative, true),
);
const vhsEnableLowInitialPlaylistBool = computed(() =>
  toBool(props.vhsEnableLowInitialPlaylist, true),
);
const vhsLimitRenditionByPlayerDimensionsBool = computed(() =>
  toBool(props.vhsLimitRenditionByPlayerDimensions, true),
);

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

const showElapsedTimeBool = computed(() => {
  const v = props.showElapsedTime;
  if (typeof v === "boolean") return v;
  return String(v).toLowerCase() !== "false";
});

const showRemainingTimeBool = computed(() => {
  const v = props.showRemainingTime;
  if (typeof v === "boolean") return v;
  return String(v).toLowerCase() !== "false";
});

const showTrackInfoBool = computed(() => {
  const v = props.showTrackInfo;
  if (typeof v === "boolean") return v;
  return String(v).toLowerCase() !== "false";
});

const showControlsRowBool = computed(() => showPlaybackControlsBool.value);

const cardStyle = computed(() => {
  const style = {
    maxHeight: "100%",
    height: "100%",
    overflow: (props.overflow || "Hidden").toLowerCase(),
    minHeight: 0,
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

const controlsPaddingStyle = computed(() => ({
  padding: `${Number(props.cardPaddingAll) || 0}rem`,
}));

const accentStyle = computed(() => ({
  "--accent-color": props.accentColor || "#1db954",
}));

const defaultPoster =
  "https://images.unsplash.com/photo-1611162617474-5b21e879e113?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400";

const displayPoster = computed(() => {
  const url = String(props.posterUrl || "").trim();
  return url || defaultPoster;
});

function guessSourceType(url) {
  const u = String(url || "").split("?")[0].toLowerCase();
  if (u.endsWith(".m3u8")) return "application/x-mpegURL";
  if (u.endsWith(".mpd")) return "application/dash+xml";
  if (u.endsWith(".webm")) return "video/webm";
  if (u.endsWith(".ogv") || u.endsWith(".ogg")) return "video/ogg";
  if (u.endsWith(".mp4") || u.endsWith(".m4v")) return "video/mp4";
  return "video/mp4";
}

function parsePlaybackRates(value) {
  return String(value || "")
    .split(",")
    .map((s) => Number(String(s).trim()))
    .filter((n) => Number.isFinite(n) && n > 0)
    .slice(0, 10);
}

function parseOptionsJson(text) {
  const raw = String(text || "").trim();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function mergePlayerOptions(base, extra) {
  if (!extra) return base;
  const merged = { ...base, ...extra };
  // Merge html5.vhs shallowly so users can override individual VHS keys.
  if (base.html5 || extra.html5) {
    merged.html5 = { ...(base.html5 || {}), ...(extra.html5 || {}) };
    const baseVhs = base.html5?.vhs;
    const extraVhs = extra.html5?.vhs;
    if (baseVhs || extraVhs) {
      merged.html5.vhs = { ...(baseVhs || {}), ...(extraVhs || {}) };
    }
  }
  return merged;
}

function getPlayer() {
  return player;
}

function ensureVideoElement() {
  const host = videoHostRef.value;
  if (!host) return null;
  if (videoEl && host.contains(videoEl)) return videoEl;

  // Clear any leftover DOM (video.js can leave wrappers behind)
  host.replaceChildren();

  const el = document.createElement("video");
  el.className = "video-js vjs-default-skin";
  el.setAttribute("playsinline", "true");
  el.setAttribute("preload", String(props.preload || "auto"));
  host.appendChild(el);
  videoEl = el;
  return el;
}

function syncFromPlayer() {
  const p = getPlayer();
  if (!p) return;
  try {
    currentTime.value = Number(p.currentTime?.() ?? 0) || 0;
    const d = Number(p.duration?.() ?? 0) || 0;
    duration.value = Number.isFinite(d) ? d : 0;
    const v = Number(p.volume?.() ?? 0) || 0;
    volume.value = v;
    if (v > 0) volumeBeforeMute.value = v;
    isPlaying.value = !p.paused?.();
  } catch {
    // ignore (player may be disposing)
  }
}

function getVideoJsInitOptions() {
  const rates = parsePlaybackRates(props.playbackRates);
  const preload = String(props.preload || "Auto").toLowerCase();
  const preloadNorm =
    preload === "metadata" || preload === "none" || preload === "auto"
      ? preload
      : "auto";
  const base = {
    autoplay: autoplayBool.value,
    controls: useVideoJsControlsBool.value,
    preload: preloadNorm,
    muted: mutedBool.value,
    loop: loopBool.value,
    playsinline: true,
    responsive: true,
    // In a dashboard widget we already control the container size (fixed grid cell height),
    // so `fluid:true` (aspect-ratio padding box) creates visible blank space.
    fluid: false,
    // Fill the container while preserving aspect ratio.
    fill: true,
    liveui: liveuiBool.value,
    bigPlayButton: false,
    // When using our custom UI, disable video.js control bar.
    controlBar: useVideoJsControlsBool.value ? undefined : false,
    playbackRates: rates.length ? rates : undefined,
    html5: {
      vhs: {
        overrideNative: vhsOverrideNativeBool.value,
        enableLowInitialPlaylist: vhsEnableLowInitialPlaylistBool.value,
        limitRenditionByPlayerDimensions:
          vhsLimitRenditionByPlayerDimensionsBool.value,
      },
    },
  };
  const extra = parseOptionsJson(props.videoJsOptionsJson);
  return mergePlayerOptions(base, extra);
}

function initPlayerIfNeeded() {
  if (player) return;
  const el = ensureVideoElement();
  if (!el) return;
  player = videojs(el, getVideoJsInitOptions());

  // Keep our reactive state in sync with video.js
  player.on("timeupdate", () => {
    currentTime.value = Number(player.currentTime?.() ?? 0) || 0;
  });
  player.on("durationchange", () => {
    const d = Number(player.duration?.() ?? 0) || 0;
    duration.value = Number.isFinite(d) ? d : 0;
  });
  player.on("loadedmetadata", () => {
    const d = Number(player.duration?.() ?? 0) || 0;
    duration.value = Number.isFinite(d) ? d : 0;
  });
  player.on("play", () => {
    isPlaying.value = true;
  });
  player.on("pause", () => {
    isPlaying.value = false;
  });
  player.on("ended", onEnded);
  player.on("error", onError);
  player.on("volumechange", () => {
    const v = Number(player.volume?.() ?? 0) || 0;
    volume.value = v;
    if (v > 0) volumeBeforeMute.value = v;
  });
}

function applySourceToPlayer(url) {
  const p = getPlayer();
  if (!p) return;
  const src = String(url || "").trim();
  if (!src) {
    try {
      p.pause();
    } catch {}
    return;
  }
  try {
    p.poster(displayPoster.value || "");
    p.src([{ src, type: guessSourceType(src) }]);
    p.load?.();
    // Apply current volume after load
    if (mutedBool.value) {
      p.muted?.(true);
    } else {
      p.muted?.(false);
      p.volume?.(Number(volume.value) || 0);
    }
    if (autoplayBool.value) {
      p.play?.().catch?.(() => {});
    }
  } catch {
    // ignore
  }
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function togglePlay() {
  const p = getPlayer();
  if (!p) return;
  if (p.paused?.()) {
    p.play?.().catch?.(() => {});
  } else {
    p.pause?.();
  }
}

function seek(e) {
  const p = getPlayer();
  const bar = e.currentTarget;
  if (!p || !bar) return;
  const rect = bar.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const d = Number(p.duration?.() ?? 0) || 0;
  if (d) p.currentTime?.(pct * d);
}

function seekAtClientX(clientX, barEl) {
  const p = getPlayer();
  if (!p || !barEl) return;
  const rect = barEl.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const d = Number(p.duration?.() ?? 0) || 0;
  if (d) p.currentTime?.(pct * d);
}

function updateProgressHandleProximity(clientX, clientY) {
  const el = progressBarRef.value;
  if (!el || !showProgressBarBool.value) {
    progressHandleActive.value = false;
    return;
  }
  const rect = el.getBoundingClientRect();
  const padY = 10;
  const near =
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top - padY &&
    clientY <= rect.bottom + padY;
  progressHandleActive.value = near;
}

function onProgressEnter() {
  progressHandleHover.value = true;
}

function onProgressLeave() {
  progressHandleHover.value = false;
  // If we're not near the bar anymore, clear active state quickly.
  updateProgressHandleProximity(-99999, -99999);
}

function onDocumentPointerMove(e) {
  lastPointerPos = { x: e.clientX, y: e.clientY };
  if (progressMoveRaf) return;
  progressMoveRaf = requestAnimationFrame(() => {
    progressMoveRaf = 0;
    updateProgressHandleProximity(lastPointerPos.x, lastPointerPos.y);
  });
}

function onSeekPointerDown(e) {
  const bar = e.currentTarget;
  if (!bar) return;
  progressHandleActive.value = true;
  if (typeof bar.setPointerCapture === "function") {
    try {
      bar.setPointerCapture(e.pointerId);
    } catch {}
  }
  seekAtClientX(e.clientX, bar);
  const onMove = (ev) => seekAtClientX(ev.clientX, bar);
  const onUp = () => {
    bar.removeEventListener("pointermove", onMove);
    bar.removeEventListener("pointerup", onUp);
    bar.removeEventListener("pointercancel", onUp);
    if (typeof bar.releasePointerCapture === "function") {
      try {
        bar.releasePointerCapture(e.pointerId);
      } catch {}
    }
    // Re-evaluate proximity after drag ends.
    updateProgressHandleProximity(lastPointerPos.x, lastPointerPos.y);
  };
  bar.addEventListener("pointermove", onMove);
  bar.addEventListener("pointerup", onUp);
  bar.addEventListener("pointercancel", onUp);
}

function setVolume(e) {
  const p = getPlayer();
  const bar = e.currentTarget;
  if (!bar || !p) return;
  const rect = bar.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  volume.value = pct;
  if (pct > 0) volumeBeforeMute.value = pct;
  p.volume?.(pct);
}

function setVolumeVertical(e) {
  const p = getPlayer();
  const bar = e.currentTarget;
  if (!bar || !p) return;
  const rect = bar.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
  volume.value = pct;
  if (pct > 0) volumeBeforeMute.value = pct;
  p.volume?.(pct);
}

function setVolumeVerticalAtClientY(clientY, barEl) {
  const p = getPlayer();
  if (!barEl || !p) return;
  const rect = barEl.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));
  volume.value = pct;
  if (pct > 0) volumeBeforeMute.value = pct;
  p.volume?.(pct);
}

function onVolumePointerDown(e) {
  const bar = e.currentTarget;
  if (!bar) return;
  if (typeof bar.setPointerCapture === "function") {
    try {
      bar.setPointerCapture(e.pointerId);
    } catch {}
  }
  setVolumeVerticalAtClientY(e.clientY, bar);
  const onMove = (ev) => setVolumeVerticalAtClientY(ev.clientY, bar);
  const onUp = () => {
    bar.removeEventListener("pointermove", onMove);
    bar.removeEventListener("pointerup", onUp);
    bar.removeEventListener("pointercancel", onUp);
    if (typeof bar.releasePointerCapture === "function") {
      try {
        bar.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };
  bar.addEventListener("pointermove", onMove);
  bar.addEventListener("pointerup", onUp);
  bar.addEventListener("pointercancel", onUp);
}

function toggleMute() {
  if (volume.value > 0) {
    volumeBeforeMute.value = volume.value;
    volume.value = 0;
    getPlayer()?.volume?.(0);
  } else {
    volume.value = volumeBeforeMute.value || 0.7;
    getPlayer()?.volume?.(volume.value);
  }
}

function toggleVolumePopup() {
  showVolumePopup.value = !showVolumePopup.value;
}

function closeVolumePopup() {
  showVolumePopup.value = false;
}

function onDocumentPointerDown(e) {
  if (!showVolumePopup.value) return;
  const root = volumeContainerRef.value;
  const target = e.target;
  if (root && target && root.contains(target)) return;
  closeVolumePopup();
}

function getFullscreenVideoEl() {
  // Prefer the created <video> element we hand to video.js.
  if (videoEl) return videoEl;
  // Fallback: try to find the tech element from the player.
  const p = getPlayer();
  const techEl = p?.tech_?.el?.();
  const maybeVideo = techEl?.tagName?.toLowerCase?.() === "video" ? techEl : techEl?.querySelector?.("video");
  return maybeVideo || null;
}

function onFullscreenChange() {
  const fsEl = document.fullscreenElement;
  isTheaterFullscreen.value = !!(fsEl && widgetRootRef.value && fsEl === widgetRootRef.value);
  const vEl = getFullscreenVideoEl();
  isVideoFullscreen.value = !!(fsEl && vEl && fsEl === vEl);
}

async function toggleTheaterFullscreen() {
  const el = widgetRootRef.value;
  if (!el) return;
  try {
    if (isTheaterFullscreen.value) {
      await document.exitFullscreen?.();
    } else {
      if (document.fullscreenElement) await document.exitFullscreen?.();
      await el.requestFullscreen?.();
    }
  } catch {
    // ignore
  }
}

async function toggleVideoFullscreen() {
  try {
    const vEl = getFullscreenVideoEl() || ensureVideoElement();
    if (!vEl) return;
    if (isVideoFullscreen.value) {
      await document.exitFullscreen?.();
      return;
    }
    if (document.fullscreenElement) await document.exitFullscreen?.();
    await vEl.requestFullscreen?.();
  } catch {
    // ignore
  }
}

function prev() {
  if (currentTrackIndex.value > 0) {
    currentTrackIndex.value--;
    nextTick(() => {
      getPlayer()?.play?.().catch?.(() => {});
    });
  } else {
    getPlayer()?.currentTime?.(0);
  }
}

function next() {
  const list = playlist.value;
  if (currentTrackIndex.value < list.length - 1) {
    currentTrackIndex.value++;
    nextTick(() => {
      getPlayer()?.play?.().catch?.(() => {});
    });
  } else {
    const p = getPlayer();
    if (!p) return;
    const d = Number(p.duration?.() ?? 0) || 0;
    if (d) p.currentTime?.(d);
  }
}

function onTimeUpdate() {
  // retained for compatibility; state is driven by video.js events
  syncFromPlayer();
}

function onLoadedMetadata() {
  // retained for compatibility; state is driven by video.js events
  syncFromPlayer();
}

function onEnded() {
  const list = playlist.value;
  if (loopBool.value) {
    try {
      getPlayer()?.currentTime?.(0);
      getPlayer()?.play?.().catch?.(() => {});
    } catch {}
    return;
  }
  if (currentTrackIndex.value < list.length - 1) {
    currentTrackIndex.value++;
    nextTick(() => {
      getPlayer()?.play?.().catch?.(() => {});
    });
  } else {
    isPlaying.value = false;
    currentTime.value = 0;
  }
}

function onError() {
  isPlaying.value = false;
}

watch(currentUrl, (url) => {
  duration.value = 0;
  currentTime.value = 0;
  nextTick(() => {
    initPlayerIfNeeded();
    applySourceToPlayer(url);
  });
});

function recreatePlayer() {
  try {
    const p = getPlayer();
    if (p) {
      const wasPlaying = !p.paused?.();
      const t = Number(p.currentTime?.() ?? 0) || 0;
      p.dispose?.();
      player = null;
      videoElKey.value++;
      videoEl = null;
      nextTick(() => {
        initPlayerIfNeeded();
        applySourceToPlayer(currentUrl.value);
        if (Number.isFinite(t) && t > 0) getPlayer()?.currentTime?.(t);
        if (wasPlaying) getPlayer()?.play?.().catch?.(() => {});
      });
      return;
    }
  } catch {
    // ignore
  }
  player = null;
  videoElKey.value++;
  videoEl = null;
  nextTick(() => {
    initPlayerIfNeeded();
    applySourceToPlayer(currentUrl.value);
  });
}

watch(
  () => [
    autoplayBool.value,
    mutedBool.value,
    loopBool.value,
    String(props.preload || "auto"),
    liveuiBool.value,
    useVideoJsControlsBool.value,
    String(props.playbackRates || ""),
    vhsOverrideNativeBool.value,
    vhsEnableLowInitialPlaylistBool.value,
    vhsLimitRenditionByPlayerDimensionsBool.value,
    String(props.videoJsOptionsJson || ""),
  ],
  () => {
    // Most video.js options are init-only; rebuild player when they change.
    recreatePlayer();
  },
);

watch(
  () => volume.value,
  (v) => {
    getPlayer()?.volume?.(v);
  },
);

function checkTrackOverflow() {
  nextTick(() => {
    let anySet = false;
    const check = (el, flag) => {
      if (!el) return;
      const inner = el.querySelector(".video-info__inner");
      const overflow = inner && el.scrollWidth > el.clientWidth;
      if (overflow && !flag.value) anySet = true;
      flag.value = overflow;
    };
    check(infoRef.value, infoScrolls);
    if (anySet) nextTick(checkTrackOverflow);
  });
}

watch(
  () => [props.videoTitle, props.videoDescription, showTrackInfoBool.value],
  checkTrackOverflow,
  { immediate: true },
);

let trackResizeObserver = null;
function observeTrackElements() {
  trackResizeObserver?.disconnect();
  trackResizeObserver = new ResizeObserver(checkTrackOverflow);
  if (infoRef.value) trackResizeObserver.observe(infoRef.value);
}

let progressResizeObserver = null;
function checkProgressLayout() {
  nextTick(() => {
    const row = progressRowRef.value;
    if (!row) return;
    const rowW = row.getBoundingClientRect()?.width ?? 0;
    // If too narrow, switch to compact single-line layout (no wrapping).
    progressCompact.value = !!rowW && rowW < 260;
  });
}

function observeProgressElements() {
  progressResizeObserver?.disconnect();
  progressResizeObserver = new ResizeObserver(checkProgressLayout);
  if (progressRowRef.value) {
    progressResizeObserver.observe(progressRowRef.value);
  }
  checkProgressLayout();
}

watch(
  () => [showProgressBarBool.value, showElapsedTimeBool.value, showRemainingTimeBool.value],
  () => {
    if (showProgressBarBool.value) observeProgressElements();
    else progressCompact.value = false;
  },
  { immediate: true },
);

onMounted(() => {
  checkTrackOverflow();
  nextTick(() => {
    observeTrackElements();
    observeProgressElements();
    initPlayerIfNeeded();
    applySourceToPlayer(currentUrl.value);
    syncFromPlayer();
  });
  document.addEventListener("pointerdown", onDocumentPointerDown, true);
  document.addEventListener("pointermove", onDocumentPointerMove, { passive: true });
  document.addEventListener("fullscreenchange", onFullscreenChange);
  onFullscreenChange();
});

onBeforeUnmount(() => {
  trackResizeObserver?.disconnect();
  progressResizeObserver?.disconnect();
  document.removeEventListener("pointerdown", onDocumentPointerDown, true);
  document.removeEventListener("pointermove", onDocumentPointerMove);
  document.removeEventListener("fullscreenchange", onFullscreenChange);
  if (hoverVideoLeaveT) window.clearTimeout(hoverVideoLeaveT);
  if (hoverActionsLeaveT) window.clearTimeout(hoverActionsLeaveT);
  if (progressMoveRaf) cancelAnimationFrame(progressMoveRaf);
  try {
    player?.dispose?.();
  } catch {}
  player = null;
  videoEl = null;
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

const progressTooltipText = computed(() => {
  const e = formatTime(currentTime.value);
  const r = formatTime(Math.max(0, (duration.value || 0) - (currentTime.value || 0)));
  return `${e} • ${r}`;
});

const showProgressTooltip = computed(
  () => showProgressBarBool.value && (progressHandleActive.value || progressHandleHover.value),
);

const volumeHandleStyle = computed(() => ({
  bottom: `${Math.max(0, Math.min(1, Number(volume.value) || 0)) * 100}%`,
}));

const hoverVideoArea = ref(false);
const hoverActions = ref(false);
const actionsHover = computed(() => hoverVideoArea.value || hoverActions.value);

let hoverVideoLeaveT = 0;
let hoverActionsLeaveT = 0;

function onVideoAreaEnter() {
  if (hoverVideoLeaveT) window.clearTimeout(hoverVideoLeaveT);
  hoverVideoLeaveT = 0;
  hoverVideoArea.value = true;
}
function onVideoAreaLeave() {
  if (hoverVideoLeaveT) window.clearTimeout(hoverVideoLeaveT);
  hoverVideoLeaveT = window.setTimeout(() => {
    hoverVideoArea.value = false;
    hoverVideoLeaveT = 0;
  }, 80);
}
function onActionsEnter() {
  if (hoverActionsLeaveT) window.clearTimeout(hoverActionsLeaveT);
  hoverActionsLeaveT = 0;
  hoverActions.value = true;
}
function onActionsLeave() {
  if (hoverActionsLeaveT) window.clearTimeout(hoverActionsLeaveT);
  hoverActionsLeaveT = window.setTimeout(() => {
    hoverActions.value = false;
    hoverActionsLeaveT = 0;
  }, 80);
}
</script>

<template>
  <div
    ref="widgetRootRef"
    class="card h-100 d-flex flex-column position-relative video-player-widget"
    :class="{ 'edit-mode': editMode, 'actions-hover': actionsHover }"
    :style="{ ...cardStyle, ...accentStyle }"
    :role="openPropertyEditor ? 'button' : undefined"
    tabindex="0"
    @dblclick.stop
  >
    <div
      class="widget-actions btn-group btn-group-sm"
      role="group"
      @click.stop
      @mouseenter="onActionsEnter"
      @mouseleave="onActionsLeave"
    >
      <button
        v-if="!editMode"
        type="button"
        class="btn btn-outline-secondary btn-sm"
        :disabled="!currentUrl"
        :title="isTheaterFullscreen ? 'Exit theater mode' : 'Theater mode'"
        @click.stop="toggleTheaterFullscreen"
      >
        <i :class="isTheaterFullscreen ? 'fa-solid fa-compress' : 'fa-solid fa-film'"></i>
      </button>
      <button
        v-if="!editMode"
        type="button"
        class="btn btn-outline-secondary btn-sm"
        :disabled="!currentUrl"
        :title="isVideoFullscreen ? 'Exit full screen' : 'Full screen'"
        @click.stop="toggleVideoFullscreen"
      >
        <i :class="isVideoFullscreen ? 'fa-solid fa-compress' : 'fa-solid fa-expand'"></i>
      </button>
      <button
        v-if="editMode && removeWidget"
        type="button"
        class="btn btn-outline-danger btn-sm"
        title="Delete"
        @click.stop="removeWidget"
      >
        <i class="fa-solid fa-trash"></i>
      </button>
      <button
        v-if="editMode"
        type="button"
        class="btn btn-outline-secondary btn-sm"
        title="Settings"
        @click.stop="onClick"
      >
        <i class="fa-solid fa-gear"></i>
      </button>
    </div>

    <div
      class="video-player video-player--vertical h-100"
      :style="{ overflow: (props.overflow || 'Hidden').toLowerCase() }"
    >
      <div
        class="video-content-area"
        @mouseenter="onVideoAreaEnter"
        @mouseleave="onVideoAreaLeave"
      >
        <div class="video-poster">
          <div
            v-if="currentUrl"
            :key="videoElKey"
            ref="videoHostRef"
            class="videojs-host"
          ></div>
          <img v-else :src="displayPoster" alt="Video Poster" loading="lazy" />
        </div>
      </div>

      <div class="video-player-main">
        <div
          v-if="showProgressBarBool || showControlsRowBool"
          class="controls-footer"
          :style="controlsPaddingStyle"
        >
          <div
            v-if="showTrackInfoBool"
            ref="infoRef"
            class="video-info-line"
            :title="videoInfoText"
          >
            <span
              class="video-info__inner"
              :class="{ 'video-info__inner--scroll': infoScrolls }"
            >
              {{ videoInfoText }}{{ infoScrolls ? "  •  " + videoInfoText : "" }}
            </span>
          </div>

          <div v-if="showProgressBarBool" class="progress-container">
            <div
              class="progress-container__row"
              ref="progressRowRef"
              :class="{ 'progress-container__row--compact': progressCompact }"
            >
              <span
                v-if="showElapsedTimeBool"
                class="time-chip time-chip--elapsed"
                title="Time elapsed"
              >
                {{ formatTime(currentTime) }}
              </span>
              <div
                class="progress-bar"
                @click="seek"
                @pointerdown.prevent="onSeekPointerDown"
                ref="progressBarRef"
                :class="{ 'progress-bar--active': progressHandleActive }"
                @pointerenter="onProgressEnter"
                @pointerleave="onProgressLeave"
              >
                <div
                  class="progress"
                  :style="{ width: `${progressPct}%` }"
                ></div>
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
              <span
                v-if="showRemainingTimeBool"
                class="time-chip time-chip--remaining"
                title="Time remaining"
              >
                {{ formatTime(Math.max(0, duration - currentTime)) }}
              </span>
            </div>
          </div>

          <div v-if="showControlsRowBool" class="controls-row">
            <div v-if="showPlaybackControlsBool" class="controls">
              <button
                type="button"
                class="control-btn"
                :disabled="!currentUrl"
                title="Previous"
                @click="prev"
              >
                <i class="fa-solid fa-backward"></i>
              </button>
              <button
                type="button"
                class="control-btn play-pause"
                :disabled="!currentUrl"
                :title="isPlaying ? 'Pause' : 'Play'"
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
                @click="next"
              >
                <i class="fa-solid fa-forward"></i>
              </button>
            </div>

            <div
              v-if="showPlaybackControlsBool && showAudioControlsBool"
              class="volume-container"
              ref="volumeContainerRef"
            >
              <i
                :class="
                  volume > 0
                    ? 'fa-solid fa-volume-up'
                    : 'fa-solid fa-volume-mute'
                "
                class="volume-icon"
                role="button"
                tabindex="0"
                :title="showVolumePopup ? 'Close volume' : 'Open volume'"
                :aria-label="showVolumePopup ? 'Close volume' : 'Open volume'"
                :aria-expanded="showVolumePopup ? 'true' : 'false'"
                @click.stop="toggleVolumePopup"
                @keydown.enter.stop="toggleVolumePopup"
                @keydown.space.prevent.stop="toggleVolumePopup"
              ></i>
              <div
                v-if="showVolumePopup"
                class="volume-popover"
                role="dialog"
                aria-label="Volume"
                @click.stop
              >
                <button
                  type="button"
                  class="volume-mute-btn"
                  :title="volume > 0 ? 'Mute' : 'Unmute'"
                  @click="toggleMute"
                >
                  <i
                    :class="
                      volume > 0
                        ? 'fa-solid fa-volume-up'
                        : 'fa-solid fa-volume-mute'
                    "
                  ></i>
                </button>
                <div
                  class="volume-slider-vertical"
                  :title="`Volume: ${Math.round(volume * 100)}%`"
                  @click="setVolumeVertical"
                  @pointerdown.prevent="onVolumePointerDown"
                >
                  <div
                    class="volume-level-vertical"
                    :style="{ height: `${volume * 100}%` }"
                  ></div>
                  <div
                    class="volume-handle"
                    :style="volumeHandleStyle"
                    aria-hidden="true"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
  z-index: 9999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
}
.card.actions-hover .widget-actions {
  opacity: 1;
  pointer-events: auto;
}
.widget-actions .btn {
  padding: 0.15rem 0.35rem;
  font-size: 0.7rem;
}

.video-player {
  width: 100%;
  max-width: 100%;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  margin: 0;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  gap: 0;
  position: relative;
}

.video-player--vertical {
  flex-direction: column;
  justify-content: center;
}

.video-content-area {
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.video-content-area > .video-poster {
  align-self: stretch;
  width: 100%;
}

.video-player-main {
  flex: 0 0 auto;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.controls-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
  width: 100%;
  min-width: 0;
  position: relative;
  z-index: 5;
}

.video-poster {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
}

.videojs-host {
  width: 100%;
  height: 100%;
}

.video-poster :deep(.video-js) {
  width: 100%;
  height: 100%;
}

.video-poster :deep(.video-js.vjs-fluid) {
  /* Safety: if enabled via advanced options JSON, prevent aspect-ratio padding box */
  padding-top: 0 !important;
  height: 100% !important;
}

.video-poster :deep(.video-js.vjs-fluid .vjs-tech) {
  position: relative !important;
}

.video-poster :deep(.video-js .vjs-tech) {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-poster video,
.video-poster img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.progress-container {
  width: 100%;
  min-width: 0;
  flex-shrink: 0;
  align-self: stretch;
}

.progress-container__row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 0;
}

.progress-container__row .progress-bar {
  flex: 1 1 0;
  min-width: 0;
}

.time-chip {
  flex: 0 0 auto;
  min-width: 0;
  text-align: center;
  white-space: nowrap;
  font-size: 0.75rem;
  color: #666;
  font-variant-numeric: tabular-nums;
}

.time-chip--elapsed {
  text-align: left;
}

.time-chip--remaining {
  text-align: right;
}

/* If the progress row is too narrow, keep one line but tighten spacing */
.progress-container__row--compact {
  gap: 6px;
}
.progress-container__row--compact .time-chip {
  font-size: 0.68rem;
}
.progress-container__row--compact .progress-bar {
  min-width: 0;
}

.video-info-line {
  width: 100%;
  min-width: 0;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  /* Match the current description styling */
  font-size: 0.7rem;
  color: #666;
  line-height: 1.1;
}

.video-info__inner {
  display: inline-block;
}

.video-info__inner--scroll {
  animation: track-marquee 8s linear infinite;
}

@keyframes track-marquee {
  0%,
  10% {
    transform: translateX(0);
  }
  90%,
  100% {
    transform: translateX(-50%);
  }
}

.controls-row {
  padding-bottom: 8px;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  position: relative;
  z-index: 6;
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
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.control-btn:hover:not(:disabled) {
  background: #e9ecef;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ============================= */
/* 🎯 PLAY BUTTON - FINAL FIX    */
/* ============================= */

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
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  width: auto;
  max-width: 120px;
  position: relative;
}

.volume-icon {
  cursor: pointer;
  flex-shrink: 0;
}

.volume-popover {
  position: absolute;
  right: 0;
  bottom: calc(100% + 8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
  z-index: 50;
}

.volume-mute-btn {
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  cursor: pointer;
  color: #444;
  line-height: 1;
}

.volume-slider-vertical {
  width: 10px;
  height: 96px;
  background: #e9ecef;
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  /* allow circular knob to render outside the track */
  overflow: visible;
  touch-action: none;
}

.volume-level-vertical {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--accent-color, #1db954);
  border-radius: 10px;
  transition: height 0.1s linear;
}

.volume-handle {
  position: absolute;
  left: 50%;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #adb5bd;
  border: 2px solid rgba(0, 0, 0, 0.18);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  transform: translate(-50%, 50%); /* center handle on fill boundary */
  pointer-events: none; /* dragging is handled on the bar */
  opacity: 1;
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

.progress-bar {
  width: 100%;
  height: 5px;
  background: #e9ecef;
  border-radius: 5px;
  /* allow circular knob to render outside the track */
  overflow: visible;
  position: relative;
  cursor: pointer;
  touch-action: none;
}

.progress {
  height: 100%;
  background: var(--accent-color, #1db954);
  transition: width 0.1s linear;
}

.progress-handle {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #adb5bd;
  border: 2px solid rgba(0, 0, 0, 0.18);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  transform: translate(-50%, -50%);
  pointer-events: none; /* dragging is handled on the bar */
  opacity: 1;
}

.progress-bar .progress-handle {
  opacity: 0;
  transition: opacity 0.12s ease;
}

.progress-bar:hover .progress-handle,
.progress-bar.progress-bar--active .progress-handle {
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

.progress-tooltip {
  position: absolute;
  top: -30px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.62rem;
  line-height: 1.1;
  white-space: nowrap;
  color: #fff;
  background: rgba(33, 37, 41, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.22);
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 5;
}

.progress-tooltip::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 100%;
  width: 0;
  height: 0;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(33, 37, 41, 0.92);
}

.time-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #666;
  margin-top: 4px;
}
</style>
