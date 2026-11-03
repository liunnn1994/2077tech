float ca_linterp(float t){return clamp(1.0-abs(2.0*t-1.0),0.0,1.0);}float ca_remap(float t,float a,float b){return clamp((t-a)/(b-a),0.0,1.0);}vec2 ca_barrelDistortion(vec2 coord,float amt){vec2 cc=coord-0.5;float dist=dot(cc,cc);return coord+cc*dist*amt;}vec4 ca_spectrum_offset(float t){vec4 ret;float lo=step(t,0.5);float hi=1.0-lo;float w=ca_linterp(ca_remap(t,1.0/6.0,5.0/6.0));ret=vec4(lo,1.0,hi,1.0)*vec4(1.0-w,w,1.0-w,1.0);return pow(ret,vec4(1.0/2.2));}
#ifndef CA_ITERATIONS
const int CA_ITERATIONS=5;
#endif
const float RECI_ITER=1.0/float(CA_ITERATIONS);vec4 chromatic_aberration(sampler2D text,vec2 uv,float maxdistort,float bendAmount){vec4 sumcol=vec4(0.0);vec4 sumw=vec4(0.0);for(int i=0;i<CA_ITERATIONS;++i){float t=float(i)*RECI_ITER;vec4 w=ca_spectrum_offset(t);sumw+=w;sumcol+=w*texture2D(text,ca_barrelDistortion(uv,bendAmount*maxdistort*t));}return sumcol/sumw;}
