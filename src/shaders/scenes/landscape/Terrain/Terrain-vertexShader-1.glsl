
                //- edit
                #pragma app_include globalUniformsGLSL

                varying vec2 vUv;
                varying vec3 vPos;
                varying vec3 vWorldPos;

                uniform float uProgress;
                uniform float uProgress2;
                uniform sampler2D tNoise;

                void main() {
                    vUv = uv;
                    vPos = position;
                    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;

                    vec3 pos = position;

                    // intro displacement
                    // float maxDist = 32.0;
                    // float noise = texture2D(tNoise, vWorldPos.xz * 0.07).r;
                    // float worldLen01 = clamp(length(vWorldPos.xz), 0.0, maxDist) / maxDist;
                    // worldLen01 += noise * 0.1;
                    // float wave2 = smoothstep(0.0 + uProgress, 0.5 + uProgress, worldLen01);
                    // wave2 = pow(wave2, 35.0);
                    // pos.y += wave2 * smoothstep(0.1, 0.15, worldLen01) * 0.5;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            
