float aastep(float threshold, float value) {
    // A constant sample has zero derivatives; equal smoothstep edges are undefined.
    float afwidth = max(length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757, 1e-6);
    return smoothstep(threshold - afwidth, threshold + afwidth, value);
}
