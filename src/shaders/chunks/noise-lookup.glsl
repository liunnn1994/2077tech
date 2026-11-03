vec4 getNoise(sampler2D tex,vec2 uv,vec2 offset){float invSize=1.0/float(textureSize(tex,0).x);return texture(tex,uv*invSize+offset);}
