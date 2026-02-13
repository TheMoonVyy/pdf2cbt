export default (cacheFor: 'CBT-Maker' | 'CBT-GAK', timeSinceEpoch: number) => {
  const now = new Date(timeSinceEpoch)

  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return `${cacheFor}_${day}_${hours}-${minutes}-${seconds}.zip`
}
