
                totalEmissiveRadiance += mousefrostrim * uColorFrost;
                float triangles = texture2D(tTriangles, vNormalMapUv * (9.0 * min(1.0, uResolution.y / 1300.0))).r;
                totalEmissiveRadiance += triangles * mousefrostrim * 10.0;
                totalEmissiveRadiance += triangles * pow(mousefrost, 2.0);
                vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
                outgoingLight = clamp(outgoingLight, vec3(0.0), vec3(1.0));
            
