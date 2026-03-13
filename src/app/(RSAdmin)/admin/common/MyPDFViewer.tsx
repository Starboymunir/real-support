"use client"
import React, { useState, useEffect, useRef } from 'react';
import { usePdf } from 'react-pdf-js';

interface MyPdfViewerProps {
  file: string; // You can make this `File | string` if needed
}

const MyPdfViewer: React.FC<MyPdfViewerProps> = ({ file }) => {
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(null);

  const canvasEl = useRef<HTMLCanvasElement | null>(null);

  const [loading, numPages] = usePdf({
    file,
    page,
    canvasEl,
  });

  const nextPage = () => {
    if (numPages && page < numPages) setPage((prev) => prev + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  return (
    <div className="space-y-4">
      {loading && <p>Loading...</p>}

      <canvas ref={canvasEl} />

      <div className="flex items-center justify-between">
        <button
          onClick={prevPage}
          disabled={page <= 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {numPages || "?"}
        </span>
        <button
          onClick={nextPage}
          disabled={numPages ? page >= numPages : true}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MyPdfViewer;