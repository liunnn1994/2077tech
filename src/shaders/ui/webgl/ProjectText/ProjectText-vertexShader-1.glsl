
                #pragma app_include matrixFunctions
                #pragma app_include falloffFunctions
                #pragma app_include globalUniformsGLSL
                #pragma app_include fitFunctions

                attribute vec3 textWeights;
                attribute vec3 centr;
                uniform float uShow1;
                uniform float uShow2;
                uniform sampler2D tSim;
                uniform bool uHighlights;

                varying vec2 vUv;
                varying float wPosY;
                varying float vAlpha;
                flat varying float illum;

                void main() {
                    float tr1 = falloff(textWeights.x, 0.0, 1.0, 0.1, clamp(uShow1, 0.0, 1.0));
                    float tr2 = falloff(textWeights.x, 0.0, 1.0, 1.0, clamp(uShow2, 0.0, 1.0));

                    float tr = 0.0;
                    illum = 0.0;

                    if (uHighlights) {
                        vec4 ppos = modelMatrix * vec4(centr, 1.0);
                        vec2 uvScreen = abs(ppos.xy) / resolutionUI;
                        vec2 val = texture2D(tSim, vec2(uvScreen.x, 1.0 - uvScreen.y)).xy;
                        tr = fit(val.g, 0.01, 1.0, 0.0, 5.0);
                        illum = val.r;
                    }

                    vUv = uv;
                    vUv.x = mod(uv.x + 0.125 * mod(floor((1.0 - tr2 + tr) * 5.654), 8.0), 1.0);
                    vAlpha = tr1;

                    vec4 wPos = modelMatrix * vec4(position, 1.0);
                    wPosY = wPos.y;

                    gl_Position = projectionMatrix * viewMatrix * wPos;
                }
            
