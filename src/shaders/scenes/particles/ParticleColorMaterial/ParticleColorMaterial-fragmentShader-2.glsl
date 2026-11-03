
                #pragma app_include globalUniformsGLSL
                #pragma app_include sineNoise
                #pragma app_include noiseTextureLookup
                #pragma app_include hsvConversion
                #pragma app_include easingFunctions_Rc

                uniform sampler2D tDiffuse;

                uniform sampler2D tBlue;
                uniform vec2 uBlueOffset;

                uniform sampler2D tScroll;
                uniform float uRingProximity;
                uniform vec3 uSquareAttr;

                varying vec2 vUv;

                void main() {
                    vec2 uv = vUv;
                    vec3 scene;

                    vec3 noise = getNoise(tBlue, gl_FragCoord.xy, uBlueOffset).rgb;

                    if (uRingProximity > 0.0) {

                        // main distortion
                        uv -= 0.5;
                        uv.x *= aspect;
                        float angle = atan(uv.y, uv.x);
                        float dist = length(uv);

                        const float bluramount = 0.3;

                        float angle1 = angle + bluramount * (noise.r - 0.5) * uRingProximity;
                        vec2 newUv1 = vec2(cos(angle1), sin(angle1)) * dist;
                        newUv1.x /= aspect;
                        newUv1 += 0.5;

                        // squares
                        float dispSquares = texture2D(tScroll, newUv1 * 1.5 + uSquareAttr.rg).g * 2.0 - 1.0;
                        newUv1 += dispSquares * 0.01 * uSquareAttr.b * uRingProximity;

                        // read color
                        scene = texture2D(tDiffuse, newUv1).rgb;

                        // highlight only when not already white
                        if (length(scene) < length(vec3(1.0))) {
                            scene = rgb2hsv(scene);
                            scene.g += 0.05 * uRingProximity;
                            scene.b += 0.075 * uRingProximity;
                            scene = hsv2rgb(scene);
                        }

                    } else {
                        scene = texture2D(tDiffuse, uv).rgb;
                    }

                    vec3 sceneColor = scene;

                    // glare
                    float diagonalGradient = pow(vUv.x * vUv.y, 2.0);
                    sceneColor += diagonalGradient * (sinenoise1(vec3(vUv.x * aspect, vUv.y, time * 0.5)) * 0.4 + 0.4) * vec3(0.8, 0.9, 1.0) * noise.b * 2.0;

                    gl_FragColor = vec4(clamp(sceneColor, 0.0, 1.0), 1.0);
                }
            
