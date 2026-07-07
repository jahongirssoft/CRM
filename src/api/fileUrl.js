const FILE_BASE = "https://najot-edu.softwareengineer.uz/files";

// Profil rasmlari (talaba/o'qituvchi avatar) — /files/{fayl} (bitta files)
export const imgUrl = (filename) => {
  if (!filename) return null;
  if (filename.startsWith("http")) return filename;
  return `${FILE_BASE}/${filename}`;
};

// Dars fayllari (video, uy vazifa) — /files/files/{fayl} (ikkita files)
export const lessonFileUrl = (filename) => {
  if (!filename) return null;
  if (filename.startsWith("http")) return filename;
  return `${FILE_BASE}/files/${filename}`;
};

// Talaba/o'qituvchi obyektidan foto URL ni topadi
export const getPhotoUrl = (obj) => {
  if (!obj) return null;
  const raw = obj.photo ?? obj.avatar ?? obj.image ?? obj.profile_photo ?? obj.profilePhoto ?? obj.profile_pic ?? null;
  return imgUrl(raw);
};

export const videoUrl = lessonFileUrl;
