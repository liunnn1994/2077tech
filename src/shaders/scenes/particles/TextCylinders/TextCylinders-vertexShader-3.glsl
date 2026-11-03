
                //- edit
                #pragma app_include globalUniformsGLSL

                attribute float rand;

                varying vec2 vUv;
                varying vec3 vPos;
                varying vec3 vWorldPos;
                varying float vRand;

                void main() {
                    vUv = uv;

                    vec3 pos = position;

                    vPos = pos;
                    vRand = rand;

                    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            
