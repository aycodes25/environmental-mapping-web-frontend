/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Color3,
  VideoRecorder,
  // Quaternion,
  Tools,
  Engine,
  // Matrix,
  MeshBuilder,
  Camera,
  ArcRotateCamera,
  // hack
  FreeCamera,
  HemisphericLight,
  StandardMaterial,
  Vector3,
  Scene,
  ActionManager,
  ExecuteCodeAction,
  CannonJSPlugin,
  SpotLight,
  Texture,
  VertexData,
  Mesh,
  GPUParticleSystem
} from "@babylonjs/core";
import { SceneLoader } from "babylonjs";
import { GridMaterial } from "@babylonjs/materials";
import * as cannon from "cannon";
import "babylonjs-loaders";
import * as GUI from "babylonjs-gui";
import { toast } from "react-toastify";
import BabylonControls from "./controls";
import { useDispatch, useSelector } from "react-redux";
import { dispatchSelectedMesh } from "../redux/actions/meshActions";
import { useControls, Leva } from "leva";
import { memoize } from "proxy-memoize";
import { formatDate, formatTime, getRealFileUrl } from "../utils";

//hack
// all below not used
// import RedCapet from '../assets/RedCapet.png';
// import redCircle from '../assets/redCircle.png';
// import ColoredCircle from '../assets/pngwing.png';
// import RainBow from '../assets/pngRainbow.png';

let currTagPos = null
let currSpotlight = null
let currCameraPosition = null
let currCameraDirection = null
let currentCameraRotation = null

const cameraControls = {
  cameraSensitivity: { value: 1, min: 0, max: 10, step: 1 },
  // cameraSpeed: { value: 3, min: 0, max: 10, step:1 },
  zoomSensitivity: { value: 1, min: 0, max: 50, step: 1 },
  panSensitivity: { value: 1, min: 0, max: 10, step: 1 },
  angularSensibility: { value: 1000, min: 0, max: 5000, step: 500 },
  contrast: { value: 1, min: 0, max: 0.7, step: 0.1 },
  // zoomInertia: { value: 0.9, min: 0, max: 1, step:0.1 },
  // panInertia: { value: 0.9, min: 0, max: 1, step:0.1 },
  apply: true,
};

function updateCameraSettings(scene, controls) {
  scene.getCameraByName("camera0").angularSensibilityX =
    controls.angularSensibility;
  // scene.getCameraByName('camera0').speed = controls.cameraSpeed;
  scene.getCameraByName("camera0").angularSensibilityY =
    controls.angularSensibility;
  // scene.getCameraByName('camera0').panningSensibility = controls.panSensitivity;
  scene.getCameraByName("camera0").wheelPrecision = controls.zoomSensitivity;
  // scene.getCameraByName('camera0').inertia = controls.zoomInertia;
  scene.getCameraByName("camera0").pinchPrecision = controls.zoomSensitivity;
  scene.getCameraByName("camera0").pinchDeltaPercentage =
    controls.zoomSensitivity;

  // scene.getCameraByName("camera1").angularSensibilityX =
  //   controls.angularSensibility;
  // // scene.getCameraByName('camera1').speed = controls.cameraSpeed;
  // scene.getCameraByName("camera1").angularSensibilityY =
  //   controls.angularSensibility;
  // // scene.getCameraByName('camera1').panningSensibility = controls.panSensitivity;
  // scene.getCameraByName("camera1").wheelPrecision = controls.zoomSensitivity;
  // // scene.getCameraByName('camera1').inertia = controls.zoomInertia;
  // scene.getCameraByName("camera1").pinchPrecision = controls.zoomSensitivity;
  // scene.getCameraByName("camera1").pinchDeltaPercentage =
  //   controls.zoomSensitivity;
}

