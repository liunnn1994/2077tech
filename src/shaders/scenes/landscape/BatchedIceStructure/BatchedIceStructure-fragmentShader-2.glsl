
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include falloffFunctions

                varying vec2 vUv;
                varying vec3 vPos;
                varying float vDisplacement;
                varying float vEmission;
                varying float vBounce;

                uniform sampler2D tMap;
                uniform sampler2D tMapExploded;
                uniform sampler2D tTriangles;
                uniform sampler2D tNoise;

                uniform float uProgress;
                uniform float uIntroMaterialize;

                void main() {
                    vec3 color = texture2D(tMap, vUv).rgb;
                    vec3 exploded = texture2D(tMapExploded, vUv).rgb + 0.05;
                    vec3 blue = vec3(0.5, 0.7, 1.0);

                    // fade between 'together' lightmap and 'exploded' lightmap, based on displacement
                    float textureMix = clamp(5.0 * vDisplacement, 0.0, 1.0);
                    color = mix(color, exploded, textureMix);

                    // intro animation
                    if (uIntroMaterialize < 1.0) {
                        float introEmissive = 1.0 - falloffsmooth(vPos.y, 3.95, -0.4, 1.5, uIntroMaterialize);
                        if (introEmissive > 0.9999) discard;

                        float triangles = texture2D(tTriangles, vUv * 5.0).r;
                        introEmissive += clamp(introEmissive * triangles * 13.0, 0.0, 1.0);

                        color += introEmissive * blue;
                    }

                    // add emission based on displacement
                    color += pow(vEmission, 2.0) * clamp(1.0 * vDisplacement, 0.0, 1.0) * blue;

                    // add idle emission;
                    vec3 powEmission = pow(vEmission, 8.0) * blue * 0.5;
                    color += powEmission * (sin(vPos.x - time * 1.0 + 3.2) * 0.5 + 0.5);

                    // make inside of structure glow, on faces furthest from camera
                    color += max(0.0, smoothstep(0.0, 2.0, vPos.x * 0.5 - vPos.z * 0.5)) * powEmission;

                    // add fake sss from sunlight (just a sideways gradient, but kept dark near the ground)
                    color += (vPos.x * 0.1 + 0.4) * 0.3 * min(vPos.y + 0.5, 1.0) * 0.5;

                    // color safety
                    color = clamp(color, vec3(0.0), vec3(1.0));

                    // add ground bounce
                    float verticalGrad = (1.0 - smoothstep(-1.5, 1.0, vPos.y));
                    color += (1.0 - smoothstep(-1.5, 1.0, vPos.y)) * vBounce * vec3(0.8, 0.9, 1.0) * 0.25;

                    gl_FragColor = vec4(color, 1.0);
                }
            
