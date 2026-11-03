
                //- edit
                #pragma app_include globalUniformsGLSL
                #pragma app_include falloffFunctions
                #pragma app_include sineNoise

                varying vec2 vUv;
                varying vec3 vPos;
                varying vec3 vNormal;
                varying vec3 vEye;

                uniform float uAlpha;
                uniform sampler2D tTriangles;

                void main() {

                    vec2 uv = vUv;

                    // correct aspect for cylinder
                    uv.x *= 2.0;

                    vec3 pos = vPos;
                    float t = time * 0.5;

                    // animated noise
                    float noise = sinenoise1(pos * 4.0 + vec3(0.0, t * 0.45, -t * 0.13)) * 0.5 + 0.5;
                    noise *= sinenoise1(pos * 2.0 + vec3(t * 0.3, -t * 0.27, t * 0.2)) * 0.5 + 0.5;
                    noise = sin(noise * 15.0 - t * 7.0) * 0.5 + 0.5;
                    noise = pow(noise, 4.0);

                    // triangle texture, distorted with above noise
                    float triangles = texture2D(tTriangles, uv * 6.0 + vec2(noise * 0.05)).r;

                    // fade at top, edges, slight fresnel
                    float fresnel = 1.0 - max(0.0, dot(normalize(vNormal), normalize(vEye)));
                    float softedge = 1.0 - smoothstep(0.65, 0.99, fresnel);
                    fresnel = mix(fresnel, 1.0, 0.25);
                    float fadetop = 1.0 - smoothstep(0.5, 1.0, vUv.y);

                    // composite final alpha
                    float alpha = (noise * triangles * 2.0 + noise * 0.03) * fresnel * softedge * fadetop;

                    // animate on scroll
                    alpha *= uAlpha;

                    vec3 color = vec3(1.0);

                    gl_FragColor = vec4(color, alpha);
                }
            
