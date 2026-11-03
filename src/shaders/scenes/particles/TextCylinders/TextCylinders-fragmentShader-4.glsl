
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include falloffFunctions

                varying vec2 vUv;
                varying vec3 vPos;
                varying float vRand;

                uniform sampler2D tMap;
                uniform float uAlpha;

                void main() {

                    float alpha = texture2D(tMap, vUv).r;

                    // animate fade
                    alpha *= sin(time * 2.0 + vRand * 10.0 + (vPos.x * 2.0 + vPos.z * 2.0 + vPos.y)) * 0.5 + 0.5;
                    alpha *= 0.25;

                    alpha *= uAlpha;

                    vec3 color = vec3(1.0);

                    gl_FragColor = vec4(color, alpha);
                }
            
