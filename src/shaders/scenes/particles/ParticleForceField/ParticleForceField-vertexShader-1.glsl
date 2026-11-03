
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include matrixFunctions

                varying vec2 vUv;
                varying vec3 vPos;
                varying vec3 vNormal;
                varying vec3 vEye;

                void main() {
                    vUv = uv;

                    vec3 pos = position;
                    vPos = (modelMatrix * vec4(position, 1.0)).xyz;

                    // for fresnel
                    vNormal = normalMatrix * normal;
                    vEye = -(modelViewMatrix * vec4(position, 1.0)).xyz;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            
