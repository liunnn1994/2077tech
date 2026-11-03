
            #pragma app_include globalUniformsGLSL

            varying vec2 vUv;
            varying float vLightFalloff;

            uniform float uAlpha;

            void main() {
                vec2 uv = gl_PointCoord.xy;
                uv.y = 1.0 - uv.y;

                float circularGrad = 1.0 - clamp(length(uv - 0.5) * 2.0, 0.0, 1.0);
                circularGrad *= pow(uv.x, 2.0);
                circularGrad = pow(circularGrad, 2.0);

                vec3 color = vec3(1.0);
                float alpha = circularGrad * vLightFalloff;
                alpha *= uAlpha;

                gl_FragColor = vec4(color, alpha);
            }
        
