import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Marzipano from 'marzipano';
import screenfull from 'screenfull';
import { normalizePanoramas, resolvePanoramaImageUrl } from '../utils/panoramaUtils';
import './Panorama.css';

/**
 * @param {object} props
 * @param {Array} props.panoramas
 * @param {boolean} [props.autorotateEnabled]
 * @param {'default'|'immersive'} [props.variant] — immersive matches backoffice viewer chrome (title bar, no edit UI)
 * @param {boolean} [props.fillHeight] — with immersive, stretch to fill parent (e.g. full-screen modal)
 */
const PanoViewer = ({ panoramas, autorotateEnabled = true, variant = 'default', fillHeight = false }) => {
    const panoRef = useRef(null);
    const immersiveRootRef = useRef(null);
    const viewerRef = useRef(null);
    const scenesRef = useRef([]);
    const autorotateRef = useRef(null);
    const [currentSceneName, setCurrentSceneName] = useState('');
    const [activeScene, setActiveScene] = useState(null);
    const [isAutorotateEnabled, setIsAutorotateEnabled] = useState(autorotateEnabled);
    const autorotateEnabledRef = useRef(isAutorotateEnabled);

    const normalizedPanoramas = useMemo(() => normalizePanoramas(panoramas), [panoramas]);

    useEffect(() => {
        autorotateEnabledRef.current = isAutorotateEnabled;
    }, [isAutorotateEnabled]);

    useEffect(() => {
        if (!panoRef.current || normalizedPanoramas.length === 0) return;

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
            viewer.startMovement(autorotate);
            viewer.setIdleMovement(3000, autorotate);
        }

        function stopAutorotate() {
            viewer.stopMovement();
            viewer.setIdleMovement(Infinity);
        }

        function switchScene(sceneObj, viewOverride) {
            stopAutorotate();
            const params =
                viewOverride ||
                sceneObj.data.initialViewParameters || { pitch: 0, yaw: 0, fov: 1.5707963267948966 };
            sceneObj.view.setParameters(params);
            sceneObj.scene.switchTo();
            startAutorotate();
            setCurrentSceneName(sceneObj.data.name);
            setActiveScene(sceneObj.data);
        }

        const scenes = normalizedPanoramas.map((sceneData) => {
            const imageUrl = resolvePanoramaImageUrl(sceneData);
            if (!imageUrl) return null;
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

            return { data: sceneData, scene, view };
        }).filter(Boolean);

        if (scenes.length === 0) {
            viewer.destroy();
            viewerRef.current = null;
            return;
        }

        scenesRef.current = scenes;

        scenes.forEach((sceneObj) => {
            (sceneObj.data.linkHotspots || []).forEach((hotspot) => {
                const wrapper = document.createElement('div');
                wrapper.classList.add('hotspot', 'link-hotspot');

                const icon = document.createElement('img');
                icon.src = '/img/link.png';
                icon.classList.add('link-hotspot-icon');
                wrapper.appendChild(icon);

                const tooltip = document.createElement('div');
                tooltip.classList.add('link-hotspot-tooltip');
                const targetData = normalizedPanoramas.find((p) => p.id === hotspot.target);
                tooltip.textContent = targetData ? targetData.name : 'Next Room';
                wrapper.appendChild(tooltip);

                wrapper.addEventListener('click', () => {
                    const target = scenesRef.current.find((s) => s.data.id === hotspot.target);
                    if (target) switchScene(target, hotspot.targetViewParameters);
                });

                sceneObj.scene.hotspotContainer().createHotspot(wrapper, { yaw: hotspot.yaw, pitch: hotspot.pitch });
            });
        });

        if (scenes.length > 0) {
            switchScene(scenes[0]);
        }

        const el = panoRef.current;
        const bumpSize = () => {
            try {
                viewer.updateSize();
            } catch {
                /* ignore */
            }
        };
        requestAnimationFrame(() => {
            bumpSize();
            requestAnimationFrame(bumpSize);
        });

        let resizeObserver = null;
        if (el && typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => bumpSize());
            resizeObserver.observe(el);
        }

        return () => {
            if (resizeObserver) resizeObserver.disconnect();
            viewer.destroy();
            viewerRef.current = null;
        };
    }, [normalizedPanoramas]);

    useEffect(() => {
        if (!viewerRef.current || !autorotateRef.current) return;
        const viewer = viewerRef.current;
        if (isAutorotateEnabled) {
            viewer.startMovement(autorotateRef.current);
            viewer.setIdleMovement(3000, autorotateRef.current);
        } else {
            viewer.stopMovement();
            viewer.setIdleMovement(Infinity);
        }
    }, [isAutorotateEnabled]);

    const toggleFullscreen = useCallback(() => {
        if (!screenfull.isEnabled) return;
        const el = variant === 'immersive' ? immersiveRootRef.current : panoRef.current;
        if (el) screenfull.toggle(el);
    }, [variant]);

    const handleZoom = (delta) => {
        const viewer = viewerRef.current;
        if (!viewer) return;
        const view = viewer.view();
        view.setParameters({ fov: view.fov() * delta });
    };

    const handleMove = (dir) => {
        const viewer = viewerRef.current;
        if (!viewer) return;
        const view = viewer.view();
        const params = view.parameters();
        if (dir === 'left') view.setParameters({ yaw: params.yaw - 0.1 });
        if (dir === 'right') view.setParameters({ yaw: params.yaw + 0.1 });
        if (dir === 'up') view.setParameters({ pitch: params.pitch - 0.1 });
        if (dir === 'down') view.setParameters({ pitch: params.pitch + 0.1 });
    };

    if (normalizedPanoramas.length === 0) return null;

    const thumbSrc = activeScene ? resolvePanoramaImageUrl(activeScene) : '';

    if (variant === 'immersive') {
        const immersiveClass = fillHeight
            ? 'pano-immersive-root pano-immersive-root--fill'
            : 'pano-immersive-root pano-immersive-root--embedded';
        return (
            <div ref={immersiveRootRef} className={immersiveClass}>
                <div className="pano-public-titlebar">
                    <div className="pano-public-thumb-wrap">
                        {thumbSrc ? <img src={thumbSrc} alt="" className="pano-public-thumb" /> : null}
                    </div>
                    <div className="pano-public-scene-name">{currentSceneName || 'Loading tour…'}</div>
                    <div
                        className={`pano-public-autorotate ${isAutorotateEnabled ? 'enabled' : ''}`}
                        onClick={() => setIsAutorotateEnabled(!isAutorotateEnabled)}
                        title="Toggle autorotate"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setIsAutorotateEnabled(!isAutorotateEnabled)}
                    >
                        <img className="icon on" src="/img/pause.png" alt="" />
                        <img className="icon off" src="/img/play.png" alt="" />
                    </div>
                    <div
                        className="pano-public-fullscreen"
                        onClick={toggleFullscreen}
                        title="Fullscreen"
                        role="button"
                        tabIndex={0}
                    >
                        <img src="/img/fullscreen.png" alt="" />
                    </div>
                </div>
                <div className="pano-immersive-canvas-wrap">
                    <div ref={panoRef} className="pano-immersive-canvas" />
                </div>
            </div>
        );
    }

    return (
        <div className="panorama-container">
            <div ref={panoRef} className="pano-default-canvas" />

            <div className="pano-scene-badge">
                {currentSceneName || 'Loading tour...'}
            </div>

            <div className="pano-controls">
                <button
                    type="button"
                    onClick={() => setIsAutorotateEnabled(!isAutorotateEnabled)}
                    className={`pano-autorotate-btn ${isAutorotateEnabled ? 'enabled' : ''}`}
                    title="Toggle Autorotate"
                >
                    <img src={isAutorotateEnabled ? '/img/pause.png' : '/img/play.png'} alt="Rotate" />
                </button>

                <div className="pano-control-group">
                    <button type="button" onClick={() => handleMove('up')} className="pano-control-btn" title="Move Up">
                        <img src="/img/up.png" alt="Up" />
                    </button>
                    <div className="pano-move-row">
                        <button type="button" onClick={() => handleMove('left')} className="pano-control-btn" title="Move Left">
                            <img src="/img/left.png" alt="Left" />
                        </button>
                        <button type="button" onClick={() => handleMove('down')} className="pano-control-btn" title="Move Down">
                            <img src="/img/down.png" alt="Down" />
                        </button>
                        <button type="button" onClick={() => handleMove('right')} className="pano-control-btn" title="Move Right">
                            <img src="/img/right.png" alt="Right" />
                        </button>
                    </div>
                </div>

                <div className="pano-control-group">
                    <button type="button" onClick={() => handleZoom(0.9)} className="pano-control-btn" title="Zoom In">
                        <img src="/img/plus.png" alt="+" />
                    </button>
                    <button type="button" onClick={() => handleZoom(1.1)} className="pano-control-btn" title="Zoom Out">
                        <img src="/img/minus.png" alt="-" />
                    </button>
                </div>

                <div className="pano-control-group">
                    <button type="button" onClick={toggleFullscreen} className="pano-control-btn" title="Toggle Fullscreen">
                        <img src="/img/fullscreen.png" alt="Fullscreen" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PanoViewer;
