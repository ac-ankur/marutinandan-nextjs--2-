"use client";

import { useEffect, useState } from "react";
import { admin, returns } from "@/lib/api";

export default function AuthenticatedReturnPhotos({ caseId, photos = [], adminView = false }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((photo, index) => (
        <ReturnPhoto key={photo.id || index} caseId={caseId} photo={photo} adminView={adminView} />
      ))}
    </div>
  );
}

function ReturnPhoto({ caseId, photo, adminView }) {
  const [src, setSrc] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl;
    let active = true;
    const load = async () => {
      try {
        const blob = adminView
          ? await admin.returnPhoto(caseId, photo.id)
          : await returns.photo(caseId, photo.id);
        objectUrl = URL.createObjectURL(blob);
        if (active) setSrc(objectUrl);
        else URL.revokeObjectURL(objectUrl);
      } catch {
        if (active) setFailed(true);
      }
    };
    load();
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [adminView, caseId, photo.id]);

  if (failed) return <div className="flex aspect-square items-center justify-center rounded-xl bg-slate-100 p-3 text-center text-xs text-slate-500">Photo unavailable</div>;
  if (!src) return <div className="aspect-square animate-pulse rounded-xl bg-slate-100" aria-label="Loading claim photo" />;
  return <a href={src} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-slate-200"><img src={src} alt={photo.originalName || "Customer claim evidence"} className="aspect-square w-full object-cover" /></a>;
}
