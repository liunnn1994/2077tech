
                //- edit
                #pragma app_include globalUniformsGLSL

                varying vec2 vUv;
                varying vec3 vPos;
                varying vec3 vWorldPos;
                varying vec3 vMouseGlow;

                uniform vec3 uMousePos;
                uniform float uProgress;
                uniform float uProgress2;
                uniform sampler2D tNoise;

                void main() {
                    vUv = uv;
                    vPos = position;
                    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;

                    vec3 pos = position;

                    // approximate light glow based on structure interaction
                    vMouseGlow = (1.0 - clamp(distance(uMousePos, vWorldPos.xyz * vec3(1.0, 0.0, 1.0)), 0.0, 5.0) / 5.0) * vec3(0.5, 0.7, 1.0) * smoothstep(-0.5, 2.0, uMousePos.y);
                    vMouseGlow *= 1.0 - clamp(length(vWorldPos.xyz), 0.0, 9.0) / 9.0;
                    vMouseGlow *= 2.0;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            
