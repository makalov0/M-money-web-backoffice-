import { useEffect } from "react";
import { X, Download } from "lucide-react";

type Props = {
  open: boolean;
  src: string;
  onClose: () => void;
  showDownload?: boolean;
};

export default function ImagePreviewModal({
  open,
  src,
  onClose,
  showDownload = true,
}: Props) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Right Buttons */}
        <div className="absolute -top-12 right-0 flex gap-2">
          {showDownload && (
            <a
              href={src}
              download
              target="_blank"
              rel="noreferrer"
              className="bg-white/90 hover:bg-white text-gray-800 px-3 py-2 rounded-lg flex items-center gap-2 shadow"
            >
              <Download size={18} />
              Download
            </a>
          )}

          <button
            onClick={onClose}
            className="bg-white/90 hover:bg-white text-gray-800 px-3 py-2 rounded-lg flex items-center gap-2 shadow"
          >
            <X size={18} />
            Close
          </button>
        </div>

        {/* Image */}
        <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
          <img
            src={src}
            className="w-full max-h-[80vh] object-contain bg-black"
            alt="preview"
          />
        </div>
      </div>
    </div>
  );
}
