import re from 'regex-parser'
import process from 'process'

console.log(re(process.argv[2]).toString())
