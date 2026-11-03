

                    varying vec4 vRand;

                    #define outPos pc_fragColor
                    uniform sampler2D tTexture1;

                    layout(location = 1) out highp vec4 outVel;
                    uniform sampler2D tTexture2;

                    uniform sampler2D tOrig;
                    uniform sampler2D tVel;

                    uniform mat4 uProjMatrix;
                    uniform mat4 uViewMatrix;
                    uniform mat4 uModelMatrix;

                    uniform float uCubeSize;
                    uniform vec3 uLightPos;
                    uniform float uRotation;
                    uniform float uAdditionalNoise;
                    uniform float uShowNoise;
                    uniform float uInteractForce;

                    #ifdef GL_FRAGMENT_PRECISION_HIGH
                        precision highp sampler3D;
                    #else
                        precision mediump sampler3D;
                    #endif
                    uniform sampler3D tVolume;
                    uniform float uVolumeScale;

                    #pragma app_include globalUniformsGLSL
                    #pragma app_include frameRateInterpolation
                    #pragma app_include pcgHash
                    #pragma app_include rotationMatrices

                    void main() {
                        ivec2 uv = ivec2(gl_FragCoord.xy);
                        vec4 currentPos = texelFetch(tTexture1, uv, 0);
                        vec4 currentVel = texelFetch(tTexture2, uv, 0);
                        float positionLimit = uCubeSize * 0.5;

                        // constant rotation
                        mat3 rotMatrix = rotateY(uRotation);

                        // sample volume
                        vec3 samplePos = rotMatrix * (currentPos.xyz / uCubeSize) * uVolumeScale + 0.5;

                        vec4 volData = texture(tVolume, samplePos);
                        vec3 grad = normalize(volData.rgb * 2.0 - 1.0) * rotMatrix;
                        float dist = (volData.a * 2.0 - 1.0) * 2.0;

                        // velocity

                        // fluid sim interaction
                        float pushForce = 0.0005;
                        vec4 wPos = uModelMatrix * vec4(currentPos.xyz, 1.0);
                        vec4 vPos = uViewMatrix * wPos;
                        vec4 posProjected = uProjMatrix * vPos;
                        vec2 uvScreen = (posProjected.xy / posProjected.w + 1.0) * 0.5;
                        vec3 vel = texture2D(tVel, uvScreen).xyz;
                        vec3 up = vec3(uViewMatrix[0][1], uViewMatrix[1][1], uViewMatrix[2][1]);
                        vec3 right = vec3(uViewMatrix[0][0], uViewMatrix[1][0], uViewMatrix[2][0]);
                        vec3 disp = right * vel.x + up * vel.y;
                        currentVel.xyz += disp * pushForce * dtRatio * uInteractForce;
                        float invFluidStrength = 1.0 - length(vel) * 0.65 * uInteractForce;

                        float additionalNoise = max(uAdditionalNoise, uShowNoise);

                        // add curl noise
                        float force1 = 0.0002 * (0.7 + 0.3 * vRand.z) + 0.0004 * additionalNoise;
                        currentVel.xyz += BitangentNoise4D(vec4((currentPos.xyz) * 7.0, time * (1.0 + 0.7 * vRand.y))) * force1 * dtRatio;

                        // towards origanl position
                        vec4 origPos = texelFetch(tOrig, uv, 0);
                        vec3 toOrig = origPos.xyz - currentPos.xyz;
                        currentVel.xyz += (origPos.xyz - currentPos.xyz) * 0.001 * dtRatio * invFluidStrength;

                        // towards the surface
                        float force2 = 0.0015 * (0.7 + 0.3 * vRand.w);
                        float signForce = mix(0.0, -0.3, sign(dist) + 1.0);
                        currentVel.xyz += grad * force2 * signForce * dtRatio * invFluidStrength;

                        // friction
                        currentVel.xyz *= frictionFPS(0.9, dtRatio);

                        // position

                        // add vel to position
                        currentPos.xyz += currentVel.xyz * dtRatio;

                        // clamp position to a cube -> switch to cylinder
                        currentPos.y = clamp(currentPos.y, -0.34, 0.35);
                        currentPos.xz = normalize(currentPos.xz) * clamp(length(currentPos.xz), 0.0, 0.275);

                        // https://developer.nvidia.com/gpugems/gpugems/part-iii-materials/chapter-16-real-time-approximations-subsurface-scattering
                        vec3 lightPos = normalize(uLightPos);
                        float wrap = 0.25;
                        float dp = dot(lightPos, grad);
                        float wrapDiffuse = max(0.0, (dp + wrap) / (1.0 + wrap));

                        // bounce
                        dp = -dp;
                        wrapDiffuse += max(0.0, dp) * 0.1;

                        // particles inside the volume are dark
                        // currentPos.a = lerpFPS(currentPos.a, mix(wrapDiffuse * 0.2, wrapDiffuse, smoothstep(-0.05, -0.001, dist)), 0.2, dtRatio);
                        float targetShadow = mix(wrapDiffuse * 0.2, wrapDiffuse, smoothstep(-0.05, -0.001, dist));
                        currentPos.a = mix(targetShadow, currentPos.a, additionalNoise);

                        // save the length of the velocity interpolated for emissiviness
                        currentVel.a = lerpFPS(currentVel.a, length(currentVel.xyz), 0.035, dtRatio);

                        outVel = currentVel;
                        outPos = currentPos;
                    }
                
