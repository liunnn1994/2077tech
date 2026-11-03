

                    /*
                    material.transmission = transmission;
                    material.transmissionAlpha = 1.0;
                    material.thickness = thickness;
                    material.attenuationDistance = attenuationDistance;
                    material.attenuationColor = attenuationColor;
                    */

                    vec3 pos = vIceWorldPosition;
                    vec3 v = normalize( cameraPosition - pos );
                    vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );

                    vec4 transmitted = vec4(0.0);

                    // custom chromatic aberration / threejs default refraction

                    if (uChromaticAberration > 0.0) {

                        float transmissionR, transmissionB, transmissionG;
                        float thickness_smear = uThickness * pow(roughnessFactor, 0.33);
                        vec4 noise = getNoise(tBlue, gl_FragCoord.xy, uBlueOffset);
                        vec4 noise2 = getNoise(tBlue, gl_FragCoord.xy + vec2(8.4, 9.6), uBlueOffset * + vec2(1.34, 34.32));

                        vec3 distortionNormal = roughnessFactor * roughnessFactor * 2.0 * normalize(noise2.xyz) + mousefrost * 0.025;
                        vec3 sampleNorm = normalize(n + distortionNormal);
                        float totalSamples = float( AWESOME_SAMPLES );

                        for (float i = 0.0; i < float( AWESOME_SAMPLES ); i ++) {
                            transmissionR = getIBLVolumeRefraction2(
                                sampleNorm, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
                                pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, uThickness + thickness_smear * (i + noise.g) / totalSamples,
                                uAttenuationColor, uAttenuationDistance
                            ).r;
                            transmissionG = getIBLVolumeRefraction2(
                                sampleNorm, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
                                pos, modelMatrix, viewMatrix, projectionMatrix, material.ior  * (1.0 + uChromaticAberration * (i + noise.r) / totalSamples), uThickness + thickness_smear * (i + noise.r) / totalSamples,
                                uAttenuationColor, uAttenuationDistance
                            ).g;
                            transmissionB = getIBLVolumeRefraction2(
                                sampleNorm, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
                                pos, modelMatrix, viewMatrix, projectionMatrix, material.ior * (1.0 + 2.0 * uChromaticAberration * (i + noise.b) / totalSamples), uThickness + thickness_smear * (i + noise.b) / totalSamples,
                                uAttenuationColor, uAttenuationDistance
                            ).b;

                            transmitted.r += transmissionR;
                            transmitted.g += transmissionG;
                            transmitted.b += transmissionB;
                        }

                        transmitted /= float( AWESOME_SAMPLES );
                        transmitted.a = 1.0;
                    } else {

                        // three's default
                        transmitted = getIBLVolumeRefraction2(
                            n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
                            pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, uThickness,
                            uAttenuationColor, uAttenuationDistance
                        );
                    }

                    // material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
                    // totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
                    totalDiffuse = transmitted.rgb; // fix
                    totalDiffuse = clamp(totalDiffuse, vec3(0.0), vec3(1.0)); // fix
            
