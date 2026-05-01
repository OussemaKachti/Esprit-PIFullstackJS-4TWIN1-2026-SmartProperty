import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import Marzipano from 'marzipano';
import screenfull from 'screenfull';
import toast from 'react-hot-toast';

type ViewParams = { pitch: number; yaw: number; fov: number };

interface Hotspot {
    linkId?: string;
    yaw: number;
    pitch: number;
    target: string;
    /** When set, visitors arriving via this link see this view instead of the room's default checkpoint */
    targetViewParameters?: ViewParams;
}

interface Panorama {
    id: string;
    name: string;
    url: string;
    linkHotspots?: Hotspot[];
    initialViewParameters?: { pitch: number; yaw: number; fov: number };
}

interface PanoramaManagerProps {
    propertyId: string;
    initialPanoramas: Panorama[];
    onSave: (panoramas: Panorama[]) => Promise<void>;
    onClose: () => void;
    apiUrl: string;
}

type LinkLandingFlowState =
    | null
    | { phase: 'choose'; sourceId: string; targetId: string; targetName: string; linkId: string; chainBackLink: boolean }
    | { phase: 'aim'; sourceId: string; targetId: string; targetName: string; linkId: string; chainBackLink: boolean };

const HOTSPOT_PLACEMENT_ARM_DELAY_MS = 450;
const HOTSPOT_PLACEMENT_MAX_DRIFT_PX = 8;

