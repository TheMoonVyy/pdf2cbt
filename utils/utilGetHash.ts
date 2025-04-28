export default async function (
  input: File | ArrayBuffer | Uint8Array,
  algorithm: string = 'SHA-256',
): Promise<string> {
  let data: ArrayBuffer | Uint8Array

  if (input instanceof File) {
    data = await input.arrayBuffer()
  }
  else {
    data = input
  }

  const hashBuffer = await crypto.subtle.digest(algorithm, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
