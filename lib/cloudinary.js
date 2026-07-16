// lib/cloudinary.js — Client Cloudinary
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'kmilvqsi'
const API_KEY    = process.env.CLOUDINARY_API_KEY
const API_SECRET = process.env.CLOUDINARY_API_SECRET

// Upload via API Cloudinary
export async function uploadToCloudinary(file, options = {}) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', options.preset || 'wedding_photos')
  formData.append('folder', options.folder || 'mariage')
  if (options.tags) formData.append('tags', options.tags.join(','))
  if (options.public_id) formData.append('public_id', options.public_id)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )
  if (!res.ok) throw new Error('Upload échoué')
  return res.json()
}

// URL optimisée
export function cloudinaryUrl(publicId, transforms = {}) {
  const { w = 800, h = 600, fit = 'fill', q = 'auto', f = 'auto' } = transforms
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${w},h_${h},c_${fit},q_${q},f_${f}/${publicId}`
}

// Thumbnail
export function thumbnail(publicId) {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_300,h_220,c_fill,q_auto,f_auto/${publicId}`
}

export { CLOUD_NAME }
