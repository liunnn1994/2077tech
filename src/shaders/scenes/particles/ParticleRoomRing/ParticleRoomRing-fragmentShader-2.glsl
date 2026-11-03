
                //- edit
                #pragma app_include globalUniformsGLSL

                varying vec2 vUv;

                void main() {

                    vec3 color = vec3(2.0);

                    // draw ring
                    float dist = length(vUv - 0.5);
                    float alpha = smoothstep(0.5, 0.3, dist);
                    alpha *= smoothstep(0.3, 0.4, dist);
                    alpha *= smoothstep(0.03, 0.1, abs(vUv.x - 0.5));
                    // alpha *= smoothstep(0.04, 0.09, abs(vUv.y - 0.5));

                    // subtle animation
                    alpha *= mix(1.0, 0.8, sin(time * 2.0 + dist + vUv.x * 2.0 + vUv.y) * 0.5 + 0.5);

                    gl_FragColor = vec4(color, alpha);
                }
            
