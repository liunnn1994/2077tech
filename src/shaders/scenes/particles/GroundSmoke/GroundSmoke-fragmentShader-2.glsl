
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include falloffFunctions

                varying float vFalloff;
                varying vec2 vUv;
                varying vec3 vPos;

                uniform sampler2D tWind;
                uniform float uAlpha;

                void main() {
                    vec2 screenUv = gl_FragCoord.xy / resolution;

                    vec2 uv = vUv * vec2(0.5, 1.0);
                    uv.x -= uv.y;
                    float t = time * 0.05 + 0.5;

                    // layer to create organic smoke
                    float wind = texture2D(tWind, uv * 1.0 + vec2(-t, t * 0.7)).r;
                    wind *= texture2D(tWind, uv * 2.0 + vec2(-t, t * 0.7)).r;
                    wind *= texture2D(tWind, uv * 3.0 + vec2(-t, t * 0.7)).r;

                    float value = wind;

                    // fade at inner and outer part of mesh
                    float fade = 1.0;
                    fade *= smoothstep(0.4, 0.5, vUv.x);
                    fade *= smoothstep(1.0, 0.4, vUv.x);
                    value *= fade;

                    float glowMask = smoothstep(0.3, 0.45, vUv.x) * smoothstep(0.8, 0.4, vUv.x);
                    // value += glowMask * 0.3;
                    // value += pow(glowMask, 2.0) * wind * 0.2;

                    // fade by depth
                    // value *= vFalloff;

                    // convert to linear(ish)
                    float alpha = value;
                    alpha *= 3.0;
                    alpha = pow(alpha, 3.0);
                    alpha += pow(screenUv.x, 2.0) * fade * 0.15;

                    // animation
                    alpha *= uAlpha;

                    vec3 color = vec3(0.9, 0.95, 1.0);

                    gl_FragColor = vec4(color, alpha);
                }
            
