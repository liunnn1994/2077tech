
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include falloffFunctions

                varying float vFalloff;
                varying vec2 vUv;
                varying vec3 vPos;

                uniform sampler2D tWind;

                void main() {
                    vec2 uv = vUv * vec2(0.25, 0.5);
                    uv.x += vPos.z * 0.1;
                    float t = time * 0.15;

                    // layer to create organic smoke
                    float value = texture2D(tWind, uv * 3.0 + vec2(-t, t * 0.7)).r;
                    value *= texture2D(tWind, uv * 4.0 + vec2(-t, t * 0.7)).r;
                    value *= texture2D(tWind, uv * 6.0 + vec2(-t, t * 0.7)).r;

                    // fade at inner and outer part of mesh
                    float fade = 1.0;
                    fade *= smoothstep(0.0, 0.2, vUv.y);
                    fade *= smoothstep(1.0, 0.5, vUv.y);
                    fade *= 1.0 - abs((vUv.x - 0.5) * 2.0);
                    // fade *= 1.0 - smoothstep(1.0, 0.3, vUv.y);
                    value *= fade;

                    // fade by depth
                    value *= vFalloff;

                    // convert to linear(ish)
                    float alpha = value;
                    alpha *= 2.75;
                    alpha = pow(alpha, 3.0);
                    alpha = min(1.0, alpha);

                    vec3 color = vec3(0.85, 0.9, 1.0);

                    gl_FragColor = vec4(color, alpha);
                }
            
