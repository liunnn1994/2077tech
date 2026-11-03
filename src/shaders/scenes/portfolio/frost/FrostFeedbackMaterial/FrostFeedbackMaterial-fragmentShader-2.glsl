
                #pragma app_include globalUniformsGLSL
                #pragma app_include fitFunctions

                const float aspectRatio = 1.0;
                float line(vec2 uv, vec2 point1, vec2 point2) {
                    vec2 pa = uv - point1, ba = point2 - point1;
                    pa.x *= aspectRatio;
                    ba.x *= aspectRatio;
                    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
                    return length(pa - ba * h);
                }

                float cubicIn(float t) { return t * t * t; }

                varying vec2 vUv;

                uniform sampler2D tBuffer;
                uniform sampler2D tAdvect;
                uniform vec2 uSplatCoords;
                uniform vec2 uSplatPrevCoords;
                uniform float uSplatRadius;

                void main() {
                    vec2 uv = vUv;

                    float resolution = float(textureSize(tBuffer, 0));
                    vec2 invResolution = 1.0 / vec2(resolution);

                    // advect by noise
                    vec2 noiseUv = vUv;
                    vec2 advect = (texture2D(tAdvect, noiseUv * 3.0).xy * 2.0 - 1.0) * 1.0;
                    uv += advect * invResolution;

                    // wave propagation
                    float wavespeed = 1.0;
                    vec2 offset = invResolution * wavespeed;
                    float l = texture2D(tBuffer, uv - vec2(offset.x, 0.0)).r;
                    float r = texture2D(tBuffer, uv + vec2(offset.x, 0.0)).r;
                    float t = texture2D(tBuffer, uv + vec2(0.0, offset.y)).r;
                    float b = texture2D(tBuffer, uv - vec2(0.0, offset.y)).r;
                    float nextVal = max(max(max(l, r), t), b);

                    // mouse line splat
                    float radius = 0.05 * smoothstep(0.1, 1.0, uSplatRadius);
                    float splat = cubicIn(clamp(1.0 - line(vUv, uSplatPrevCoords.xy, uSplatCoords.xy) / radius, 0.0, 1.0));
                    nextVal += splat;

                    // damping and clamp
                    nextVal *= 0.985;
                    nextVal = min(nextVal, 1.0);

                    float rim = nextVal - texture2D(tBuffer, uv).r;

                    gl_FragColor = vec4(nextVal, rim, 0.0, 1.0);
                }
            
