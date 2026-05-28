import { useEffect, useRef } from "react";

/**
 * Technological WebGL background: layered perspective grid, plasma plume,
 * scrolling data streams, dot matrix overlay and chromatic scanlines.
 * Renders into an absolute canvas. Parent must be positioned.
 */
export function WebGLBackground({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    const vert = `
      attribute vec2 p;
      void main() { gl_Position = vec4(p, 0.0, 1.0); }
    `;
    const frag = `
      precision highp float;
      uniform vec2 uRes;
      uniform float uTime;
      uniform vec2 uMouse;

      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float hash11(float n){ return fract(sin(n)*43758.5453); }
      float noise(vec2 p){
        vec2 i = floor(p); vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0,0.0));
        float c = hash(i + vec2(0.0,1.0));
        float d = hash(i + vec2(1.0,1.0));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
      }
      float fbm(vec2 p){
        float v = 0.0; float a = 0.5;
        for (int i = 0; i < 5; i++){ v += a*noise(p); p *= 2.02; a *= 0.5; }
        return v;
      }

      // Distant perspective grid (floor-style)
      float perspectiveGrid(vec2 uv, float t){
        // project — pull lines toward horizon
        vec2 g = uv;
        g.y = 1.0 / (abs(g.y) + 0.04);
        g.x *= g.y;
        g += vec2(0.0, t * 1.4);
        vec2 q = fract(g * 1.2) - 0.5;
        float line = smoothstep(0.5, 0.46, max(abs(q.x), abs(q.y)));
        // fade behind horizon
        float horizonFade = smoothstep(0.0, 0.4, -uv.y) * smoothstep(-0.95, -0.3, uv.y);
        return line * horizonFade;
      }

      // Vertical streaming "data" columns
      float dataStreams(vec2 uv, float t){
        vec2 g = uv * vec2(40.0, 18.0);
        float col = floor(g.x);
        float speed = 0.6 + hash11(col) * 1.6;
        float y = fract(g.y * 0.12 + t * speed + hash11(col * 1.7));
        float head = smoothstep(0.0, 0.02, y) * smoothstep(0.5, 0.0, y);
        float trail = pow(1.0 - y, 4.0);
        float intensity = head * 0.9 + trail * 0.18;
        // randomly turn off some columns
        float alive = step(0.35, hash11(col * 0.31));
        return intensity * alive;
      }

      void main(){
        vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
        float t = uTime * 0.08;

        // Top-half: dot matrix
        vec2 dotG = uv * 80.0;
        vec2 dq = fract(dotG) - 0.5;
        float dot = smoothstep(0.18, 0.0, length(dq));
        float dotMask = smoothstep(0.2, -0.4, uv.y);
        float matrix = dot * dotMask * 0.35;

        // Floor grid
        float grid = perspectiveGrid(uv * 1.3, t);

        // Streams
        float streams = dataStreams(uv + vec2(0.0, t * 0.0), uTime * 0.4);

        // Vignette
        float vignette = smoothstep(1.3, 0.1, length(uv));

        // Plasma plume following mouse
        vec2 m = uMouse * vec2(1.2, 0.7);
        float n = fbm(uv * 1.8 + uTime * 0.07);
        float blob = smoothstep(0.95, 0.15, length(uv - m) - n * 0.18);

        vec3 bg = vec3(0.025, 0.03, 0.055);
        vec3 cyan = vec3(0.32, 0.92, 1.00);
        vec3 violet = vec3(0.58, 0.42, 1.00);
        vec3 hot = vec3(1.00, 0.45, 0.85);

        vec3 col = bg;
        col += cyan   * grid    * 0.55;
        col += cyan   * matrix  * 0.6;
        col += mix(cyan, violet, n) * blob * 0.45;
        col += hot    * pow(blob, 4.0) * 0.6;
        col += vec3(0.65, 0.95, 1.0) * streams * 0.55;

        col *= 0.7 + 0.6 * vignette;

        // Subtle chromatic scanlines
        float scan = 0.96 + 0.04 * sin(gl_FragCoord.y * 1.6 + uTime * 2.0);
        col *= scan;

        // Gamma
        col = pow(col, vec3(0.9));

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn("[webgl] shader error", gl.getShaderInfoLog(s));
      }
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");

    const mouse = { x: 0, y: 0.2 };
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    window.addEventListener("resize", resize);

    const start = performance.now();
    let raf = 0;
    const render = () => {
      const time = (performance.now() - start) / 1000;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 w-full h-full ${className}`}
    />
  );
}
