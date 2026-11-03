
                uniform vec3 uColor;
                uniform bool uHoverAnimation;
                uniform float uHoverMix;

                varying vec3 wPos;

                #pragma app_include globalUniformsGLSL
                #pragma app_include falloffFunctions
                #pragma app_include curveFunctions
                #pragma app_include sineNoise

                void main() {
                    vec3 col = mix(vec3(0.0), uColor, smoothstep(0.75, 1.5, length(wPos)));

                    float n1 = sinenoise1(wPos * 10.1 + vec3(0.0, 0.0, 0.0)) * 0.5 + 0.5;

                    if (uHoverAnimation) {
                        // hovermix goes from -1 to 0
                        col = mix(col, vec3(uHoverMix < 0.0 ? 0.0 : 0.3), abs(uHoverMix));
                    }

                    col = mix(vec3(0.0), col, smoothstep(0.4, 0.5, n1));

                    gl_FragColor = vec4(col, 1.0);
                }
            
