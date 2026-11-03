
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include matrixFunctions
                #pragma app_include falloffFunctions
                #pragma app_include rotationMatrices

                attribute vec3 centr;
                attribute vec3 rand;

                varying vec2 vUv;
                varying vec3 vPos;
                varying float vFalloff;
                varying float vFalloff2;
                varying float vFade;
                varying float vGlow;
                varying float vFirstRingMask;
                varying vec2 vGlowPos;

                vec2 rotate(vec2 v, float a) {
                    float s = sin(a);
                    float c = cos(a);
                    mat2 m = mat2(c, s, -s, c);
                    return m * v;
                }

                void main() {
                    vUv = uv;
                    vPos = (modelViewMatrix * vec4(position, 1.0)).xyz;

                    vec3 pos = position;
                    vec3 translation = getMatrixTranslation(modelMatrix);
                    float firstRingMask = falloff(translation.y, -1.66, -1.661, 0.01, 0.5);
                    vFirstRingMask = 1.0 - firstRingMask;
                    float camFactor = 1.0 - (1.0 - clamp(-cameraPosition.z * 0.8, 0.0, 1.0));

                    // rotate based on camera distance
                    float dist = distance(cameraPosition, translation);

                    vFalloff = falloffsmooth(dist, 14.0, 2.0, 13.0, 0.75);
                    float glowFalloff = 1.0 - smoothstep(0.2, 0.4, 1.0 - vFalloff);

                    vec3 scaledCentr = centr * 0.3;
                    vec3 axis = normalize(rand * 2.0 - 1.0);
                    float angle = 0.5 * smoothstep(1.5, 12.0, -vPos.z) + firstRingMask * camFactor * 0.5;
                    pos -= scaledCentr;
                    pos = rotate3D(pos, axis, angle);
                    pos += scaledCentr;

                    pos += centr * glowFalloff * mix(0.075, 0.15, rand.z);
                    pos += rand.y * centr * glowFalloff * sin(rand.x * 5.0 + time * 0.5 + (centr.x + centr.y + centr.z) * 15.0) * 0.05;

                    // additional push based on camera coming into view

                    pos += centr * camFactor * 0.15 * firstRingMask;

                    float spinFalloff = falloffsmooth(dist, 8.0, 2.0, 5.0, 0.5);
                    float spinFalloff2 = falloffsmooth(dist, 10.0, 2.0, 8.0, 0.5);

                    float angle1 = spinFalloff * 3.14159 * 0.3;
                    pos.xz = rotate(pos.xz, angle1);

                    float angle2 = spinFalloff2 * 3.14159 * 0.3 + translation.y * 0.25 + 1.5;
                    pos.xy = rotate(pos.xy, angle2);

                    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
                    vGlowPos = rotate(worldPos.xz, -time * 0.5 + translation.y * 2.2);

                    // fade in as camera approaches
                    vFade = falloffsmooth(dist, 2.0, 16.0, 9.0, 0.5);

                    // make first ring fully visible
                    vFade = min(1.0, vFade);

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            
