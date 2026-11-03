
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include antialiasedStep
                #pragma app_include rotateUv

                uniform vec3 uColor;

                flat varying float vProgress;
                varying vec3 wPos;

                void main() {
                    if (vProgress < 0.001) discard;
                    vec2 uv = rotateUV(gl_PointCoord.xy, mix(1.3, 0.0, vProgress));
                    uv = uv * 2.0 - 1.0;

                    const float size = 0.1;
                    float shape = 1.0 - aastep(size, abs(uv.x)) * aastep(size, abs(uv.y));
                    if (shape < 0.001) discard;

                    vec3 col = mix(vec3(0.0), uColor, smoothstep(0.75, 1.5, length(wPos)));
                    gl_FragColor = vec4(col, 1.0);
                }
            
