
                //- edit
                #pragma app_include globalUniformsGLSL

                varying vec2 vUv;


                vec2 rotate(vec2 v, float a) {
                    float s = sin(a);
                    float c = cos(a);
                    mat2 m = mat2(c, s, -s, c);
                    return m * v;
                }

                void main() {
                    vUv = uv;

                    vec3 pos = position;
                    pos.xz = rotate(pos.xz, -time * 0.2);

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            
