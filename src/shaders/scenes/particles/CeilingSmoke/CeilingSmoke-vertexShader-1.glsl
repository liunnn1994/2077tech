
                //- edit
                #pragma app_include globalUniformsGLSL

                varying float vFalloff;
                varying vec2 vUv;
                varying vec3 vPos;

                void main() {
                    vUv = uv;

                    vec3 pos = position;
                    vPos = position;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            
