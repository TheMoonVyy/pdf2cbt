// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async <T = any>(file: File | Blob): Promise<T> => {
  try {
    const jsonData = await new Response(file).json()
    return jsonData
  }
  catch (e) {
    throw new Error('Invalid JSON file', { cause: e })
  }
}
