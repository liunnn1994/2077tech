
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include matrixFunctions
                #pragma app_include easingFunctions_Rc

                attribute float progress;
                attribute ivec2 nums;
                attribute int side;
                flat varying ivec2 vNums;
                flat varying float vProgress;
                flat varying int vSide;

                uniform float uSize;
                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    vSide = side;
                    vProgress = progress;
                    vNums = nums;

                    vec3 left = getViewLeft();
                    vec3 up = getViewUp();

                    float size = uSize;
                    vec4 pos = instanceMatrix * billboardModelMatrix() * vec4(position * size * power1In(progress), 1.0);

                    // detect side
                    vec4 projPos = projectionMatrix * viewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
                    float screenSide = -sign(projPos.x / projPos.w);

                    pos.xyz += left * screenSide * uSize * 1.75;
                    pos.xyz += up * 1.0 * uSize;

                    gl_Position = projectionMatrix * viewMatrix * pos;
                }
            
