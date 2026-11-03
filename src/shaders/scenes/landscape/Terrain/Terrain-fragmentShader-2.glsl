
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include falloffFunctions

                varying vec2 vUv;
                varying vec3 vPos;
                varying vec3 vWorldPos;

                uniform sampler2D tMap;
                uniform sampler2D tWind;
                uniform sampler2D tTriangles;
                uniform sampler2D tNoise;

                uniform float uProgress;
                uniform float uProgress2;
                uniform float uTriangleAlpha;
                uniform float uAlpha;

                float hash12(vec2 p) {
                    vec3 p3  = fract(vec3(p.xyx) * .1031);
                    p3 += dot(p3, p3.yzx + 33.33);
                    return fract((p3.x + p3.y) * p3.z);
                }

                void main() {
                    vec3 color = texture2D(tMap, vUv).rgb;
                    float alpha = 1.0;

                    // wind
                    float t = time;
                    float wind = texture2D(tWind, vWorldPos.xz * 0.1 + vWorldPos.xy * 0.1 + vec2(-t * 0.25, -t * 0.3)).r;
                    float verticalGrad = (1.0 - clamp(vPos.y * 0.5 + 0.75, 0.0, 1.0));
                    wind *= texture2D(tWind, vWorldPos.xz * 0.15 + vWorldPos.xy * 0.15 + vec2(-t * 0.18, -t * 0.225)).r;
                    wind *= verticalGrad;
                    wind *= color.r;
                    wind *= 2.0;
                    color += wind;

                    // intro animation
                    if (uProgress2 < 1.0) {
                        // reduce alpha to zero so we can composite layers onto it
                        alpha *= 0.0;

                        // create input textures and values
                        float noise = texture2D(tNoise, vWorldPos.xz * 0.07).r;
                        float triangles = texture2D(tTriangles, vWorldPos.xz * 0.25).r;
                        vec3 blue = vec3(0.3, 0.45, 1.0);
                        float inputGradient = length(vWorldPos.xz);
                        inputGradient += noise * 3.5;

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
                        color += terrainShockwaveColor;
                        alpha += terrainShockwaveAlpha;

                        color += triangleShockwaveColor * (1.0 - terrainShockwaveAlpha);
                        alpha += triangleShockwaveAlpha * (1.0 - terrainShockwaveAlpha);
                    }

                    // fade at edges
                    alpha = clamp(alpha, 0.0, 1.0);
                    alpha *= 1.0 - smoothstep(0.85, 1.0, length(vPos.xz) * 0.1085);

                    alpha *= uAlpha;

                    color = clamp(color, vec3(0.0), vec3(1.0));

                    gl_FragColor = vec4(color, alpha);
                }
            
