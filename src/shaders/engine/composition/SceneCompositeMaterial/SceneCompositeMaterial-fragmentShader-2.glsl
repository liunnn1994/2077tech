
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include fitFunctions
                #pragma app_include falloffFunctions
                #pragma app_include easingFunctions_Rc
                #pragma app_include noiseTextureLookup

                #define CA_ITERATIONS 5
                #pragma app_include chromaticAberration

                uniform sampler2D tScene1;
                uniform sampler2D tScene2;
                uniform sampler2D tScroll;
                uniform sampler2D tBlue;
                uniform vec2 uBlueOffset;
                uniform float uProgress;
                uniform float uProgressVel;

                uniform sampler2D tDetail;
                uniform sampler2D tCubes;
                uniform sampler2D tFrost;
                uniform bool uInCubes;
                uniform float uDetailProgress;
                uniform float uDetailProgress2;

                varying vec2 vUv;

                void main() {

                    vec3 color = vec3(0.0);

                    /*
                    // horizontal cut effect that reacts to velocity
                    float slope = 0.15 * uProgressVel * aspect * step(0.0, uProgress);
                    float inclination = mix(1.0 - vUv.x, vUv.x, step(slope, 0.0));
                    float cut = aastep(vUv.y + inclination * abs(slope), fit(uProgress, 0.0, 1.0, 0.0, 1.0 + abs(slope)));
                    */

                    if (uProgress > 0.0) {
                        // cut
                        vec2 uvTex = vUv - 0.5;
                        uvTex.x *= aspect;
                        uvTex += 0.5;
                        vec3 scrollTex = texture2D(tScroll, uvTex * 1.0).rgb;

                        // slope displacement
                        float slopeDisp = (scrollTex.b * 2.0 - 1.0) * 0.4;
                        float slope = -0.2 * aspect * step(0.0, uProgress);
                        float inclination = mix(1.0 - vUv.x + slopeDisp, vUv.x + slopeDisp, step(slope, 0.0));
                        float incProgress = fit(uProgress, 0.0, 1.0, 0.0, 1.0 + abs(slope));

                        // cromatic aberration
                        float cutDiagonalBlur = falloff(vUv.y + inclination * abs(slope), 0.0, 1.0, 2.0, incProgress);

                        // tech displacement
                        float cutDiagonalDisplacement = falloff(vUv.y + inclination * abs(slope), 0.0, 1.0, 0.9, incProgress);
                        float cutDisp = falloff(scrollTex.g, 0.0, 1.0, 1.0, cutDiagonalDisplacement);

                        // ice cut
                        float cutDiagonal = falloff(vUv.y + inclination * abs(slope), 0.0, 1.0, 0.2, incProgress);
                        float cut = falloff(scrollTex.r, 0.0, 1.0, 2.0, cutDiagonal);

                        // vars
                        const float parallaxY = 0.4;
                        const float displacement = 0.025;

                        // add blue noise to hide the seams from the chromatic aberration
                        vec4 noise = getNoise(tBlue, gl_FragCoord.xy, uBlueOffset);

                        // mix with optimization to save texture reads
                        vec3 scene1 = vec3(0.0);
                        vec3 scene2 = vec3(0.0);
                        float modulator = 12.0 * smoothstep(1.0, 0.7, abs(vUv.x * 2.0 - 1.0)) * smoothstep(1.0, 0.7, abs(vUv.y * 2.0 - 1.0));
                        if (cut < 1.0) scene1 = chromatic_aberration(tScene1, vUv - vec2(0.0, parallaxY * power2In(uProgress) + displacement * cutDisp), modulator, cutDiagonalBlur * noise.r).rgb;
                        if (cut > 0.0) scene2 = chromatic_aberration(tScene2, vUv + vec2(0.0, parallaxY * power2In(1.0 - uProgress) + displacement * (1.0 - cutDisp)), modulator, (1.0 - cutDiagonalBlur) * noise.g).rgb;
                        color = clamp(mix(scene1, scene2, cut), vec3(0.0), vec3(1.0));

                    } else {
                        // detail overlay
                        if (uInCubes && uDetailProgress > 0.0) {
                            if (uDetailProgress < 1.0 || uDetailProgress2 < 1.0) {
                                // normalized uv
                                vec2 uvTex = vUv - 0.5;
                                uvTex.x *= aspect;
                                uvTex += 0.5;

                                // transition
                                float transition = fit(uDetailProgress, 0.4, 1.0, 0.0, 1.0);

                                // blue noise to hide the seams from the chromatic aberration
                                vec4 noise = getNoise(tBlue, gl_FragCoord.xy, uBlueOffset);
                                float modulator = 8.0 * smoothstep(1.0, 0.5, abs(vUv.x * 2.0 - 1.0)) * smoothstep(1.0, 0.5, abs(vUv.y * 2.0 - 1.0));

                                // tech displacement
                                vec2 techDisp = uvTex - 0.5;
                                techDisp *= 0.1;
                                float tTech = texture(tScroll, techDisp).g * 2.0 - 1.0;
                                float dispTechStr = 0.005;
                                vec2 dispTech = vec2(1.0, 0.0) * tTech * dispTechStr;

                                // ice displacement
                                vec2 uvDisp = uvTex - 0.5;
                                uvDisp *= 5.0;
                                uvDisp *= (1.0 - uDetailProgress);
                                float tDisp = texture(tFrost, uvDisp).r * 2.0 - 1.0;
                                float dispStr = 0.1;
                                vec2 disp = vec2(1.0, 0.0) * tDisp * dispStr;
                                disp += vec2(0.0, 1.0) * tDisp * dispStr;

                                vec3 scene;
                                if (transition < 1.0) {
                                    vec2 sceneIceDisp = disp * power1In(fit(uDetailProgress, 0.1, 0.9, 0.0, 1.0));
                                    vec2 sceneTechDisp = dispTech * power4Out(uDetailProgress);
                                    scene = chromatic_aberration(tCubes, vUv + sceneIceDisp + sceneTechDisp, modulator, power2Out(uDetailProgress) * noise.r).rgb;
                                }

                                vec3 detail;
                                if (transition > 0.0) {
                                    vec2 detailIceDisp = disp * fit(uDetailProgress, 0.1, 0.9, 1.0, 0.0);
                                    vec2 detailTechDisp = dispTech * fit(uDetailProgress2, 0.7, 1.0, 1.0, 0.0);
                                    detail = chromatic_aberration(tDetail, vUv + detailIceDisp + detailTechDisp, modulator, power2Out(1.0 - uDetailProgress2) * noise.r).rgb;
                                }

                                // mix both scenes
                                color = mix(scene, detail, transition);
                            } else {
                                color = texture2D(tDetail, vUv).rgb;
                            }
                        } else {
                            color = texture2D(tScene1, vUv).rgb;
                        }
                    }

                    gl_FragColor = vec4(color, 1.0);
                }
            
