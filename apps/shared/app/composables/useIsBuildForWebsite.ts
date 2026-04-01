let _isBuildForWebsite: boolean | undefined = undefined

export default () => {
  if (_isBuildForWebsite === undefined) {
    const raw = useRuntimeConfig().public.isBuildForWebsite as string | boolean
    _isBuildForWebsite = raw === 'true' || raw === true
  }

  return _isBuildForWebsite
}
