import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const corpDir = path.resolve('Imagens/Fotos corporativas-20260913T143540Z-1-001/Fotos corporativas');
const prodDir = path.resolve('Imagens/Fotos dos produtos-20260913T143548Z-1-001/Fotos dos produtos');
const outDir = path.resolve('public/assets/images');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Imagens reais confirmadas para a versão institucional refinada
const imageMap = [
  { src: path.join(corpDir, 'IMG_6917.JPG'), name: 'equipe-hero', width: 1800, height: 1200, position: 'center' },
  { src: path.join(corpDir, 'IMG_7437.JPG'), name: 'equipe-institucional', width: 1400, height: 933, position: 'center' },
  { src: path.join(corpDir, 'IMG_7282.JPG'), name: 'atendimento-balcao', width: 800, height: 1000, position: 'north' },
  { src: path.join(corpDir, 'IMG_7256.JPG'), name: 'showroom-iluminacao', width: 800, height: 1000, position: 'center' },
  { src: path.join(corpDir, 'IMG_7260.JPG'), name: 'estoque-estrutura', width: 800, height: 1000, position: 'center' },
  { src: path.join(corpDir, 'IMG_7274.JPG'), name: 'balcao-detalhe', width: 800, height: 1000, position: 'center' },
  { src: path.join(prodDir, 'DSC09813.JPG'), name: 'loja-fachada', width: 1400, height: 900, position: 'center' }
];

async function processImages() {
  console.log('⚡ Processando imagens reais confirmadas...');
  let count = 0;
  for (const item of imageMap) {
    if (!fs.existsSync(item.src)) {
      console.warn('⚠️ Imagem não encontrada:', item.src);
      continue;
    }
    try {
      const pipeline = sharp(item.src).resize(item.width, item.height, { fit: 'cover', position: item.position || 'center' });
      await pipeline.clone().webp({ quality: 84 }).toFile(path.join(outDir, `${item.name}.webp`));
      await pipeline.clone().avif({ quality: 80 }).toFile(path.join(outDir, `${item.name}.avif`));
      await sharp(item.src)
        .resize(Math.round(item.width / 2), Math.round(item.height / 2), { fit: 'cover', position: item.position || 'center' })
        .webp({ quality: 80 })
        .toFile(path.join(outDir, `${item.name}-sm.webp`));
      count++;
      console.log(`✅ [${count}/${imageMap.length}] ${item.name} gerado (.webp, .avif, -sm.webp)`);
    } catch (err) {
      console.error(`❌ Erro em ${item.name}:`, err.message);
    }
  }
  console.log(`✨ Total de ${count} imagens reais processadas!`);
}

processImages();
