/*
  Converts a camelCase string into human-readable format
  eg: 'someCamelCase' --> 'Some Camel Case'
*/
export default (str: string) => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, match => match.toUpperCase())
}
