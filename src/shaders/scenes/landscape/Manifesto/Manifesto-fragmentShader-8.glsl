
                #pragma app_include msdfFunctions
                #pragma app_include fitFunctions
                #pragma app_include falloffFunctions

                uniform sampler2D tMap;
                uniform vec3 uColor;
                uniform float uBlink;

                varying vec2 vUv;
                varying float vAlpha;

                void main() {
                    vec2 uv = vUv;
                    float alpha = vAlpha;

                    if (uBlink < 1.0) alpha *= 0.6 + 0.4 * mod(floor(uBlink * 5.0), 2.0);

                    alpha *= msdf(tMap, uv);
                    gl_FragColor = vec4(uColor, alpha);
                }
            
