uniform float iGlobalTime;
// uniform vec2 iResolution;
uniform samplerCube envMap;
varying vec2 vUv;
uniform vec3 blobColor;
uniform float lightIntensity;
uniform float reflectiveness;


struct S {
	vec3 n;
	vec3 no;
	float lenc;
	float w;
	float wo;
};
	
struct B {
	vec3 pos;
	S res;
};
const int blobs_num = 5;
B blobs[5];


S sphere(vec3 center, float radius, vec3 ray)
{
	vec3 vpos = normalize(center);

	float radiusout = radius * 1.6;
	float s = length(cross(vpos, ray));
	float spd = length(center);
	float d = s * spd;

	float dlen = sqrt(spd*spd - d*d);
	vec2 r = vec2(radius, radiusout);
	vec2 cd = dlen - sqrt(r*r - d*d);
	if(radius < d) cd.x = dlen;
	if(radiusout < d) cd.y = dlen;
	vec3 n = normalize(center - ray * cd.x);
	vec3 no = normalize(center - ray * cd.y);
	return S(n, no, cd.y,
			 clamp(1.0 - d/radius, 0.0, 1.0),
			 clamp(1.0 - d/radiusout, 0.0, 1.0)
			);
}

float logisticcurve(float i)
{
	return i*i*i*(i*(i*6.0-15.0)+10.0);
}

float getweight(float w1i, float w2i)
{
	vec2 w = vec2(w1i, w2i);
	w = w / (w.x+w.y);
	w = w*w*w*(w*(w*6.0-15.0)+10.0);
	return clamp((w.y-w.x+1.0)*0.5, 0.0, 1.0);
}

void init()
{
	float s = sin(iGlobalTime*4.04);
	float s2 = sin(iGlobalTime*1.234);
	float c = cos(iGlobalTime*2.734);
	float c2 = cos(iGlobalTime*5.234);
	blobs[0] = B(vec3(c*2.0,c,10.0 + s2*2.0),
				 S(vec3(.0,.0,.0),vec3(.0,.0,.0),.0,.0,.0));
	blobs[1] = B(vec3(c,s2,10.0 + c2*2.0),
				 S(vec3(.0,.0,.0),vec3(.0,.0,.0),.0,.0,.0));
	blobs[2] = B(vec3(s,-s2*1.8,10.0 - c*2.0),
				 S(vec3(.0,.0,.0),vec3(.0,.0,.0),.0,.0,.0));
	blobs[3] = B(vec3(s2*1.3,-s,10.0 + c*2.0),
				 S(vec3(.0,.0,.0),vec3(.0,.0,.0),.0,.0,.0));
	blobs[4] = B(vec3(c2*0.6,c2*0.6,10.0 + s*2.0),
				 S(vec3(.0,.0,.0),vec3(.0,.0,.0),.0,.0,.0));
}

#pragma glslify: blendScreen = require(glsl-blend/screen)

void main()
{
	gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
	
	const float SR = 1.0;
	
	init();

	// vec2 p2 = gl_FragCoord.xy / iResolution.xy;
	vec2 p2 = -0.5 + 2.0 * vUv;

	vec2 xy = p2 - vec2(0.5,0.5);
	// xy.y *= -iResolution.y / iResolution.x;

	vec3 ray = normalize(vec3(xy.x, xy.y, 1.0));
	float outlinew = 0.0;
	vec3 n = vec3(0.0,0.0,0.0);
	float wall = 0.0;
	float far = 13.0;
	for(int i = 0; i < blobs_num; i++) {
		blobs[i].res = sphere(blobs[i].pos, SR, ray);
		float d = 1.0 - blobs[i].res.lenc/far;
		blobs[i].res.wo *= d;
		blobs[i].res.w *= d;
		wall += blobs[i].res.wo / float(blobs_num);
	}
	if(wall == .0) return;
	
	for(int i=0;i<blobs_num;i++) {
		if(blobs[i].res.wo == .0) continue;
		float otherwo = wall - (blobs[i].res.wo / float(blobs_num));
		float wmix = mix(blobs[i].res.w, blobs[i].res.wo, otherwo-blobs[i].res.wo);
		outlinew += wmix;
		vec3 nb = mix(blobs[i].res.n, blobs[i].res.no,
					  getweight(blobs[i].res.wo, otherwo));
		n = mix(nb, n, 
				(n.z == .0) ? 0.0 :
				getweight(mix(blobs[i].res.w,blobs[i].res.wo,0.33), otherwo));
	}

	n = normalize(n);

	vec3 LIGHT = normalize(vec3(.2,1.0,.6)); 

	float l = dot(LIGHT, n);
	
	
	// vec3(1.0, 0.5, 0.0)
	//  vec3(0.8, 0.8, l * 0.8) 


	vec4 col = vec4( blendScreen( vec3(l, l, l) * lightIntensity, blobColor ), 1.0);

	// col *= vec4(1.0, 1.0, 1.0, 1.0);
	// float l = n.y;

	// gl_FragColor = vec4(l,l,l,1.0);

	vec4 env = textureCube(envMap, n);
	if(outlinew > 0.0) 
		gl_FragColor = vec4( blendScreen(col.rgb, env.rgb,reflectiveness), col.a);
		// gl_FragColor = mix(col, env,reflectiveness);
		// gl_FragColor = mix(col, env, l);
		
}