import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageUri: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  useEffect(() => {
    if (isOpen && !capturedUri) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, capturedUri]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn("Camera access warning:", err);
      setCameraError("Camera access was not granted or not available. You can also upload a document file directly.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedUri(dataUrl);
        stopCamera();
      }
    }
  };

  const retake = () => {
    setCapturedUri(null);
    startCamera();
  };

  const confirmCapture = () => {
    if (capturedUri) {
      onCapture(capturedUri);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-[#1B1B1F] text-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col border border-white/10">
        {/* Header */}
        <div className="p-4 bg-black/40 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#97F0FF]" />
            <h3 className="font-bold text-sm text-white">Capture Document / Receipt</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview */}
        <div className="relative aspect-4/3 bg-black flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center text-white/80 max-w-xs flex flex-col items-center gap-3">
              <AlertCircle className="w-10 h-10 text-[#FFE082]" />
              <p className="text-xs">{cameraError}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 text-xs font-bold bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
              >
                Retry Camera
              </button>
            </div>
          ) : capturedUri ? (
            <img src={capturedUri} alt="Captured Document" className="w-full h-full object-contain" />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Document Alignment Frame */}
              <div className="absolute inset-8 border-2 border-dashed border-[#97F0FF]/60 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="text-[11px] font-bold text-white/60 bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs">
                  Align receipt or certificate inside frame
                </span>
              </div>
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-black/60 flex items-center justify-between gap-3 border-t border-white/10">
          {capturedUri ? (
            <>
              <button
                onClick={retake}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Retake
              </button>
              <button
                onClick={confirmCapture}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#1B873F] hover:bg-[#146c32] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Check className="w-4 h-4" />
                Use Photo
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5"
                title="Flip Camera"
              >
                <RefreshCw className="w-4 h-4" />
                Flip
              </button>
              <button
                onClick={takeSnapshot}
                disabled={!!cameraError}
                className="flex-1 py-3 px-6 rounded-xl bg-[#005FB0] hover:bg-[#004f94] active:scale-95 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Camera className="w-5 h-5" />
                Snap Photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
