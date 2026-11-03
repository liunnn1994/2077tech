
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include matrixFunctions
                #pragma app_include falloffFunctions

                attribute float glow;

                varying vec2 vUv;
                varying vec3 vPos;
                varying vec3 vWorldPos;
                varying float vFalloff;
                varying float vFalloff2;
                varying float vFade;
                varying float vGlow;
                varying float vDist;
                varying vec2 vGlowPos;

                vec2 rotate(vec2 v, float a) {
                    float s = sin(a);
                    float c = cos(a);
                    mat2 m = mat2(c, s, -s, c);
                    return m * v;
                }

                void main() {
                    vUv = uv;
                    vGlow = glow;
                    vPos = position;

                    vec3 pos = position;
                    vec3 translation = getMatrixTranslation(modelMatrix);

                    // rotate based on camera distance
                    float dist = distance(cameraPosition, translation);

                    float spinFalloff = falloffsmooth(dist, 8.0, 2.0, 5.0, 0.5);
                    float spinFalloff2 = falloffsmooth(dist, 10.0, 2.0, 8.0, 0.5);

                    float firstRingMask = falloff(translation.y, -4.5, -4.51, 0.01, 0.5);

                    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
                    float depth = -mvPos.z;
                    vFalloff = smoothstep(3.5, 2.3, depth);


                    // falloff = smoothstep(0.0, 1.0, falloff);
                    // falloff = pow(falloff, 2.0);

                    // idle rotation
                    // pos.xy = rotate(pos.xy, -time * 0.1);

                    float angle1 = spinFalloff * 3.14159 * 0.25 * (1.0 - firstRingMask);
                    pos.xz = rotate(pos.xz, angle1);

                    float angle2 = spinFalloff2 * 3.14159 * 0.25 + translation.y * 0.5;
                    pos.xy = rotate(pos.xy, angle2);

                    // // fade in as camera enters structure
                    // vec3 structureEntrance = vec3(0.0, 0.0, 1.0);
                    // vFalloff2 = 1.0 - clamp(cameraPosition.y - 1.0, 0.0, 4.0) / 4.0;
                    // vFalloff2 = smoothstep(0.0, 1.0, vFalloff2);

                    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
                    vWorldPos = worldPos.xyz;
                    vGlowPos = rotate(worldPos.xz, -time * 0.5 + translation.y * 2.2);

                    gl_Position = projectionMatrix * mvPos;
                }
            
