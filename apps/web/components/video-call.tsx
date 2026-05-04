"use client";

import { useEffect, useRef, useState } from "react";
import { Video, VideoOff, Mic, MicOff, Phone, Maximize2, Minimize2, CameraOff } from "lucide-react";

interface VideoCallProps {
  onClose: () => void;
}

export function VideoCall({ onClose }: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<"connecting" | "connected" | "ended">("connecting");

  useEffect(() => {
    async function getMedia() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setDeviceError("Camera/microphone not supported in this browser.");
        setCallStatus("connected");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        setLocalStream(stream);
        setCallStatus("connected");
      } catch (err: any) {
        if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setDeviceError("No camera or microphone found on this device.");
        } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setDeviceError("Camera/microphone access was denied. Check browser permissions.");
        } else {
          setDeviceError(`Could not access media devices: ${err.message}`);
        }
        setCallStatus("connected");
      }
    }

    getMedia();

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Attach stream to video element after both are ready
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  function toggleMute() {
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => { t.enabled = isMuted; });
      setIsMuted((m) => !m);
    }
  }

  function toggleVideo() {
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => { t.enabled = isVideoOff; });
      setIsVideoOff((v) => !v);
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  function endCall() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCallStatus("ended");
    onClose();
  }

  if (callStatus === "ended") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="rounded-lg bg-white p-8 text-center">
          <p className="text-lg font-semibold">Call Ended</p>
          <button onClick={onClose} className="mt-4 rounded-md bg-brand px-4 py-2 text-white">Close</button>
        </div>
      </div>
    );
  }

  if (callStatus === "connecting") {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-80 rounded-lg border border-line bg-black shadow-lg">
        <div className="flex aspect-video items-center justify-center bg-gray-900">
          <p className="text-sm text-white/60">Connecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed z-50 ${isFullscreen ? "inset-0" : "bottom-4 right-4 w-80 rounded-lg border border-line bg-black shadow-lg"}`}>
      {/* Device error banner */}
      {deviceError && (
        <div className="flex items-center gap-2 bg-yellow-900/80 px-3 py-2 text-xs text-yellow-200">
          <CameraOff className="h-3.5 w-3.5 shrink-0" />
          {deviceError}
        </div>
      )}

      {isFullscreen ? (
        <div className="relative h-full w-full bg-black">
          <video ref={undefined} autoPlay playsInline className="h-full w-full object-cover" />
          {!deviceError && (
            <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-4 right-4 w-32 rounded-lg border-2 border-white" />
          )}
          {deviceError && (
            <div className="absolute bottom-4 right-4 flex h-24 w-32 items-center justify-center rounded-lg border-2 border-white bg-gray-800">
              <CameraOff className="h-6 w-6 text-white/40" />
            </div>
          )}
        </div>
      ) : (
        <div className="relative aspect-video bg-gray-900">
          {deviceError ? (
            <div className="flex h-full w-full items-center justify-center">
              <CameraOff className="h-10 w-10 text-white/20" />
            </div>
          ) : (
            <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          )}
          <div className="absolute bottom-2 left-2 text-xs text-white/60">You</div>
        </div>
      )}

      <div className="flex items-center justify-center gap-4 bg-gray-800 p-4">
        <button
          onClick={toggleMute}
          disabled={!localStream}
          className={`rounded-full p-3 ${isMuted ? "bg-red-500" : "bg-gray-600"} text-white disabled:opacity-40`}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
        <button
          onClick={toggleVideo}
          disabled={!localStream}
          className={`rounded-full p-3 ${isVideoOff ? "bg-red-500" : "bg-gray-600"} text-white disabled:opacity-40`}
        >
          {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </button>
        <button onClick={endCall} className="rounded-full bg-red-500 p-3 text-white">
          <Phone className="h-5 w-5 rotate-[135deg]" />
        </button>
        <button onClick={toggleFullscreen} className="rounded-full bg-gray-600 p-3 text-white">
          {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

export function useVideoCall() {
  const [isActive, setIsActive] = useState(false);
  return {
    isActive,
    startCall: () => setIsActive(true),
    endCall: () => setIsActive(false),
  };
}
