
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include rotateUv

                varying vec2 vUv;

                uniform sampler2D tNoise;
                uniform vec3 uColor1;
                uniform vec3 uColor2;
                uniform float uRotation;

                vec3 hash32(vec2 p) {
                    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
                    p3 += dot(p3, p3.yxz+33.33);
                    return fract((p3.xxy+p3.yzz)*p3.zyx);
                }

                float hash12(vec2 p) {
                    vec3 p3  = fract(vec3(p.xyx) * .1031);
                    p3 += dot(p3, p3.yzx + 33.33);
                    return fract((p3.x + p3.y) * p3.z);
                }

                void main() {
                    // diagonal gradient
                    vec2 uv = vUv - 0.5;
                    uv.x *= resolution.x / resolution.y;
                    uv *= 0.5;
                    uv += 0.5;
                    uv = rotateUV(uv, uRotation);

                    float gradient = pow(uv.y, 3.0);
                    gradient *= 0.5;

                    // add noise to prevent banding
                    gradient += hash12(vUv * 1000.0 + time) * 0.01;

                    // main color
                    vec3 color = mix(uColor1, uColor2, gradient);

                    gl_FragColor = vec4(color, 1.0);
                }
            
