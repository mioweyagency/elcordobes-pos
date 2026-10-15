import { useEffect, useRef, useState } from "react";

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import "../styles/coriAvatar3D.css";

/* =========================================================
   CLEAN UP MODEL RESOURCES
========================================================= */

function disposeModel(model) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();

  model.traverse((object) => {
    if (object.geometry) {
      geometries.add(object.geometry);
    }

    const objectMaterials = Array.isArray(object.material)
      ? object.material
      : object.material
        ? [object.material]
        : [];

    for (const material of objectMaterials) {
      materials.add(material);

      for (const value of Object.values(material)) {
        if (value?.isTexture) {
          textures.add(value);
        }
      }
    }
  });

  for (const texture of textures) {
    texture.dispose();

    if (
      typeof ImageBitmap !== "undefined" &&
      texture.image instanceof ImageBitmap
    ) {
      texture.image.close();
    }
  }

  for (const material of materials) {
    material.dispose();
  }

  for (const geometry of geometries) {
    geometry.dispose();
  }
}

/* =========================================================
   CORI 3D
========================================================= */

export default function CoriAvatar3D({
  animationName = "",
  rotationY = 0,
}) {
  const containerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const container = containerRef.current;

    let disposed = false;
    let frameId = 0;

    let renderer;
    let model;
    let mixer;

    let normalizedWidth = 2;
    let normalizedDepth = 1;

    const characterHeight = 2.5;
    const centerY = characterHeight / 2;

    setLoading(true);
    setError("");

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      35,
      1,
      0.01,
      100
    );

    /* Transparent background. */

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      setLoading(false);
      setError("No se pudo iniciar la vista 3D.");

      return;
    }

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 1.5)
    );

    renderer.setClearColor(0x000000, 0);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    renderer.domElement.setAttribute("aria-hidden", "true");

    container.appendChild(renderer.domElement);

    /* LIGHTS */

    const ambient = new THREE.HemisphereLight(
      0xffffff,
      0xe1d4bc,
      2.2
    );

    scene.add(ambient);

    const mainLight = new THREE.DirectionalLight(
      0xffffff,
      2.5
    );

    mainLight.position.set(3, 5, 5);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(
      0xffedd7,
      1.2
    );

    fillLight.position.set(-3, 2, 3);
    scene.add(fillLight);

    /* FIT TO AVAILABLE SPACE */

    function resize() {
      if (disposed) return;

      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);

      renderer.setSize(width, height, false);

      camera.aspect = width / height;

      const halfFov = THREE.MathUtils.degToRad(
        camera.fov / 2
      );

      const verticalDistance =
        characterHeight / 2 / Math.tan(halfFov);

      const horizontalDistance =
        normalizedWidth /
        2 /
        (Math.tan(halfFov) * camera.aspect);

      const distance =
        Math.max(verticalDistance, horizontalDistance) *
          1.25 +
        normalizedDepth / 2;

      camera.position.set(0, centerY, distance);
      camera.lookAt(0, centerY, 0);
      camera.updateProjectionMatrix();

      renderer.render(scene, camera);
    }

    const resizeObserver = new ResizeObserver(resize);

    resizeObserver.observe(container);
    resize();

    /* RESPECT REDUCED MOTION */

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    let previousTime = 0;

    function animate(time) {
      if (disposed) return;

      frameId = requestAnimationFrame(animate);

      if (document.hidden || motionPreference.matches) {
        previousTime = time;
        return;
      }

      if (!previousTime) {
        previousTime = time;
      }

      const elapsed = time - previousTime;

      /* About 30 FPS to reduce work on iPad. */

      if (elapsed < 1000 / 30) return;

      previousTime = time;

      const delta = Math.min(elapsed / 1000, 0.1);

      mixer?.update(delta);

      renderer.render(scene, camera);
    }

    /* LOAD CORI */

    const loader = new GLTFLoader();

    const modelUrl =
      `${import.meta.env.BASE_URL}models/cori.glb`;

    loader.load(
      modelUrl,

      (gltf) => {
        if (disposed) {
          disposeModel(gltf.scene);
          return;
        }

        model = gltf.scene;

        const clips = gltf.animations || [];

        console.info(
          "Animaciones de Cori:",
          clips.map((clip) => clip.name)
        );

        const requestedClip = animationName
          ? clips.find(
              (clip) => clip.name === animationName
            )
          : null;

        const idleClip = clips.find(
          (clip) => /idle/i.test(clip.name)
        );

        const selectedClip =
          requestedClip || idleClip || clips[0];

        if (selectedClip) {
          mixer = new THREE.AnimationMixer(model);

          const action = mixer.clipAction(selectedClip);

          action.setLoop(THREE.LoopRepeat, Infinity);
          action.play();

          mixer.update(0);
        }

        model.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(model);

        if (box.isEmpty()) {
          disposeModel(model);
          model = null;

          setLoading(false);
          setError("El archivo no contiene un modelo visible.");

          return;
        }

        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const scale =
          characterHeight / Math.max(size.y, 0.001);

        /*
          Centra usando grupos externos para no alterar
          las transformaciones que utiliza la animación.
        */

        const offset = new THREE.Group();

        offset.position.set(
          -center.x,
          -box.min.y,
          -center.z
        );

        offset.add(model);

        const character = new THREE.Group();

        character.scale.setScalar(scale);
        character.rotation.y = rotationY;

        character.add(offset);
        scene.add(character);

        /* Calculate bounds after applying orientation. */

        character.updateMatrixWorld(true);

        const finalBox = new THREE.Box3().setFromObject(
          character
        );

        const finalSize = finalBox.getSize(
          new THREE.Vector3()
        );

        normalizedWidth = finalSize.x;
        normalizedDepth = finalSize.z;

        resize();

        setLoading(false);

        frameId = requestAnimationFrame(animate);
      },

      undefined,

      (loadError) => {
        if (disposed) return;

        console.error("Error cargando Cori:", loadError);

        setLoading(false);
        setError(
          "No se pudo cargar Cori. Revisa public/models/cori.glb."
        );
      }
    );

    /* CLEAN UP WHEN LEAVING INTRO */

    return () => {
      disposed = true;

      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();

      if (mixer && model) {
        mixer.stopAllAction();
        mixer.uncacheRoot(model);
      }

      if (model) {
        disposeModel(model);
      }

      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [animationName, rotationY]);

  return (
    <div
      className="cori3d-avatar"
      role="img"
      aria-label="Cori, tu asistente de cafetería"
      aria-busy={loading}
    >
      <div
        ref={containerRef}
        className="cori3d-canvas"
      />

      {loading && (
        <p className="cori3d-message" role="status">
          Cori está llegando…
        </p>
      )}

      {error && (
        <p className="cori3d-message" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}