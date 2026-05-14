import { useEffect, useRef } from "react";
import * as THREE from "three";

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

const ThreeSiteBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 13);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return undefined;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));

    const group = new THREE.Group();
    scene.add(group);

    const darkMode = () => document.documentElement.classList.contains("dark");
    const primaryColor = new THREE.Color(darkMode() ? "#74e08b" : "#2f6534");
    const secondaryColor = new THREE.Color(darkMode() ? "#c7f9d0" : "#5f8f65");

    const ambient = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.7);
    keyLight.position.set(3, 5, 6);
    scene.add(keyLight);

    const plateMaterial = new THREE.MeshPhysicalMaterial({
      color: primaryColor,
      transparent: true,
      opacity: darkMode() ? 0.12 : 0.1,
      roughness: 0.42,
      metalness: 0.12,
      transmission: 0.14,
      thickness: 0.3,
      side: THREE.DoubleSide,
    });

    const lineMaterial = new THREE.LineBasicMaterial({
      color: secondaryColor,
      transparent: true,
      opacity: darkMode() ? 0.36 : 0.24,
    });

    const plateGeometry = new THREE.BoxGeometry(1.75, 1.05, 0.04);
    const edgeGeometry = new THREE.EdgesGeometry(plateGeometry);
    const plates = [];

    const positions = [
      [-5.7, 2.8, -1.5],
      [-3.25, 0.65, -0.8],
      [-5.05, -2.2, -1.3],
      [3.25, 2.25, -1.1],
      [5.55, 0.15, -1.6],
      [3.85, -2.65, -0.95],
      [0.25, 3.25, -2.2],
      [0.55, -3.2, -1.8],
    ];

    positions.forEach(([x, y, z], index) => {
      const plate = new THREE.Mesh(plateGeometry, plateMaterial);
      plate.position.set(x, y, z);
      plate.rotation.set(0.2 + index * 0.08, -0.5 + index * 0.12, 0.1);
      plate.scale.setScalar(index % 3 === 0 ? 1.15 : 1);

      const edges = new THREE.LineSegments(edgeGeometry, lineMaterial);
      edges.position.copy(plate.position);
      edges.rotation.copy(plate.rotation);
      edges.scale.copy(plate.scale);

      group.add(plate, edges);
      plates.push({ plate, edges, speed: 0.16 + index * 0.012 });
    });

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 90;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 13;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i * 3 + 2] = -2 - Math.random() * 4;
    }
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3),
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: secondaryColor,
      transparent: true,
      opacity: darkMode() ? 0.28 : 0.18,
      size: 0.025,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    group.add(particles);

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const applyTheme = () => {
      const isDark = darkMode();
      plateMaterial.color.set(isDark ? "#74e08b" : "#2f6534");
      plateMaterial.opacity = isDark ? 0.12 : 0.1;
      lineMaterial.color.set(isDark ? "#c7f9d0" : "#5f8f65");
      lineMaterial.opacity = isDark ? 0.36 : 0.24;
      particleMaterial.color.set(isDark ? "#c7f9d0" : "#5f8f65");
      particleMaterial.opacity = isDark ? 0.28 : 0.18;
    };

    const observer = new MutationObserver(applyTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);
    resize();

    const clock = new THREE.Clock();
    let frameId = 0;
    const reducedMotion = prefersReducedMotion();

    const render = () => {
      const elapsed = clock.getElapsedTime();
      const motionScale = reducedMotion ? 0.25 : 1;

      group.rotation.y += (pointer.x * 0.08 - group.rotation.y) * 0.035;
      group.rotation.x += (-pointer.y * 0.04 - group.rotation.x) * 0.035;

      plates.forEach(({ plate, edges, speed }, index) => {
        const drift = Math.sin(elapsed * speed * motionScale + index) * 0.08;
        plate.position.y +=
          (positions[index][1] + drift - plate.position.y) * 0.04;
        plate.rotation.z += 0.0016 * motionScale;
        plate.rotation.y += 0.0012 * motionScale;
        edges.position.copy(plate.position);
        edges.rotation.copy(plate.rotation);
      });

      particles.rotation.y = elapsed * 0.018 * motionScale;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      observer.disconnect();
      plateGeometry.dispose();
      edgeGeometry.dispose();
      particleGeometry.dispose();
      plateMaterial.dispose();
      lineMaterial.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="three-site-background"
      aria-hidden="true"
    />
  );
};

export default ThreeSiteBackground;
