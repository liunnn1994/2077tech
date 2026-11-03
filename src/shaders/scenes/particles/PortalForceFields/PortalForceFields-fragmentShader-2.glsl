
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include falloffFunctions
                #pragma app_include sineNoise
                #pragma app_include antialiasedStep

                varying vec2 vUv;
                varying vec3 vPos;
                varying vec3 vWorldPos;
                varying float vFalloff;

                uniform sampler2D tTriangles;
                uniform sampler2D tNoise;

                void main() {
                    float alpha = 1.0;

                    float y = length(vUv - 0.5) * 2.0;

                    float circleMask = 1.0 - step(0.98, y);
                    float radialMask = smoothstep(0.5, 1.0, y);
                    float circleEdgeMask = smoothstep(0.9, 0.85, y);

                    float noise = texture2D(tNoise, vUv * 0.25 + vec2(vWorldPos.y)).r;
                    noise *= texture2D(tNoise, vUv * 0.8 + vec2(vWorldPos.y)).r;
                    noise = sin(noise * 13.0 + time - y * 10.0) * 0.5 + 0.5;
                    float mask = aastep(0.2, noise) * (1.0 - noise * 0.75);

                    // float n1 = aastep(0.1, noise) * (1.0 - pow(noise, 2.0));
                    // alpha = max(alpha, n1);

                    float triangles = texture2D(tTriangles, vUv * 2.0 + noise * 0.04).r * 4.0;

                    // shape effect
                    alpha = triangles * mask;
                    alpha += pow(mask, 5.0) * 0.5;
                    alpha += radialMask * 0.5;
                    alpha *= circleMask;
                    alpha = min(1.0, alpha);

                    // clip to circle
                    alpha *= circleEdgeMask;

                    alpha *= smoothstep(0.45 - vFalloff * 0.25, 0.75 - vFalloff * 0.3, length(vUv - 0.5));
                    float camFactor = (1.0 - clamp(-cameraPosition.z * 8.0, 0.0, 1.0));
                    alpha *= camFactor;

                    // fade as camera appears
                    // alpha *= 1.0 - pow(vFalloff, 2.0);

                    vec3 color = vec3(0.7, 0.8, 1.0);

                    gl_FragColor = vec4(color, alpha);
                }
            
