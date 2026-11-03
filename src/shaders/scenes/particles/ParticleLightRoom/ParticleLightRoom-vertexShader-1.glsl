
                //- edit
                #pragma app_include globalUniformsGLSL

                varying vec2 vUv;
                varying vec3 vPos;

                void main() {
                    vUv = uv;

                    vec3 pos = position;
                    vPos = pos;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            
