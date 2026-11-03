
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include matrixFunctions
                #pragma app_include falloffFunctions

                attribute int isNum;
                attribute float textWeight;

                uniform float uShow1;
                uniform float uShow2;

                varying vec2 vUv;
                flat varying int vIsNum;
                varying float vAlpha;
                varying float vAlpha2;

                void main() {
                    vIsNum = isNum;

                    float tr1 = falloff(textWeight, 0.0, 1.0, 0.1, clamp(uShow1, 0.0, 1.0));
                    float tr2 = falloff(textWeight, 0.0, 1.0, 1.0, clamp(uShow2, 0.0, 1.0));

                    vUv = uv;
                    if (isNum == -1) { // letters
                        vUv.x = mod(uv.x + 0.125 * mod(floor((1.0 - tr2) * 5.753), 8.0), 1.0);
                    }

                    vAlpha = tr1;
                    vAlpha2 = tr2;

                    gl_Position = projectionMatrix * viewMatrix * billboardModelMatrix() * vec4(position, 1.0);
                }
            
