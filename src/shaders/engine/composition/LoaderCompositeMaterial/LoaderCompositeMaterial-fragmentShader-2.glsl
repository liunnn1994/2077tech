
                //- edit
                #pragma app_include globalUniformsGLSL

                uniform sampler2D tScene;
                uniform float uIntro;
                uniform vec3 uColor;

                varying vec2 vUv;

                void main() {
                    vec4 scene = texture2D(tScene, vUv);
                    vec3 color = scene.rgb;

                    // final overlay
                    color = mix(uColor, color, uIntro);

                    // color
                    gl_FragColor = vec4(color, 1.0);
                }
            
