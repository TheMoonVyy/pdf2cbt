export default (value: string) => {
  return value.startsWith('#') ? value : `#${value}`
}
