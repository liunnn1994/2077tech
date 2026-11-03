
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include falloffFunctions
                #pragma app_include sineNoise

                varying vec2 vUv;
                varying vec3 vPos;
                varying vec3 vPosOriginal;
                varying float vGlow;

                uniform sampler2D tMap;
                uniform sampler2D tPerlin;
                uniform float uAlpha;
                uniform vec3 uColor1;
                uniform vec3 uColor2;

                void main() {
                    float posLen = length(vPos.xz);
                    // baked texture
                    vec3 color = texture2D(tMap, vUv).rgb;
                    color *= mix(0.65, 1.0, vPos.x * 0.5 + 0.5);
                    color += (vPos.x + 1.0) * 0.02;

                    // background gradient
                    vec2 screenUv = gl_FragCoord.xy / resolution;
                    float diagonalGradient = (screenUv.x + screenUv.y) * 0.5;
                    diagonalGradient *= sinenoise1(vec3(screenUv, time * 0.614)) * 0.5 + 0.5;
                    diagonalGradient *= sinenoise1(vec3(screenUv * 2.0, time * 0.17)) * 0.5 + 0.5;
                    vec3 bg = mix(uColor1, uColor2, diagonalGradient);

                    // add a bit of smokeyness to lower part
                    // float perlin = texture2D(tPerlin, vPos.xz * 18.0 + vec2(-time * 0.4, -time * 0.2)).r * 0.08;
                    float depth = smoothstep(0.06, -0.2, vPos.y);

                    // composite final color from baked texture and background gradient
                    float radialGradient = smoothstep(1.4, 1.6, posLen);
                    // color = mix(color, bg, clamp(radialGradient, 0.0, 1.0));

                    // animate alpha on scroll
                    float alpha = falloffsmooth(posLen * 3.0, 0.0, 6.0, 3.0, uAlpha);

                    // fade to distance
                    alpha *= smoothstep(1.99, 1.3, posLen);
                    // float alpha = 1.0;

                    // radial alpha
                    // alpha *= radialGradient;
                    // alpha *= 1.0 - pow(radialGradient, 2.0);

                    // fake shadow
                    float shadow = min(1.0, length(vPos * 1.5 + vec3(1.15, 0.0, -0.55)));
                    shadow = pow(shadow, 2.0);
                    shadow += sin(time * 3.3 + vPos.z * 5.0) * 0.1 + 0.1;
                    shadow += sin(time * 3.1 + vPos.x * 4.0) * 0.1 + 0.1;
                    shadow = mix(0.5, 1.0, shadow);
                    color *= mix(vec3(0.5, 0.7, 1.0) * 0.1, vec3(1.0), shadow);

                    vec3 blue = vec3(0.5, 0.7, 1.0);
                    blue *= 1.0 - radialGradient;
                    float glowModulation = smoothstep(0.087, -0.1, vPosOriginal.y);
                    float animatedGlow = smoothstep(0.087, 0.05, vPosOriginal.y);
                    animatedGlow *= sin(vPos.z * 5.0 + posLen * 10.0 - time * 0.75) * 0.5 + 0.5;
                    // glowModulation = pow(glowModulation, 4.0);
                    color += blue * glowModulation;
                    color += blue * animatedGlow;




                    gl_FragColor = vec4(color, alpha);
                }
            
