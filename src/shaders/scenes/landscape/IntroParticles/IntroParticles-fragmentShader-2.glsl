
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include falloffFunctions

                varying vec3 vWorldPos;

                uniform sampler2D tNumbers;

                uniform float uProgress;
                uniform float uAlpha;

                void main() {
                    // scale uvs to match a single character of the spritesheet
                    vec2 uv = gl_PointCoord.xy;
                    uv.y = 1.0 - uv.y;
                    uv.y /= 32.0;
                    uv.y += 1.0 / 32.0;

                    // animate spritesheet character offset
                    float offset = length(vWorldPos);
                    float progress = uProgress * 4.0;
                    progress = floor(progress * 12.0 - offset) / 32.0;
                    progress = clamp(progress, 0.0, 1.0);
                    uv.y += progress;

                    // sample numbers texture with offset uvs
                    float numbers = texture2D(tNumbers, uv).r;
                    float alpha = 1.0;

                    // intro animation
                    float gradientInput = length(vWorldPos);
                    float shockwave = falloff(gradientInput, 0.0, 20.0, 5.0, uProgress);
                    alpha *= shockwave;

                    vec3 color = vec3(numbers);
                    alpha *= 0.5;

                    gl_FragColor = vec4(color, alpha);
                }
            
