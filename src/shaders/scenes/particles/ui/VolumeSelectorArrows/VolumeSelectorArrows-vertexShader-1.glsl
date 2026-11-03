
                attribute float side;
                uniform float uWidth;
                uniform float uScale;
                uniform float uOpacity1;
                uniform float uOpacity2;

                varying float vOpacity;

                void main() {
                    vOpacity = mix(uOpacity1, uOpacity2, side * 0.5 + 0.5);
                    vec3 pos = position * uScale + vec3(side, 0.0, 0.0) * uWidth;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            
