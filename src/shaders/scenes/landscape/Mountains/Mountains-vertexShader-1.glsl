
                //- edit
                #pragma app_include globalUniformsGLSL

                varying vec2 vUv;
                varying vec3 vPos;
                varying vec3 vWorldPos;
                varying vec4 vMvPos;

                uniform float uProgress;
                uniform float uProgress2;

                void main() {
                    vUv = uv;
                    vPos = position;
                    vMvPos = modelViewMatrix * vec4(position, 1.0);
                    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;

                    vec3 pos = position;

                    // intro displacement
                    float maxDist = 32.0;
                    float worldLen01 = clamp(length(vWorldPos.xz), 0.0, maxDist) / maxDist;
                    float wave2 = smoothstep(0.0 + uProgress, 0.5 + uProgress, worldLen01);
                    wave2 = pow(wave2, 20.0);
                    // pos.y += wave2;

                    gl_Position = projectionMatrix * vMvPos;
                }
            
