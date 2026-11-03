
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include falloffFunctions
                #pragma app_include sineNoise

                varying vec2 vUv;
                varying vec3 vPos;

                uniform sampler2D tDotPattern;
                uniform float uAlpha;
                uniform vec3 uColor1;
                uniform vec3 uColor2;

                float hash12(vec2 p) {
                    vec3 p3  = fract(vec3(p.xyx) * .1031);
                    p3 += dot(p3, p3.yzx + 33.33);
                    return fract((p3.x + p3.y) * p3.z);
                }

                void main() {
                    // background color gradient
                    vec2 screenUv = gl_FragCoord.xy / resolution;
                    float ramp = (screenUv.x + screenUv.y) * 0.5;
                    ramp *= sinenoise1(vec3(screenUv, time * 0.614)) * 0.5 + 0.5;
                    ramp *= sinenoise1(vec3(screenUv * 2.0, time * 0.17)) * 0.5 + 0.5;
                    vec3 color = mix(uColor1, uColor2, ramp);
                    color *= 1.1;

                    // dot pattern
                    vec2 dotUv = vUv * vec2(200.0, 100.0);
                    float dots = texture2D(tDotPattern, dotUv).r;
                    float dotid = hash12(floor(dotUv));
                    float dotfade = 1.0 - abs(fract(dotid + time * 0.1) - 0.5) * 2.0;
                    color += dots * dotfade * 2.0;

                    // animate on scroll
                    // float alpha = falloffsmooth(length(vPos.xz), 0.0, 10.1, 2.0, uAlpha);
                    // color *= alpha;

                    gl_FragColor = vec4(color, 1.0);
                }
            
