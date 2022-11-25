attribute vec3 vertex_position;

uniform mat4 matrix_model;
uniform mat4 matrix_projection;
uniform mat4 matrix_view;
uniform mat3 matrix_normal;
uniform float scale;

varying vec2 vUv0;

void main(void) {
    vec3 normal = normalize(matrix_normal * vec3(1, 0, 0));
    float d = max(0.0, (dot(vec3(matrix_view[0][2], matrix_view[1][2], matrix_view[2][2]), normal) - 0.35) * (1.0 / (1.0 - 0.35)));
    
    mat4 modelMatrix = matrix_view * matrix_model;
    modelMatrix[0][0] = 1.0;
    modelMatrix[0][1] = 0.0;
    modelMatrix[0][2] = 0.0;
    modelMatrix[1][0] = 0.0;
    modelMatrix[1][1] = 1.0;
    modelMatrix[1][2] = 0.0;
    modelMatrix[2][0] = 0.0;
    modelMatrix[2][1] = 0.0;
    modelMatrix[2][2] = 1.0;
    
    vec4 positionW = modelMatrix * vec4(vertex_position * scale * d, 1.0);
    
    gl_Position = matrix_projection * positionW;
    
    vUv0 = vertex_position.xy + vec2(0.5);
    vUv0.y = 1.0 - vUv0.y;
}
