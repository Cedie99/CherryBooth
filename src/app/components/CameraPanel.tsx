"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CameraSettings = {
  mirror: boolean;
  timer: number; // 0 = no timer, 3, 5, 10
  selectedDeviceId: string;
  brightness: number;
  contrast: number;
  showGrid: boolean;
};

type CameraPanelProps = {
  framesNeeded: number;
  filterCss: string;
  onPhotosChange: (photos: string[]) => void;
};

const defaultSettings: CameraSettings = {
  mirror: true,
  timer: 3,
  selectedDeviceId: "",
  brightness: 100,
  contrast: 100,
  showGrid: false,
};

const timerOptions = [0, 3, 5, 10];

export default function CameraPanel({
  framesNeeded,
  filterCss,
  onPhotosChange,
}: CameraPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [settings, setSettings] = useState<CameraSettings>(defaultSettings);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [flash, setFlash] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start / restart camera when user clicks Start (also enumerates devices)
  const startCamera = useCallback(async () => {
    // Stop existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    setCameraError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: settings.selectedDeviceId
            ? { exact: settings.selectedDeviceId }
            : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: settings.selectedDeviceId ? undefined : "user",
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Attach stream to the always-mounted video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Enumerate available cameras after permission is granted
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter((d) => d.kind === "videoinput");
        setDevices(videoDevices);
        if (videoDevices.length > 0 && !settings.selectedDeviceId) {
          setSettings((s) => ({
            ...s,
            selectedDeviceId: videoDevices[0].deviceId,
          }));
        }
      } catch {
        // enumeration failed, non-critical
      }

      setCameraActive(true);
    } catch (err) {
      setCameraError(
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Camera access denied. Please allow camera permissions."
          : "Could not access camera. Make sure a camera is connected."
      );
      setCameraActive(false);
    }
  }, [settings.selectedDeviceId]);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  // Take a single snapshot from the video feed
  const takeSnapshot = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Apply mirror
    if (settings.mirror) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    // Apply brightness and contrast
    ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%)`;

    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.filter = "none";

    return canvas.toDataURL("image/png");
  }, [settings.mirror, settings.brightness, settings.contrast]);

  // Flash effect
  const triggerFlash = useCallback(() => {
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
  }, []);

  // Capture a single frame with optional countdown
  const captureFrame = useCallback(
    (frameIndex: number): Promise<string | null> => {
      return new Promise((resolve) => {
        const timerValue = settings.timer;

        if (timerValue === 0) {
          triggerFlash();
          const photo = takeSnapshot();
          resolve(photo);
          return;
        }

        let remaining = timerValue;
        setCountdown(remaining);

        countdownRef.current = setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            setCountdown(null);
            triggerFlash();
            const photo = takeSnapshot();
            resolve(photo);
          } else {
            setCountdown(remaining);
          }
        }, 1000);
      });
    },
    [settings.timer, takeSnapshot, triggerFlash]
  );

  // Capture all frames sequentially
  const startCapture = useCallback(async () => {
    if (!cameraActive || capturing) return;

    setCapturing(true);
    const newPhotos: string[] = [];

    for (let i = 0; i < framesNeeded; i++) {
      setCurrentFrame(i);

      // Small delay between frames (after the first one)
      if (i > 0) {
        await new Promise((r) => setTimeout(r, 800));
      }

      const photo = await captureFrame(i);
      if (photo) {
        newPhotos.push(photo);
        // Update photos progressively
        setPhotos([...newPhotos]);
        onPhotosChange([...newPhotos]);
      }
    }

    setCapturing(false);
    setCurrentFrame(0);
  }, [cameraActive, capturing, framesNeeded, captureFrame, onPhotosChange]);

  // Retake a specific frame
  const retakeFrame = useCallback(
    async (frameIndex: number) => {
      if (!cameraActive) return;

      setCapturing(true);
      setCurrentFrame(frameIndex);

      const photo = await captureFrame(frameIndex);
      if (photo) {
        const updated = [...photos];
        updated[frameIndex] = photo;
        setPhotos(updated);
        onPhotosChange(updated);
      }

      setCapturing(false);
      setCurrentFrame(0);
    },
    [cameraActive, photos, captureFrame, onPhotosChange]
  );

  // Clear all photos
  const clearPhotos = useCallback(() => {
    setPhotos([]);
    onPhotosChange([]);
  }, [onPhotosChange]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const liveFilterStyle = `${filterCss !== "none" ? filterCss : ""} brightness(${settings.brightness}%) contrast(${settings.contrast}%)`.trim();

  return (
    <div className="camera-panel">
      {/* Hidden canvas for snapshot */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Viewfinder */}
      <div className="camera-box camera-box-live">
        {/* Video is always in the DOM so the ref is available; hidden when inactive */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-video"
          style={{
            transform: settings.mirror ? "scaleX(-1)" : "none",
            filter: liveFilterStyle || undefined,
            display: cameraActive ? "block" : "none",
          }}
        />
        {cameraActive ? (
          <>
            {settings.showGrid && <div className="camera-grid-overlay" />}
            {flash && <div className="camera-flash" />}
            {countdown !== null && (
              <div className="camera-countdown">{countdown}</div>
            )}
            <div className="camera-hud">
              <span className="camera-hud-dot">● REC</span>
              <span>
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {capturing && (
              <div className="camera-frame-indicator">
                Shot {currentFrame + 1} / {framesNeeded}
              </div>
            )}
          </>
        ) : (
          <div className="camera-placeholder">
            {cameraError ? (
              <p className="camera-error">{cameraError}</p>
            ) : (
              <>
                <span className="camera-placeholder-icon">📸</span>
                <p>Tap &quot;Start Camera&quot; to begin</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main controls */}
      <div className="camera-controls">
        {!cameraActive ? (
          <button className="capture-btn" type="button" onClick={startCamera}>
            📷
          </button>
        ) : (
          <button
            className="capture-btn"
            type="button"
            onClick={startCapture}
            disabled={capturing}
          >
            {capturing ? (
              <span className="capture-btn-pulse" />
            ) : (
              "♥"
            )}
          </button>
        )}
        <div className="camera-controls-text">
          {!cameraActive ? (
            <>
              <p>Start Camera</p>
              <p className="muted">allow camera access to begin</p>
            </>
          ) : capturing ? (
            <>
              <p>
                Capturing shot {currentFrame + 1} of {framesNeeded}...
              </p>
              <p className="muted">hold still and smile!</p>
            </>
          ) : photos.length === framesNeeded ? (
            <>
              <p>All {framesNeeded} shots captured!</p>
              <p className="muted">retake any frame or download your strip</p>
            </>
          ) : (
            <>
              <p>Tap heart to capture {framesNeeded} shots</p>
              <p className="muted">
                {settings.timer > 0
                  ? `${settings.timer}s countdown · `
                  : "instant · "}
                {settings.mirror ? "mirrored" : "original"}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Quick actions */}
      {cameraActive && (
        <div className="camera-quick-actions">
          <button
            className={`tiny-pill ${settings.mirror ? "on" : ""}`}
            type="button"
            onClick={() =>
              setSettings((s) => ({ ...s, mirror: !s.mirror }))
            }
          >
            ↔ Mirror
          </button>
          <button
            className={`tiny-pill ${settings.showGrid ? "on" : ""}`}
            type="button"
            onClick={() =>
              setSettings((s) => ({ ...s, showGrid: !s.showGrid }))
            }
          >
            ⊞ Grid
          </button>
          <button
            className="tiny-pill"
            type="button"
            onClick={() => setShowSettings((s) => !s)}
          >
            ⚙ Settings
          </button>
          {photos.length > 0 && (
            <button className="tiny-pill" type="button" onClick={clearPhotos}>
              ✕ Clear
            </button>
          )}
          <button className="tiny-pill" type="button" onClick={stopCamera}>
            ⏹ Stop
          </button>
        </div>
      )}

      {/* Settings panel */}
      {showSettings && cameraActive && (
        <div className="camera-settings">
          <p className="label">Timer</p>
          <div className="pill-grid">
            {timerOptions.map((t) => (
              <button
                key={t}
                className={`tiny-pill ${settings.timer === t ? "on" : ""}`}
                type="button"
                onClick={() => setSettings((s) => ({ ...s, timer: t }))}
              >
                {t === 0 ? "Off" : `${t}s`}
              </button>
            ))}
          </div>

          {devices.length > 1 && (
            <>
              <p className="label">Camera</p>
              <select
                className="text-input"
                value={settings.selectedDeviceId}
                onChange={(e) => {
                  setSettings((s) => ({
                    ...s,
                    selectedDeviceId: e.target.value,
                  }));
                  // Restart camera with new device
                  setTimeout(() => startCamera(), 100);
                }}
              >
                {devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Camera ${devices.indexOf(d) + 1}`}
                  </option>
                ))}
              </select>
            </>
          )}

          <div className="slider-line slider-input-line">
            <span>Bright</span>
            <input
              className="range-input"
              type="range"
              min={60}
              max={140}
              value={settings.brightness}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  brightness: Number(e.target.value),
                }))
              }
            />
            <span>{settings.brightness}%</span>
          </div>

          <div className="slider-line slider-input-line">
            <span>Contrast</span>
            <input
              className="range-input"
              type="range"
              min={60}
              max={140}
              value={settings.contrast}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  contrast: Number(e.target.value),
                }))
              }
            />
            <span>{settings.contrast}%</span>
          </div>

          <button
            className="tiny-pill"
            type="button"
            style={{ marginTop: "0.5rem" }}
            onClick={() =>
              setSettings((s) => ({
                ...s,
                brightness: 100,
                contrast: 100,
              }))
            }
          >
            Reset adjustments
          </button>
        </div>
      )}

      {/* Captured thumbnails */}
      {photos.length > 0 && (
        <div className="camera-thumbnails">
          <p className="label">
            Captured ({photos.length}/{framesNeeded})
          </p>
          <div className="camera-thumb-grid">
            {photos.map((photo, i) => (
              <div key={`photo-${i}`} className="camera-thumb">
                <img
                  src={photo}
                  alt={`Shot ${i + 1}`}
                  style={{ filter: filterCss !== "none" ? filterCss : undefined }}
                />
                <button
                  className="camera-thumb-retake"
                  type="button"
                  onClick={() => retakeFrame(i)}
                  disabled={capturing}
                  title={`Retake shot ${i + 1}`}
                >
                  ↻
                </button>
                <span className="camera-thumb-num">#{i + 1}</span>
              </div>
            ))}
            {Array.from({ length: framesNeeded - photos.length }).map(
              (_, i) => (
                <div
                  key={`empty-${i}`}
                  className="camera-thumb camera-thumb-empty"
                >
                  <span>#{photos.length + i + 1}</span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Info tips section */}
      {!cameraActive && (
        <div className="camera-tips">
          <p className="label">✨ Tips for great shots</p>
          <div className="tips-list">
            <div className="tip-item">
              <span className="tip-icon">💡</span>
              <p>Good lighting makes all the difference</p>
            </div>
            <div className="tip-item">
              <span className="tip-icon">🎯</span>
              <p>Position yourself in the frame center</p>
            </div>
            <div className="tip-item">
              <span className="tip-icon">😊</span>
              <p>Natural expressions look best</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
