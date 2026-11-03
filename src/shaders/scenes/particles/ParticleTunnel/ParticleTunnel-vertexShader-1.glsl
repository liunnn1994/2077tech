
                //- edit
                #pragma app_include globalUniformsGLSL

                varying float vFalloff;
                varying vec2 vUv;
                varying vec3 vPos;

                void main() {
                    vUv = uv;

                    vec3 pos = position;
                    vPos = pos;

                    // fade in as camera enters structure
                    vFalloff = 1.0 - clamp(cameraPosition.y - 1.0, 0.0, 4.0) / 4.0;
                    vFalloff = smoothstep(0.0, 1.0, vFalloff);

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            
