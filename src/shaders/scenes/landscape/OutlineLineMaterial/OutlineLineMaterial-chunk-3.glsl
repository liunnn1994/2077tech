
                    // intro materialize effect

                    float alpha = mix(uAlpha, 1.0, uScrollAlpha);
                    float idleAnimation = sin(vWorldPos.y * 6.0 + time * 5.0) * 0.5 + 0.5;
                    idleAnimation *= cos(vWorldPos.z * 6.0 + time * 5.0) * 0.5 + 0.5;
                    idleAnimation *= sin(vWorldPos.x * 6.0 + time * 5.0) * 0.5 + 0.5;
                    idleAnimation = idleAnimation * 0.8 + 0.2;
                    alpha *= idleAnimation;

                    // materialize effect
                    alpha *= falloffsmooth(vWorldPos.y, 3.5, 0.1, 2.0, uIntroMaterialize);

                    gl_FragColor.a = alpha;
            
