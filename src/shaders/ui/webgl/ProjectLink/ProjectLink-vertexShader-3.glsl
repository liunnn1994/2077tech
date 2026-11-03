
                #pragma app_include matrixFunctions
                #pragma app_include falloffFunctions
                #pragma app_include globalUniformsGLSL
                #pragma app_include fitFunctions

                uniform sampler2D tSim;
                uniform bool uHighlights;

                varying vec2 vUv;
                varying float wPosY;
                flat varying vec2 vScale;
                flat varying vec2 illum;

                void main() {
                    illum = vec2(0.0);

                    if (uHighlights) {
                        vec4 ppos = modelMatrix * vec4(vec3(0.0), 1.0);
                        vec2 uvScreen = abs(ppos.xy) / resolutionUI;
                        vec2 val = texture2D(tSim, vec2(uvScreen.x, 1.0 - uvScreen.y)).xy;
                        illum.x = fit(val.g, 0.01, 1.0, 0.0, 5.0);
                        illum.y = val.r;
                    }

                    vUv = uv;
                    vScale = getMatrixScale(modelMatrix).xy;

                    vec4 wPos = modelMatrix * vec4(position, 1.0);
                    wPosY = wPos.y;
                    gl_Position = projectionMatrix * viewMatrix * wPos;
                }
            
