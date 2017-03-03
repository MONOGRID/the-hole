uniform sampler2D map;
uniform sampler2D mapb;
uniform sampler2D map2;
uniform sampler2D map2b;
uniform vec3 fogColor;
uniform float mapReactive;
uniform float mapMix;
uniform float opacity;
varying vec2 vUv;
varying float fog;


void main() {

	vec4 diffuseColor = vec4( 1.0, 1.0, 1.0, 1.0 );

	vec4 texelColora = texture2D( map, vUv );
	texelColora = mapTexelToLinear( texelColora );
	vec4 texelColorb = texture2D( mapb, vUv );
	texelColorb = mapTexelToLinear( texelColorb );

	vec4 texelColor = mix(texelColora,texelColorb,mapReactive);

	vec4 texelColor2a = texture2D( map2, vUv );
	texelColor2a = mapTexelToLinear( texelColor2a );
	vec4 texelColor2b = texture2D( map2b, vUv );
	texelColor2b = mapTexelToLinear( texelColor2b );

	vec4 texelColor2 = mix(texelColor2a,texelColor2b,mapReactive);

	diffuseColor = mix(texelColor,texelColor2,mapMix);

	diffuseColor = mix(diffuseColor, vec4(fogColor,1.0), fog);

	gl_FragColor = diffuseColor;
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
	gl_FragColor = linearToOutputTexel( gl_FragColor );
	// gl_FragColor.rgb *= 4.0;
}