
                //- edit
                #pragma app_include globalUniformsGLSL

                attribute vec3 color;
                attribute vec3 centr;
                attribute float primrand;

                varying vec2 vUv;
                varying vec3 vPos;

                uniform sampler2D tNoise;
                uniform float uProgress;

                mat4 rotation3D(vec3 axis, float angle) {
                    axis = normalize(axis);
                    float s = sin(angle);
                    float c = cos(angle);
                    float oc = 1.0 - c;

                    return mat4(oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s,  0.0,
                                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,  0.0,
                                0.0, 0.0, 0.0, 1.0);
                }

                void main() {
                    vUv = uv;
                    vPos = position;

                    // construct a static viewMatrix, to ignore camera position
                    mat4 viewMatrixCopy = viewMatrix;
                    viewMatrixCopy[0] = vec4(1.0, 0.0, 0.0, 0.0);
                    viewMatrixCopy[1] = vec4(0.0, 1.0, 0.0, 0.0);
                    viewMatrixCopy[2] = vec4(0.0, 0.0, 1.0, 0.0);
                    viewMatrixCopy[3] = vec4(0.0, 0.0, -5.0, 1.0);

                    // rotate with scroll
                    vec3 customPos = position;
                    customPos -= centr;
                    customPos = (rotation3D(vec3(0.0, 0.0, 1.0), uProgress * 5.0 * mix(0.1, 0.5, primrand) + time * 0.2 * primrand) * vec4(customPos, 1.0)).xyz;
                    // responsive x offset
                    vec3 offset = centr * vec3(clamp(aspect * 0.5, 0.65, 1.0), 1.0, 1.0);
                    offset.y -= 5.0;
                    customPos += offset;

                    // translate with scroll
                    customPos.y += uProgress * 10.0;

                    gl_Position = projectionMatrix * viewMatrixCopy * modelMatrix * vec4(customPos, 1.0);

                }
            
