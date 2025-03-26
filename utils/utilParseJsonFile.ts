export default async (file: File | Blob) => {
  try {
    const jsonData = await new Response(file).json()
    return jsonData
  }
  catch (e) {
    throw new Error('Invalid JSON file', { cause: e })
  }
}
