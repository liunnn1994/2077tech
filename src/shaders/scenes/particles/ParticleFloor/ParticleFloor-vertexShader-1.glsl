
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include rotationMatrices

                attribute float animationmask;
                attribute float iteration;
                attribute float glow;

                uniform float uRotationTime;

                varying vec2 vUv;
                varying vec3 vPos;
                varying vec3 vPosOriginal;
                varying float vGlow;

                void main() {
                    vUv = uv;
                    vGlow = glow;
                    vPosOriginal = position;

                    vec3 pos = position;

                    float t = uRotationTime;


                    // pos.y -= animationmask * 0.015;

                    // animate individual pieces
                    vec3 axis = normalize(vec3(0.0, 0.5, 1.0));
                    axis = rotate3D(axis, vec3(0.0, 1.0, 0.0), t * 1.25 + iteration * 1.2);
                    float angle = 0.03 * animationmask;
                    pos = rotate3D(pos, axis, angle);

                    pos.y -= sin(iteration - t) * 0.01 * animationmask;
                    pos.y -= animationmask * 0.04;

                    // pos.y -= (sin(time + iteration * 0.2) * 0.5 + 0.5) * animationmask * 0.05;
                    // pos.y -= animationmask * 0.03;

                    vPos = pos;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            
