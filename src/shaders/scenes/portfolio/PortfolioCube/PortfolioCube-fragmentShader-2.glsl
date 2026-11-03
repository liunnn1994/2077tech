
                layout(location = 1) out highp vec4 gInfo;

                #pragma app_include globalUniformsGLSL

                varying vec2 vUv;

                uniform sampler2D tTexture1;
                uniform float uProgress;

                void main() {
                    vec2 uv = vUv;
                    vec2 st = uv;
                    st.y *= 0.75;
                    st *= 1.5;
                    float t = time * 0.075;
                    vec2 offset = vec2(0.0, t);
                    float noise = texture2D(tTexture1, st + offset).r;
                    noise *= texture2D(tTexture1, st * 0.5 + offset).r;
                    float grad = 1.0 - clamp(length(vUv - 0.5) * 2.0, 0.0, 1.0);
                    noise *= grad;
                    noise *= length(vUv - 0.5);
                    noise = noise * 6.5;

                    // fade by scroll distance
                    float scrollDist = clamp(1.0 - abs(uProgress) * 20.0, 0.0, 1.0);
                    noise *= scrollDist;

                    vec3 color = vec3(1.0);
                    float alpha = noise;
                    gl_FragColor = vec4(color, alpha);
                }
            
