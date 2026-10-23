'use client';

type ApartmentsPaginationProps = {
  pagination: { page: number; limit: number; total: number; total_pages: number };
  currentPage: number;
  setCurrentPage: (page: number) => void;
  allLoaded: boolean;
};

export function ApartmentsPagination(props: ApartmentsPaginationProps) {
  const { pagination, currentPage, setCurrentPage, allLoaded } = props;
  return (
    <>
      {/* Pagination */}
      {pagination.total_pages > 1 && !allLoaded && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.total_pages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="hidden items-center gap-1 sm:flex">
              {(() => {
                const pages = [];
                const totalPages = pagination.total_pages;
                const current = pagination.page;
                
                let startPage = Math.max(1, current - 3);
                let endPage = Math.min(totalPages, current + 3);
                
                if (current <= 4) {
                  startPage = 1;
                  endPage = Math.min(7, totalPages);
                }
                
                if (current >= totalPages - 3) {
                  startPage = Math.max(1, totalPages - 6);
                  endPage = totalPages;
                }
                
                if (startPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => setCurrentPage(1)}
                      className="btn-secondary"
                    >
                      1
                    </button>
                  );
                  if (startPage > 2) {
                    pages.push(
                      <span key="ellipsis-start" className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                }
                
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={
                        i === current
                          ? 'rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                          : 'btn-secondary'
                      }
                    >
                      {i}
                    </button>
                  );
                }
                
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(
                      <span key="ellipsis-end" className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      className="btn-secondary"
                    >
                      {totalPages}
                    </button>
                  );
                }
                
                return pages;
              })()}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(pagination.total_pages, currentPage + 1))}
              disabled={currentPage === pagination.total_pages}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
