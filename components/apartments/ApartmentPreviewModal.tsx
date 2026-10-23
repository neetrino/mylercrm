'use client';

type ApartmentPreviewModalProps = {
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  previewOriginalUrl: string | null;
  setPreviewOriginalUrl: (url: string | null) => void;
};

export function ApartmentPreviewModal(props: ApartmentPreviewModalProps) {
  const { previewUrl, setPreviewUrl, previewOriginalUrl, setPreviewOriginalUrl } = props;
  return (
    <>
      {/* 3D preview modal (iframe) */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => { setPreviewUrl(null); setPreviewOriginalUrl(null); }}
          role="dialog"
          aria-modal="true"
          aria-label="Preview"
        >
          <div
            className="relative flex max-h-[85vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <span className="text-sm font-medium text-gray-700">3D Preview</span>
              <button
                type="button"
                onClick={() => { setPreviewUrl(null); setPreviewOriginalUrl(null); }}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="relative min-h-[400px] flex-1 overflow-hidden rounded-b-2xl">
              <iframe
                src={previewUrl}
                title="3D Preview"
                className="absolute inset-0 h-full w-full border-0"
                allowFullScreen
                allow="autoplay; fullscreen; web-share; xr-spatial-tracking"
              />
            </div>
            {previewOriginalUrl && (
              <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                <p className="mb-2 text-xs text-gray-500">
                  If the preview is blocked (Matterport allows embedding only from certain sites), open the 3D tour in a new tab:
                </p>
                <a
                  href={previewOriginalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Open 3D tour in new tab
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
