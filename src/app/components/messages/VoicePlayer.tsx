import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '../ui/button';
import { audioService } from '../../../services/audio.service';

interface VoicePlayerProps {
  audioUrl: string;
  duration?: number;
}

export function VoicePlayer({ audioUrl, duration = 0 }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);
  const [resolvedSrc, setResolvedSrc] = useState<string>('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Résoudre l'URL (signed URL) si le bucket est privé
  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    setResolvedSrc('');

    (async () => {
      try {
        const playable = await audioService.getPlayableUrl(audioUrl);
        if (!cancelled) setResolvedSrc(playable);
      } catch (e) {
        console.error('Erreur résolution URL audio:', e);
        if (!cancelled) setLoadError('Audio indisponible');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setTotalDuration(Math.floor(audio.duration));
    };

    const handleTimeUpdate = () => {
      setCurrentTime(Math.floor(audio.currentTime));
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setIsPlaying(false);
      setLoadError('Impossible de lire cet audio');
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!resolvedSrc || loadError) return;

    if (isPlaying) {
      audio.pause();
    } else {
      try {
        await audio.play();
      } catch (e) {
        console.error('Erreur play audio:', e);
        setLoadError('Impossible de lire cet audio');
        return;
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audio.currentTime = percentage * audio.duration;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 max-w-xs">
      <audio ref={audioRef} src={resolvedSrc || undefined} preload="metadata" />

      {/* Play/Pause Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlay}
        disabled={!resolvedSrc || !!loadError}
        className="h-10 w-10 p-0 rounded-full bg-[#FACC15] hover:bg-[#e6b800] text-white disabled:opacity-60"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </Button>

      {/* Waveform/Progress */}
      <div className="flex-1 space-y-1">
        {loadError && <div className="text-xs text-red-600">{loadError}</div>}
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="h-1 bg-gray-300 rounded-full cursor-pointer relative overflow-hidden"
        >
          <div
            className="h-full bg-[#FACC15] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Time */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>
    </div>
  );
}


