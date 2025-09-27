// composables/usePlaceholderImage.ts
export const usePlaceholderImage = () => {
  const getImageOrPlaceholder = (url?: string | null) => {
    return url && url.trim() !== ''
      ? url
      : 'https://placehold.co/300x200?text=No+Image&font=roboto&bg=1c1d1d&color=ccc'
  }

  return { getImageOrPlaceholder }
}
