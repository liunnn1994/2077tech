
                    #pragma app_include globalUniformsGLSL
                    #pragma app_include antialiasedStep
                    #pragma app_include normalEncoding
                    #pragma app_include falloffFunctions

                    uniform float uAlpha;

                    varying vec2 vUv;
                    varying vec3 vPos;
                    varying vec4 vMvPos;
                    varying float vAlpha;

                    void main() {
                        float value = 1.0 - min(10.0, length(vPos)) / 10.0;
                        vec3 color = vec3(mix(0.75, 1.0, value));
                        float alpha = 1.0;

                        // fade near bounds
                        vec3 bounds = vec3(25.0, 10.0, 25.0);
                        alpha *= 1.0 - min(bounds.x, abs(vPos.x)) / bounds.x;
                        alpha *= 1.0 - min(bounds.y, abs(vPos.y)) / bounds.y;
                        alpha *= 1.0 - min(bounds.z, abs(vPos.z)) / bounds.z;

                        // fade near camera
                        alpha *= smoothstep(length(vMvPos), 0.5, 1.0);

                        // fade near ground
                        alpha *= smoothstep(0.0, 2.0, vPos.y);

                        // fade near structure
                        alpha *= smoothstep(0.5, 1.0, min(6.0, length(vPos)) / 6.0);

                        // shape
                        float circularGrad = 1.0 - length(vUv - 0.5) * 2.0;
                        alpha *= circularGrad;

                        alpha *= uAlpha;
                        alpha = clamp(alpha, 0.0, 1.0);

                        gl_FragColor = vec4(color, alpha);
                    }
                
