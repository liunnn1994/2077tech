
                #pragma app_include globalUniformsGLSL

                uniform sampler2D tDiffuse;

                varying vec2 vUv;

                #pragma app_include lutSampling

                uniform sampler3D tLUT;
                uniform float uLUTSize;
                uniform float uLUTIntensity;

                vec3 hash32(vec2 p) {
                    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
                    p3 += dot(p3, p3.yxz+33.33);
                    return fract((p3.xxy+p3.yzz)*p3.zyx);
                }

                void main() {
                    vec2 uv = vUv;

                    // get scene applying color correction
                    vec4 scene = texture2D(tDiffuse, uv);
                    vec3 sceneColor = apply3DLUTTetrahedral(scene.rgb, tLUT, uLUTSize, uLUTIntensity);

                    gl_FragColor = vec4(sceneColor, 1.0);
                }
            
