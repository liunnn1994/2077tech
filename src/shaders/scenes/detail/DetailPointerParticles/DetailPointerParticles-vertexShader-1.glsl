
                #pragma app_include globalUniformsGLSL
                #pragma app_include rotateUv
                #pragma app_include fitFunctions
                #pragma app_include treadmill

                attribute vec3 random;

                varying float vLightFalloff;
                varying vec3 vRandom;

                uniform float uRotation;
                uniform sampler2D tSim;

                void main() {
                    vRandom = random;

                    float t = time * 0.05;
                    vec3 pos = position;
                    pos.x += sin(t * 0.4 + position.y * 2.5);
                    pos.y += sin(t * 0.2 + position.x * 2.5);
                    pos.y += time * random.z * 0.2;
                    pos = treadmill(pos, vec3(1.0));
                    // pos.z += sin(t * 0.3 + position.z * 2.5);

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

                    vec2 ndc = gl_Position.xy / gl_Position.w;
                    vec2 fluid = texture(tSim, ndc * 0.5 + 0.5).rb;
                    float sim = fit(fluid.y, 1e-8, 0.3, 0.0, 1.0);
                    // sim = 1.;

                    // scale larger with screen gradient
                    float size = mix(3.0, 10.0, random.x * sim);
                    gl_PointSize = size * (resolution.y * 0.002);

                    // random flicker
                    float flick = sin(time * 0.8 + random.y * 12.43) * 0.5 + 0.5;
                    flick *= sin(time * 1.73 + random.z * 7.16) * 0.5 + 0.5;
                    vLightFalloff = mix(0.5, 1.0, flick) * sim;
                }
            
