
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include falloffFunctions

                varying vec2 vUv;
                varying vec3 vPos;

                uniform sampler2D tMap;

                uniform float uProgress;
                uniform float uAlpha;

                void main() {
                    vec3 color = vec3(1.0);
                    float alpha = texture2D(tMap, vUv).r;

                    // idle animation
                    float idleAnimation = sin((vPos.x + vPos.y) * 5.0 + time * 3.0) * 0.5 + 0.5;
                    idleAnimation *= cos(vPos.y * 10.0 + alpha * 3.0 + time * 2.0) * 0.5 + 0.5;
                    idleAnimation *= sin(vPos.y * 2.0 + time * 2.0) * 0.5 + 0.5;
                    alpha = idleAnimation * 0.9 * alpha + 0.1 * alpha;
                    alpha *= 0.65;

                    gl_FragColor = vec4(color, alpha);
                }
            
