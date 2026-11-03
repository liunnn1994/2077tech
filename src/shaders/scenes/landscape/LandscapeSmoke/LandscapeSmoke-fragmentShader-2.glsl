
                //- edit
                #pragma app_include globalUniformsGLSL

                varying vec2 vUv;
                varying vec3 vPos;
                varying vec3 vWorldPos;
                varying vec3 vNormal;

                uniform sampler2D tWind;
                uniform float uAlpha;

                void main() {
                    vec2 uv = vUv;
                    uv.x *= 2.0;

                    // wind
                    float t = time * 0.15;

                    if (vWorldPos.x > 6.0) {
                        t += 0.914;
                    }
                    float wind = texture2D(tWind, uv + vec2(-t, t * 0.4)).r;
                    wind *= texture2D(tWind, uv * 1.25 + vec2(-t, 0.75)).r;
                    wind *= texture2D(tWind, uv * 0.5 + vec2(-t, -t * 0.35)).r;
                    wind *= 8.0;

                    vec3 color = vec3(1.0);

                    float alpha = wind;
                    alpha *= 1.0 - vUv.y;
                    alpha *= smoothstep(0.0, 0.1, vUv.y);
                    alpha *= smoothstep(0.0, 0.5, vUv.x);
                    alpha *= smoothstep(1.0, 0.8, vUv.x);
                    alpha *= uAlpha;

                    gl_FragColor = vec4(color, alpha);
                }
            