export function SceneComponent({
  baseUrl,
  filenameWithExtension,
  setIsLoading,
  tags,
  onSceneReady,
  ...rest
}) {
  const reactCanvas = useRef(null);
  const dispatch = useDispatch();
  const controls = useControls(cameraControls);
  // const [toolTipText, setToolTipText] = useState("undefined");
  const setting = useSelector((state) => state.settingState.setting);
  const [newTaggedInfoName, setNewTaggedInfoName] = useState("");
  const [newTaggedInfoPosition, setNewTaggedInfoPosition] = useState("");
  const [newTaggedInfo, setNewTaggedInfo] = useState({});
  // const modelInteractionData = useSelector(
  //   memoize((state) => state.selectedMeshState.data)
  // );

  const modelInterationActiveData = useSelector(
    memoize((state) => state.selectedMeshState.activeMeshData)
  );

  const destructureTaggedInfo = (modelInterationData) => {
    if (modelInterationData) {
      const newTaggedinfo = JSON.parse(modelInterationData);
      return [newTaggedinfo?.meshName, newTaggedinfo?.tagPosition];
    } else {
      return [];
    }
  };

  // const handleFilterTags = useCallback(
  //   (search) => {
  //     const regex = new RegExp(`.*${search.toLowerCase()}.*`, "i");

  //     const searchResult = tags?.filter((item) => {
  //       return (
  //         regex.test(item.objectName?.toLowerCase()) ||
  //         regex.test(item.taggedInfo?.toLowerCase())
  //       );
  //     });

  //     if (searchResult && searchResult[0]) {
  //       setToolTipText(searchResult[0].objectName);
  //     } else {
  //       setToolTipText("undefined");
  //     }
  //   },
  //   [tags]
  // );

  // useEffect(() => {
  //   if (newTaggedInfoName) {
  //     handleFilterTags(newTaggedInfoName);
  //   }
  // }, [handleFilterTags, newTaggedInfoName]);

  // useEffect(() => {
  //   createOrUpdateTooltip(toolTipText);
  // }, [toolTipText]);

  // hack
  // useEffect(() => {
  //   const [meshName, tagPosition] = destructureTaggedInfo(modelInteractionData);
  //   if (
  //     meshName &&
  //     destructureTaggedInfo(modelInterationActiveData?.taggedInfo)[0]
  //   ) {
  //     setNewTaggedInfoName(modelInterationActiveData.objectName);
  //   } else {
  //     setNewTaggedInfoName(meshName);
  //   }
  //   setNewTaggedInfoPosition(tagPosition);
  //   setNewTaggedInfo(modelInteractionData);
  // }, [modelInteractionData, modelInterationActiveData]);

  function delayCreateScene(engine, baseUrl, filenameWithExtension) {
    const scene = new Scene(engine);
    window.scene = scene // make global
    const canvas = document.getElementById("renderCanvas");
    const baseUrlWithSlash = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";

    const sunAngleCamera = new ArcRotateCamera(
      "camera0",
      Math.PI / 2,
      Math.PI / 2,
      100,
      new Vector3(0, 100, 0),
      scene
    );

    // hack
    sunAngleCamera.rotation = new Vector3(-Math.PI / 2, 0, 0);

    const light = new HemisphericLight("light", new Vector3(1, 1, 0), scene);
    light.intensity = controls.contrast;

    // this also saves the loaded file in indexedDb
    loadSceneFromGlb(getRealFileUrl(baseUrlWithSlash + filenameWithExtension), scene)

    let is2DView;

    const heatmapButton = document.getElementById("heatmapButton");
    heatmapButton.addEventListener("click", () => {
      scene.activeCamera =
        scene.activeCamera !== sunAngleCamera
          ? sunAngleCamera
          : scene.getCameraByName("camera1");
    });

    const screenshotButton = document.getElementById("screenshotButton");
    screenshotButton.addEventListener("click", () => {
      saveScreenshot(scene);
    });

    const OverlayButton2D = document.getElementById("2DOverlayButton");
    OverlayButton2D.addEventListener("click", () => {
      if (is2DView) {
        // Switch to 3D view
        scene.activeCamera.mode = Camera.PERSPECTIVE_CAMERA;
        is2DView = false;
      } else {
        // Switch to 2D view
        scene.activeCamera.mode = Camera.ORTHOGRAPHIC_CAMERA;
        is2DView = true;
      }
    });

    const transparentMaterial = new StandardMaterial(
      "transparentMaterial",
      scene
    );
    transparentMaterial.diffuseColor = new Color3(1, 1, 1);
    transparentMaterial.alpha = 0;
    transparentMaterial.specularColor = Color3.Black();
    transparentMaterial.emissiveColor = Color3.Black();
    transparentMaterial.ambientColor = Color3.Black();
    transparentMaterial.freeze();

    const dynamicTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI(
      "ImGUI",
      true,
      scene
    );

    const jetBox = MeshBuilder.CreateBox(
      "jetBox",
      { size: 0, height: 0, width: 0, updatable: true },
      scene
    );
    jetBox.visibility = 0;
    jetBox.isPickable = false;
    jetBox.scaling.setAll(1);
    jetBox.material = transparentMaterial;

    const ellipse_jetBox = new GUI.Ellipse("ellipse_jetBox");
    ellipse_jetBox.isPointerBlocker = true;
    ellipse_jetBox.height = "7px";
    ellipse_jetBox.width = "7px";
    ellipse_jetBox.alpha = 1;
    ellipse_jetBox.background = "blue";
    ellipse_jetBox.linkOffsetY = 0;
    ellipse_jetBox.isVisible = false;
    dynamicTexture.addControl(ellipse_jetBox);
    ellipse_jetBox.linkWithMesh(jetBox);

    scene.onBeforeRenderObservable.add(() => {
      if (scene.activeCamera === sunAngleCamera) {
        ellipse_jetBox.isVisible = true;
      } else {
        ellipse_jetBox.isVisible = false;
      }
    });
    const angle = 1 * (2 * Math.PI);
    const radius = 4;

    const camera1 = new FreeCamera(
      `camera1`,
      jetBox.position,
      scene
    );

    camera1.speed = 0.6

    camera1.lowerRadiusLimit = 0;
    camera1.upperRadiusLimit = 10;
    camera1.attachControl(canvas, true);
    camera1.position.copyFrom(jetBox.position);
    camera1.parent = jetBox;
    scene.addCamera(camera1);

    camera1.onViewMatrixChangedObservable.add(() => {
      hideSpotLight(scene)
    });

    scene.activeCamera = scene.getCameraByName("camera1");
    document.addEventListener("keydown", (event) => {
      // Check if the "=" key is pressed to flip between camera 0 and 1
      if (event.key === "=") {
        const selectedCamera =
          scene.activeCamera === scene.getCameraByName("camera1")
            ? scene.getCameraByName("camera0")
            : scene.getCameraByName("camera1");
        if (selectedCamera) {
          scene.activeCamera = selectedCamera;
        }
      }
    });

    scene.beginAnimation(jetBox, 0, 100, true);

    scene.onBeforeRenderObservable.addOnce(() => {
      BabylonControls(scene);
    });

    let boundaryRadius;
    let boundaryCenter;
    // scene.onReadyObservable.addOnce(() => {
    //   const loadedMeshes = scene.meshes;

    //   // Calculate the bounding box
    //   const centroid = Vector3.Zero();
    //   let maxExtent = 0;
    //   loadedMeshes.forEach((mesh) => {
    //     const tagPosition = mesh.getAbsolutePosition();
    //     centroid.addInPlace(tagPosition);
    //     const distance = Vector3.Distance(tagPosition, centroid);
    //     if (distance > maxExtent) {
    //       maxExtent = distance;
    //     }
    //   });
    //   centroid.scaleInPlace(1 / loadedMeshes.length);

    //   scene.getCameraByName("camera0").setTarget(centroid);
    //   jetBox.position.addInPlace(centroid);
    //   boundaryRadius = maxExtent;
    //   boundaryCenter = centroid.clone();
    // });

    // scene.onReadyObservable.addOnce(() => {
    //   // Check if the new position is within the boundary
    //   const newPosition = new Vector3(jetBox.position);
    //   const distanceToBoundaryCenter = Vector3.Distance(
    //     newPosition,
    //     boundaryCenter
    //   );

    //   if (distanceToBoundaryCenter <= boundaryRadius) {
    //     jetBox.position.copyFrom(newPosition);
    //   } else {
    //     jetBox.position.copyFrom(boundaryCenter);
    //   }
    // });

    scene.registerBeforeRender(() => {
      updateCameraSettings(scene, controls);
    });

    return [scene];
  }

  useEffect(() => {
    window.CANNON = cannon;

    setupDB()
      .then(db => {
      })
      .catch(error => {
        console.error("Database setup failed", error);
      });
    const { current: canvas } = reactCanvas;

    if (!canvas) return;

    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });
    // look here for additional info
    // https://doc.babylonjs.com/setup/support/webGPU/webGPUOptimization/webGPUSnapshotRendering/
    engine.snapshotRendering = true;
    engine.snapshotRenderingMode = BABYLON.Constants.SNAPSHOTRENDERING_STANDARD;
    const [scene] = delayCreateScene(engine, baseUrl, filenameWithExtension);

    const handleSceneReady = () => {
      onSceneReady(scene);
      setIsLoading(false);
      toast.success("model is ready!");
    };

    if (scene.isReady()) {
      tags.map((tag) => {
        let tagInfo = JSON.parse(tag.taggedInfo)
        drawTag(scene, tagInfo.tagPosition)
      });
      handleSceneReady();
    } else {
      scene.onReadyObservable.addOnce(handleSceneReady);
    }

    scene.onReadyObservable.addOnce(() => {
      setIsLoading(false);
    });

    scene.onDisposeObservable.addOnce(() => {
      setIsLoading(true);
    });

    const renderLoop = () => {
      scene.render();
    };

    engine.runRenderLoop(renderLoop);

    const resize = () => {
      scene.getEngine().resize();
    };

    window.addEventListener("resize", resize);

    return () => {
      // engine.stopRenderLoop(renderLoop);
      // scene.getEngine().dispose();
      // scene.dispose();
      // window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <Leva
        hideCopyButton={true}
        hidden={setting}
        collapsed={true}
        titleBar={{ drag: true, filter: false }}
      />
      <canvas
        id="renderCanvas"
        className="h-screen w-full cursor-pointer"
        ref={reactCanvas}
        // hack - remove external props to prevent rerender
        {...rest}
      />
    </>
  );
}

