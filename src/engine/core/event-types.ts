import type { Vector2 } from 'three';

/** Pointer values are maintained by PointerInput and passed by reference. */
export interface PointerPayload {
  finger: number;
  touchID: number | false;
  eventID: string;
  currentInput: 'mouse' | 'touch';
  button: number;
  touching: boolean;
  position: Vector2;
  position01: Vector2;
  position11: Vector2;
  delta: Vector2;
  delta11: Vector2;
  dragged: Vector2;
  dragged11: Vector2;
  velocity: Vector2;
  swipeVelocity: Vector2;
}

export interface WheelPayload {
  position: Vector2;
  delta: Vector2;
  velocity: Vector2;
  isPinching: boolean;
}

export type FramePhase = 'webgl_prerender' | 'webgl_render' | 'webgl_postrender';
export type PointerPhase = 'start' | 'move' | 'drag' | 'end' | 'click';

/** The empty suffix denotes the primary pointer; numbered suffixes are fingers. */
type PointerEvents = {
  [Name in `touch${'' | number}_${PointerPhase}`]: [pointer: PointerPayload];
};

interface RuntimeEvents {
  resize: [width: number, height: number];
  visibility_change: [visible: boolean];
  focus_change: [focused: boolean];
  keydown: [event: KeyboardEvent];
  keyup: [event: KeyboardEvent];
  wheel: [wheel: WheelPayload];

  webgl_prerender: [timeSeconds: number, deltaMilliseconds: number];
  webgl_render: [timeSeconds: number, deltaMilliseconds: number];
  webgl_postrender: [timeSeconds: number, deltaMilliseconds: number];
  webgl_average_fps_update: [framesPerSecond: number];
  webgl_render_active: [active: boolean];
  asset_error: [error: Error];

  webgl_show_ui_intro: [];
  webgl_hover_logo: [];
  webgl_ui_particles_clicked: [];
  webgl_project_show: [projectIndex: number];
  webgl_project_hide: [];

  webgl_router_start: [];
  webgl_router_block_navigation: [blocked: boolean];
  webgl_router_request_switch_scene: [
    scene: string,
    path: string,
    params: Readonly<Record<string, string | null>>,
  ];
  webgl_switch_scene: [path: string];

  webgl_audio_mute_toggle: [];
  webgl_audio_update_mute: [muted: boolean];
  webgl_audio_global_volume: [volume: number];
  webgl_set_audio_volume: [name: string, volume: number];
  webgl_play_audio: [name: string];
}

export type EngineEvents = RuntimeEvents & PointerEvents;
