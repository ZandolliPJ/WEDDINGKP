import { NextResponse } from 'next/server'
import crypto from 'crypto'

const API_KEY    = process.env.CLOUDINARY_API_KEY
const API_SECRET = process.env.CLOUDINARY_API_SECRET
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'kmilvqsi'

export async function POST(req) {
  const { folder, tags, public_id } = await req.json()
  const timestamp = Math.round(Date.now() / 1000)
  const params = { folder: folder || 'mariage', timestamp,
    ...(tags && { tags: tags.join(',') }),
    ...(public_id && { public_id }) }

  const str = Object.keys(params).sort()
    .map(k => `${k}=${params[k]}`).join('&') + API_SECRET
  const signature = crypto.createHash('sha256').update(str).digest('hex')

  return NextResponse.json({ signature, timestamp, api_key: API_KEY, cloud_name: CLOUD_NAME, ...params })
}
