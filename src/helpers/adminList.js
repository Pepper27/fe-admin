export const ADMIN_LIST_LIMIT = 5000;

const parseCreatedAtFormat = (value) => {
  const text = String(value || "").trim();
  if (!text) return NaN;

  const match = text.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  if (!match) return NaN;

  const [, day, month, year, hour = "0", minute = "0", second = "0"] = match;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  ).getTime();
};

export const getCreatedTime = (item, dateKeys = ["createdAt"]) => {
  for (const key of dateKeys) {
    const value = item?.[key];
    const time = value ? new Date(value).getTime() : NaN;
    if (Number.isFinite(time) && time > 0) return time;
  }

  const createdAtFormat = parseCreatedAtFormat(item?.createdAtFormat);
  if (Number.isFinite(createdAtFormat) && createdAtFormat > 0) return createdAtFormat;

  const objectId = String(item?._id || item?.id || item?.productId || "");
  if (/^[a-f\d]{24}$/i.test(objectId)) {
    return parseInt(objectId.slice(0, 8), 16) * 1000;
  }

  return 0;
};

export const sortByCreatedDesc = (items, dateKeys) => {
  if (!Array.isArray(items)) return [];
  return items
    .slice()
    .sort((a, b) => getCreatedTime(b, dateKeys) - getCreatedTime(a, dateKeys));
};

export const paginateItems = (items, page, limit) => {
  const safeLimit = Math.max(1, Number(limit) || 10);
  const safePage = Math.max(1, Number(page) || 1);
  const startIndex = (safePage - 1) * safeLimit;
  return items.slice(startIndex, startIndex + safeLimit);
};