export function splitFileUrl(fileUrl) {
  const urlSplit = fileUrl.split("/")

  // Extract filename with extension
  const filenameWithExtension = urlSplit.pop();
  const baseUrl = urlSplit.pop()

  return [baseUrl, filenameWithExtension];
}

export const SpinnerOverlay = () => {
  return (
    <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black bg-opacity-80">
      <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-solid border-blue-500"></div>
    </div>
  );
};

/** purpose: is to display positions that contains tags  */
export function addAnchor(meshTaggedInfo, scene, onClick) {
  const position = JSON.parse(
    JSON.parse(meshTaggedInfo.taggedInfo).tagPosition
  );
  const name = JSON.parse(meshTaggedInfo.taggedInfo).name;
  const styles = {
    alpha: 1,
    backgroundColor: meshTaggedInfo?.type === "sampling" ? "red" : meshTaggedInfo?.type === "incident" ? "yellow" : meshTaggedInfo?.type === "safety" ? "green" : "pink",
    borderColor: "white",
    fontWeight: "300",
    height: 8,
    hoverCursor: "pointer",
    width: 8,
  };

  const sphere = MeshBuilder.CreateSphere(
    "taggedSphere",
    { diameter: 0, segments: 0, diameterX: 0, diameterY: 0, diameterZ: 0 },
    scene
  );
  sphere.position.copyFrom(new Vector3(position._x, position._y, position._z));
  sphere.visibility = 0;
  sphere.isVisible = false;
  sphere.alpha = 0;
  sphere.isPickable = false;
  sphere.renderingGroupId = 0;
  sphere.isNearPickable = false;
  sphere.scaling.setAll(0.3);

  const dynamicTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI(
    "ImGUI",
    true,
    scene
  );

  sphere.actionManager = new ActionManager(scene);

  // Show tooltip on hover
  sphere.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, function () {
      var tooltip = document.getElementById("tooltip");
      if (!tooltip) {
        tooltip = document.createElement("div");
        tooltip.id = "tooltip";
        tooltip.style =
          "position: absolute; display: none; background: rgba(0, 0, 0, 0.75); color: white; padding: 5px; border-radius: 5px; pointer-events: none;";
        document.body.appendChild(tooltip);
      }
      tooltip.innerHTML = `<p> ${meshTaggedInfo.objectName
        }<br/>
        <span class='text-xs'>${meshTaggedInfo?.type === "sampling" ? meshTaggedInfo?.sample?.name : "type"
        }: <span class='text-xs'>${meshTaggedInfo?.type === "sampling" ? meshTaggedInfo.presence : meshTaggedInfo?.type === "incident" ? meshTaggedInfo?.incident?.name : meshTaggedInfo?.type
        }</span></span>
        <br/><span class='text-xs'>Date: ${formatDate(
          meshTaggedInfo.createdAt
        )}</span><br/><span class='text-xs'>Time: ${formatTime(
          meshTaggedInfo.createdAt
        )}</span></p>`;
      tooltip.style.display = "block";
    })
  );

  // Hide tooltip when hover ends
  sphere.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, function () {
      var tooltip = document.getElementById("tooltip");
      if (!tooltip) {
        tooltip = document.createElement("div");
        tooltip.id = "tooltip";
        tooltip.style =
          "position: absolute; display: none; background: rgba(0, 0, 0, 0.75); color: white; padding: 5px; border-radius: 5px; pointer-events: none;";
        document.body.appendChild(tooltip);
      }
      tooltip.style.display = "none";
    })
  );

  const anchor = new GUI.Ellipse("anchor");
  anchor.isPointerBlocker = true;
  anchor.height = styles.height + "px";
  anchor.width = styles.width + "px";
  anchor.alpha = styles.alpha;
  anchor.color = styles.borderColor;
  anchor.background = styles.backgroundColor;
  anchor.linkOffsetY = 0;
  anchor.hoverCursor = styles.hoverCursor;
  anchor.isPickable = false;
  anchor.onPointerClickObservable.addOnce(() => {
    onClick(meshTaggedInfo, sphere.position);
  });
  dynamicTexture.addControl(anchor);
  anchor.linkWithMesh(sphere);
  sphere._freeze();
}

