
                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    vec3 pos = position * 0.25 - 0.75;
                    gl_Position = vec4(pos, 1.0);
                }
            
