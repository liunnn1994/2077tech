
                #pragma app_include globalUniformsGLSL
                uniform vec3 uColor;

                varying vec3 vRandom;
                varying float vLightFalloff;

                void main() {
                    vec2 uv = gl_PointCoord.xy;
                    float limit = step(length(uv - 0.5), 0.5);

                    if (vLightFalloff < 0.001 || limit < 0.001) discard;

                    float circularGrad = 1.0 - clamp(length(uv - 0.5) * 2.0, 0.0, 1.0);
                    circularGrad *= pow(uv.x, 2.0);
                    // circularGrad = pow(circularGrad, 2.0);

                    gl_FragColor = vec4(uColor, vLightFalloff * circularGrad);
                }
            
