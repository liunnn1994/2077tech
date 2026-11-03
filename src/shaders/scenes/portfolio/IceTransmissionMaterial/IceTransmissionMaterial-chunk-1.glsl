
                uniform float uChromaticAberration;
                uniform sampler2D tBlue;
                uniform vec2 uBlueOffset;
                uniform vec2 uResolution;

                uniform float uTransmission;
                uniform float uThickness;
                uniform float uAttenuationDistance;
                uniform vec3 uAttenuationColor;

                #pragma app_include noiseTextureLookup
                #pragma app_include baseShader1
            
