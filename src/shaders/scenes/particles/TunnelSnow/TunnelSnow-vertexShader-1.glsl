
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include treadmill

                attribute vec3 random;

                varying vec3 vWorldPos;
                varying vec3 vMvPos;
                varying vec3 vRandom;
                varying float vFalloff;
                varying float vAngle;
                varying float vAlpha;

                uniform sampler2D tNoise;

                vec2 rotate(vec2 v, float a) {
                    float s = sin(a);
                    float c = cos(a);
                    mat2 m = mat2(c, s, -s, c);
                    return m * v;
                }

                void main() {
                    vRandom = random;
                    vAngle = random.y * 3.14 * 2.0 + mix(0.5, 0.2, random.x);
                    vAngle -= time * mix(0.5, 1.0, random.x * 1.3);

                    vec3 pos = position;

                    float t = time;
                    t *= mix(0.2, 1.0, random.x);

                    pos.y -= mix(0.4, 0.7, fract(random.x + random.z + random.y)) * time;

                    float angle = t * 0.5 + pos.y;
                    pos.x += sin(angle) * 0.4;
                    pos.z += cos(angle) * 0.4;
                    pos.xz = rotate(pos.xz, t * 0.5);


                    pos = treadmill(pos, vec3(3.0, 4.0, 3.0));

                    vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;

                    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
                    vMvPos = mvPos.xyz;

                    // fade at ends
                    vAlpha = 1.0;
                    vAlpha *= smoothstep(8.0, 0.0, -vWorldPos.y);
                    vAlpha *= smoothstep(0.0, 2.0, -vWorldPos.y);

                    // circular gradient fade
                    vAlpha *= 1.0 - min(1.0, length(vWorldPos.xz) * 0.5);

                    // fade near camera
                    vAlpha *= smoothstep(0.5, 1.0, -vMvPos.z);

                    // fade far from camera
                    vAlpha *= smoothstep(0.0, 2.0, -vMvPos.z);

                    vAlpha *= sin(time + random.x + random.z * 13.0) * 0.5 + 0.5;
                    vAlpha *= 0.3;

                    gl_Position = projectionMatrix * mvPos;
                    // gl_PointSize = resolution.y / mix(75.0, 125.0, random.z);
                    float size = 50.0;
                    gl_PointSize = size / length(mvPos.xyz) * (resolution.y / 1300.0);
                }
            
