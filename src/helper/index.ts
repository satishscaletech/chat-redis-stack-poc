interface PaginationOffset {
  limit: number;
  offset: number;
  pagenumber: number;
}

export function getPaginateOffset(
  pageNumber: number,
  recordPerPage: number,
): PaginationOffset {
  const pagenumber = pageNumber ? Number(pageNumber) : 1;
  const limit = recordPerPage ? Number(recordPerPage) : 10;
  const offset = (pagenumber - 1) * limit;
  return { limit, offset, pagenumber };
}
