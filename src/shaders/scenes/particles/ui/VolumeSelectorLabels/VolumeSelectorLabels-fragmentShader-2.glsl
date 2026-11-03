
                        #pragma app_include msdfFunctions
                        #pragma app_include fitFunctions
                        #pragma app_include falloffFunctions
                        #pragma app_include globalUniformsGLSL

                        uniform sampler2D tMap;
                        uniform vec3 uColor;
                        uniform float uFadePosition;
                        uniform float uFadeMargin;

                        varying vec2 vUv;
                        varying float vAlpha;

                        void main() {
                            vec2 uv = vUv;
                            float alpha = vAlpha;
                            alpha *= msdf(tMap, uv);

                            alpha *= smoothstep(resolution.x * 0.5 + uFadePosition + uFadeMargin, resolution.x * 0.5 + uFadePosition, gl_FragCoord.x);
                            alpha *= smoothstep(resolution.x * 0.5 - uFadePosition - uFadeMargin, resolution.x * 0.5 - uFadePosition, gl_FragCoord.x);

                            gl_FragColor = vec4(uColor, alpha);
                        }
                    
