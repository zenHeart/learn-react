import 'server-only'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
export async function getLesson() {
  const data = JSON.parse(await readFile(path.join(process.cwd(), 'data/lesson.json'), 'utf8'))
  // Test-only synthetic marker demonstrates a server boundary; never render it or pass it as props.
  const marker = process.env.LAB_PRIVATE_NOTE
  if (marker && marker.length > 512) throw new Error('Synthetic marker exceeds fixture limit')
  return { title: data.title, summary: data.summary }
}
