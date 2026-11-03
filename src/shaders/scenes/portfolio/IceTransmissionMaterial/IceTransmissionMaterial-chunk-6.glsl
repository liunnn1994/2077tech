
                float roughnessFactor = roughness;
                roughnessFactor *= 1.0 - mousefrost; // new line

                #ifdef USE_ROUGHNESSMAP
                    vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
                    roughnessFactor *= texelRoughness.g;
                #endif
            
