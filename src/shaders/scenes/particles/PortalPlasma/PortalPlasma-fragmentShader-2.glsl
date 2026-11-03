
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include falloffFunctions

                varying float vFalloff;
                varying vec2 vUv;
                varying vec3 vPos;

                uniform sampler2D tWind;

                void main() {
                    vec2 uv = vUv * vec2(0.25, 0.5);
                    uv.x += uv.y;
                    float t = -time * 0.075;

                    // layer to create organic smoke
                    float wind = texture2D(tWind, uv * 3.0 + vec2(-t, t * 0.7)).r;
                    wind *= texture2D(tWind, uv * 4.0 + vec2(-t, t * 0.7)).r;
                    wind *= texture2D(tWind, uv * 6.0 + vec2(-t, t * 0.7)).r;

                    float value = wind;

                    // fade at inner and outer part of mesh
                    float fade = 1.0;
                    fade *= smoothstep(0.3, 0.4, vUv.x);
                    fade *= smoothstep(0.6, 0.5, vUv.x);
                    value *= fade;

                    float glowMask = smoothstep(0.3, 0.45, vUv.x) * smoothstep(0.8, 0.4, vUv.x);
                    value += glowMask * 0.3;
                    value += pow(glowMask, 2.0) * wind * 0.2;

                    // fade by depth
                    value *= vFalloff;

                    // convert to linear(ish)
                    float alpha = value;
                    alpha *= 1.7;
                    alpha = pow(alpha, 4.0);
                    alpha = min(1.0, alpha);

                    // fade in when scene transitions in
                    float camFactor = pow(1.0 - clamp(-cameraPosition.z, 0.0, 1.0), 4.0);
                    alpha *= camFactor;

                    vec3 color = vec3(0.65, 0.8, 1.0);

                    gl_FragColor = vec4(color, alpha);
                }
            
