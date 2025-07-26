/*
  util to merge "data" object's values into "target" object
  given that property name and type of value are same, else ignored
  This function is specificially for settings objects
*/
const utilSelectiveMergeObj = <T extends object>(
  target: T,
  data: Partial<T>,
): T => {
  if (
    typeof target !== 'object' || target === null
    || typeof data !== 'object' || data === null
  ) {
    return target
  }

  if (Array.isArray(target) && Array.isArray(data)) {
    return data as unknown as T // Fully replace arrays
  }

  for (const key of Object.keys(target) as Array<keyof T>) {
    if (!(key in data)) continue // Skip keys not in data

    const targetValue = target[key]
    const dataValue = data[key]

    if (
      typeof targetValue === 'object' && targetValue !== null
      && typeof dataValue === 'object' && dataValue !== null
    ) {
      target[key] = utilSelectiveMergeObj(
        targetValue,
        dataValue,
      ) as T[keyof T]
    }
    else if (typeof dataValue === typeof targetValue && targetValue !== dataValue) {
      target[key] = dataValue as T[keyof T]
    }
  }

  return target
}

export default utilSelectiveMergeObj
