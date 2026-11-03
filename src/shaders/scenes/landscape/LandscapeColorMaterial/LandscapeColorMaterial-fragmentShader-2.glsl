
                #pragma app_include globalUniformsGLSL

                uniform sampler2D tDiffuse;

                varying vec2 vUv;

                #pragma app_include lutSampling

                uniform sampler3D tLUT;
                uniform float uLUTSize;
                uniform float uLUTIntensity;
                uniform float uGradientAlpha;

                vec3 hash32(vec2 p) {
                    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
                    p3 += dot(p3, p3.yxz+33.33);
                    return fract((p3.xxy+p3.yzz)*p3.zyx);
                }

                void main() {
                    vec2 uv = vUv;

                    // apply rgb shift
                    // float offset = 0.08 * length(vUv - 0.5);
                    // offset = pow(offset, 2.0);
                    // float r = texture2D(tDiffuse, uv + vec2(-offset, offset)).r;
                    // float g = texture2D(tDiffuse, uv).g;
                    // float b = texture2D(tDiffuse, uv + vec2(offset, -offset)).b;
                    // vec3 scene = vec3(r, g, b);

                    vec3 scene = texture2D(tDiffuse, uv).rgb;
                    float gradient = mix(0.8, 1.0, (uv.x + uv.y) * 0.5);
                    gradient = mix(1.0, gradient, uGradientAlpha);
                    scene *= gradient;

                    vec3 sceneColor = apply3DLUTTetrahedral(scene.rgb, tLUT, uLUTSize, uLUTIntensity);

                    // film grain
                    // vec3 noise = hash32(uv * 1000.0 + time);
                    // noise *= 2.0;
                    // noise -= 1.0;
                    // sceneColor += noise * 0.05;

                    gl_FragColor = vec4(sceneColor, 1.0);
                }
            
