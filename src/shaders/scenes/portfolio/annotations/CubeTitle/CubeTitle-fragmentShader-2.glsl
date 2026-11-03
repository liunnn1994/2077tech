
                #pragma app_include msdfFunctions
                #pragma app_include fitFunctions
                #pragma app_include falloffFunctions

                uniform sampler2D tMap;
                uniform vec3 uColor;

                varying vec2 vUv;
                varying float vAlpha;

                void main() {
                    vec2 uv = vUv;
                    float alpha = vAlpha;
                    alpha *= msdf(tMap, uv);
                    gl_FragColor = vec4(uColor, alpha);
                }
            
