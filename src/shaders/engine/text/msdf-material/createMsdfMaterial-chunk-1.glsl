
            //- edit

            varying vec2 vUv;

            #ifdef ANIMATION_TRANSLATE
                attribute vec2 textWeights;
                attribute vec3 lineWeights;
                uniform vec2 uAnimationDirection;
                uniform float uAnimationAmount;
                uniform float uAnimationOrder;
                uniform float uAnimationMargin;
                uniform float uAnimationProgress;
                varying float vAlpha;
                #pragma app_include falloffFunctions
            #endif

            #ifdef ANIMATION_MASK
                attribute vec2 textWeights;
                attribute vec3 lineWeights;
                attribute vec4 uvMask;
                varying vec2 vTextWeights;
                varying vec3 vLineWeights;
                varying vec4 vUVMask;
            #endif

            void main() {
                vUv = uv;
                vec3 pos = position;

                #ifdef ANIMATION_TRANSLATE
                    float weight = 0.0;

                    #if ANIMATION_TRANSLATE == 1
                        weight = textWeights.x;
                    #elif ANIMATION_TRANSLATE == 2
                        weight = textWeights.y;
                    #elif ANIMATION_TRANSLATE == 3
                        weight = lineWeights.x;
                    #elif ANIMATION_TRANSLATE == 4
                        weight = lineWeights.y;
                    #elif ANIMATION_TRANSLATE == 5
                        weight = lineWeights.z;
                    #endif

                    vAlpha = falloffsmooth(abs(uAnimationOrder - weight), 0.0, 1.0, uAnimationMargin, clamp(uAnimationProgress, 0.0, 1.0));
                    pos += vec3(uAnimationDirection, 0.0) * uAnimationAmount * (1.0 - vAlpha);
                #endif

                #ifdef ANIMATION_MASK
                    vTextWeights = textWeights;
                    vLineWeights = lineWeights;
                    vUVMask = uvMask;
                #endif

                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        
