
            //- edit

            #pragma app_include msdfFunctions

            uniform sampler2D tMap;
            uniform vec3 uColor;
            uniform float uAlpha;

            varying vec2 vUv;

            #ifdef OUTLINE
                uniform float uOutlineWidth;
            #endif

            #ifdef ANIMATION_TRANSLATE
                varying float vAlpha;
            #endif

            #ifdef ANIMATION_MASK
                uniform vec2 uAnimationDirection;
                uniform float uAnimationAmount;
                uniform float uAnimationOrder;
                uniform float uAnimationMargin;
                uniform float uAnimationProgress;
                varying vec2 vTextWeights;
                varying vec3 vLineWeights;
                varying vec4 vUVMask;
                #pragma app_include falloffFunctions
            #endif

            void main() {
                vec2 uv = vUv;
                float alpha = uAlpha;

                #ifdef ANIMATION_MASK
                    float weight = 0.0;

                    #if ANIMATION_MASK == 1
                        weight = vTextWeights.x;
                    #elif ANIMATION_MASK == 2
                        weight = vTextWeights.y;
                    #elif ANIMATION_MASK == 3
                        weight = vLineWeights.x;
                    #elif ANIMATION_MASK == 4
                        weight = vLineWeights.y;
                    #elif ANIMATION_MASK == 5
                        weight = vLineWeights.z;
                    #endif

                    float a = falloffsmooth(abs(uAnimationOrder - weight), 0.0, 1.0, uAnimationMargin, clamp(uAnimationProgress, 0.0, 1.0));
                    uv += uAnimationDirection * uAnimationAmount * (1.0 - a);
                    uv = clamp(uv, vec2(vUVMask.x, vUVMask.z), vec2(vUVMask.y, vUVMask.w));
                #endif

                #ifdef ANIMATION_TRANSLATE
                    alpha *= vAlpha;
                #endif

                #ifdef OUTLINE
                    alpha *= msdf(tMap, uv, uOutlineWidth);
                #else
                    alpha *= msdf(tMap, uv);
                #endif

                gl_FragColor = vec4(uColor, alpha);
            }
        
