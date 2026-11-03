
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include rotateUv

                varying vec2 vUv;

                uniform sampler2D tMap;
                uniform sampler2D tBokeh;
                uniform vec3 uColor;

                void main() {
                    float circularGradient = 1.0 - clamp(length(vUv - 0.5) * 2.0, 0.0, 1.0);
                    circularGradient = pow(circularGradient, 2.0);

                    float bokeh = texture2D(tBokeh, vUv * 2.0).r;
                    float noise = texture2D(tMap, vUv * 2.0 + time * 0.15).r;
                    bokeh *= noise;
                    bokeh *= 5.0;

                    vec3 color = uColor;
                    float alpha = (circularGradient + bokeh * circularGradient) * 0.15;
                    // alpha *= 1.0 - vUv.x;

                    gl_FragColor = vec4(color, alpha);
                }
            