const PanoViewer = forwardRef(function PanoViewer(
    { panoramas, onSceneChange, autorotateEnabled, apiBaseUrl }: { panoramas: Panorama[], onSceneChange: (name: string, sceneId: string) => void, autorotateEnabled: boolean, apiBaseUrl: string },
    ref
) {
    const panoRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<any>(null);
    const scenesRef = useRef<any[]>([]);
    const autorotateRef = useRef<any>(null);
    const autorotateEnabledRef = useRef(autorotateEnabled);
    const placingCallbackRef = useRef<((coords: { yaw: number, pitch: number }) => void) | null>(null);
    const placementReadyAtRef = useRef(0);
    const pointerDownRef = useRef<{ x: number; y: number } | null>(null);
    const pointerMovedRef = useRef(false);

    useEffect(() => {
        if (!panoRef.current || panoramas.length === 0) return;

        // If viewer already exists, update scenes dynamically
        if (viewerRef.current) return;

        const viewer = new Marzipano.Viewer(panoRef.current, {
            controls: { mouseViewMode: 'drag' },
        });
        viewerRef.current = viewer;

        const autorotate = Marzipano.autorotate({
            yawSpeed: 0.03,
            targetPitch: 0,
            targetFov: Math.PI / 2,
        });
        autorotateRef.current = autorotate;

        function startAutorotate() {
            if (!autorotateEnabledRef.current) return;
            viewer.setIdleMovement(3000, autorotate);
        }

        function stopAutorotate() {
            viewer.stopMovement();
            viewer.setIdleMovement(Infinity);
        }

        function switchScene(sceneObj: any, viewOverride?: ViewParams) {
            stopAutorotate();
            const params = viewOverride || sceneObj.data.initialViewParameters || { pitch: 0, yaw: 0, fov: 1.5707963267948966 };
            sceneObj.view.setParameters(params);
            sceneObj.scene.switchTo();
            startAutorotate();
            onSceneChange(sceneObj.data.name, sceneObj.data.id);
        }

        viewerRef.current._switchScene = switchScene;

        const scenes = panoramas.map((sceneData) =>
            buildScene(viewer, sceneData, scenesRef, switchScene, apiBaseUrl)
        );
        scenesRef.current = scenes;

        if (scenes.length > 0) {
            switchScene(scenes[0]);
        }

        const panoEl = panoRef.current;
        function handlePointerDown(e: PointerEvent) {
            pointerDownRef.current = { x: e.clientX, y: e.clientY };
            pointerMovedRef.current = false;
        }

        function handlePointerMove(e: PointerEvent) {
            if (!pointerDownRef.current) return;
            const dx = e.clientX - pointerDownRef.current.x;
            const dy = e.clientY - pointerDownRef.current.y;
            if (Math.hypot(dx, dy) > HOTSPOT_PLACEMENT_MAX_DRIFT_PX) {
                pointerMovedRef.current = true;
            }
        }

        function handlePointerUp() {
            window.setTimeout(() => {
                pointerDownRef.current = null;
                pointerMovedRef.current = false;
            }, 0);
        }

        function handleCanvasClick(e: MouseEvent) {
            if (!placingCallbackRef.current) return;
            if (Date.now() < placementReadyAtRef.current || pointerMovedRef.current) return;

            const coords = viewer.view().screenToCoordinates({
                x: e.clientX,
                y: e.clientY,
            });
            placingCallbackRef.current(coords);
            placingCallbackRef.current = null;
            placementReadyAtRef.current = 0;
        }
        panoEl.addEventListener('pointerdown', handlePointerDown);
        panoEl.addEventListener('pointermove', handlePointerMove);
        panoEl.addEventListener('pointerup', handlePointerUp);
        panoEl.addEventListener('pointercancel', handlePointerUp);
        panoEl.addEventListener('click', handleCanvasClick);

        return () => {
            panoEl.removeEventListener('pointerdown', handlePointerDown);
            panoEl.removeEventListener('pointermove', handlePointerMove);
            panoEl.removeEventListener('pointerup', handlePointerUp);
            panoEl.removeEventListener('pointercancel', handlePointerUp);
            panoEl.removeEventListener('click', handleCanvasClick);
            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
        };
    }, [panoramas, apiBaseUrl]); // Re-init/sync when panoramas change


    useImperativeHandle(ref, () => ({
        switchSceneById(id: string) {
            const scene = scenesRef.current.find((s) => s.data.id === id);
            if (scene) viewerRef.current._switchScene(scene);
        },
        getScenes() {
            return scenesRef.current;
        },
        addScene(sceneData: Panorama) {
            const viewer = viewerRef.current;
            if (!viewer) return;
            const sceneObj = buildScene(viewer, sceneData, scenesRef, viewerRef.current._switchScene, apiBaseUrl);
            scenesRef.current = [...scenesRef.current, sceneObj];
            return sceneObj;
        },
        deleteScene(id: string) {
            const viewer = viewerRef.current;
            if (!viewer) return;

            const current = scenesRef.current.find((s) => s.scene === viewer.scene());
            if (current?.data.id === id) {
                const fallback = scenesRef.current.find((s) => s.data.id !== id);
                if (fallback) viewerRef.current._switchScene(fallback);
            }

            scenesRef.current.forEach((sceneObj) => {
                if (sceneObj.data.id === id) return;
                const container = sceneObj.scene.hotspotContainer();
                const hotspots = container.listHotspots();
                hotspots.forEach((h: any) => {
                    const el = typeof h.domElement === 'function' ? h.domElement() : h._domElement;
                    if (el && el._targetId === id) {
                        container.destroyHotspot(h);
                    }
                });
                sceneObj.data.linkHotspots = (sceneObj.data.linkHotspots || []).filter((lh: any) => lh.target !== id);
            });

            scenesRef.current = scenesRef.current.filter((s) => s.data.id !== id);
        },
        setAutorotate(enabled: boolean) {
            autorotateEnabledRef.current = enabled;
            const viewer = viewerRef.current;
            if (!viewer) return;
            if (enabled) {
                viewer.startMovement(autorotateRef.current);
                viewer.setIdleMovement(3000, autorotateRef.current);
            } else {
                viewer.stopMovement();
                viewer.setIdleMovement(Infinity);
            }
        },
        toggleFullscreen() {
            if (screenfull.isEnabled && panoRef.current) screenfull.toggle(panoRef.current);
        },
        startPlacingHotspot(callback: (coords: { yaw: number, pitch: number }) => void) {
            placingCallbackRef.current = callback;
            placementReadyAtRef.current = Date.now() + HOTSPOT_PLACEMENT_ARM_DELAY_MS;
            pointerDownRef.current = null;
            pointerMovedRef.current = false;
            viewerRef.current?.stopMovement();
        },
        cancelPlacingHotspot() {
            placingCallbackRef.current = null;
            placementReadyAtRef.current = 0;
            pointerDownRef.current = null;
            pointerMovedRef.current = false;
        },
        addLinkHotspot(yaw: number, pitch: number, targetId: string, opts?: { targetViewParameters?: ViewParams; linkId?: string }) {
            const viewer = viewerRef.current;
            if (!viewer) return '';
            const currentScene = scenesRef.current.find(
                (s) => s.scene === viewer.scene()
            );
            if (!currentScene) return '';
            const linkId = opts?.linkId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `link-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
            const hotspot: Hotspot = {
                linkId,
                yaw,
                pitch,
                target: targetId,
                ...(opts?.targetViewParameters ? { targetViewParameters: opts.targetViewParameters } : {}),
            };
            const el = createLinkHotspotElement(hotspot, scenesRef, viewerRef.current._switchScene, currentScene.data.id);
            currentScene.scene.hotspotContainer().createHotspot(el, { yaw, pitch });
            currentScene.data.linkHotspots = [...(currentScene.data.linkHotspots || []), hotspot];
            return linkId;
        },
        setLinkTargetView(sourceSceneId: string, linkId: string, vp: ViewParams | null) {
            const sceneObj = scenesRef.current.find((s) => s.data.id === sourceSceneId);
            if (!sceneObj?.data.linkHotspots) return;
            const h = sceneObj.data.linkHotspots.find((x: Hotspot) => x.linkId === linkId);
            if (!h) return;
            if (vp) h.targetViewParameters = { ...vp };
            else delete h.targetViewParameters;
        },
        getCurrentSceneId() {
            const viewer = viewerRef.current;
            if (!viewer) return null;
            const scene = scenesRef.current.find(s => s.scene === viewer.scene());
            return scene ? scene.data.id : null;
        },
        getCurrentView() {
            const viewer = viewerRef.current;
            if (!viewer) return null;
            const view = viewer.view();
            return {
                yaw: view.yaw(),
                pitch: view.pitch(),
                fov: view.fov()
            };
        },
        zoom(delta: number) {
            const viewer = viewerRef.current;
            if (!viewer) return;
            const view = viewer.view();
            view.setParameters({ fov: view.fov() * delta });
        },
        move(dir: string) {
            const viewer = viewerRef.current;
            if (!viewer) return;
            const view = viewer.view();
            const params = view.parameters();
            if (dir === 'left') view.setParameters({ yaw: params.yaw - 0.1 });
            if (dir === 'right') view.setParameters({ yaw: params.yaw + 0.1 });
            if (dir === 'up') view.setParameters({ pitch: params.pitch - 0.1 });
            if (dir === 'down') view.setParameters({ pitch: params.pitch + 0.1 });
        }
    }));

    return <div id="pano" ref={panoRef} className="absolute inset-0 overflow-hidden bg-black" />;
});

function buildScene(
    viewer: any,
    sceneData: Panorama,
    scenesRef: React.MutableRefObject<any[]>,
    switchSceneFn: (s: any, viewOverride?: ViewParams) => void,
    apiBaseUrl: string
) {
    let cleanPath = sceneData.url.replace(/\\/g, '/');
    if (cleanPath.includes('uploads/')) {
        cleanPath = cleanPath.substring(cleanPath.indexOf('uploads/'));
    } else if (!cleanPath.startsWith('http')) {
        cleanPath = `uploads/${cleanPath}`;
    }
    const imageUrl = cleanPath.startsWith('http') ? cleanPath : `${apiBaseUrl}/${cleanPath}`;
    const source = Marzipano.ImageUrlSource.fromString(imageUrl);
    const geometry = new Marzipano.EquirectGeometry([{ width: 4000 }]);
    const limiter = Marzipano.RectilinearView.limit.traditional(
        4000,
        (100 * Math.PI) / 180,
        (120 * Math.PI) / 180
    );
    const view = new Marzipano.RectilinearView(
        sceneData.initialViewParameters || { pitch: 0, yaw: 0, fov: 1.5707963267948966 },
        limiter
    );
    const scene = viewer.createScene({ source, geometry, view });

    const hotspotElements: HTMLElement[] = [];
    (sceneData.linkHotspots || []).forEach((hotspot) => {
        const el = createLinkHotspotElement(hotspot, scenesRef, switchSceneFn, sceneData.id);
        scene.hotspotContainer().createHotspot(el, { yaw: hotspot.yaw, pitch: hotspot.pitch });
        hotspotElements.push(el);
    });

    return { data: sceneData, scene, view, hotspots: hotspotElements };
}

function createLinkHotspotElement(
    hotspot: Hotspot,
    scenesRef: React.MutableRefObject<any[]>,
    switchSceneFn: (s: any, viewOverride?: ViewParams) => void,
    sourceSceneId: string
) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('hotspot', 'link-hotspot');
    (wrapper as any)._targetId = hotspot.target;

    const icon = document.createElement('img');
    icon.src = '/img/link.png';
    icon.classList.add('link-hotspot-icon');
    wrapper.appendChild(icon);

    const tooltip = document.createElement('div');
    tooltip.classList.add('link-hotspot-tooltip');
    const targetData = (scenesRef.current || []).find((s) => s.data.id === hotspot.target);
    tooltip.textContent = targetData ? targetData.data.name : hotspot.target;
    wrapper.appendChild(tooltip);

    wrapper.addEventListener('click', () => {
        const sourceEntry = scenesRef.current.find((s) => s.data.id === sourceSceneId);
        const list = (sourceEntry?.data.linkHotspots || []) as Hotspot[];
        const stored = hotspot.linkId
            ? list.find((h) => h.linkId === hotspot.linkId)
            : list.find(
                  (h) =>
                      h.target === hotspot.target &&
                      Math.abs(h.yaw - hotspot.yaw) < 1e-6 &&
                      Math.abs(h.pitch - hotspot.pitch) < 1e-6
              );
        const targetId = stored?.target ?? hotspot.target;
        const override = stored?.targetViewParameters;
        const target = scenesRef.current.find((s) => s.data.id === targetId);
        if (target) switchSceneFn(target, override);
    });

    return wrapper;
}

export default function PanoramaManager({ propertyId, initialPanoramas, onSave, onClose, apiUrl }: PanoramaManagerProps) {
    useEffect(() => {
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, []);

    const [panoramas, setPanoramas] = useState<Panorama[]>(initialPanoramas);
    const [currentSceneId, setCurrentSceneId] = useState<string | null>(panoramas.length > 0 ? panoramas[0].id : null);
    const [sceneName, setSceneName] = useState<string>(panoramas.length > 0 ? panoramas[0].name : "");
    const [placingHotspotFor, setPlacingHotspotFor] = useState<{ id: string, name: string, chainBackLink: boolean } | null>(null);
    const [linkLandingFlow, setLinkLandingFlow] = useState<LinkLandingFlowState>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [autorotate, setAutorotate] = useState(true);
    const [uploadName, setUploadName] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [panelOpen, setPanelOpen] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const viewerRef = useRef<any>(null);

    const handleFile = async (file: File | undefined) => {
        if (!uploadName.trim()) {
            toast.error('Please enter a room name before uploading the panorama.');
            return;
        }
        if (!file || !file.type.startsWith('image/')) return;
        setIsUploading(true);

        const formData = new FormData();
        const safeName = uploadName.trim();
        const ext = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : '';
        const newFile = new File([file], `${safeName}${ext}`, { type: file.type });
        formData.append(`pano0`, newFile);

        try {
            const response = await fetch(`${apiUrl}/properties/${propertyId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                const updatedProperty = data.data || data;
                const newPanoList = updatedProperty.panoramas || [];
                const newlyAdded = newPanoList.find((p: any) => p.name === safeName) || newPanoList[newPanoList.length - 1];

                if (newlyAdded) {
                    if (viewerRef.current && panoramas.length > 0) {
                        viewerRef.current.addScene(newlyAdded);
                        const updatedScenes = viewerRef.current.getScenes()?.map((s: any) => s.data) || newPanoList;
                        setPanoramas(updatedScenes);
                    } else {
                        setPanoramas(newPanoList);
                    }

                    if (!currentSceneId && newPanoList.length === 1) {
                        setCurrentSceneId(newlyAdded.id);
                        setSceneName(newlyAdded.name);
                    }

                    if (newPanoList.length > 1) {
                        window.setTimeout(() => {
                            handleAddHotspot(newlyAdded.id, newlyAdded.name, true);
                        }, 250);
                    }
                }

                setUploadName('');
                toast.success("Room uploaded successfully");
            } else {
                toast.error("Failed to upload room");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error uploading room");
        } finally {
            setIsUploading(false);
            setDragOver(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    function runChainIfNeeded(chainBackLink: boolean, sourceId: string, targetId: string) {
        if (!chainBackLink || sourceId === targetId) return;
        window.setTimeout(() => {
            viewerRef.current?.switchSceneById(targetId);
            setCurrentSceneId(targetId);
            const scenes = viewerRef.current?.getScenes() || [];
            const updated = scenes.map((s: any) => s.data);
            const targetScene = updated.find((s: any) => s.id === targetId);
            if (targetScene) setSceneName(targetScene.name);
            window.setTimeout(() => {
                const sourceScene = updated.find((s: any) => s.id === sourceId);
                if (sourceScene) handleAddHotspot(sourceId, sourceScene.name, false);
            }, 800);
        }, 700);
    }

    const handleAddHotspot = (targetId: string, targetName: string, chainBackLink = true) => {
        const sourceId = viewerRef.current?.getCurrentSceneId();
        if (!sourceId) return;

        setLinkLandingFlow(null);
        setPlacingHotspotFor({ id: targetId, name: targetName, chainBackLink });
        viewerRef.current?.startPlacingHotspot((coords: { yaw: number, pitch: number }) => {
            const linkId = viewerRef.current?.addLinkHotspot(coords.yaw, coords.pitch, targetId);
            setPlacingHotspotFor(null);

            const scenes = viewerRef.current?.getScenes() || [];
            const updated = scenes.map((s: any) => s.data);
            setPanoramas(updated);

            if (linkId) {
                setLinkLandingFlow({
                    phase: 'choose',
                    sourceId,
                    targetId,
                    targetName,
                    linkId,
                    chainBackLink,
                });
            } else {
                runChainIfNeeded(chainBackLink, sourceId, targetId);
            }
        });
    };

    const finishLinkLanding = (flow: NonNullable<LinkLandingFlowState>) => {
        setLinkLandingFlow(null);
        runChainIfNeeded(flow.chainBackLink, flow.sourceId, flow.targetId);
    };

    const handleSetCheckpoint = () => {
        const view = viewerRef.current?.getCurrentView();
        const sceneId = viewerRef.current?.getCurrentSceneId();
        if (view && sceneId) {
            setPanoramas(prev => prev.map(s =>
                s.id === sceneId ? { ...s, initialViewParameters: view } : s
            ));
            toast.success("Initial view (checkpoint) saved for this scene");
        }
    };

    const handleRenameScene = (id: string, newName: string) => {
        setPanoramas(prev => prev.map(s => s.id === id ? { ...s, name: newName } : s));
        if (id === currentSceneId) {
            setSceneName(newName);
        }
    };

    const handleSave = async () => {
        await onSave(panoramas);
        onClose();
    };

    const handleDeletePanorama = (id: string) => {
        if (!window.confirm("Are you sure you want to delete this room and all links to it?")) return;
        viewerRef.current?.deleteScene(id);

        if (currentSceneId === id) {
            const next = panoramas.find(p => p.id !== id);
            setCurrentSceneId(next ? next.id : null);
            setSceneName(next ? next.name : "");
        }

        const scenes = viewerRef.current?.getScenes() || [];
        setPanoramas(scenes.map((s: any) => s.data));
    };

    const bodyClasses = [
        'desktop',
        'multiple-scenes',
        placingHotspotFor ? 'placing-hotspot' : '',
    ].filter(Boolean).join(' ');

    return createPortal(
        <div className="panorama-editor-scope fixed inset-0 z-[200000] bg-black" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            <div id="app-root" className={bodyClasses} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', color: '#fff', background: '#000' }}>

                {/* Panorama viewer using 360-feature-identical structure */}
                {panoramas.length > 0 ? (
                    <PanoViewer
                        ref={viewerRef}
                        panoramas={panoramas}
                        onSceneChange={(name, sceneId) => {
                            setSceneName(name);
                            setCurrentSceneId(sceneId);
                        }}
                        autorotateEnabled={autorotate}
                        apiBaseUrl={apiUrl.replace('/api', '')}
                    />
                ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>▧</div>
                            <p>No panoramas uploaded yet. Add a room below.</p>
                        </div>
                    </div>
                )}

                {/* TitleBar — same as 360 feature */}
                <div id="titleBar">
                    <div className="scene-thumb-container">
                        {(() => {
                            const cur = panoramas.find(p => p.id === currentSceneId);
                            if (!cur) return null;
                            let cleanPath = cur.url.replace(/\\/g, '/');
                            if (cleanPath.includes('uploads/')) cleanPath = cleanPath.substring(cleanPath.indexOf('uploads/'));
                            else if (!cleanPath.startsWith('http')) cleanPath = `uploads/${cleanPath}`;
                            const src = cleanPath.startsWith('http') ? cleanPath : `${apiUrl.replace('/api', '')}/${cleanPath}`;
                            return <img src={src} alt="" className="current-scene-thumb" />;
                        })()}
                    </div>
                    <div className="sceneName">{sceneName}</div>
                    <div
                        id="autorotateToggle"
                        className={autorotate ? 'enabled' : ''}
                        onClick={() => { const next = !autorotate; setAutorotate(next); viewerRef.current?.setAutorotate(next); }}
                        title="Toggle autorotate"
                        style={{ cursor: 'pointer' }}
                    >
                        <img className="icon on" src="/img/pause.png" alt="" />
                        <img className="icon off" src="/img/play.png" alt="" />
                    </div>
                    {/* Save & Close */}
                    <div style={{ position: 'absolute', top: 0, left: 0, height: 40, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', zIndex: 200 }}>
                        <button
                            onClick={handleSave}
                            style={{ background: '#4a90d9', color: '#fff', border: 'none', padding: '4px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer', letterSpacing: 1 }}
                        >SAVE</button>
                        <button
                            onClick={onClose}
                            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '4px 10px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                        >✕</button>
                    </div>
                </div>

                {/* Per-link landing: default checkpoint vs custom view */}
                {linkLandingFlow && !placingHotspotFor && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 56,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 130,
                            maxWidth: 'min(520px, 92vw)',
                            background: 'rgba(0,0,0,0.82)',
                            border: '1px solid rgba(255,255,255,0.25)',
                            borderRadius: 8,
                            padding: '12px 16px',
                            color: '#fff',
                            fontSize: 13,
                            lineHeight: 1.45,
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        }}
                    >
                        {linkLandingFlow.phase === 'choose' ? (
                            <>
                                <div style={{ marginBottom: 10 }}>
                                    Link to <strong>{linkLandingFlow.targetName}</strong> — choose where visitors arrive when they use this link (not only the room’s default checkpoint).
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            viewerRef.current?.setLinkTargetView(linkLandingFlow.sourceId, linkLandingFlow.linkId, null);
                                            const scenes = viewerRef.current?.getScenes() || [];
                                            setPanoramas(scenes.map((s: any) => s.data));
                                            toast.success('Link uses the room default checkpoint');
                                            finishLinkLanding(linkLandingFlow);
                                        }}
                                        style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', borderRadius: 4 }}
                                    >
                                        Default checkpoint
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            viewerRef.current?.switchSceneById(linkLandingFlow.targetId);
                                            setCurrentSceneId(linkLandingFlow.targetId);
                                            setSceneName(linkLandingFlow.targetName);
                                            setLinkLandingFlow({ ...linkLandingFlow, phase: 'aim' });
                                        }}
                                        style={{ background: '#4a90d9', color: '#fff', border: 'none', padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', borderRadius: 4 }}
                                    >
                                        Choose landing view…
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ marginBottom: 10 }}>
                                    Aim the camera in <strong>{linkLandingFlow.targetName}</strong>, then save as the landing view for this link.
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const scenes = viewerRef.current?.getScenes() || [];
                                            const src = scenes.map((s: any) => s.data).find((d: Panorama) => d.id === linkLandingFlow.sourceId);
                                            viewerRef.current?.switchSceneById(linkLandingFlow.sourceId);
                                            if (src) {
                                                setSceneName(src.name);
                                                setCurrentSceneId(src.id);
                                            }
                                            setLinkLandingFlow({
                                                phase: 'choose',
                                                sourceId: linkLandingFlow.sourceId,
                                                targetId: linkLandingFlow.targetId,
                                                targetName: linkLandingFlow.targetName,
                                                linkId: linkLandingFlow.linkId,
                                                chainBackLink: linkLandingFlow.chainBackLink,
                                            });
                                        }}
                                        style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', borderRadius: 4 }}
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const cur = viewerRef.current?.getCurrentSceneId();
                                            const v = viewerRef.current?.getCurrentView();
                                            if (!v || cur !== linkLandingFlow.targetId) {
                                                toast.error('Switch to the target room and aim, then save.');
                                                return;
                                            }
                                            viewerRef.current?.setLinkTargetView(linkLandingFlow.sourceId, linkLandingFlow.linkId, v);
                                            const scenes = viewerRef.current?.getScenes() || [];
                                            setPanoramas(scenes.map((s: any) => s.data));
                                            toast.success('Custom landing view saved for this link');
                                            finishLinkLanding(linkLandingFlow);
                                        }}
                                        style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', borderRadius: 4 }}
                                    >
                                        Save link landing
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Checkpoint button - set initial view */}
                <button
                    onClick={handleSetCheckpoint}
                    style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 100, background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.5, backdropFilter: 'blur(8px)' }}
                    title="Set current view as initial checkpoint for this scene"
                >
                    ✓ Set Checkpoint
                </button>

                {/* ProjectPanel — exactly as in 360 feature */}
                <button
                    id="projectPanelToggle"
                    className={panelOpen ? 'open' : ''}
                    onClick={() => setPanelOpen((o: boolean) => !o)}
                    title={panelOpen ? 'Close panel' : 'Open panel'}
                >
                    {panelOpen ? '→' : '← Project'}
                </button>

                <div id="projectPanel" className={panelOpen ? 'open' : ''}>
                    <div className="panel-header">PROJECT CONTENT</div>

                    <div className="scenes-section">
                        <div className="section-label">ROOMS / CHECKPOINTS</div>
                        <div className="scenes-list">
                            {panoramas.map((p) => (
                                <div
                                    key={p.id}
                                    className={`project-scene-item${currentSceneId === p.id ? ' active' : ''}`}
                                    onClick={() => { setCurrentSceneId(p.id); viewerRef.current?.switchSceneById(p.id); }}
                                >
                                    <div className="scene-info">
                                        <div className="scene-name-text">{p.name}</div>
                                    </div>
                                    <div className="scene-item-actions">
                                        <button
                                            className="item-action-btn edit"
                                            onClick={(e) => { e.stopPropagation(); const n = window.prompt('Rename to:', p.name); if (n?.trim()) handleRenameScene(p.id, n.trim()); }}
                                            title="Rename room"
                                        >✎</button>
                                        <button
                                            className="item-action-btn link"
                                            onClick={(e) => { e.stopPropagation(); handleAddHotspot(p.id, p.name); }}
                                            title="Link to this room"
                                        >🔗</button>
                                        <button
                                            className="item-action-btn delete"
                                            onClick={(e) => { e.stopPropagation(); handleDeletePanorama(p.id); }}
                                            title="Delete room"
                                        >✕</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="upload-section">
                        <div className="section-label">ADD NEW ROOM</div>
                        <input
                            type="text"
                            className="upload-name-input"
                            placeholder="Room name..."
                            value={uploadName}
                            onChange={(e) => setUploadName(e.target.value)}
                            disabled={isUploading}
                        />
                        <div
                            className={`project-drop-zone${dragOver ? ' drag-over' : ''}`}
                            onClick={() => !isUploading && fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={!isUploading ? handleDrop : undefined}
                        >
                            {isUploading ? (
                                <p>Uploading...</p>
                            ) : (
                                <>
                                    <div className="drop-icon">▧</div>
                                    <p>Drop panorama here</p>
                                </>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFile(e.target.files?.[0])}
                            disabled={isUploading}
                        />
                    </div>
                </div>

                {/* Placing overlay — identical to 360 feature */}
                {placingHotspotFor && (
                    <div
                        id="placing-overlay"
                        onClick={() => { viewerRef.current?.cancelPlacingHotspot(); setPlacingHotspotFor(null); }}
                    >
                        <span>
                            Pan to aim, then click once on the panorama to place the <strong>{placingHotspotFor.name}</strong> link. Dragging will not place it. Click this bar to cancel.
                        </span>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
