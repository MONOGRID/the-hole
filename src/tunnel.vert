uniform vec4 offsetRepeat;
uniform vec2 distortion;
uniform float tunnelLenght;

varying vec2 vUv;
varying float fog;

void main() {
  vec3 transformed = vec3( position );

  fog = clamp((-position.z - (tunnelLenght - 150.0)) / 150.0, 0.0, 1.0);
  // fog = -position.z / tunnelLenght;
  // fog = pow(fog,2.0);
  // fog = 1.0;

  float distortionFactor = position.z / tunnelLenght;
  distortionFactor = pow(distortionFactor,2.0);

  transformed.x = position.x + (distortionFactor * distortion.x);
  transformed.y = position.y + (distortionFactor * distortion.y);

  vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );

  vUv = uv * offsetRepeat.zw + offsetRepeat.xy;

  gl_Position = projectionMatrix * mvPosition;
}