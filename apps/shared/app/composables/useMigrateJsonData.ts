import { MigrateJsonData } from '#layers/shared/app/src/scripts/migrate-json-data'

let obj: MigrateJsonData | null = null

export default () => {
  if (!obj)
    obj = new MigrateJsonData(useRuntimeConfig().public.projectVersion)

  return obj
}
