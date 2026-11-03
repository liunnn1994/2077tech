
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include falloffFunctions
                #pragma app_include sineNoise

                varying vec2 vUv;
                varying vec3 vPos;
                varying float vFalloff;
                varying float vFalloff2;
                varying float vGlow;
                varying float vFade;
                varying float vFirstRingMask;

                uniform sampler2D tMap;
                uniform sampler2D tGlow;
                uniform float uAlpha;
                uniform vec3 uColor1;
                uniform vec3 uColor2;

                void main() {
                    float alpha = 1.0;

                    vec3 color = texture2D(tMap, vUv).rgb;

                    // background gradient
                    vec2 screenUv = gl_FragCoord.xy / resolution;
                    float diagonalGradient = (screenUv.x + screenUv.y) * 0.5;
                    diagonalGradient *= sinenoise1(vec3(screenUv, time * 0.614)) * 0.5 + 0.5;
                    diagonalGradient *= sinenoise1(vec3(screenUv * 2.0, time * 0.17)) * 0.5 + 0.5;
                    vec3 bg = mix(uColor1, uColor2, diagonalGradient);
                    bg *= 1.1;

                    color = mix(bg, color, vFade * 0.95);

                    // darken as camera approaches
                    // color *= vFalloff;

                    // reveal as camera enters structure entry
                    // color *= vFalloff2;

                    // emissive
                    float falloff = 1.0 - vFalloff;
                    float glowFalloff = smoothstep(0.2, 0.4, falloff);
                    float n1 = sinenoise1(vPos + time * 0.5 + color.r * 5.0) * 0.5 + 0.5;
                    n1 = n1 * 0.5 + 0.5;
                    float camFactor = pow(1.0 - clamp(-cameraPosition.z, 0.0, 1.0), 4.0);
                    color += texture2D(tGlow, vUv).r * vec3(0.5, 0.7, 1.0) * n1 * glowFalloff * 0.8 * camFactor;
                    // vec3 blue = vec3(0.5, 0.7, 1.0) * vFirstRingMask;
                    // float glowModulation = pow(length(vGlowPos - vec2(0.0, 0.5)), 3.0);
                    // color += blue * vGlow * 5.0 * glowFalloff * glowModulation;
                    // color += color * blue * smoothstep(0.9, 1.0, falloff) * glowModulation * 0.5;

                    gl_FragColor = vec4(color, alpha);
                }
            
