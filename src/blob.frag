// metaball by @h013
uniform float iGlobalTime;
// uniform vec2 iResolution;
varying vec2 vUv;

float metaball(vec3 p, vec4 spr){
	float fv[5];
	float t = iGlobalTime;
	fv[0] = length(p - vec3(2.0 * sin(t), 0.0, 2.0 * cos(t)));
	fv[1] = length(p - vec3(4.0 * sin(t), sin(t), 2.0 * cos(t * 0.7)));
	fv[2] = length(p - vec3(1.0 * sin(t), 2.0 * cos(t * 1.3), 1.0 * cos(t)));
	fv[3] = length(p - vec3(4.0 * cos(t), 2.0 * cos(t * 1.3), 1.5 * cos(t)));
	fv[4] = length(p - vec3(0.5 * sin(t * 0.2), 2.0 * cos(t * 1.6), 0.5 * sin(t)));
	float len = 0.0;
	float fs = 1.0;
	for (int i = 0; i < 5; i ++) {
		len += fs / (fv[i] * fv[i]);
	}
	len = min(16.0, len);
	len = 1.0 - len;
	return len;
}


mat4 getrotz(float angle) {
	return mat4(cos(angle), -sin(angle), 0.0, 0.0,
				sin(angle),  cos(angle), 0.0, 0.0,
				0.0,         0.0, 1.0, 0.0,
				0.0,         0.0, 0.0, 1.0);
}
mat4 getrotx(float angle) {
	return mat4(       1.0,         0.0, 0.0, 0.0,
				0.0, cos(angle), -sin(angle), 0.0,
				0.0, sin(angle), cos(angle), 0.0,
				0.0, 0.0, 0.0, 1.0);
}

float scene(vec3 p) {
	float angle = iGlobalTime;
	mat4 rotmat = getrotz(angle) * getrotx(angle * 0.5);
	vec4 q = rotmat * vec4(p, 0.0);
	float d = metaball(q.xyz,vec4(0.0, 0.0, 2.0 , 6.0));
	return d;
}

vec3 getN(vec3 p){
	float eps=0.01;
	return normalize(vec3(
		scene(p+vec3(eps,0,0))-scene(p-vec3(eps,0,0)),
		scene(p+vec3(0,eps,0))-scene(p-vec3(0,eps,0)),
		scene(p+vec3(0,0,eps))-scene(p-vec3(0,0,eps))
	));
}
float AO(vec3 p,vec3 n){
	float dlt=0.5;
	float oc=0.0,d=1.0;
	for(float i=0.0;i<6.;i++){
		oc+=(i*dlt-scene(p+n*i*dlt))/d;
		d*=2.0;
	}
	
	float tmp = 1.0-oc;
	return tmp;
}

void main() {
	// float aspect = iResolution.y / iResolution.x;
	
	// vec2 p2 = gl_FragCoord.xy / iResolution.xy;

	vec2 p2 = -0.5 + 2.0 * vUv;

	vec3 org = vec3(vec2(0.5, 0.5) - p2, -22.0);
	// org.y *= aspect;
	
	vec3 camera_pos = vec3(0.0, 0.0, -23.0);
	vec3 dir = normalize(org - camera_pos);
	vec4 col = vec4(0.0, 0.0, 0.0, 1.0);
	vec3 p = org.xyz;
	float d, g;
	
	for (int i = 0; i < 64; i++) {
		d = scene(p.xyz) * 1.0;
		p = p + d * dir;
	}
	
	
	vec3 n=getN(p);
	float a=AO(p,n);
	vec3 s=vec3(0,0,0);
	vec3 lp[3],lc[3];
	lp[0]=vec3(4.0 * cos(iGlobalTime),0, 4.0 * sin(iGlobalTime));
	lp[1]=vec3(2,3,-18);
	lp[2]=vec3(4,-2,-24);  
	lc[0]=vec3(1.0,0.5,0.4);  
	
	
	float theta = acos(p.y / length(p));
	float phi = acos(p.x / length(p.xz)) + iGlobalTime;
	lc[1] = vec3(sin(iGlobalTime), cos(iGlobalTime), sin(iGlobalTime) * cos(iGlobalTime));
	lc[2]=vec3(0.2,1.0,0.5);
	
	for(int i=0;i<3;i++){
		vec3 l,lv;
		lv=lp[i]-p;
		l=normalize(lv);
		vec3 r = reflect(-l, n);
		vec3 v = normalize(camera_pos - p);
		g=length(lv);
		g = (max(0.0,dot(l,n)) + pow(max(0.0, dot(r, v)), 2.0))/(g)*5.;
		s+=g*lc[i];
	}
	float fg=min(1.0,20.0/length(p-org));
	col = vec4(s*a,1)*fg*fg;
	gl_FragColor  = col;
}
