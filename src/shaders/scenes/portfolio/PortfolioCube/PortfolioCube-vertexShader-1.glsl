
                #pragma app_include matrixFunctions

                uniform sampler2D tTexture1;
                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    gl_Position = projectionMatrix * viewMatrix * (billboardModelMatrix() * vec4(position, 1.0));
                }
            
