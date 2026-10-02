import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');
const htmlPath = path.join(dist, 'index.html');
let html = await readFile(htmlPath, 'utf8');

const scriptTag = /<script type="module" crossorigin src="(\.\/assets\/[^\"]+\.js)"><\/script>/;
const styleTag = /<link rel="stylesheet" crossorigin href="(\.\/assets\/[^\"]+\.css)">/;
const jsPath = html.match(scriptTag)?.[1];
const cssPath = html.match(styleTag)?.[1];
if (!jsPath || !cssPath) throw new Error('Không tìm thấy JS/CSS của bản build; kiểm tra đầu ra Vite.');

const js = await readFile(path.join(dist, jsPath), 'utf8');
const css = await readFile(path.join(dist, cssPath), 'utf8');
if (/\bimport\.meta\b|\bimport\s*\(|^\s*(?:import|export)\s/m.test(js)) {
  throw new Error('Bản JS còn cú pháp module; không thể tạo index mở trực tiếp an toàn.');
}
html = html.replace(scriptTag, '');
html = html.replace(styleTag, () => `<style>\n${css.replace(/<\/style/gi, '<\\/style')}\n</style>`);
html = html.replace('</body>', () => `<script>\n${js.replace(/<\/script/gi, '<\\/script')}\n</script>\n</body>`);
await writeFile(htmlPath, html);
console.log('Đã tạo dist/index.html tự chứa JS/CSS.');
