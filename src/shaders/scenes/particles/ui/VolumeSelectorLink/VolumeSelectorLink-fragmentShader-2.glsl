
                #pragma app_include msdfFunctions
                #pragma app_include imageFitUv

                uniform sampler2D tMap;
                uniform sampler2D tBlocks;
                uniform vec3 uColor;
                uniform float uShow;
                uniform float uRand;

                varying vec2 vUv;
                flat varying vec2 vScale;

                vec2 hash21(float p) {
                    vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
                    p3 += dot(p3, p3.yzx + 33.33);
                    return fract((p3.xx+p3.yz)*p3.zy);
                }

                void main() {
                    vec2 uv = imagefitUV(vUv, vec2(textureSize(tMap, 0)), vScale, 1.0);
                    float a = 1.0;

                    if (uShow < 1.0) {
                        // squared displacement
                        float steps = 3.0;
                        vec2 hash = hash21(floor(uShow * steps) / steps + uRand * 3.342);
                        vec2 offset = hash * 2.0 - 1.0;
                        vec2 scale = vec2(0.1, 0.15);
                        vec2 blocksUV = uv * scale + uRand * 12.4242 + offset * uRand * 4.543;
                        float blocks1 = texture2D(tBlocks, blocksUV).g * 2.0 - 1.0;
                        float displacement = 0.025;
                        uv += vec2(blocks1, 0.0) * displacement;

                        // make it blink
                        a *= sin(uShow * 30.0 + uRand * 12.4242) * 0.15 + 0.85;
                        a *= step(0.01, uShow);

                    }

                    a *= msdf(tMap, uv);
                    gl_FragColor = vec4(uColor, a);

                    // gl_FragColor = vec4(uColor, 1.0);
                }
            