export const onSceneReady = (scene, dispatch) => {
  // hack
  // setupVideoRecording(scene);
  let selectedMesh = null;

  const jetBox = scene.getMeshByName("jetBox");

  scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
      const pickResult = pointerInfo.pickInfo

      // if (scene.activeCamera === scene.getCameraByName("camera1")) {
      //   updateSpotLight(pickResult, scene);
      // }

      if (pickResult.hit) {

        const pointCoordinates = pickResult.pickedPoint;
        if (scene.activeCamera === scene.getCameraByName("camera1")) {
          updateSpotLight(pickResult, scene);
        }

        if (pickResult.pickedMesh) {
          dispatch(
            dispatchSelectedMesh(
              JSON.stringify({
                tagPosition: extractPositionCoordinates(currTagPos || pointCoordinates),
                meshName: pickResult.pickedMesh?.name || "no name",
                cameraPosition: extractPositionCoordinates(currCameraPosition),
                cameraDirection: extractPositionCoordinates(currCameraDirection),
                cameraRotation: extractPositionCoordinates(currentCameraRotation)
              })
            )
          );
        }

        // const activeCamera = scene.activeCamera;
        // if (activeCamera && activeCamera.name === "camera0" && jetBox) {
        //   jetBox.position = pointCoordinates;
        // }
      }
    }
  })

  // Show information pop-up when hovering over a mesh
  scene.onPointerMove = function (evt, pickResult) {
    if (pickResult && pickResult.pickedMesh) {
      pickResult.pickedMesh.isPickable = true;
      if (selectedMesh && selectedMesh !== pickResult.pickedMesh) {
        hideTooltip();
      } else {
        showTooltip(evt.clientX, evt.clientY);
      }
    } else {
      hideTooltip();
    }
  };
};

