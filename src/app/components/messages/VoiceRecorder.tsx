import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, X, Send, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onClose: () => void;
  isMobile: boolean;
}

export function VoiceRecorder({ onRecordingComplete, onClose, isMobile }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);

      // Start timer
      timerRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      // Start audio level monitoring
      updateAudioLevel();
    } catch (err) {
      setError('Impossible d\'accéder au microphone. Veuillez autoriser l\'accès.');
      console.error('Erreur microphone:', err);
    }
  };

  // Update audio level for visualization
  const updateAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average level
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average / 255); // Normalize to 0-1

    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }
  };

  // Send recording
  const sendRecording = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, duration);
      onClose();
    }
  };

  // Cancel recording
  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setDuration(0);
    onClose();
  };

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: isMobile ? 50 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: isMobile ? 50 : 20 }}
        transition={{ type: 'spring', duration: 0.3 }}
        className={`fixed ${
          isMobile
            ? 'bottom-0 left-0 right-0'
            : 'bottom-20 left-1/2 -translate-x-1/2'
        } bg-white rounded-t-2xl md:rounded-2xl shadow-2xl border border-gray-200 z-[70] ${
          isMobile ? 'w-full' : 'w-[400px]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">
            Message vocal
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={cancelRecording}
            className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Audio Visualization */}
          {isRecording && (
            <div className="flex items-center justify-center gap-1 h-20">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-[#FACC15] rounded-full"
                  animate={{
                    height: `${Math.max(10, audioLevel * 80 * (0.5 + Math.random()))}px`,
                  }}
                  transition={{
                    duration: 0.1,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                />
              ))}
            </div>
          )}

          {/* Duration */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 font-mono">
              {formatDuration(duration)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {isRecording ? 'Enregistrement en cours...' : audioBlob ? 'Enregistrement terminé' : 'Prêt à enregistrer'}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isRecording && !audioBlob && (
              <Button
                onClick={startRecording}
                size="lg"
                className="h-16 w-16 rounded-full bg-[#FACC15] hover:bg-[#e6b800] text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Mic className="w-6 h-6" />
              </Button>
            )}

            {isRecording && (
              <>
                <Button
                  onClick={stopRecording}
                  size="lg"
                  variant="destructive"
                  className="h-16 px-8 rounded-full"
                >
                  Arrêter
                </Button>
              </>
            )}

            {audioBlob && !isRecording && (
              <>
                <Button
                  onClick={cancelRecording}
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 rounded-full"
                >
                  Annuler
                </Button>
                <Button
                  onClick={sendRecording}
                  size="lg"
                  className="h-12 px-6 rounded-full bg-[#FACC15] hover:bg-[#e6b800] text-white gap-2"
                >
                  <Send className="w-4 h-4" />
                  Envoyer
                </Button>
              </>
            )}
          </div>

          {/* Limits info */}
          {duration >= 50 && (
            <p className="text-xs text-orange-600 text-center">
              Durée maximale: 60 secondes
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

