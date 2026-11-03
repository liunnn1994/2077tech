
                    #pragma app_include globalUniformsGLSL
                    #pragma app_include antialiasedStep
                    #pragma app_include fitFunctions
                    #pragma app_include rotationMatrices
                    #pragma app_include linearStep

                    uniform vec3 uColorLight;
                    uniform vec3 uColorDark;
                    uniform vec3 uColorInitial;
                    uniform vec3 uColorFast;

                    uniform vec3 uLightPos;

                    uniform float uVisible;
                    uniform float uAlpha;
                    uniform float uInitialGlow;

                    varying float vShadow;
                    varying float vVel;
                    varying float vY;

                    void main() {
                        float alpha = step(length(gl_PointCoord.xy - 0.5), 0.5) * uVisible;
                        if (alpha < 0.001) discard;

                        // calculate normal
                        vec2 uv = 2.0 * gl_PointCoord.xy - 1.0;
                        vec3 n = vec3(uv, sqrt(1.0 - clamp(dot(uv, uv), 0.0, 1.0)));
                        n.y = 1.0 - n.y;

                        // calculate light direction
                        float lightShadow = max(0.0, dot(normalize(rotateY(3.1416) * uLightPos), normalize(n)));
                        float ramp = lightShadow * vShadow;

                        // base color
                        vec3 color = mix(uColorDark, uColorLight, ramp);

                        // highlight color for velocity
                        color = mix(color, uColorFast, pow(fit(vVel, 0.003, 0.005, 0.0, 1.0), 2.0));

                        // poor's man motion blur
                        alpha *= max(uInitialGlow, pow(fit(vVel, 0.002, 0.007, 1.0, 0.0), 2.0) * 0.5 + 0.5);

                        // we do a blending trick here. the initial hidden state requires: alpha 0, uInitialGlow 1 and color white
                        // alpha must be animated first and the color used will be
                        vec3 fadeInColor = mix(vec3(1.0), uColorInitial, linearstep(0.0, 1.0, uAlpha));
                        color = mix(color, fadeInColor, uInitialGlow);

                        gl_FragColor = vec4(clamp(color, 0.0, 1.0), alpha * uAlpha);
                    }
                
