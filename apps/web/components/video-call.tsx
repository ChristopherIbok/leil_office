"use client";

import { useEffect, useRef, useState } from "react";
import { Video, VideoOff, Mic, MicOff, Phone, Maximize2, Minimize2 } from "lucide-react";

interface VideoCallProps {
  onClose: () => void;
}

export function VideoCall({ onClose }: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callStatus, setCallStatus] = useState<"connecting" | "connected" | "ended">("connecting");

  useEffect(() => {
    async function getMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setCallStatus("connected");
      } catch (err) {
        console.error("Failed to get media:", err);
        setCallStatus("ended");
      }
    }
    getMedia();

    return () => {
      localStream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  function toggleMute() {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  }

  function toggleVideo() {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
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
    localStream?.getTracks().forEach(track => track.stop());
    setCallStatus("ended");
    onClose();
  }

  if (callStatus === "ended") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="rounded-lg bg-white p-8 text-center">
          <p className="text-lg font-semibold">Call Ended</p>
          <button onClick={onClose} className="mt-4 rounded-md bg-brand px-4 py-2 text-white">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed z-50 ${isFullscreen ? "inset-0" : "bottom-4 right-4 w-80 rounded-lg border border-line bg-black shadow-lg"}`}>
      {isFullscreen ? (
        <div className="relative h-full w-full bg-black">
          <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
          <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-4 right-4 w-32 rounded-lg border-2 border-white" />
        </div>
      ) : (
        <div className="relative aspect-video bg-gray-900">
          <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          <div className="absolute bottom-2 left-2 text-xs text-white">You</div>
        </div>
      )}

      <div className="flex items-center justify-center gap-4 bg-gray-800 p-4">
        <button
          onClick={toggleMute}
          className={`rounded-full p-3 ${isMuted ? "bg-red-500" : "bg-gray-600"} text-white`}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
        <button
          onClick={toggleVideo}
          className={`rounded-full p-3 ${isVideoOff ? "bg-red-500" : "bg-gray-600"} text-white`}
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

  function startCall() {
    setIsActive(true);
  }

  function endCall() {
    setIsActive(false);
  }

  return { isActive, startCall, endCall };
}