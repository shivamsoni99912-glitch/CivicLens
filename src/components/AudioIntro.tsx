import { useRef, useState, type CSSProperties } from 'react';
import { IconPause, IconPlay, IconWave } from './icons';

const AUDIO_SRC = '/civiclens-overview.mp3';

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export default function AudioIntro() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setIsPlaying(false);
      }
    } else {
      audio.pause();
    }
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  return (
    <section id="listen" className="section section--cream section--tight">
      <div className="container">
        <article className="listen-card">
          <div className="listen-card__copy">
            <span className="eyebrow eyebrow--dark">
              <span className="eyebrow__dot" />
              Audio introduction
            </span>
            <h2 className="display display--sm display--onDark">
              Get to Know <em>CivicLens AI</em>
            </h2>
            <p className="listen-card__lede">Too busy to read? Listen to our quick introduction.</p>
          </div>

          <div className="listen-card__player">
            <div className="player">
              <button
                type="button"
                className="player__btn"
                onClick={togglePlayback}
                aria-label={isPlaying ? 'Pause the CivicLens AI introduction' : 'Play the CivicLens AI introduction'}
              >
                {isPlaying ? <IconPause width={22} height={22} /> : <IconPlay width={22} height={22} />}
              </button>

              <div className="player__body">
                <div className="player__meta">
                  <span className="player__label">
                    <IconWave width={16} height={16} />
                    CivicLens overview
                  </span>
                  <span className="player__time">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <input
                  type="range"
                  className="player__track"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={currentTime}
                  onChange={(event) => seek(Number(event.target.value))}
                  aria-label="Audio playback position"
                  style={{ '--progress': `${progress}%` } as CSSProperties}
                />
              </div>

              <audio
                ref={audioRef}
                src={AUDIO_SRC}
                preload="metadata"
                onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
                onDurationChange={(event) => setDuration(event.currentTarget.duration)}
                onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                  setIsPlaying(false);
                  setCurrentTime(0);
                }}
              />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
