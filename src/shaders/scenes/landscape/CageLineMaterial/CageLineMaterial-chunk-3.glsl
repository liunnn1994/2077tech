
                    float intro_gradientInput = length(vWorldPos);
                    float intro_shockwave = falloff(intro_gradientInput, 0.0, 20.0, 5.0, uProgress);

                    float alpha = uAlpha;
                    alpha *= intro_shockwave;

                    float idleAnimation = sin(vColor.r * 13.0 + time * 6.0) * 0.5 + 0.5;
                    alpha *= idleAnimation;

                    gl_FragColor.a = alpha;
            
