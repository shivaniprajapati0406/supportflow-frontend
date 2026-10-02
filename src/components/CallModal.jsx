import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

// ==========================================================
// WEBRTC CONFIG
// ==========================================================

const ICE_SERVERS = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      urls: "stun:stun1.l.google.com:19302",
    },
  ],
};

// ==========================================================
// CALL STATES
// ==========================================================

const CALL_STATE = {
  IDLE: "idle",
  CALLING: "calling",
  RINGING: "ringing",
  CONNECTED: "connected",
};

// ==========================================================
// CALL MODAL
// ==========================================================

export default function CallModal({
  socket,
  currentUser,
  ticketId,
  targetUserId,
  targetName,
}) {
  // ========================================================
  // STATES
  // ========================================================

  const [callState, setCallState] = useState(
    CALL_STATE.IDLE
  );

  const [isMuted, setIsMuted] = useState(false);

  const [incomingCall, setIncomingCall] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");

  // ========================================================
  // REFS
  // ========================================================

  const peerConnectionRef = useRef(null);

  const localStreamRef = useRef(null);

  const remoteAudioRef = useRef(null);

  const remoteSocketIdRef = useRef(null);

  const pendingIceCandidatesRef = useRef([]);

  // ========================================================
  // CLEANUP CALL
  // ========================================================

  const cleanupCall = useCallback(() => {
    console.log("Cleaning up call...");

    // ------------------------------------------------------
    // CLOSE PEER CONNECTION
    // ------------------------------------------------------

    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.onicecandidate = null;
        peerConnectionRef.current.ontrack = null;
        peerConnectionRef.current.onconnectionstatechange = null;

        peerConnectionRef.current.close();
      } catch (error) {
        console.error(
          "Peer cleanup error:",
          error
        );
      }

      peerConnectionRef.current = null;
    }

    // ------------------------------------------------------
    // STOP MICROPHONE
    // ------------------------------------------------------

    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => {
          try {
            track.stop();
          } catch (error) {
            console.error(
              "Track stop error:",
              error
            );
          }
        });

      localStreamRef.current = null;
    }

    // ------------------------------------------------------
    // CLEAR REMOTE AUDIO
    // ------------------------------------------------------

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    // ------------------------------------------------------
    // CLEAR ICE
    // ------------------------------------------------------

    pendingIceCandidatesRef.current = [];

    // ------------------------------------------------------
    // CLEAR REMOTE SOCKET
    // ------------------------------------------------------

    remoteSocketIdRef.current = null;

    // ------------------------------------------------------
    // RESET STATES
    // ------------------------------------------------------

    setIsMuted(false);
    setIncomingCall(null);
    setCallState(CALL_STATE.IDLE);
  }, []);

  // ==========================================================
  // GET MICROPHONE
  // ==========================================================

  const getLocalStream = useCallback(async () => {
    try {
      console.log(
        "Requesting microphone permission..."
      );

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        console.error(
          "getUserMedia not supported"
        );

        setErrorMessage(
          "Microphone is not supported by this browser."
        );

        return null;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });

      console.log(
        "Microphone permission granted."
      );

      localStreamRef.current = stream;

      return stream;
    } catch (error) {
      console.error(
        "Microphone access error:",
        error
      );

      if (error?.name === "NotAllowedError") {
        setErrorMessage(
          "Microphone permission denied. Please allow microphone access."
        );
      } else if (
        error?.name === "NotFoundError"
      ) {
        setErrorMessage(
          "No microphone found on this device."
        );
      } else {
        setErrorMessage(
          "Microphone permission denied or unavailable."
        );
      }

      return null;
    }
  }, []);

  // ==========================================================
  // CREATE PEER CONNECTION
  // ==========================================================

  const createPeerConnection = useCallback(
    (remoteSocketId) => {
      console.log(
        "Creating WebRTC peer connection:",
        remoteSocketId
      );

      const pc =
        new RTCPeerConnection(
          ICE_SERVERS
        );

      // ------------------------------------------------------
      // ICE CANDIDATE
      // ------------------------------------------------------

      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          return;
        }

        console.log(
          "Sending ICE candidate..."
        );

        socket.emit(
          "webrtc_ice_candidate",
          {
            targetSocketId:
              remoteSocketId,
            candidate:
              event.candidate,
          }
        );
      };

      // ------------------------------------------------------
      // REMOTE AUDIO
      // ------------------------------------------------------

      pc.ontrack = (event) => {
        console.log(
          "Remote audio received."
        );

        if (
          remoteAudioRef.current &&
          event.streams &&
          event.streams[0]
        ) {
          remoteAudioRef.current.srcObject =
            event.streams[0];

          remoteAudioRef.current
            .play()
            .then(() => {
              console.log(
                "Remote audio playing."
              );
            })
            .catch((error) => {
              console.warn(
                "Audio autoplay blocked:",
                error
              );
            });
        }
      };

      // ------------------------------------------------------
      // CONNECTION STATE
      // ------------------------------------------------------

      pc.onconnectionstatechange = () => {
        console.log(
          "WebRTC connection state:",
          pc.connectionState
        );

        if (
          pc.connectionState ===
          "connected"
        ) {
          console.log(
            "VOICE CALL CONNECTED."
          );
        }

        if (
          pc.connectionState ===
            "failed" ||
          pc.connectionState ===
            "disconnected"
        ) {
          console.log(
            "WebRTC connection failed/disconnected."
          );

          cleanupCall();

          setErrorMessage(
            "Voice call connection failed."
          );
        }

        if (
          pc.connectionState ===
          "closed"
        ) {
          console.log(
            "WebRTC connection closed."
          );
        }
      };

      return pc;
    },
    [socket, cleanupCall]
  );

  // ==========================================================
  // START CALL
  // ==========================================================

  const startCall = useCallback(() => {
    console.log(
      "================================"
    );

    console.log(
      "STARTING VOICE CALL"
    );

    console.log(
      "Target User ID:",
      targetUserId
    );

    console.log(
      "Target Name:",
      targetName
    );

    console.log(
      "Ticket ID:",
      ticketId
    );

    console.log(
      "Socket Connected:",
      socket?.connected
    );

    console.log(
      "Socket ID:",
      socket?.id
    );

    console.log(
      "================================"
    );

    // ------------------------------------------------------
    // CHECK TARGET USER
    // ------------------------------------------------------

    if (!targetUserId) {
      setErrorMessage(
        "Support user is not available."
      );

      console.error(
        "TARGET USER ID IS MISSING."
      );

      return;
    }

    // ------------------------------------------------------
    // CHECK SOCKET
    // ------------------------------------------------------

    if (!socket?.connected) {
      setErrorMessage(
        "Connection to server is unavailable."
      );

      console.error(
        "SOCKET IS NOT CONNECTED."
      );

      return;
    }

    // ------------------------------------------------------
    // RESET ERROR
    // ------------------------------------------------------

    setErrorMessage("");

    // ------------------------------------------------------
    // SET CALLING
    // ------------------------------------------------------

    setCallState(
      CALL_STATE.CALLING
    );

    // ------------------------------------------------------
    // SEND CALL REQUEST
    // IMPORTANT:
    // Backend expects targetUserId
    // NOT targetSocketId
    // ------------------------------------------------------

    socket.emit(
      "call_user",
      {
        targetUserId:
          String(targetUserId),

        callerName:
          currentUser?.name ||
          currentUser?.fullName ||
          currentUser?.email ||
          "User",

        ticketId:
          ticketId || null,
      }
    );
  }, [
    socket,
    targetUserId,
    targetName,
    currentUser,
    ticketId,
  ]);

  // ==========================================================
  // ACCEPT INCOMING CALL
  // ==========================================================

  const acceptCall =
    useCallback(async () => {
      if (!incomingCall) {
        console.error(
          "No incoming call found."
        );

        return;
      }

      console.log(
        "================================"
      );

      console.log(
        "ACCEPTING INCOMING CALL"
      );

      console.log(
        incomingCall
      );

      console.log(
        "================================"
      );

      setErrorMessage("");

      const callerSocketId =
        incomingCall.callerSocketId;

      if (!callerSocketId) {
        setErrorMessage(
          "Caller connection is unavailable."
        );

        return;
      }

      remoteSocketIdRef.current =
        callerSocketId;

      // ------------------------------------------------------
      // GET MICROPHONE
      // ------------------------------------------------------

      const stream =
        await getLocalStream();

      if (!stream) {
        return;
      }

      // ------------------------------------------------------
      // CREATE PEER
      // ------------------------------------------------------

      const pc =
        createPeerConnection(
          callerSocketId
        );

      peerConnectionRef.current =
        pc;

      // ------------------------------------------------------
      // ADD AUDIO TRACK
      // ------------------------------------------------------

      stream
        .getTracks()
        .forEach((track) => {
          pc.addTrack(
            track,
            stream
          );
        });

      // ------------------------------------------------------
      // SEND ACCEPTED
      // ------------------------------------------------------

      socket.emit(
        "call_accepted",
        {
          callerSocketId,
        }
      );

      // ------------------------------------------------------
      // UPDATE UI
      // ------------------------------------------------------

      setIncomingCall(null);

      setCallState(
        CALL_STATE.CONNECTED
      );

      console.log(
        "Call accepted successfully."
      );
    }, [
      incomingCall,
      socket,
      getLocalStream,
      createPeerConnection,
    ]);

  // ==========================================================
  // REJECT CALL
  // ==========================================================

  const rejectCall =
    useCallback(() => {
      if (!incomingCall) {
        return;
      }

      console.log(
        "Rejecting incoming call..."
      );

      socket.emit(
        "call_rejected",
        {
          callerSocketId:
            incomingCall.callerSocketId,
        }
      );

      setIncomingCall(null);

      setErrorMessage("");

      setCallState(
        CALL_STATE.IDLE
      );
    }, [
      incomingCall,
      socket,
    ]);

  // ==========================================================
  // END CALL
  // ==========================================================

  const endCall =
    useCallback(() => {
      console.log(
        "Ending voice call..."
      );

      if (
        remoteSocketIdRef.current
      ) {
        socket.emit(
          "end_call",
          {
            targetSocketId:
              remoteSocketIdRef.current,
          }
        );
      }

      cleanupCall();
    }, [
      socket,
      cleanupCall,
    ]);

  // ==========================================================
  // MUTE / UNMUTE
  // ==========================================================

  const toggleMute =
    useCallback(() => {
      if (!localStreamRef.current) {
        return;
      }

      const audioTrack =
        localStreamRef.current
          .getAudioTracks()[0];

      if (!audioTrack) {
        return;
      }

      audioTrack.enabled =
        !audioTrack.enabled;

      setIsMuted(
        !audioTrack.enabled
      );

      console.log(
        audioTrack.enabled
          ? "Microphone ON"
          : "Microphone OFF"
      );
    }, []);

  // ==========================================================
  // SOCKET EVENT LISTENERS
  // ==========================================================

  useEffect(() => {
    if (!socket) {
      return;
    }

    // ========================================================
    // INCOMING CALL
    // ========================================================

    const handleIncomingCall = ({
      callerSocketId,
      callerUserId,
      callerName,
      ticketId:
        incomingTicketId,
    }) => {
      console.log(
        "================================"
      );

      console.log(
        "INCOMING CALL RECEIVED"
      );

      console.log({
        callerSocketId,
        callerUserId,
        callerName,
        incomingTicketId,
      });

      console.log(
        "================================"
      );

      // ------------------------------------------------------
      // IF ALREADY IN CALL
      // ------------------------------------------------------

      if (
        callState !==
        CALL_STATE.IDLE
      ) {
        console.log(
          "Already in another call."
        );

        socket.emit(
          "call_rejected",
          {
            callerSocketId,
          }
        );

        return;
      }

      // ------------------------------------------------------
      // STORE CALL
      // ------------------------------------------------------

      setIncomingCall({
        callerSocketId,
        callerUserId,
        callerName:
          callerName ||
          "User",
        ticketId:
          incomingTicketId ||
          null,
      });

      setErrorMessage("");

      setCallState(
        CALL_STATE.RINGING
      );
    };

    // ========================================================
    // CALL ACCEPTED
    // ========================================================

    const handleCallAccepted =
      async ({
        receiverSocketId,
      }) => {
        console.log(
          "================================"
        );

        console.log(
          "CALL ACCEPTED BY RECEIVER"
        );

        console.log(
          "Receiver Socket:",
          receiverSocketId
        );

        console.log(
          "================================"
        );

        if (!receiverSocketId) {
          setErrorMessage(
            "Receiver connection unavailable."
          );

          cleanupCall();

          return;
        }

        remoteSocketIdRef.current =
          receiverSocketId;

        // ----------------------------------------------------
        // GET MICROPHONE
        // ----------------------------------------------------

        const stream =
          await getLocalStream();

        if (!stream) {
          endCall();

          return;
        }

        // ----------------------------------------------------
        // CREATE PEER
        // ----------------------------------------------------

        const pc =
          createPeerConnection(
            receiverSocketId
          );

        peerConnectionRef.current =
          pc;

        // ----------------------------------------------------
        // ADD AUDIO
        // ----------------------------------------------------

        stream
          .getTracks()
          .forEach((track) => {
            pc.addTrack(
              track,
              stream
            );
          });

        // ----------------------------------------------------
        // CREATE OFFER
        // ----------------------------------------------------

        console.log(
          "Creating WebRTC offer..."
        );

        const offer =
          await pc.createOffer();

        await pc.setLocalDescription(
          offer
        );

        // ----------------------------------------------------
        // SEND OFFER
        // ----------------------------------------------------

        console.log(
          "Sending WebRTC offer..."
        );

        socket.emit(
          "webrtc_offer",
          {
            targetSocketId:
              receiverSocketId,

            offer,
          }
        );

        setCallState(
          CALL_STATE.CONNECTED
        );
      };

    // ========================================================
    // CALL REJECTED
    // ========================================================

    const handleCallRejected =
      () => {
        console.log(
          "Call was rejected."
        );

        setErrorMessage(
          "Call was declined."
        );

        cleanupCall();
      };

    // ========================================================
    // WEBRTC OFFER
    // ========================================================

    const handleWebrtcOffer =
      async ({
        callerSocketId,
        offer,
      }) => {
        console.log(
          "================================"
        );

        console.log(
          "WEBRTC OFFER RECEIVED"
        );

        console.log(
          "Caller Socket:",
          callerSocketId
        );

        console.log(
          "================================"
        );

        const pc =
          peerConnectionRef.current;

        if (!pc) {
          console.error(
            "Peer connection not found."
          );

          return;
        }

        try {
          await pc.setRemoteDescription(
            new RTCSessionDescription(
              offer
            )
          );

          // --------------------------------------------------
          // ADD PENDING ICE
          // --------------------------------------------------

          for (
            const candidate of
              pendingIceCandidatesRef.current
          ) {
            try {
              await pc.addIceCandidate(
                new RTCIceCandidate(
                  candidate
                )
              );
            } catch (error) {
              console.error(
                "Pending ICE error:",
                error
              );
            }
          }

          pendingIceCandidatesRef.current =
            [];

          // --------------------------------------------------
          // CREATE ANSWER
          // --------------------------------------------------

          console.log(
            "Creating WebRTC answer..."
          );

          const answer =
            await pc.createAnswer();

          await pc.setLocalDescription(
            answer
          );

          // --------------------------------------------------
          // SEND ANSWER
          // --------------------------------------------------

          console.log(
            "Sending WebRTC answer..."
          );

          socket.emit(
            "webrtc_answer",
            {
              targetSocketId:
                callerSocketId,

              answer,
            }
          );
        } catch (error) {
          console.error(
            "WebRTC offer error:",
            error
          );

          setErrorMessage(
            "Failed to establish voice connection."
          );
        }
      };

    // ========================================================
    // WEBRTC ANSWER
    // ========================================================

    const handleWebrtcAnswer =
      async ({
        answer,
      }) => {
        console.log(
          "WEBRTC ANSWER RECEIVED"
        );

        const pc =
          peerConnectionRef.current;

        if (!pc) {
          console.error(
            "Peer connection not found."
          );

          return;
        }

        try {
          await pc.setRemoteDescription(
            new RTCSessionDescription(
              answer
            )
          );

          // --------------------------------------------------
          // ADD PENDING ICE
          // --------------------------------------------------

          for (
            const candidate of
              pendingIceCandidatesRef.current
          ) {
            try {
              await pc.addIceCandidate(
                new RTCIceCandidate(
                  candidate
                )
              );
            } catch (error) {
              console.error(
                "Pending ICE error:",
                error
              );
            }
          }

          pendingIceCandidatesRef.current =
            [];

          console.log(
            "WebRTC answer applied."
          );
        } catch (error) {
          console.error(
            "WebRTC answer error:",
            error
          );

          setErrorMessage(
            "Failed to connect voice call."
          );
        }
      };

    // ========================================================
    // ICE CANDIDATE
    // ========================================================

    const handleIceCandidate =
      async ({
        candidate,
      }) => {
        if (!candidate) {
          return;
        }

        console.log(
          "ICE candidate received."
        );

        const pc =
          peerConnectionRef.current;

        if (!pc) {
          console.log(
            "Peer not ready. Saving ICE candidate."
          );

          pendingIceCandidatesRef.current.push(
            candidate
          );

          return;
        }

        // ----------------------------------------------------
        // WAIT FOR REMOTE DESCRIPTION
        // ----------------------------------------------------

        if (
          !pc.remoteDescription
        ) {
          console.log(
            "Remote description not ready. Saving ICE."
          );

          pendingIceCandidatesRef.current.push(
            candidate
          );

          return;
        }

        try {
          await pc.addIceCandidate(
            new RTCIceCandidate(
              candidate
            )
          );

          console.log(
            "ICE candidate added."
          );
        } catch (error) {
          console.error(
            "ICE candidate error:",
            error
          );
        }
      };

    // ========================================================
    // CALL ENDED
    // ========================================================

    const handleCallEnded =
      () => {
        console.log(
          "Remote user ended the call."
        );

        cleanupCall();
      };

    // ========================================================
    // CALL ERROR
    // ========================================================

    const handleCallError =
      ({
        message,
      }) => {
        console.error(
          "CALL ERROR:",
          message
        );

        setErrorMessage(
          message ||
            "Unable to start call."
        );

        cleanupCall();
      };

    // ========================================================
    // REGISTER EVENTS
    // ========================================================

    socket.on(
      "incoming_call",
      handleIncomingCall
    );

    socket.on(
      "call_accepted",
      handleCallAccepted
    );

    socket.on(
      "call_rejected",
      handleCallRejected
    );

    socket.on(
      "webrtc_offer",
      handleWebrtcOffer
    );

    socket.on(
      "webrtc_answer",
      handleWebrtcAnswer
    );

    socket.on(
      "webrtc_ice_candidate",
      handleIceCandidate
    );

    socket.on(
      "call_ended",
      handleCallEnded
    );

    socket.on(
      "call_error",
      handleCallError
    );

    // ========================================================
    // REMOVE EVENTS
    // ========================================================

    return () => {
      socket.off(
        "incoming_call",
        handleIncomingCall
      );

      socket.off(
        "call_accepted",
        handleCallAccepted
      );

      socket.off(
        "call_rejected",
        handleCallRejected
      );

      socket.off(
        "webrtc_offer",
        handleWebrtcOffer
      );

      socket.off(
        "webrtc_answer",
        handleWebrtcAnswer
      );

      socket.off(
        "webrtc_ice_candidate",
        handleIceCandidate
      );

      socket.off(
        "call_ended",
        handleCallEnded
      );

      socket.off(
        "call_error",
        handleCallError
      );
    };
  }, [
    socket,
    callState,
    getLocalStream,
    createPeerConnection,
    cleanupCall,
    endCall,
  ]);

  // ==========================================================
  // COMPONENT UNMOUNT
  // ==========================================================

  useEffect(() => {
    return () => {
      cleanupCall();
    };
  }, [cleanupCall]);

  // ==========================================================
  // DEBUG
  // ==========================================================

  console.log(
    "CALL MODAL DEBUG:",
    {
      targetUserId,
      targetName,
      ticketId,
      socketConnected:
        socket?.connected,
      socketId:
        socket?.id,
      callState,
    }
  );

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="call-modal-wrapper">

      {/* ====================================================
          REMOTE AUDIO
      ==================================================== */}

      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
      />

      {/* ====================================================
          ERROR MESSAGE
      ==================================================== */}

      {errorMessage && (
        <div className="call-error-banner">
          {errorMessage}
        </div>
      )}

      {/* ====================================================
          START CALL
      ==================================================== */}

      {callState ===
        CALL_STATE.IDLE &&
        targetUserId && (
          <button
            type="button"
            className="call-btn call-btn-start"
            onClick={startCall}
          >
            📞 Call{" "}
            {targetName ||
              "Support Agent"}
          </button>
        )}

      {/* ====================================================
          CALLING
      ==================================================== */}

      {callState ===
        CALL_STATE.CALLING && (
          <div className="call-panel">

            <div className="call-icon">
              📞
            </div>

            <p>
              Calling{" "}
              {targetName ||
                "Support Agent"}
              ...
            </p>

            <button
              type="button"
              className="call-btn call-btn-end"
              onClick={endCall}
            >
              ❌ Cancel
            </button>

          </div>
        )}

      {/* ====================================================
          INCOMING CALL
      ==================================================== */}

      {callState ===
        CALL_STATE.RINGING &&
        incomingCall && (
          <div className="call-panel incoming">

            <div className="call-icon">
              📲
            </div>

            <p>
              Incoming call from{" "}
              <strong>
                {incomingCall.callerName ||
                  "User"}
              </strong>
            </p>

            <div className="call-actions">

              <button
                type="button"
                className="call-btn call-btn-accept"
                onClick={acceptCall}
              >
                ✅ Accept
              </button>

              <button
                type="button"
                className="call-btn call-btn-reject"
                onClick={rejectCall}
              >
                ❌ Reject
              </button>

            </div>

          </div>
        )}

      {/* ====================================================
          CONNECTED CALL
      ==================================================== */}

      {callState ===
        CALL_STATE.CONNECTED && (
          <div className="call-panel active">

            <div className="call-icon">
              🔊
            </div>

            <p>
              On call
              {targetName
                ? ` with ${targetName}`
                : ""}
            </p>

            <div className="call-actions">

              <button
                type="button"
                className="call-btn call-btn-mute"
                onClick={toggleMute}
              >
                {isMuted
                  ? "🔇 Unmute"
                  : "🎙️ Mute"}
              </button>

              <button
                type="button"
                className="call-btn call-btn-end"
                onClick={endCall}
              >
                📵 End Call
              </button>

            </div>

          </div>
        )}

    </div>
  );
}