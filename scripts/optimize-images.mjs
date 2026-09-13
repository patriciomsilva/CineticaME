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
  { src: path.join(corpDir, 'IMG_6917.JPG'), name: 'equipe-hero', width: 1200, height: 800, smWidth: 600, smHeight: 400, position: 'center' },
  { src: path.join(corpDir, 'IMG_7437.JPG'), name: 'equipe-institucional', width: 1000, height: 667, smWidth: 500, smHeight: 333, position: 'center' },
  { src: path.join(corpDir, 'IMG_7282.JPG'), name: 'atendimento-balcao', width: 700, height: 875, smWidth: 400, smHeight: 500, position: 'north' },
  { src: path.join(corpDir, 'IMG_7256.JPG'), name: 'showroom-iluminacao', width: 700, height: 875, smWidth: 400, smHeight: 500, position: 'center' },
  { src: path.join(corpDir, 'IMG_7260.JPG'), name: 'estoque-estrutura', width: 700, height: 875, smWidth: 400, smHeight: 500, position: 'center' },
  { src: path.join(corpDir, 'IMG_7274.JPG'), name: 'balcao-detalhe', width: 700, height: 875, smWidth: 400, smHeight: 500, position: 'center' },
  { src: path.join(prodDir, 'DSC09813.JPG'), name: 'loja-fachada', width: 1000, height: 643, smWidth: 500, smHeight: 321, position: 'center' }
];

async function processImages() {
  console.log('⚡ Processando imagens reais otimizadas...');
  let count = 0;
  for (const item of imageMap) {
    if (!fs.existsSync(item.src)) {
      console.warn('⚠️ Imagem não encontrada:', item.src);
      continue;
    }
    try {
      const pipeline = sharp(item.src).resize(item.width, item.height, { fit: 'cover', position: item.position || 'center' });
      await pipeline.clone().webp({ quality: 82, effort: 6 }).toFile(path.join(outDir, `${item.name}.webp`));
      await pipeline.clone().avif({ quality: 75, effort: 6 }).toFile(path.join(outDir, `${item.name}.avif`));
      
      const smPipeline = sharp(item.src).resize(item.smWidth, item.smHeight, { fit: 'cover', position: item.position || 'center' });
      await smPipeline.clone().webp({ quality: 80, effort: 6 }).toFile(path.join(outDir, `${item.name}-sm.webp`));
      await smPipeline.clone().avif({ quality: 72, effort: 6 }).toFile(path.join(outDir, `${item.name}-sm.avif`));
      
      count++;
      console.log(`✅ [${count}/${imageMap.length}] ${item.name} gerado (.webp, .avif, -sm.webp, -sm.avif)`);
    } catch (err) {
      console.error(`❌ Erro em ${item.name}:`, err.message);
    }
  }
  console.log(`✨ Total de ${count} imagens reais processadas!`);
}

processImages();
