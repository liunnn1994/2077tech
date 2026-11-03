
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include easingFunctions_Rc

                attribute float progress;
                uniform float uSize;

                flat varying float vProgress;

                void main() {
                    vProgress = progress;
                    vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
                    float size = uSize * progress;

                    gl_Position = projectionMatrix * viewPos;
                    gl_PointSize = size / length(viewPos.xyz) * (resolution.y / 1300.0);
                }
            
