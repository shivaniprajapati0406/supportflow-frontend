import { useEffect, useRef, useState } from "react";
import "./AIVoiceAssistant.css";

const API_BASE_URL = "http://localhost:5000/api";

function AIVoiceAssistant() {
  // ==========================================================
  // REFS
  // ==========================================================

  const recognitionRef = useRef(null);
  const conversationRef = useRef("");
  const listeningRef = useRef(false);
  const speakingRef = useRef(false);
  const processingRef = useRef(false);

  // ==========================================================
  // STATE
  // ==========================================================

  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState("");

  // ==========================================================
  // CLEANUP
  // ==========================================================

  const cleanup = () => {
    console.log("🛑 Cleaning up voice assistant");

    listeningRef.current = false;
    speakingRef.current = false;
    processingRef.current = false;

    try {
      recognitionRef.current?.stop();
    } catch {}

    recognitionRef.current = null;

    setConnected(false);
    setConnecting(false);
    setStatus("Ready");
  };

  // ==========================================================
  // WINDOWS LOCAL AI TEXT TO SPEECH
  // ==========================================================
  //
  // Customer Voice
  //      ↓
  // Browser Speech Recognition
  //      ↓
  // /api/ai/chat
  //      ↓
  // Ollama
  //      ↓
  // /api/ai/speak
  //      ↓
  // Windows PowerShell
  //      ↓
  // Microsoft Ravi
  //
  // No OpenAI
  // No Paid API
  // No browser speechSynthesis
  // ==========================================================

  const speakResponse = async (text) => {
    if (!text || !String(text).trim()) {
      console.warn("⚠️ No AI text available for speech");
      return;
    }

    try {
      const cleanText = String(text).trim();

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Please login first to use AI Voice."
        );
      }

      // AI is speaking
      speakingRef.current = true;

      setStatus("AI is speaking...");
      setError("");

      console.log(
        "🔊 Sending AI reply to Windows TTS:",
        cleanText
      );

      // ======================================================
      // CALL WINDOWS TTS BACKEND
      // ======================================================

      const response = await fetch(
        `${API_BASE_URL}/ai/speak`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            text: cleanText,
          }),
        }
      );

      // ======================================================
      // READ RESPONSE
      // ======================================================

      const data = await response.json();

      console.log(
        "🔊 Windows TTS API response:",
        data
      );

      // ======================================================
      // ERROR CHECK
      // ======================================================

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Windows TTS failed."
        );
      }

      console.log(
        "✅ Windows TTS completed successfully"
      );

      // ======================================================
      // BACKEND WAITS UNTIL WINDOWS SPEECH FINISHES
      // ======================================================

      speakingRef.current = false;
      processingRef.current = false;

      // ======================================================
      // START LISTENING AGAIN
      // ======================================================

      if (listeningRef.current) {
        setStatus("Listening...");

        setTimeout(() => {
          if (
            listeningRef.current &&
            !speakingRef.current &&
            !processingRef.current
          ) {
            startListening();
          }
        }, 300);
      }

    } catch (error) {
      speakingRef.current = false;
      processingRef.current = false;

      console.error(
        "❌ Windows TTS error:",
        error
      );

      setError(
        error?.message ||
          "Failed to play AI voice."
      );

      // ======================================================
      // RECOVER LISTENING
      // ======================================================

      if (listeningRef.current) {
        setStatus("Listening...");

        setTimeout(() => {
          if (
            listeningRef.current &&
            !speakingRef.current &&
            !processingRef.current
          ) {
            startListening();
          }
        }, 700);
      }
    }
  };

  // ==========================================================
  // SEND MESSAGE TO OLLAMA AI
  // ==========================================================

  const sendToAI = async (message) => {
    try {
      // AI is processing
      processingRef.current = true;

      setStatus("AI is thinking...");
      setError("");

      // ======================================================
      // TOKEN
      // ======================================================

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Please login first to use AI Voice."
        );
      }

      console.log(
        "📤 Sending voice message to AI:",
        message
      );

      // ======================================================
      // STOP SPEECH RECOGNITION
      // ======================================================

      try {
        recognitionRef.current?.stop();
      } catch {}

      recognitionRef.current = null;

      // ======================================================
      // CALL OLLAMA CHAT API
      // ======================================================

      const response = await fetch(
        `${API_BASE_URL}/ai/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            message,

            conversation:
              conversationRef.current ||
              "No previous conversation.",
          }),
        }
      );

      // ======================================================
      // READ RESPONSE
      // ======================================================

      const data =
        await response.json();

      console.log(
        "🤖 Voice AI API Response:",
        data
      );

      // ======================================================
      // ERROR CHECK
      // ======================================================

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to generate AI response."
        );
      }

      // ======================================================
      // GET AI REPLY
      // ======================================================

      const reply =
        data.reply?.trim();

      if (!reply) {
        throw new Error(
          "AI returned an empty response."
        );
      }

      console.log(
        "🤖 VOICE AI REPLY:",
        reply
      );

      // ======================================================
      // SAVE CONVERSATION
      // ======================================================

      conversationRef.current +=
        `\nCustomer: ${message}\n` +
        `SupportFlow AI: ${reply}\n`;

      // ======================================================
      // SPEAK AI RESPONSE
      // ======================================================

      await speakResponse(reply);

    } catch (error) {
      processingRef.current = false;
      speakingRef.current = false;

      console.error(
        "❌ AI Voice Chat Error:",
        error
      );

      setError(
        error?.message ||
          "Failed to get AI response."
      );

      // ======================================================
      // RECOVER LISTENING
      // ======================================================

      if (listeningRef.current) {
        setStatus("Listening...");

        setTimeout(() => {
          if (
            listeningRef.current &&
            !speakingRef.current &&
            !processingRef.current
          ) {
            startListening();
          }
        }, 700);
      }
    }
  };

  // ==========================================================
  // START MICROPHONE LISTENING
  // ==========================================================

  const startListening = () => {

    // ======================================================
    // CHECK ASSISTANT STATE
    // ======================================================

    if (!listeningRef.current) {
      return;
    }

    // ======================================================
    // DON'T LISTEN WHILE AI IS BUSY
    // ======================================================

    if (
      speakingRef.current ||
      processingRef.current
    ) {
      console.log(
        "⏸️ Microphone blocked while AI is busy"
      );

      return;
    }

    // ======================================================
    // CHECK SPEECH RECOGNITION SUPPORT
    // ======================================================

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Voice recognition is not supported in this browser. Please use Google Chrome."
      );

      cleanup();

      return;
    }

    // ======================================================
    // STOP OLD RECOGNITION
    // ======================================================

    try {
      recognitionRef.current?.stop();
    } catch {}

    // ======================================================
    // CREATE RECOGNITION
    // ======================================================

    const recognition =
      new SpeechRecognition();

    recognitionRef.current =
      recognition;

    // ======================================================
    // SPEECH SETTINGS
    // ======================================================

    recognition.lang =
      "en-IN";

    recognition.continuous =
      false;

    recognition.interimResults =
      false;

    recognition.maxAlternatives =
      1;

    // ======================================================
    // ON START
    // ======================================================

    recognition.onstart = () => {
      console.log(
        "🎤 Microphone listening started"
      );

      setConnecting(false);

      setConnected(true);

      setStatus(
        "Listening..."
      );
    };

    // ======================================================
    // ON RESULT
    // ======================================================

    recognition.onresult =
      (event) => {

        const transcript =
          event.results?.[0]?.[0]
            ?.transcript
            ?.trim();

        // ==================================================
        // EMPTY RESULT
        // ==================================================

        if (!transcript) {

          console.warn(
            "⚠️ Empty speech result"
          );

          if (
            listeningRef.current &&
            !speakingRef.current &&
            !processingRef.current
          ) {
            setTimeout(() => {

              if (
                listeningRef.current &&
                !speakingRef.current &&
                !processingRef.current
              ) {
                startListening();
              }

            }, 400);
          }

          return;
        }

        // ==================================================
        // CUSTOMER MESSAGE
        // ==================================================

        console.log(
          "🎤 Customer said:",
          transcript
        );

        // ==================================================
        // BLOCK RESTART
        // ==================================================

        processingRef.current =
          true;

        // ==================================================
        // STOP RECOGNITION
        // ==================================================

        try {
          recognition.stop();
        } catch {}

        recognitionRef.current =
          null;

        // ==================================================
        // SEND MESSAGE TO AI
        // ==================================================

        setStatus(
          "AI is thinking..."
        );

        sendToAI(
          transcript
        );
      };

    // ======================================================
    // ON ERROR
    // ======================================================

    recognition.onerror =
      (event) => {

        console.error(
          "❌ Speech Recognition Error:",
          event.error
        );

        // ==================================================
        // MICROPHONE PERMISSION ERROR
        // ==================================================

        if (
          event.error ===
            "not-allowed" ||
          event.error ===
            "service-not-allowed"
        ) {

          setError(
            "Microphone permission was denied. Please allow microphone access."
          );

          cleanup();

          return;
        }

        // ==================================================
        // NO SPEECH / ABORTED
        // ==================================================

        if (
          event.error ===
            "no-speech" ||
          event.error ===
            "aborted"
        ) {

          if (
            listeningRef.current &&
            !speakingRef.current &&
            !processingRef.current
          ) {

            setStatus(
              "Listening..."
            );

            setTimeout(() => {

              if (
                listeningRef.current &&
                !speakingRef.current &&
                !processingRef.current
              ) {
                startListening();
              }

            }, 600);
          }

          return;
        }

        // ==================================================
        // OTHER ERRORS
        // ==================================================

        if (
          listeningRef.current &&
          !speakingRef.current &&
          !processingRef.current
        ) {

          setTimeout(() => {

            if (
              listeningRef.current &&
              !speakingRef.current &&
              !processingRef.current
            ) {
              startListening();
            }

          }, 800);
        }
      };

    // ======================================================
    // ON END
    // ======================================================

    recognition.onend =
      () => {

        console.log(
          "🎤 Speech recognition ended"
        );

        if (
          recognitionRef.current ===
          recognition
        ) {
          recognitionRef.current =
            null;
        }

        // ==================================================
        // RESTART ONLY IF SAFE
        // ==================================================

        if (
          listeningRef.current &&
          !speakingRef.current &&
          !processingRef.current
        ) {

          setStatus(
            "Listening..."
          );

          setTimeout(() => {

            if (
              listeningRef.current &&
              !speakingRef.current &&
              !processingRef.current
            ) {
              startListening();
            }

          }, 400);
        }
      };

    // ======================================================
    // START RECOGNITION
    // ======================================================

    try {

      recognition.start();

    } catch (error) {

      console.warn(
        "⚠️ Recognition start warning:",
        error
      );
    }
  };

  // ==========================================================
  // START VOICE ASSISTANT
  // ==========================================================

  const startVoice =
    async () => {

      // ======================================================
      // ALREADY RUNNING
      // ======================================================

      if (
        connecting ||
        connected
      ) {
        return;
      }

      // ======================================================
      // TOKEN CHECK
      // ======================================================

      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {

        setError(
          "Please login first to use AI Voice."
        );

        return;
      }

      try {

        // ====================================================
        // RESET ERROR
        // ====================================================

        setError("");

        setConnecting(true);

        setStatus(
          "Starting voice assistant..."
        );

        console.log(
          "🚀 Starting SupportFlow AI Voice"
        );

        // ====================================================
        // MICROPHONE PERMISSION
        // ====================================================

        const microphone =
          await navigator.mediaDevices
            .getUserMedia({
              audio: true,
            });

        console.log(
          "🎤 Microphone permission granted"
        );

        // ====================================================
        // STOP TEMPORARY STREAM
        // ====================================================

        microphone
          .getTracks()
          .forEach(
            (track) => {
              track.stop();
            }
          );

        // ====================================================
        // RESET CONVERSATION
        // ====================================================

        conversationRef.current =
          "";

        // ====================================================
        // RESET STATES
        // ====================================================

        speakingRef.current =
          false;

        processingRef.current =
          false;

        listeningRef.current =
          true;

        setConnecting(false);

        setConnected(true);

        setStatus(
          "Listening..."
        );

        // ====================================================
        // START SPEECH RECOGNITION
        // ====================================================

        startListening();

      } catch (error) {

        console.error(
          "❌ AI Voice Start Error:",
          error
        );

        setError(
          "Microphone access is required. Please allow microphone permission."
        );

        cleanup();
      }
    };

  // ==========================================================
  // STOP VOICE
  // ==========================================================

  const stopVoice = () => {

    console.log(
      "🛑 Stopping AI Voice Assistant"
    );

    cleanup();
  };

  // ==========================================================
  // COMPONENT CLEANUP
  // ==========================================================

  useEffect(() => {

    return () => {
      cleanup();
    };

  }, []);

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      {/* ====================================================
          VOICE FLOATING BUTTON
      ==================================================== */}

      {!open && (
        <button
          className="ai-voice-fab"
          onClick={() => {

            setOpen(true);

            setError("");

          }}
          aria-label="Open AI Voice Assistant"
          title="Talk to SupportFlow AI"
        >
          🎙️
        </button>
      )}

      {/* ====================================================
          VOICE PANEL
      ==================================================== */}

      {open && (

        <div className="ai-voice-panel">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="ai-voice-header">

            <div>

              <div className="ai-voice-title">
                SupportFlow AI Voice
              </div>

              <div className="ai-voice-subtitle">
                Talk naturally with your support assistant
              </div>

            </div>

            <button
              className="ai-voice-close"
              onClick={() => {

                stopVoice();

                setOpen(false);

              }}
            >
              ×
            </button>

          </div>

          {/* ==================================================
              BODY
          ================================================== */}

          <div className="ai-voice-body">

            {/* =================================================
                AI ORB
            ================================================= */}

            <div
              className={`ai-voice-orb ${
                connected
                  ? "active"
                  : ""
              }`}
            >

              <span>
                🤖
              </span>

            </div>

            {/* =================================================
                STATUS
            ================================================= */}

            <div className="ai-voice-status">

              {connecting
                ? "Connecting..."
                : connected
                ? status
                : "Click Start Voice to begin"}

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

              <div className="ai-voice-error">

                {error}

              </div>

            )}

            {/* =================================================
                START / STOP
            ================================================= */}

            {!connected ? (

              <button
                className="ai-voice-start"
                onClick={
                  startVoice
                }
                disabled={
                  connecting
                }
              >

                {connecting
                  ? "Starting..."
                  : "🎙️ Start Voice"}

              </button>

            ) : (

              <button
                className="ai-voice-stop"
                onClick={
                  stopVoice
                }
              >

                🛑 End Conversation

              </button>

            )}

            {/* =================================================
                HINT
            ================================================= */}

            <p className="ai-voice-hint">

              Allow microphone access when your browser asks.

            </p>

          </div>

        </div>

      )}
    </>
  );
}

export default AIVoiceAssistant;