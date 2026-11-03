
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include rotateUv

                varying vec2 vUv;

                uniform sampler2D tMap;
                uniform vec3 uColor;

                void main() {
                    float t = time * 0.12;
                    float noise = texture2D(tMap, vUv * vec2(1.0, 0.46) + vec2(t, t * 0.323)).r;
                    noise += texture2D(tMap, vUv * vec2(0.5, 0.25) + vec2(-t * 0.77, -t * 0.414)).r;

                    float circularGradient = 1.0 - clamp(length(vUv - 0.5) * 2.0, 0.0, 1.0);
                    circularGradient = pow(circularGradient, 2.0);

                    vec3 color = uColor;
                    float alpha = circularGradient * noise * 0.07;

                    gl_FragColor = vec4(color, alpha);
                }
            
