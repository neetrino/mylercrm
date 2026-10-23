'use client';

type ApartmentsPreviewModalProps = {
  previewModalUrl: string | null;
  setPreviewModalUrl: (url: string | null) => void;
};

export function ApartmentsPreviewModal(props: ApartmentsPreviewModalProps) {
  const { previewModalUrl, setPreviewModalUrl } = props;
  return (
    <>
      {/* 3D Preview modal */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4"
          onClick={() => setPreviewModalUrl(null)}
          role="dialog"
          aria-modal="true"
          aria-label="3D preview"
        >
          <div
            className="relative flex h-[92dvh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-xl sm:h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
              <span className="text-sm font-medium text-gray-700">3D Preview</span>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="relative flex-1 min-h-0">
              <iframe
                src={previewModalUrl}
                title="3D preview"
                className="absolute inset-0 h-full w-full rounded-b-2xl border-0"
                allowFullScreen
                allow="autoplay; fullscreen; xr-spatial-tracking"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
