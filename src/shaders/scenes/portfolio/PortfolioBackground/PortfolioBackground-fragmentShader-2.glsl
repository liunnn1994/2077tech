
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include noiseTextureLookup

                varying vec2 vUv;

                uniform float uProgress;
                uniform vec3 uColor1;
                uniform vec3 uColor2;
                uniform sampler2D tPerlin;
                uniform sampler2D tDotPattern;
                uniform sampler2D tBlue;
                uniform vec2 uBlueOffset;

                float hash12(vec2 p) {
                    vec3 p3  = fract(vec3(p.xyx) * .1031);
                    p3 += dot(p3, p3.yzx + 33.33);
                    return fract((p3.x + p3.y) * p3.z);
                }

                float quadraticInOut(float t) {
                    float p = 2.0 * t * t;
                    return t < 0.5 ? p : -p + (4.0 * t) - 1.0;
                }

                void main() {
                    vec2 screenUv = vUv;
                    screenUv.x *= aspect;
                    screenUv *= 0.3;

                    float t = time * 0.075;

                    vec2 offset1 = vec2(-t, t * 0.25);
                    vec2 offset2 = vec2(t, -t * 0.5);

                    // match scroll
                    offset1.y -= uProgress * 0.25;
                    offset1.y -= uProgress * 0.4;

                    // perlin noise
                    float perlin = texture2D(tPerlin, screenUv + offset1).r;
                    perlin += texture2D(tPerlin, screenUv * 0.5 + offset2).r;
                    perlin *= 0.5;
                    vec3 color = mix(uColor1, uColor2, perlin);

                    // dot pattern
                    vec2 dotUv = screenUv * 45.0;
                    dotUv += vec2(0.0, -uProgress * 10.0);
                    float dots = texture2D(tDotPattern, dotUv).r;
                    float dotid = hash12(floor(dotUv));
                    float dotfade = 1.0 - abs(fract(dotid + time * 0.1) - 0.5) * 2.0;
                    color += dots * dotfade;

                    // blue noise to prevent banding
                    vec4 noise = getNoise(tBlue, gl_FragCoord.xy, uBlueOffset);
                    color += noise.rgb * 0.05;

                    gl_FragColor = vec4(color, 1.0);
                }
            
