
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include easingFunctions_Rc

                attribute float progress;
                uniform float uSize;
                uniform float uHover;

                flat varying float vProgress;
                varying vec3 wPos;

                void main() {
                    vProgress = progress;

                    vec3 pos = position;
                    wPos = pos;

                    float size = uSize * progress * uHover;
                    vec4 viewPos = modelViewMatrix * vec4(pos, 1.0);

                    gl_Position = projectionMatrix * viewPos;
                    gl_PointSize = size / length(viewPos.xyz) * (resolution.y / 1300.0);
                }
            
