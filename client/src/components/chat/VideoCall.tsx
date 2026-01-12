import { useState, useEffect, useRef } from "react";
import Peer from "simple-peer";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import socketService from "@/lib/socket";

interface VideoCallProps {
  recipientId: string;
  recipientName: string;
  onClose: () => void;
  isIncoming?: boolean;
  callerId?: string;
  signal?: any; // Caller's signal data
}

export default function VideoCall({
  recipientId,
  recipientName,
  onClose,
  isIncoming = false,
  callerId,
  signal: callerSignal,
}: VideoCallProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer.Instance | null>(null);

  useEffect(() => {
    let mounted = true;

    // Get user media
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        if (!mounted) return;

        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }

        if (!isIncoming) {
          // Initiator - create offer
          const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: currentStream,
          });

          peer.on("signal", (data: Peer.SignalData) => {
            console.log("📞 Sending call signal to:", recipientId);
            socketService.emit("call-user", {
              userToCall: recipientId,
              signalData: data,
              from: callerId,
            });
          });

          peer.on("stream", (remoteStream: MediaStream) => {
            console.log("📹 Received remote stream");
            if (userVideo.current) {
              userVideo.current.srcObject = remoteStream;
            }
          });

          peer.on("error", (err) => {
            console.error("Peer error:", err);
          });

          socketService.on("call-accepted", (signal: any) => {
            console.log("✅ Call accepted, signaling peer");
            setCallAccepted(true);
            peer.signal(signal);
          });

          peerRef.current = peer;
        }
      })
      .catch((err) => {
        console.error("Failed to get media:", err);
        const errorMessage =
          err.name === "NotAllowedError"
            ? "🚫 Bạn đã từ chối quyền truy cập camera/microphone.\n\n✅ Cách khắc phục:\n1. Nhấn vào biểu tượng 🎥 hoặc 🔒 bên trái thanh địa chỉ\n2. Cho phép Camera và Microphone\n3. Làm mới trang và thử lại"
            : err.name === "NotFoundError"
            ? "📷 Không tìm thấy camera/microphone.\n\nVui lòng kết nối thiết bị và thử lại!"
            : "❌ Không thể truy cập camera/microphone.\n\nLỗi: " + err.message;

        alert(errorMessage);
        onClose();
      });

    // Listen for incoming call signal (for receiver)
    if (isIncoming && callerSignal) {
      console.log("📞 Preparing to receive incoming call");
    }

    // Cleanup
    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      socketService.off("call-accepted");
      socketService.off("call-made");
      socketService.off("call-ended");
    };
  }, []);

  const answerCall = () => {
    console.log("📞 Answering call from:", callerId);
    setCallAccepted(true);

    if (!stream) {
      alert("Chưa sẵn sàng camera/microphone. Vui lòng thử lại!");
      return;
    }

    if (!callerSignal) {
      console.error("No caller signal available");
      alert("Không nhận được tín hiệu từ người gọi. Vui lòng thử lại!");
      return;
    }

    console.log("Creating peer to answer call");
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (data: Peer.SignalData) => {
      console.log("📡 Sending answer signal to caller");
      socketService.emit("answer-call", { signal: data, to: callerId });
    });

    peer.on("stream", (remoteStream: MediaStream) => {
      console.log("📹 Received caller stream");
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    peer.on("error", (err) => {
      console.error("Peer error during answer:", err);
      alert("Lỗi kết nối: " + err.message);
      onClose();
    });

    // Signal the caller's offer
    console.log("Signaling with caller data");
    peer.signal(callerSignal);

    peerRef.current = peer;
  };

  const endCall = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    socketService.emit("end-call", { to: recipientId });
    onClose();
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="relative h-full w-full">
        {/* Remote Video - Full Screen */}
        {callAccepted ? (
          <video
            ref={userVideo}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-6xl font-bold text-white shadow-2xl">
                {recipientName.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-3xl font-semibold text-white">
                {recipientName}
              </h2>
              {!isIncoming && (
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500"></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                    style={{ animationDelay: "100ms" }}
                  ></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                    style={{ animationDelay: "200ms" }}
                  ></div>
                  <p className="ml-3 text-lg text-gray-300">Calling...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Local Video - Picture in Picture */}
        <video
          ref={myVideo}
          autoPlay
          playsInline
          muted
          className="absolute bottom-24 right-4 h-40 w-56 rounded-xl border-4 border-white object-cover shadow-2xl transition-transform hover:scale-105"
        />

        {/* Call Info */}
        <div className="absolute top-6 left-6 rounded-lg bg-black bg-opacity-50 px-4 py-3 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold text-white">{recipientName}</h2>
          <div className="mt-1 flex items-center space-x-2">
            <div
              className={`h-2 w-2 rounded-full ${
                callAccepted ? "bg-green-500" : "bg-yellow-500 animate-pulse"
              }`}
            ></div>
            <p className="text-sm text-gray-300">
              {!callAccepted && isIncoming && "📞 Incoming call..."}
              {!callAccepted && !isIncoming && "📞 Calling..."}
              {callAccepted && "✅ Connected"}
            </p>
          </div>
        </div>

        {/* Incoming Call - Accept Button */}
        {isIncoming && !callAccepted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md">
            <div className="rounded-2xl bg-white p-8 text-center shadow-2xl">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-4xl font-bold text-white">
                {recipientName.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {recipientName}
              </h3>
              <p className="mt-2 text-gray-600">Cuộc gọi video đến...</p>
              <div className="mt-6 flex justify-center space-x-4">
                <Button
                  size="lg"
                  className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 shadow-lg"
                  onClick={endCall}
                >
                  <PhoneOff className="h-7 w-7" />
                </Button>
                <Button
                  size="lg"
                  className="h-16 w-16 rounded-full bg-green-600 hover:bg-green-700 shadow-lg animate-pulse"
                  onClick={() => answerCall()}
                >
                  <Phone className="h-7 w-7" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 space-x-4">
          <Button
            size="lg"
            variant={isMuted ? "destructive" : "secondary"}
            className="h-16 w-16 rounded-full shadow-xl transition-all hover:scale-110"
            onClick={toggleMute}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <MicOff className="h-7 w-7" />
            ) : (
              <Mic className="h-7 w-7" />
            )}
          </Button>

          <Button
            size="lg"
            variant={isVideoOff ? "destructive" : "secondary"}
            className="h-16 w-16 rounded-full shadow-xl transition-all hover:scale-110"
            onClick={toggleVideo}
            title={isVideoOff ? "Turn on video" : "Turn off video"}
          >
            {isVideoOff ? (
              <VideoOff className="h-7 w-7" />
            ) : (
              <Video className="h-7 w-7" />
            )}
          </Button>

          <Button
            size="lg"
            className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 shadow-xl transition-all hover:scale-110"
            onClick={endCall}
            title="End call"
          >
            <PhoneOff className="h-7 w-7" />
          </Button>
        </div>
      </div>
    </div>
  );
}
