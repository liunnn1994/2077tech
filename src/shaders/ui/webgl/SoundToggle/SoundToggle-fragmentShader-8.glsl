
                #pragma app_include globalUniformsGLSL
                #pragma app_include msdfFunctions
                #pragma app_include imageFitUv

                uniform sampler2D tMap;
                uniform vec3 uColor;
                uniform float uShow;
                uniform float uRand;
                uniform float uActive;

                varying vec2 vUv;
                flat varying vec2 vScale;

                void main() {
                    vec2 uv = vUv * vec2(1.0, 0.5) + vec2(0.0, uActive * 0.5);
                    float a = 1.0;

                    if (uShow < 1.0) {
                        a *= sin(uShow * 30.0 + uRand * 12.4242) * 0.4 + 0.6;
                        a *= step(0.01, uShow);
                    }

                    a *= msdf(tMap, uv);

                    gl_FragColor = vec4(uColor, a);
                }
            
