
                    #pragma app_include globalUniformsGLSL

                    attribute vec4 rand;
                    attribute vec2 texuv;
                    uniform sampler2D tTexture1;
                    uniform sampler2D tTexture2;

                    uniform float uSize;

                    varying float vShadow;
                    varying float vVel;
                    varying float vY;

                    void main() {
                        vec4 posData = texture2D(tTexture1, texuv);
                        vec4 velData = texture2D(tTexture2, texuv);

                        vec3 pos = posData.xyz;
                        vec4 vPos = modelViewMatrix * vec4(pos, 1.0);
                        float size = uSize;

                        vShadow = posData.w;
                        vVel = velData.w;
                        vY = posData.y;

                        gl_Position = projectionMatrix * vPos;
                        gl_PointSize = size / length(vPos.xyz) * (resolution.y / 1300.0);
                    }
                
