import { formatFileSize } from './fields';

export const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const MAX_PHOTOS = 10;

export interface PendingPhoto {
  id: string;
  file: File;
  preview: string;
}

let sequence = 0;
export const newPhotoId = () => `photo-${Date.now()}-${(sequence += 1)}`;

const sameFile = (a: File, b: File) => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

/** Separa os arquivos aceitos dos recusados; cada recusa vem com o nome do arquivo e o motivo. */
export function validatePhotoFiles(files: File[], pending: File[], existingCount: number) {
  const accepted: File[] = [];
  const rejected: string[] = [];
  let slots = Math.max(0, MAX_PHOTOS - existingCount - pending.length);

  for (const file of files) {
    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
      rejected.push(`${file.name}: formato não aceito. Use JPG, PNG, WEBP ou GIF.`);
    } else if (file.size === 0) {
      rejected.push(`${file.name}: o arquivo está vazio.`);
    } else if (file.size > MAX_PHOTO_BYTES) {
      rejected.push(`${file.name}: tem ${formatFileSize(file.size)} e o limite é 5 MB por foto.`);
    } else if ([...pending, ...accepted].some((other) => sameFile(other, file))) {
      rejected.push(`${file.name}: essa foto já está na lista.`);
    } else if (slots === 0) {
      rejected.push(`${file.name}: limite de ${MAX_PHOTOS} fotos atingido.`);
    } else {
      accepted.push(file);
      slots -= 1;
    }
  }
  return { accepted, rejected };
}
