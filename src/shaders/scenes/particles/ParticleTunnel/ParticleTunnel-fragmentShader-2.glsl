
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include falloffFunctions

                varying float vFalloff;
                varying vec2 vUv;
                varying vec3 vPos;

                uniform sampler2D tWind;

                void main() {
                    vec2 uv = vUv * vec2(1.0, 0.25);
                    uv.x += uv.y;
                    float t = time * 0.05;

                    // layer to create organic smoke
                    float value = texture2D(tWind, uv * 3.0 + vec2(-t, t * 0.7)).r;
                    value *= texture2D(tWind, uv * 4.0 + vec2(-t, t * 0.7)).r;
                    value *= texture2D(tWind, uv * 6.0 + vec2(-t, t * 0.7)).r;

                    // fade at inner and outer part of mesh
                    float fade = 1.0;
                    fade *= smoothstep(0.0, 0.2, vUv.y);
                    fade *= smoothstep(1.0, 0.9, vUv.y);
                    // fade *= 1.0 - smoothstep(1.0, 0.3, vUv.y);
                    value *= fade;

                    // convert to linear(ish)
                    float alpha = value;
                    alpha = pow(alpha, 3.0);
                    alpha *= 3.0;
                    // alpha *= vFalloff;

                    vec3 color = vec3(0.85, 0.9, 1.0);
                    // color = vec3(1.0, 0.0, 0.0);
                    // alpha = 1.0;

                    gl_FragColor = vec4(color, alpha);
                }
            
