import { Pdf2CbtDB } from '#layers/shared/db'

let db: Pdf2CbtDB | null = null
export default () => {
  if (!db)
    db = new Pdf2CbtDB()
  return db
}
