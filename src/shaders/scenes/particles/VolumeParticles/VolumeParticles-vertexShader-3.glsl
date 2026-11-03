
                    attribute vec4 rand;
                    varying vec4 vRand;
                    void main() {
                        vRand = rand;
                        gl_Position = vec4(position, 1.0);
                    }
                
