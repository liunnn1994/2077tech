
                #ifdef USE_NORMALMAP_OBJECTSPACE
                    normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0; // overrides both flatShading and attribute normals
                    #ifdef FLIP_SIDED
                        normal = - normal;
                    #endif
                    #ifdef DOUBLE_SIDED
                        normal = normal * faceDirection;
                    #endif

                    normal = normalize( normalMatrix * normal );
                #elif defined( USE_NORMALMAP_TANGENTSPACE )
                    vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
                    // r186 can store only XY in a packed two-channel normal map.
                    #if defined( USE_PACKED_NORMALMAP )
                        mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
                    #endif
                    mapN.xy *= normalScale;
                    mapN.xy *= 1.0 - mousefrost; // new line
                    normal = normalize( tbn * mapN );
                #elif defined( USE_BUMPMAP )
                    normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
                #endif
            
