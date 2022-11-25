precision mediump float;

varying vec2 vUv0;

uniform float opacity;
uniform sampler2D texture_diffuseMap;

void main(void) {
    vec3 diffuse = texture2D(texture_diffuseMap, vUv0).rgb;
    
    if (diffuse.b * opacity < 0.001) {
        discard;
    }
    
    gl_FragColor = vec4(diffuse * opacity, 1.0);
}
