
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

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            
