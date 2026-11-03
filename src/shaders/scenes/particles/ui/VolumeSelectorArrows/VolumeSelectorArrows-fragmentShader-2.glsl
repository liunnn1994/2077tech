
                uniform vec3 uColor;
                varying float vOpacity;
                void main() {
                    float opacity = vOpacity;
                    if (vOpacity < 1.0) {
                        opacity = floor(mod(vOpacity * 6.0, 2.0));
                    }

                    gl_FragColor = vec4(uColor * opacity, 1.0);
                }
            
