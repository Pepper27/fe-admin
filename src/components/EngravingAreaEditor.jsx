import React, { useRef, useState, useEffect } from "react";

// Minimal draggable/resizable single-area editor.
// Props: imageUrl, initialArea {xPct,yPct,wPct,hPct,shape}, onChange(area)
export default function EngravingAreaEditor({
  imageUrl,
  initialArea,
  onChange,
}) {
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const [area, setArea] = useState(
    initialArea || { xPct: 25, yPct: 25, wPct: 50, hPct: 50, shape: "rect" },
  );

  useEffect(() => {
    onChange && onChange(area);
  }, [area]);

  // Convert percentages to pixel rect inside image element
  const toPixels = () => {
    const img = imgRef.current;
    if (!img) return null;
    const rect = img.getBoundingClientRect();
    const left = rect.left;
    const top = rect.top;
    const w = rect.width;
    const h = rect.height;
    const x = (area.xPct / 100) * w + left;
    const y = (area.yPct / 100) * h + top;
    const width = (area.wPct / 100) * w;
    const height = (area.hPct / 100) * h;
    return {
      left: x,
      top: y,
      width,
      height,
      imgLeft: left,
      imgTop: top,
      imgW: w,
      imgH: h,
    };
  };

  // Drag logic
  useEffect(() => {
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startArea = null;

    const onMouseMove = (e) => {
      if (!dragging) return;
      const img = imgRef.current;
      const rect = img.getBoundingClientRect();
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const newLeftPx = Math.min(
        Math.max((startArea.xPct / 100) * rect.width + dx, 0),
        rect.width - (startArea.wPct / 100) * rect.width,
      );
      const newTopPx = Math.min(
        Math.max((startArea.yPct / 100) * rect.height + dy, 0),
        rect.height - (startArea.hPct / 100) * rect.height,
      );
      setArea((prev) => ({
        ...prev,
        xPct: Number(((newLeftPx / rect.width) * 100).toFixed(2)),
        yPct: Number(((newTopPx / rect.height) * 100).toFixed(2)),
      }));
    };

    const onMouseUp = () => {
      dragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    const onMouseDown = (e) => {
      if (e.target.dataset.role !== "drag-handle") return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startArea = { ...area };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      e.preventDefault();
    };

    const container = containerRef.current;
    container && container.addEventListener("mousedown", onMouseDown);
    return () => {
      container && container.removeEventListener("mousedown", onMouseDown);
    };
  }, [area]);

  // Resize via corner handle (bottom-right)
  useEffect(() => {
    let resizing = false;
    let startX = 0;
    let startY = 0;
    let startArea = null;

    const onMove = (e) => {
      if (!resizing) return;
      const img = imgRef.current;
      const rect = img.getBoundingClientRect();
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const newW = Math.min(
        Math.max((startArea.wPct / 100) * rect.width + dx, 10),
        rect.width - (startArea.xPct / 100) * rect.width,
      );
      const newH = Math.min(
        Math.max((startArea.hPct / 100) * rect.height + dy, 10),
        rect.height - (startArea.yPct / 100) * rect.height,
      );
      setArea((prev) => ({
        ...prev,
        wPct: Number(((newW / rect.width) * 100).toFixed(2)),
        hPct: Number(((newH / rect.height) * 100).toFixed(2)),
      }));
    };
    const onUp = () => {
      resizing = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    const onDown = (e) => {
      if (e.target.dataset.role !== "resize-handle") return;
      resizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startArea = { ...area };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      e.preventDefault();
    };

    const container = containerRef.current;
    container && container.addEventListener("mousedown", onDown);
    return () =>
      container && container.removeEventListener("mousedown", onDown);
  }, [area]);

  const px = toPixels();

  return (
    <div
      ref={containerRef}
      className="engraving-editor"
      style={{ position: "relative", width: "100%" }}
    >
      <img
        ref={imgRef}
        src={imageUrl}
        alt="preview"
        style={{
          width: "100%",
          display: "block",
          maxHeight: 400,
          objectFit: "contain",
        }}
      />
      {px && (
        <div
          style={{
            position: "absolute",
            left: px.left - px.imgLeft,
            top: px.top - px.imgTop,
            width: px.width,
            height: px.height,
            border: "2px dashed #0ea5a4",
            boxSizing: "border-box",
            cursor: "move",
            background: "rgba(14,165,164,0.06)",
          }}
          data-role="drag-handle"
        >
          <div
            data-role="resize-handle"
            style={{
              position: "absolute",
              right: -6,
              bottom: -6,
              width: 12,
              height: 12,
              background: "#0ea5a4",
              borderRadius: 2,
              cursor: "nwse-resize",
            }}
            data-role="resize-handle"
          />
        </div>
      )}
    </div>
  );
}
