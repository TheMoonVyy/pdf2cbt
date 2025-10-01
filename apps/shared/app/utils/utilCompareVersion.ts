type Operator = '<' | '>' | '<=' | '>=' | '=' | '!='

const versionRegex = /^v?(\d+)\.(\d+)\.(\d+)$/

const versionNumEquivalent = (versionStr: string) => {
  const match = versionStr.match(versionRegex)
  if (match) {
    const [_, major, minor, patch] = match
    return (Number(major) * 1000000)
      + (Number(minor) * 1000)
      + Number(patch)
  }

  return 0
}

// simple version comparison utility
// which more than enough for our use case
export default (
  lhsVersion: string,
  operator: Operator,
  rhsVersion: string,
) => {
  const l = versionNumEquivalent(lhsVersion)
  const r = versionNumEquivalent(rhsVersion)

  switch (operator) {
    case '<':
      return l < r
    case '<=':
      return l <= r
    case '>':
      return l > r
    case '>=':
      return l >= r
    case '=':
      return l === r
    case '!=':
      return l !== r
  }
}
