
                //- edit
                #pragma app_include globalUniformsGLSL

                varying vec2 vUv;
                varying vec3 vPos;
                varying vec3 vWorldPos;

                void main() {
                    vUv = uv;
                    vPos = position;
                    vec3 pos = position;
                    vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            
