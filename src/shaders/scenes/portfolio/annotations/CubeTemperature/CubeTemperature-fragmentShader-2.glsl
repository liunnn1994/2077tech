
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include msdfFunctions
                #pragma app_include antialiasedStep

                uniform sampler2D tNums;
                uniform sampler2D tMap;
                uniform vec3 uColor;

                flat varying int vIsNum;
                varying vec2 vUv;
                varying float vAlpha;
                varying float vAlpha2;

                void main() {
                    vec2 uv = vUv;

                    float alpha = vAlpha;

                    if (vIsNum == -1) { // letters
                        alpha *= msdf(tMap, uv);
                    } else if (vIsNum < -1) { // sign
                        // -2 negative, -3 positive,
                        vec2 signUV = abs(uv * 2.0 - 1.0);
                        alpha = (1.0 - aastep(0.18, signUV.y)) * (1.0 - aastep(0.8, signUV.x));
                        if (vIsNum == -3) alpha = max(alpha, (1.0 - aastep(0.2, signUV.x)) * (1.0 - aastep(0.7, signUV.y)));
                        alpha *= step(0.99, vAlpha);
                    } else { // numbers
                        float numStep = 1.0 / 10.0;
                        uv = vec2(numStep * vUv.x + float(vIsNum) * numStep, vUv.y);
                        uv.x = uv.x + numStep * mod(floor((1.0 - vAlpha2) * 5.753), 8.0);
                        alpha *= msdf(tNums, uv);
                    }

                    gl_FragColor = vec4(uColor, alpha);
                }
            
