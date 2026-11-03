
                //- edit
                #pragma app_include globalUniformsGLSL

                varying vec2 vUv;
                varying vec3 vPos;

                uniform vec3 uColor1;
                uniform vec3 uColor2;
                uniform vec3 uIntroColor;
                uniform float uProgress;

                void main() {

                    // light to dark gradient
                    vec2 screenUv = gl_FragCoord.xy / resolution;
                    float grad = (screenUv.x + screenUv.y) * 0.5;
                    grad = pow(grad, 2.0);
                    vec3 color1 = uColor1;
                    vec3 color2 = uColor2;
                    vec3 color = mix(color2, color1, grad);

                    // intro animation
                    color = mix(uIntroColor, color, uProgress);

                    gl_FragColor = vec4(color, 1.0);
                }
            
