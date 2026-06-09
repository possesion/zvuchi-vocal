import { Play } from 'lucide-react'

export function VideoPlaceholder() {
  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-sm bg-white/5">
      <div className="flex flex-col items-center gap-3 text-white/40">
        <Play className="h-12 w-12" aria-hidden="true" />
        <p className="text-sm">Видео скоро появится</p>
      </div>
    </div>
  )
}
