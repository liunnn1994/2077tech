
                //- edit
                #pragma app_include globalUniformsGLSL

                // Three resolves draw order to instance IDs with its indirect
                // texture. This also handles culling and multi-draw fallback;
                // the former per-vertex batchId attribute no longer exists.
                #include <batching_pars_vertex>

                uniform sampler2D tOptions;
                vec4 getOptions(const in float i) {
                    int size = textureSize(tOptions, 0).x;
                    int x = int(i) % size;
                    int y = int(i) / size;
                    return texelFetch(tOptions, ivec2(x, y), 0);
                }

                // attribute vec3 rand;
                attribute float emission;

                varying vec2 vUv;
                varying vec3 vPos;
                varying float vDisplacement;
                varying float vBounce;
                varying float vEmission;

                vec2 rotate(vec2 v, float a) {
                    float s = sin(a);
                    float c = cos(a);
                    mat2 m = mat2(c, s, -s, c);
                    return m * v;
                }

                void main() {
                    vUv = uv;
                    vEmission = emission;

                    float instanceId = getIndirectIndex(gl_DrawID);
                    mat4 batchingMatrix = getBatchingMatrix(instanceId);
                    vec3 pos = (batchingMatrix * vec4(position, 1.0)).xyz;
                    vPos = pos;

                    vec4 options = getOptions(instanceId);
                    vDisplacement = options.r;
                    vBounce = options.g;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            
