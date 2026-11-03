
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include falloffFunctions

                varying vec3 vWorldPos;
                varying vec3 vNoise;
                varying vec3 vMvPos;
                varying vec3 vRandom;
                varying float vFalloff;
                varying float vAngle;
                varying float vAlpha;

                uniform sampler2D tNumbers;

                uniform float uProgress;
                uniform float uAlpha;

                vec2 rotate(vec2 v, float a) {
                    float s = sin(a);
                    float c = cos(a);
                    mat2 m = mat2(c, s, -s, c);
                    return m * v;
                }

                void main() {
                    vec2 uv = gl_PointCoord.xy;

                    vec3 color = vec3(1.0);
                    float alpha = vAlpha;

                    // circle shape
                    float circularGrad = 1.0 - length(uv - 0.5) * 2.0;
                    alpha *= circularGrad;

                    uv -= 0.5;
                    uv = rotate(uv, vAngle);
                    uv += 0.5;

                    float squish = pow(1.0 - abs(uv.x - 0.5), floor(vRandom.y * 3.0 + 2.0));
                    alpha *= squish;
                    alpha = clamp(alpha, 0.0, 1.0);

                    gl_FragColor = vec4(color, alpha);
                }
            