export function showTooltip(clientX, clientY) {
  var tooltip = document.getElementById("tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "tooltip";
    tooltip.style =
      "position: absolute; display: none; background: rgba(0, 0, 0, 0.75); color: white; padding: 5px; border-radius: 5px; pointer-events: none;";
    document.body.appendChild(tooltip);
  }
  tooltip.style.left = clientX + 10 + "px";
  tooltip.style.top = clientY + 10 + "px";
  tooltip.style.display = "block";
}

export function createOrUpdateTooltip(objectName) {
  var tooltip = document.getElementById("tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "tooltip";
    tooltip.style =
      "position: absolute; display: none; background: rgba(0, 0, 0, 0.75); color: white; padding: 5px; border-radius: 5px; pointer-events: none;";
    document.body.appendChild(tooltip);
  }
  tooltip.textContent = objectName || "undefined";
}

export function hideTooltip() {
  var tooltip = document.getElementById("tooltip");
  if (tooltip) {
    tooltip.style.display = "none";
  }
}

export const stopRecording = (videoRecorder) => {
  videoRecorder.stopRecording((blob) => {
    const videoUrl = URL.createObjectURL(blob);
    const videoElement = document.createElement("a");
    videoElement.style.display = "block";
    videoElement.style.width = "300px";
    videoElement.style.height = "50px";
    videoElement.style.margin = "0 auto";
    videoElement.style.position = "absolute";
    videoElement.style.top = "10px";
    videoElement.style.zIndex = "999";
    videoElement.href = videoUrl;
    videoElement.download = "recorded_video.mp4";
    videoElement.innerHTML = "Download Video";
    document.body.appendChild(videoElement);
    toast.success("Video recording stopped successfully");
  });
  toast.success("Video recording stopped");
};

export function ensureHighlightableRecursively(mesh, scene) {
  // hack
  // if (
  //   mesh !== scene.getMeshByName("jetBox") ||
  //   mesh !== scene.getMeshByName("taggedSphere") ||
  //   mesh.name === "taggedSphere"
  // ) {
  //   mesh.isPickable = true;
  //   mesh.visibility = 1;
  //   mesh.isVisible = true;
  //   //  mesh.material = new StandardMaterial("defaultMaterial", scene);
  //   //   mesh.material.diffuseColor = mesh.material.diffuseColor;
  //   //   mesh.material.specularColor = mesh.material.specularColor;
  //   if (mesh.renderingGroupId === 0) {
  //     mesh.renderingGroupId = 1;
  //   }
  //   if (mesh.getChildMeshes) {
  //     var childMeshes = mesh.getChildMeshes();
  //     childMeshes.forEach(function (childMesh) {
  //       ensureHighlightableRecursively(childMesh, scene);
  //     });
  //   }
  // }
}

