vec2 imagefitUV(vec2 uv,vec2 imageSize,vec2 containerSize,float cover){vec2 st=containerSize/imageSize;float aspect=mix(min(st.x,st.y),max(st.x,st.y),cover);return(uv-0.5)*st*(1.0/aspect)+0.5;}
