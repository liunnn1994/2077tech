
                precision #pragma app_include baseShader0 float;
                precision #pragma app_include baseShader1 sampler2D;

                #pragma app_include baseShader2

                uniform sampler2D uTarget;
                uniform float aspectRatio;
                uniform vec3 color;
                uniform vec2 point;
                uniform vec2 prevPoint;
                uniform float radius;
                uniform bool isDye;

                varying vec2 vUv;

                float line(vec2 uv, vec2 point1, vec2 point2) {
                    vec2 pa = uv - point1, ba = point2 - point1;
                    pa.x *= aspectRatio;
                    ba.x *= aspectRatio;
                    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
                    return length(pa - ba * h);
                }

                float cubicIn(float t) {
                    return t * t * t;
                }

                void main () {
                    #ifdef SPLAT_DOT
                        vec2 p = vUv - point.xy;
                        p.x *= aspectRatio;
                        vec3 splat = exp(-dot(p, p) / (radius / 50.0)) * color; // vec3 splat = exp(-dot(p, p) / radius) * color;
                    #else
                        vec3 splat = cubicIn(clamp(1.0 - line(vUv, prevPoint.xy, point.xy) / radius, 0.0, 1.0)) * color;
                    #endif

                    vec3 base = texture2D(uTarget, vUv).xyz;
                    vec3 result = base + splat;
                    if (isDye) result = clamp(result, vec3(0.0), vec3(1.0));

                    gl_FragColor = vec4(result, 1.0);
                }
            