export function gridBoxOnMesh(mesh, scene) {
  const boundingBox = mesh.getBoundingInfo().boundingBox;
  const boundingBoxSize = boundingBox.maximum.subtract(boundingBox.minimum);
  const gridSize = 0.1;
  const gridColor = new Color3(0.0, 1.0, 0.0);
  const numGridBoxesX = Math.ceil(boundingBoxSize.x / gridSize);
  const numGridBoxesY = Math.ceil(boundingBoxSize.y / gridSize);
  const numGridBoxesZ = Math.ceil(boundingBoxSize.z / gridSize);
  for (let i = 0; i < numGridBoxesX; i++) {
    for (let j = 0; j < numGridBoxesY; j++) {
      for (let k = 0; k < numGridBoxesZ; k++) {
        const x = boundingBox.minimum.x + i * gridSize + gridSize / 2;
        const y = boundingBox.minimum.y + j * gridSize + gridSize / 2;
        const z = boundingBox.minimum.z + k * gridSize + gridSize / 2;
        const box = MeshBuilder.CreateBox("gridBox", { size: gridSize }, scene);
        box.position = new Vector3(x, y, z);
        box.material = new StandardMaterial("gridBoxMaterial", scene);
        box.material.diffuseColor = gridColor;
        box.isPickable = true;
        box.actionManager = new ActionManager(scene);
        box.actionManager.registerAction(
          new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
            box.material.emissiveColor = new Color3(1, 1, 1);
          })
        );
        box.actionManager.registerAction(
          new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
            box.material.emissiveColor = Color3.Black();
          })
        );
      }
    }
  }
}

export const startRecording = (videoRecorder) => {
  const maxRecordingDuration = 60 * 2 * 1000;
  videoRecorder.startRecording();
  toast.success("Video recording started");
  setTimeout(() => {
    stopRecording(videoRecorder);
  }, maxRecordingDuration);
};

export const setupVideoRecording = (scene) => {
  const engine = scene.getEngine();
  if (VideoRecorder.IsSupported(engine)) {
    const videoRecorder = new VideoRecorder(engine, { fps: 30 });
    const recordButton = document.getElementById("recordButton");
    recordButton.addEventListener("click", () => {
      if (!videoRecorder.isRecording) {
        startRecording(videoRecorder);
      } else {
        stopRecording(videoRecorder);
      }
    });
  }
};

export function saveScreenshot(scene) {
  Tools.CreateScreenshot(
    scene.getEngine(),
    scene.activeCamera,
    { width: 1024, height: 900 },
    function (data) {
      const imageUrl = URL.createObjectURL(data);
      const screenshotElement = document.createElement("a");
      screenshotElement.style.display = "none";
      screenshotElement.href = imageUrl;
      screenshotElement.download = "screenshot.jpeg";
      document.body.appendChild(screenshotElement);
      screenshotElement.click();
      document.body.removeChild(screenshotElement);
    }
  );
  toast.success("Screenshot saved");
}

export function updateSpotLight(pickInfo, scene) {
  hideSpotLight()
  const clickedPoint = pickInfo.pickedPoint;
  if (!clickedPoint) return
  updateCameraPosition(scene)
  let position = new Vector3(clickedPoint.x, clickedPoint.y + 1.7, clickedPoint.z);
  currTagPos = position
  window.currTagPos = currTagPos
  currSpotlight = createDiscAtPosition("spotLight", position, scene)
}

export function hideSpotLight() {
  if (currSpotlight) {
    currSpotlight.isVisible = false
    currSpotlight.dispose()
    currSpotlight = null
    currTagPos = null
    window.currTagPos = currTagPos
  }
}


function createDiscAtPosition(name, position, scene, isTag = false) {
  const disc = BABYLON.MeshBuilder.CreateDisc("disc", { radius: 0.5, tessellation: 64 }, scene);
  const material = new BABYLON.StandardMaterial(name, scene);
  if (isTag) {
    material.diffuseColor = new BABYLON.Color3(1, 0, 0); // red color
  } else {
    material.diffuseColor = new BABYLON.Color3(0, 0, 1); // Blue color
  }
  disc.material = material;
  applyMeshOptimizations(disc)
  disc.position = new Vector3(position.x, position.y - 1.6, position.z);
  disc.rotation.x = Math.PI / 2;
  return disc
}

export function drawTag(scene, position, name = `${Date.now()}`) {
  if (!position) return
  if (!scene) return
  createDiscAtPosition(name, position, scene, true)
}

export function replaceInstanceWithClone(instanceMesh) {

  if (!instanceMesh.ownerMesh) {
    console.warn("The provided mesh is not an instance mesh.");
    return;
  }
  var masterMesh = instanceMesh.ownerMesh;
  var clonedMesh = masterMesh.clone("clonedMesh");
  clonedMesh.position.copyFrom(instanceMesh.position);
  clonedMesh.rotationQuaternion.copyFrom(instanceMesh.rotationQuaternion);
  clonedMesh.scaling.copyFrom(instanceMesh.scaling);
  instanceMesh.dispose();

  return clonedMesh;
}

