export default (filename: string, fileToSave: Blob | File) => {
  const url = URL.createObjectURL(fileToSave)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
