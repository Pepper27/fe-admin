import { useEffect, useMemo, useState } from "react";
import { pathAdmin } from "../../../config/api";

const formatMoney = (value) => (Number(value) || 0).toLocaleString("vi-VN");
const formatDate = (value) => {
  if (!value) return "";
  try {
    // Display as YYYY-MM-DD
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return String(value);
  }
};

export default function DesignModal({ id, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");

    fetch(`${pathAdmin}/admin/designs/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      credentials: "include",
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((json) => {
        setData(json?.data || null);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setError(err?.message || "Failed to load");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const slotLines = useMemo(() => {
    const slotCount = Number(data?.rulesSnapshot?.slotCount) || 0;
    const items = Array.isArray(data?.itemsResolved) ? data.itemsResolved : [];
    const bySlot = new Map(items.map((it) => [Number(it.slotIndex), it]));
    const lines = [];
    for (let i = 0; i < slotCount; i++) {
      const it = bySlot.get(i);
      lines.push({
        slotIndex: i,
        empty: !it,
        charmName: it?.charmName || "",
        charmImage: it?.charmImage || "",
      });
    }
    return lines;
  }, [data]);

  const braceletTitle = (() => {
    const name = data?.braceletDisplay?.name || "";
    const size = data?.braceletDisplay?.sizeCm;
    if (!name && !size) return "";
    if (name && size) return `${name} (${size}cm)`;
    return name || `${size}cm`;
  })();

  const pricing = data?.priceSnapshot || {};

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative w-[min(920px,92vw)] max-h-[88vh] overflow-auto rounded-[14px] bg-white border border-gray-200 shadow-lg">
        <div className="px-[22px] py-[18px] border-b border-gray-200">
          <div className="text-[18px] font-[800]">Design #{String(data?._id || id).slice(-3)}</div>
          <div className="text-[12px] text-gray-500">{data?._id || id}</div>
        </div>

        <div className="px-[22px] py-[18px]">
          {loading ? <div className="text-[14px] text-gray-600">Đang tải...</div> : null}
          {error ? <div className="text-[14px] text-red-600">{error}</div> : null}

          {!loading && !error && data ? (
            <>
              <div className="text-[14px] font-[800] mb-[10px]">Bracelet</div>
              <div className="flex items-center gap-[12px]">
                <div className="w-[64px] h-[64px] rounded-[10px] border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                  {data?.braceletDisplay?.image ? (
                    <img
                      src={data.braceletDisplay.image}
                      alt={data?.braceletDisplay?.name || "Bracelet"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-[11px] text-gray-400">No image</div>
                  )}
                </div>
                <div className="text-[14px] font-[700]">{braceletTitle || "(Không có dữ liệu)"}</div>
              </div>

              <div className="mt-[18px] text-[14px] font-[800]">Slots</div>
              <div className="mt-[10px] border-t border-gray-200" />
              <div className="mt-[10px]">
                {slotLines.length ? (
                  slotLines.map((line) => (
                    <div key={line.slotIndex} className="flex items-center justify-between py-[10px] border-b border-gray-100">
                      <div className="text-[13px] font-[700]">Slot {line.slotIndex}</div>
                      <div className="flex items-center gap-[10px]">
                        {line.empty ? (
                          <div className="text-[13px] text-gray-400">[Empty]</div>
                        ) : (
                          <>
                            <div className="w-[28px] h-[28px] rounded-[8px] border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                              {line.charmImage ? (
                                <img src={line.charmImage} alt={line.charmName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-[10px] text-gray-400">No</div>
                              )}
                            </div>
                            <div className="text-[13px]">[Charm {line.charmName || ""}]</div>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[13px] text-gray-500">Không có slotCount</div>
                )}
              </div>

              <div className="mt-[18px] border-t border-gray-200" />
              <div className="mt-[16px] text-[14px] font-[800]">Pricing</div>
              <div className="mt-[10px]">
                <div className="flex justify-between text-[13px] py-[6px]">
                  <div className="font-[700]">Bracelet:</div>
                  <div>{formatMoney(pricing.braceletPrice)}</div>
                </div>
                <div className="flex justify-between text-[13px] py-[6px]">
                  <div className="font-[700]">Charms:</div>
                  <div>{formatMoney(pricing.charmsPrice)}</div>
                </div>
                <div className="flex justify-between text-[13px] py-[6px] border-t border-gray-200 mt-[6px] pt-[10px]">
                  <div className="font-[800]">Total:</div>
                  <div className="font-[800]">{formatMoney(pricing.total)}</div>
                </div>
              </div>

              <div className="mt-[18px] border-t border-gray-200" />
              <div className="mt-[12px] text-[13px] text-gray-700">
                <div>Created: {formatDate(data.createdAt)}</div>
                <div>
                  User: {data?.user?.email || data?.user?.fullName || "(guest)"} / {data?.user?.guestId || data?.guestId}
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="px-[22px] py-[16px] border-t border-gray-200 flex justify-end gap-[10px]">
          <button
            type="button"
            onClick={onClose}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-[14px] font-[700] px-[18px] py-[10px] rounded-[10px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