export function deconstructMesh(mesh, scene) {
  if (mesh.subMeshes.length > 1) {
    var otherVertexData = VertexData.ExtractFromMesh(mesh, true, true);
    var indices = otherVertexData.indices;
    var normals = otherVertexData.normals;
    var positions = otherVertexData.positions;
    var uvs = otherVertexData.uvs;
    var newMeshArray = [];
    for (let index = 0; index < mesh.subMeshes.length; index++) {
      var newVertexData = new VertexData();

      var newI = indices.slice(mesh.subMeshes[index].indexStart, mesh.subMeshes[index].indexStart + mesh.subMeshes[index].indexCount);
      var newN = normals.slice(mesh.subMeshes[index].verticesStart * 3, mesh.subMeshes[index].verticesStart * 3 + mesh.subMeshes[index].verticesCount * 3);
      var newP = positions.slice(mesh.subMeshes[index].verticesStart * 3, mesh.subMeshes[index].verticesStart * 3 + mesh.subMeshes[index].verticesCount * 3);
      var newU = uvs.slice(mesh.subMeshes[index].verticesStart * 2, mesh.subMeshes[index].verticesStart * 2 + mesh.subMeshes[index].verticesCount * 2);
      for (let subIndex = 0; subIndex < newI.length; subIndex++) {
        newI[subIndex] = newI[subIndex] - mesh.subMeshes[index].verticesStart;
      }

      newVertexData.indices = newI;
      newVertexData.normals = newN;
      newVertexData.positions = newP;
      newVertexData.uvs = newU;

      var meshSubclass = new Mesh(mesh.name + '-' + index, scene);

      newVertexData.applyToMesh(meshSubclass);

      newMeshArray.push(meshSubclass);
    }
    return newMeshArray;
  } else {
    return [mesh];
  }
}

function optimizeScene(scene) {
  // this improved perf significantly with some caveats
  // look here https://doc.babylonjs.com/features/featuresDeepDive/scene/optimize_your_scene#aggressive-mode
  scene.performancePriority = BABYLON.ScenePerformancePriority.Aggressive
  // scene.performancePriority = BABYLON.ScenePerformancePriority.Intermediate
  // scene.freezeActiveMeshes()
  scene.autoClear = true
  // const optimizer = BABYLON.SceneOptimizer.OptimizeAsync(scene);
  // optimizer.start();
}

function updateCameraPosition(scene) {
  currCameraPosition = scene.activeCamera.position
  window.currCameraPosition = currCameraPosition   // to-do: use redux
  currCameraDirection = scene.activeCamera.getForwardRay().direction.clone()
  window.currCameraDirection = currCameraDirection
  currentCameraRotation = scene.activeCamera.rotation
  window.currentCameraRotation = currentCameraRotation
}

function applyMeshOptimizations(mesh) {
  // applyOcclusionAlgo(mesh)
  mesh.isReady() && mesh.freezeWorldMatrix()
  mesh.cullingStrategy = BABYLON.AbstractMesh.CULLINGSTRATEGY_BOUNDINGSPHERE_ONLY
  mesh.isPickable = true // because .performancePriority == BABYLON.ScenePerformancePriority.Aggressive
}

function applyOpRecursivelyOnSubmeshes(mesh, op) {
  if (mesh.__visited__) return
  // maybe meshes could contain parent meshes as submeshes?
  // so this is a hack to prevent cyclical recursion
  // now this implies applyOpRecursivelyOnSubmeshes can only be called
  // only once in one place
  mesh.__visited__ = true
  op(mesh)
  mesh.subMeshes?.forEach(m => applyOpRecursivelyOnSubmeshes(m, op))
}

function applyOcclusionAlgo(mesh) {
  // does not work well
  mesh.occlusionRetryCount = 5
  mesh.occlusionQueryAlgorithmType = BABYLON.AbstractMesh.OCCLUSION_ALGORITHM_TYPE_ACCURATE
  mesh.occlusionType = BABYLON.AbstractMesh.OCCLUSION_TYPE_STRICT
}

function loadSceneFromGlb(url, scene) {
  const urlSplit = url.split("/")
  let fileName = urlSplit.pop()
  // deleteFromDb(url).then(console.log) // just in case to force refetch
  // return
  checkUrlInIndexedDb(url)
    .then(result => {
      console.log(result)
      if (result.isInDb) {
        const glFile = new File([result.blob], fileName, {
          // type: "model/gltf-binary"
        });

        importGLFileInScene(glFile, scene)
      } else {
        fetch(url)
          .then((response) => response.blob())
          .then((blob) => {

            const glFile = new File([blob], fileName, {
              // type: "model/gltf-binary"
            });

            storeBlobInDb(url, blob)

            importGLFileInScene(glFile, scene)
          });
      }
    })
}

