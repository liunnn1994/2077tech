
            #pragma app_include globalUniformsGLSL

            attribute vec3 random;

            varying vec2 vUv;
            varying float vLightFalloff;

            uniform float uRotation;

            void main() {
                vUv = uv;
                float t = time * 0.1;
                vec3 pos = position;
                pos.x += sin(t * 0.4 + position.z * 2.5) * 0.75;
                pos.y += sin(t * 0.2 + position.x * 2.5) * 0.75;
                pos.z += sin(t * 0.2 + position.y * 2.5) * 0.75;

                // pos.x = max(0.22, pos.x);
                // pos.z = max(0.22, pos.z);

                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

                // scale larger with screen gradient
                vec2 ndc = gl_Position.xy / gl_Position.w;
                float size = mix(7.0, 12.0, random.x);
                gl_PointSize = size * resolution.y * 0.002;

                // random flicker
                vLightFalloff = sin(time * 1.8 + random.y * 22.43) * 0.4 + 0.6;
                vLightFalloff *= smoothstep(0.2, 0.24, length(pos.xz));
                vLightFalloff *= 1.25;
            }
        
