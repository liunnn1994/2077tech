
                #pragma app_include fitFunctions
                #pragma app_include curveFunctions
                varying vec2 vUv1;
                uniform sampler2D tMouseFrost;
                uniform sampler2D tTriangles;
                uniform vec3 uColorFrost;
                #include <uv_pars_fragment>
            