function importGLFileInScene(glFile, scene) {
  SceneLoader.ImportMeshAsync("", "", glFile, scene).then((result) => {
    result.meshes.forEach(mesh => {
      applyOpRecursivelyOnSubmeshes(mesh, () => {
        applyMeshOptimizations(mesh)
      })
    });
    optimizeScene(scene)
    centerCameras(scene)
  });
}

function centerCameras(scene) {
  const loadedMeshes = scene.meshes;

  // Calculate the bounding box
  const centroid = Vector3.Zero();
  let maxExtent = 0;
  loadedMeshes.forEach((mesh) => {
    const tagPosition = mesh.getAbsolutePosition();
    centroid.addInPlace(tagPosition);
    const distance = Vector3.Distance(tagPosition, centroid);
    if (distance > maxExtent) {
      maxExtent = distance;
    }
  });
  centroid.scaleInPlace(1 / loadedMeshes.length);

  // scene.getCameraByName("camera0").setTarget(centroid.clone())
  // scene.getCameraByName("camera0").radius = 10
  scene.getCameraByName("camera1").position = centroid.clone()
}

export function resetCameraLocation(desc) {
  if (!desc) return
  if (!window.scene) return
  let scene = window.scene
  let camera = scene.getCameraByName("camera1")
  if (!camera) return
  if (typeof desc === "string") {
    desc = JSON.parse(desc)
  }
  camera.position = new Vector3(
    desc.cameraPosition.x,
    desc.cameraPosition.y,
    desc.cameraPosition.z,
  )
  camera.direction = new Vector3(
    desc.cameraDirection.x,
    desc.cameraDirection.y,
    desc.cameraDirection.z,
  )
  camera.rotation = new Vector3(
    desc.cameraRotation.x,
    desc.cameraRotation.y,
    desc.cameraRotation.z,
  )
}

function extractPositionCoordinates(position) {
  let x = 0
  let y = 0
  let z = 0
  if (!position) return { x, y, z }
  x = position.x
  y = position.y
  z = position.z
  return { x, y, z }
}

function getBlobFromDb(url) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("models", 1);

    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction(["glb"], "readwrite");
      const store = transaction.objectStore("glb");

      const objectStoreRequest = store.get(url);
      objectStoreRequest.onsuccess = (e) => {
        if (!objectStoreRequest.result) return reject({ error: "no record in db for " + url })
        resolve(objectStoreRequest.result.blob);
      };

      objectStoreRequest.onerror = (e) => {
        reject({ error: "failed to retrieve data for " + url });
      };
    };

    request.onerror = (event) => {
      reject({ error: "Failed to open database", event: event });
    };
  });
}

function storeBlobInDb(url, blob) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("models", 1);

    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction(["glb"], "readwrite");
      const store = transaction.objectStore("glb");

      const objectStoreRequest = store.put({ url, blob });
      objectStoreRequest.onsuccess = () => {
        resolve({ success: "data stored for " + url });
      };

      objectStoreRequest.onerror = () => {
        reject({ error: "failed to store data for " + url });
      };
    };

    request.onerror = (event) => {
      reject({ error: "Failed to open database", event: event });
    };
  });
}

function deleteFromDb(url) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("models", 1);

    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction(["glb"], "readwrite");
      const store = transaction.objectStore("glb");

      const objectStoreRequest = store.delete(url);
      objectStoreRequest.onsuccess = () => {
        resolve({ success: "data deleted for " + url });
      };

      objectStoreRequest.onerror = () => {
        reject({ error: "failed to delete data for " + url });
      };
    };

    request.onerror = (event) => {
      reject({ error: "Failed to open database", event: event });
    };
  });
}

function checkUrlInIndexedDb(url) {
  return getBlobFromDb(url)
    .then(blob => {
      return { isInDb: true, blob }
    })
    .catch(() => {
      return { isInDb: false }
    })
}

function indexDb() {

  // Store the blob
  function storeBlob(blob) {
    const request = indexedDB.open("models", 1);

    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction("glb", "readwrite");
      const store = transaction.objectStore("glb");

      // Put the blob data into the store with a unique id
      const id = Date.now(); // or generate any unique ID
      store.put({ id, blob });
    };
  }

  // Example: storing a 1GB blob
  const blob = new Blob([new Uint8Array(1e9)], { type: "application/octet-stream" });
  storeBlob(blob);

}

function setupDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("models", 1);

    // Handle database setup
    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("glb")) {
        db.createObjectStore("glb", { keyPath: "url" });
      }
    };

    request.onsuccess = function (event) {
      const db = event.target.result;
      resolve(db);
    };

    request.onerror = function (event) {
      reject(event);
    };
  });
}