import fs from "node:fs";
import * as mupdf from "mupdf";
import path from 'path';

function saveImageAsSVG(pdfBytes) {
  const dir = '/tmp/test_fiitjee'
  fs.mkdirSync(dir, { recursive: true }) // ensure folder exists
  
  const doc = mupdf.Document.openDocument(pdfBytes, "application/pdf")
  const totalPages = doc.countPages()
  for (let i = 0; i < totalPages; i++) {
    const page = doc.loadPage(i)
    const buffer = new mupdf.Buffer()
    const writer = new mupdf.DocumentWriter(buffer, "svg", "text=path")
    const device = writer.beginPage(page.getBounds())
    page.run(device, mupdf.Matrix.identity)
    device.close()
    writer.endPage()
    const filename = path.join(dir, `${i+1}.svg`)
    buffer.save(filename)
  }
}

// Example invocation (adjust file path and page index as needed):
const pdf = fs.readFileSync("/mnt/sda3/pdf2cbt_work/tests_cleaned/FIITJEE/2025/Full Test - 01/AITS-2425-FT-I-LD-JEEA-Paper-1-OFFLINE.pdf")
saveImageAsSVG(pdf)