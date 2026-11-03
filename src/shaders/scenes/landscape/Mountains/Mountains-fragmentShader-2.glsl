
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include falloffFunctions

                varying vec2 vUv;
                varying vec3 vPos;
                varying vec4 vMvPos;
                varying vec3 vWorldPos;

                uniform vec3 uColor1;
                uniform vec3 uColor2;
                uniform sampler2D tMap;
                uniform sampler2D tTriangles;
                uniform sampler2D tNoise;

                uniform float uProgress;
                uniform float uProgress2;
                uniform float uTriangleAlpha;
                uniform float uAlpha;

                void main() {
                    // fog gradient
                    vec2 screenUv = gl_FragCoord.xy / resolution;
                    float grad = (screenUv.x + screenUv.y) * 0.5;
                    grad = pow(grad, 2.0);
                    vec3 color1 = uColor1;
                    vec3 color2 = uColor2;
                    vec3 fogColor = mix(color2, color1, grad);

                    vec3 color = texture2D(tMap, vUv).rgb;
                    float alpha = 1.0;

                    float distanceFog = clamp(-vMvPos.z * 0.005, 0.0, 1.0);
                    float fog = clamp(1.0 - vWorldPos.y * 0.05 - 0.5, 0.0, 1.0);
                    fog += distanceFog * 0.75;

                    // intro animation
                    if (uProgress2 < 1.0) {
                        vec3 originalColor = color;

                        // create input textures and values
                        float noise = texture2D(tNoise, vWorldPos.xz * 0.07).r;
                        float triangles = texture2D(tTriangles, vWorldPos.xz * 0.25).r;
                        vec3 blue = vec3(0.3, 0.45, 1.0);
                        float inputGradient = length(vWorldPos.xz);
                        inputGradient += noise * 3.5;

                        // mask background mountains from effects, so they're always visible
                        float backgroundMountainsMask = smoothstep(32.0, 36.0, inputGradient);
                        float invBackgroundMountainsMask = 1.0 - backgroundMountainsMask;

                        // reduce alpha to zero so we can composite layers onto it
                        alpha = backgroundMountainsMask * uAlpha;

                        // terrain layer
                        vec3 terrainShockwaveColor = vec3(0.0);
                        float terrainShockwaveAlpha = 0.0;
                        float terrainFalloff = 1.0 - falloffsmooth(inputGradient, 0.0, 32.0, 8.0, uProgress2);
                        float terrainFalloff2 = 1.0 - falloffsmooth(inputGradient, 0.0, 32.0, 3.0, uProgress2);
                        terrainShockwaveColor += terrainFalloff * triangles * blue * 3.0;
                        terrainShockwaveColor += terrainFalloff2 * blue;
                        terrainShockwaveAlpha += falloff(inputGradient, -0.1, 31.9, 0.1, uProgress2);

                        // triangle layer
                        vec3 triangleShockwaveColor = vec3(0.0);
                        float triangleShockwaveAlpha = 0.0;
                        float triangleFalloff = 1.0 - falloffsmooth(inputGradient, 0.0, 32.0, 10.0, uProgress);
                        triangleShockwaveColor += blue;
                        triangleShockwaveAlpha += falloff(inputGradient, 1.0, 33.0, 0.1, uProgress);
                        triangleShockwaveAlpha *= triangleFalloff;
                        triangleShockwaveAlpha *= triangles;

                        // composite layers
                        color += terrainShockwaveColor * invBackgroundMountainsMask;
                        alpha += terrainShockwaveAlpha * invBackgroundMountainsMask;

                        color += triangleShockwaveColor * (1.0 - terrainShockwaveAlpha) * invBackgroundMountainsMask;
                        alpha += triangleShockwaveAlpha * (1.0 - terrainShockwaveAlpha) * invBackgroundMountainsMask;

                        // prevent snapping color at end of animation
                        float endmix = smoothstep(0.8, 1.0, uProgress2);
                        color = mix(color, originalColor, endmix);
                    }

                    // fade at edges
                    alpha = clamp(alpha, 0.0, 1.0);
                    alpha *= 1.0 - smoothstep(0.7, 0.9, length(vPos.xz) * 0.1085);

                    color = clamp(color, vec3(0.0), vec3(1.0));

                    // fog
                    color = mix(color, fogColor * 1.1 + smoothstep(0.5, 1.0, color.r), fog);

                    gl_FragColor = vec4(color, alpha);
                }
            
