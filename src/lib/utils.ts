import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: 'accurate' | 'normal';
  } = {}
) {
  const { decimals = 0, sizeType = 'normal' } = opts;

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === 'accurate'
      ? (accurateSizes[i] ?? 'Bytest')
      : (sizes[i] ?? 'Bytes')
  }`;
}

/**
 * readFilesAsBase64
 * -----------------
 * Converts File objects into the structure expected by storageRouter.upload.
 *
 * @param files Array<File> – usually from input.files
 * @returns Promise<{ name: string; type: string; data: string; }[]>
 */
export async function readFilesAsBase64(
  files: File[],
): Promise<
  {
    name: string;
    type: string;
    data: string; // Base-64 (no data:prefix)
  }[]
> {
  /** read a single file */
  const readOne = (file: File) =>
    new Promise<{
      name: string;
      type: string;
      data: string;
    }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error ?? new Error("FileReader error"));
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",", 2)[1] ?? "";
        resolve({ name: file.name, type: file.type, data: base64 });
      };
      reader.readAsDataURL(file);
    });

  return Promise.all(files.map(readOne));
}
