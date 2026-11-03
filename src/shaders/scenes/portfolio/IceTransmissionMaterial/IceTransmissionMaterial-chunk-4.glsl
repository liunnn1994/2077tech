// The frost atlas uses UV1 independently from Three's material texture channels.
// Three injects the attribute itself when a standard texture selects channel 1.
#ifndef USE_UV1
    attribute vec2 uv1;
#endif
varying vec2 vUv1;
varying vec3 vIceWorldPosition;
#include <uv_pars_vertex>
