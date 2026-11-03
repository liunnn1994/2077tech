
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include noiseTextureLookup

                varying vec2 vUv;
                varying float vAlpha;

                uniform float uProgress;
                uniform vec3 uColor1;
                uniform sampler2D tMap;

                float hash12(vec2 p) {
                    vec3 p3  = fract(vec3(p.xyx) * .1031);
                    p3 += dot(p3, p3.yzx + 33.33);
                    return fract((p3.x + p3.y) * p3.z);
                }

                void main() {
                    vec2 uv = vUv;

                    float alpha = texture2D(tMap, uv).r * vAlpha * 1.2;
                    vec3 color = vec3(1.0);

                    gl_FragColor = vec4(color, alpha);
                }
            
