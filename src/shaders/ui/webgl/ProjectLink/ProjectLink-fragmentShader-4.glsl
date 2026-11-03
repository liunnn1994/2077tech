
                #pragma app_include globalUniformsGLSL
                #pragma app_include msdfFunctions
                #pragma app_include imageFitUv
                #pragma app_include fitFunctions

                uniform sampler2D tMap;
                uniform vec3 uColor;
                uniform float uShow;
                uniform float uRand;
                uniform float uOpacity;
                uniform float uFadeMargin;

                varying vec2 vUv;
                varying float wPosY;
                flat varying vec2 vScale;
                flat varying vec2 illum;

                void main() {
                    vec2 uv = imagefitUV(vUv, vec2(textureSize(tMap, 0)), vScale, 1.0);
                    float a = 1.0;

                    if (uShow < 1.0) {
                        a *= sin(uShow * 30.0 + uRand * 12.4242) * 0.4 + 0.6;
                        a *= step(0.01, uShow);
                    }

                    a *= msdf(tMap, uv);
                    a *= uOpacity * (1.0 - floor(mod(illum.x * 5.34234, 2.0)));

                    // mobile fade
                    a *= smoothstep(-uFadeMargin, -uFadeMargin * 3.0, wPosY);
                    a *= smoothstep(-resolutionUI.y + uFadeMargin, -resolutionUI.y + uFadeMargin * 3.0, wPosY);

                    gl_FragColor = vec4(mix(uColor, vec3(0.8), fit(illum.y, 0.6, 0.8, 0.0, 1.0)), a);
                }
            
