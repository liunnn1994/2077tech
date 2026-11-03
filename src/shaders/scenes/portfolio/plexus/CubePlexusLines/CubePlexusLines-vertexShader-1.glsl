
                varying vec3 wPos;

                void main() {
                    vec3 pos = position;
                    wPos = pos;
                    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * viewMatrix * worldPos;
                }
            
