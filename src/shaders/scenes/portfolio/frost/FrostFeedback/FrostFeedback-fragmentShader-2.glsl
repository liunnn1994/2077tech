
                varying vec2 vUv;

                uniform sampler2D tBuffer;
                void main() {
                    vec3 color = texture2D(tBuffer, vUv).rgb;
                    gl_FragColor = vec4(color, 1.0);
                }
            
