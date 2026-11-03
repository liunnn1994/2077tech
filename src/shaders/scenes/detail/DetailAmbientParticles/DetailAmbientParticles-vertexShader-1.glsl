
                #pragma app_include globalUniformsGLSL
                #pragma app_include rotateUv

                attribute vec3 random;

                varying vec2 vUv;
                varying float vLightFalloff;

                uniform float uRotation;

                void main() {
                    vUv = uv;
                    float t = time * 0.1;
                    vec3 pos = position;
                    pos.x += sin(t * 0.4 + position.y * 2.5);
                    pos.y += sin(t * 0.2 + position.x * 2.5);

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

                    // scale larger with screen gradient
                    vec2 ndc = gl_Position.xy / gl_Position.w;
                    float size = 15.0;
                    size *= mix(0.15, 1.0, pow(random.x, 2.0));
                    gl_PointSize = size * (resolution.y * 0.002);

                    // diagonal gradient
                    vec2 uv = ndc;
                    uv.x *= aspect;
                    uv *= 0.5;
                    uv += 0.5;
                    uv = rotateUV(uv, uRotation);
                    vLightFalloff = uv.y;
                    vLightFalloff *= 0.5;

                    // random flicker
                    vLightFalloff *= sin(time * 0.8 + random.y * 12.43) * 0.5 + 0.5;
                    vLightFalloff *= sin(time * 1.73 + random.z * 7.16) * 0.5 + 0.5;
                    vLightFalloff *= mix(0.5, 1.0, random.z);

                }
            
