"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { Loader2, ArrowLeft } from "lucide-react";

export default function VideoSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [roomName, setRoomName] = useState<string>("");

  useEffect(() => {
    // Verify session belongs to user and get room details
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/sessions/${params.id}`);
        if (!res.ok) throw new Error("Unauthorized");
        
        const data = await res.json();
        if (data.session) {
          // If a videoRoomId exists, use it, else fallback to session ID as room name
          setRoomName(data.session.videoRoomId || `nexus-ai-session-${data.session.id}`);
        } else {
          router.push("/dashboard/calendar");
        }
      } catch (e) {
        console.error(e);
        router.push("/dashboard/calendar");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchSession();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-130px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-brand-500)" }} />
      </div>
    );
  }

  if (!roomName) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-sm hover:underline"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <span className="text-sm font-medium px-3 py-1 rounded-full gradient-bg text-white">
          Native Video Session
        </span>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden shadow-lg border" style={{ borderColor: "var(--border-primary)" }}>
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomName}
          configOverwrite={{
            startWithAudioMuted: true,
            startWithVideoMuted: false,
            disableModeratorIndicator: true,
            startScreenSharing: true,
            enableEmailInStats: false,
            prejoinPageEnabled: false,
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            SHOW_CHROME_EXTENSION_BANNER: false,
          }}
          userInfo={{
            displayName: session?.user?.name || "Participant",
            email: session?.user?.email || "",
          }}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = "100%";
            iframeRef.style.width = "100%";
          }}
          onApiReady={(externalApi) => {
            // Can attach event listeners here
            externalApi.addListener("videoConferenceLeft", () => {
              router.push("/dashboard/calendar");
            });
          }}
        />
      </div>
    </div>
  );
}
