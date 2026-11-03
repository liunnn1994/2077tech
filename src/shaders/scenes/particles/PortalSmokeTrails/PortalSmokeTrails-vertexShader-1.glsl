
                //- edit
                #pragma app_include globalUniformsGLSL

                varying float vFalloff;
                varying vec2 vUv;
                varying vec3 vPos;

                void main() {
                    vUv = uv;

                    vec3 pos = position;
                    vPos = (modelMatrix * vec4(position, 1.0)).xyz;

                    // fade in as camera enters structure
                    float depth = -(modelViewMatrix * vec4(position, 1.0)).z;
                    vFalloff = 1.0 - smoothstep(2.0, 15.0, depth);
                    vFalloff *= smoothstep(0.5, 2.0, depth);

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            
