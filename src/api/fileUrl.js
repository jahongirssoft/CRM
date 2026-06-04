const FILE_BASE = "https://najot-edu.softwareengineer.uz/files";

export const imgUrl = (filename) => {
  if (!filename) return null;
  // Agar to'liq URL bo'lsa, to'g'ridan ishlat
  if (filename.startsWith("http")) return filename;
  return `${FILE_BASE}/${filename}`;
};

// Talaba/o'qituvchi obyektidan foto URL ni topadi
export const getPhotoUrl = (obj) => {
  if (!obj) return null;
  const raw = obj.photo ?? obj.avatar ?? obj.image ?? obj.profile_photo ?? obj.profilePhoto ?? obj.profile_pic ?? null;
  return imgUrl(raw);
};

export const videoUrl = (filename) => filename ? `${FILE_BASE}/files/${filename}` : null;
