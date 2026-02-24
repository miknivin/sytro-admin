import React from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function PaginationComponent({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const blockSize = 4;
  const blockStart = Math.floor((currentPage - 1) / blockSize) * blockSize + 1;
  const blockEnd = Math.min(blockStart + blockSize - 1, totalPages);
  const pageBlock = Array.from(
    { length: blockEnd - blockStart + 1 },
    (_, i) => blockStart + i,
  );
  const hasPreviousBlock = blockStart > 1;
  const hasNextBlock = blockEnd < totalPages;

  return (
    <nav
      aria-label="Page navigation example "
      className=" flex items-center justify-center"
    >
      <ul className="mx-auto inline-flex -space-x-px py-4 text-sm">
        <li>
          <button
            onClick={() => onPageChange(Math.max(blockStart - blockSize, 1))}
            disabled={!hasPreviousBlock}
            className="ms-0 flex h-8 items-center justify-center rounded-s-lg border border-e-0 border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            Previous
          </button>
        </li>
        {pageBlock.map((page) => (
          <li key={page}>
            <button
              onClick={() => onPageChange(page)}
              className={`flex h-8 items-center justify-center px-3 leading-tight ${
                currentPage === page
                  ? "bg-blue-200 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-gray-700 dark:text-white"
                  : "bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              }`}
            >
              {page}
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={() => onPageChange(Math.min(blockStart + blockSize, totalPages))}
            disabled={!hasNextBlock}
            className="flex h-8 items-center justify-center rounded-e-lg border border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}
