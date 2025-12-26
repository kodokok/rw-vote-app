function decodeApiUrl() {
  const enc = import.meta.env.VITE_API_URL_ENC

  if (!enc) {
    throw new Error('VITE_API_URL_ENC tidak ditemukan')
  }

  try {
    // bersihkan karakter aneh
    const cleaned = enc.replace(/\s/g, '')
    return atob(cleaned)
  } catch (err) {
    console.error('ENV value:', enc)
    throw new Error('API URL env bukan Base64 valid')
  }
}

export const API_URL = decodeApiUrl()
