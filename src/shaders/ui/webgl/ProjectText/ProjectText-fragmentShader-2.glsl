
                    #pragma app_include msdfFunctions
                    #pragma app_include fitFunctions
                    #pragma app_include falloffFunctions
                    #pragma app_include globalUniformsGLSL

                    uniform sampler2D tMap;
                    uniform vec3 uColor;
                    uniform float uOpacity;
                    uniform float uFadeMargin;

                    varying vec2 vUv;
                    varying float vAlpha;
                    varying float wPosY;
                    flat varying float illum;

                    void main() {
                        vec2 uv = vUv;
                        float alpha = vAlpha;
                        alpha *= msdf(tMap, uv);
                        alpha *= uOpacity;

                        // mobile fade
                        alpha *= smoothstep(-uFadeMargin, -uFadeMargin * 3.0, wPosY);
                        alpha *= smoothstep(-resolutionUI.y + uFadeMargin, -resolutionUI.y + uFadeMargin * 3.0, wPosY);

                        gl_FragColor = vec4(mix(uColor, vec3(0.8), fit(illum, 0.6, 0.8, 0.0, 1.0)), alpha);
                    }
                
