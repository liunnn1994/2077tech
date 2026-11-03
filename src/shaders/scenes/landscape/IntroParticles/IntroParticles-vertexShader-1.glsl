
                //- edit
                #pragma app_include globalUniformsGLSL

                attribute vec3 color;

                varying vec3 vWorldPos;

                uniform sampler2D tNoise;

                void main() {
                    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = resolution.y / 100.0;

                }
            
