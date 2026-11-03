
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include msdfFunctions

                flat varying float vProgress;
                flat varying int vSide;
                flat varying ivec2 vNums;

                uniform sampler2D tNums;
                uniform vec3 uColor;
                varying vec2 vUv;

                void main() {

                    float numStep = 1.0 / 10.0;
                    float num = float(vSide < 0 ? vNums.x : vNums.y);

                    vec2 uv = vec2(numStep * vUv.x + num * numStep, vUv.y);
                    float a = msdf(tNums, uv);

                    gl_FragColor = vec4(uColor, a);
                }
            
