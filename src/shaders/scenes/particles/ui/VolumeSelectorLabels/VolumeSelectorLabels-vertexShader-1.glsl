
                    #pragma app_include matrixFunctions
                    #pragma app_include falloffFunctions

                    attribute vec3 textWeights;
                    uniform float uShow1;
                    uniform float uShow2;
                    uniform float uAlpha;

                    varying vec2 vUv;
                    varying float vAlpha;

                    void main() {
                        float tr1 = falloff(textWeights.x, 0.0, 1.0, 0.1, clamp(uShow1, 0.0, 1.0));
                        float tr2 = falloff(textWeights.x, 0.0, 1.0, 1.0, clamp(uShow2, 0.0, 1.0));

                        vUv = uv;
                        vUv.x = mod(uv.x + 0.125 * mod(floor((1.0 - tr2) * 5.753), 8.0), 1.0);
                        vAlpha = tr1 * uAlpha;

                        gl_Position = projectionMatrix * viewMatrix * billboardModelMatrix() * vec4(position, 1.0);
                    }
                
