
                #pragma app_include matrixFunctions

                varying vec2 vUv;
                flat varying vec2 vScale;

                void main() {
                    vUv = uv;
                    vScale = getMatrixScale(modelMatrix).xy;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            
