
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include rotateUv

                varying vec2 vUv;
                varying vec3 vPos;

                uniform sampler2D tMap;
                uniform sampler2D tNoise;
                uniform sampler2D tCaustics;

                void main() {
                    vec3 color = texture2D(tMap, vUv).rgb;
                    float noise = texture2D(tNoise, vPos.xy * 0.4 + vec2(-time * 0.1, time * 0.023)).r;
                    color *= mix(0.025, 0.15, noise);

                    float caustics = texture2D(tCaustics, vPos.xy * 1.5 + vec2(-time * 0.1, time * 0.023)).r;
                    caustics = min(caustics, texture2D(tCaustics, vPos.xy * 2.0 + vec2(time * 0.05, -time * 0.013)).r);
                    color += caustics * color.b * 30.0;

                    gl_FragColor = vec4(color, 1.0);
                }
            
