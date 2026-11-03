
                //- edit
                #pragma app_include globalUniformsGLSL

                attribute vec3 centr;

                varying vec2 vUv;
                varying float vAlpha;

                uniform float uProgress;
                uniform sampler2D tPerlin;

                void main() {
                    // text animated in screen space, not world space
                    vec3 localpos = position - centr;
                    vec3 offset = centr;
                    offset.x /= aspect;

                    float depth = offset.z * 0.5 + 0.5;

                    // scale
                    localpos.x /= aspect;
                    localpos *= 2.5;
                    localpos *= mix(1.0, 2.0, depth);

                    // match scroll
                    offset.y = fract((offset.y * 0.5 + 0.5) + uProgress * 1.25 * depth) * 2.0 - 1.0;

                    // spread apart
                    offset *= 1.7;

                    vec3 pos = localpos + offset;

                    // fade
                    vAlpha = texture2D(tPerlin, pos.xz * 3.0 + time * 0.075 + offset.z * 10.0).r;
                    vAlpha = smoothstep(0.1, 0.6, vAlpha);

                    vUv = uv;
                    gl_Position = vec4(pos, 1.0);
                    // gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            
