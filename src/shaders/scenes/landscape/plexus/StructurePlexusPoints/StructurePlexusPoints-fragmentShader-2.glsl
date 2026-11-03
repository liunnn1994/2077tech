
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include antialiasedStep
                #pragma app_include rotateUv

                uniform vec3 uColor;

                flat varying float vProgress;

                void main() {
                    if (vProgress < 0.001) discard;
                    vec2 uv = rotateUV(gl_PointCoord.xy, mix(1.3, 0.0, vProgress));
                    uv = uv * 2.0 - 1.0;

                    const float size = 0.125;
                    float shape = 1.0 - aastep(size, abs(uv.x)) * aastep(size, abs(uv.y));

                    gl_FragColor = vec4(uColor, shape * 0.5);
                }
            
