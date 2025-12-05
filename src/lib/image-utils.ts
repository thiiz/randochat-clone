'use client';

/**
 * Comprime e redimensiona uma imagem no lado do cliente usando Canvas API.
 * Isso economiza bandwidth e custos de serverless functions.
 *
 * @param file - Arquivo de imagem original
 * @param maxSize - Tamanho máximo em pixels (largura e altura)
 * @param quality - Qualidade da compressão (0-1)
 * @returns Promise<File> - Arquivo comprimido
 */
export async function compressImage(
  file: File,
  maxSize: number = 500,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Criar canvas com o tamanho desejado
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Não foi possível criar contexto do canvas'));
          return;
        }

        // Calcular dimensões mantendo aspect ratio e fazendo crop centralizado
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = img.width;
        let sourceHeight = img.height;

        // Crop para quadrado (pega o menor lado)
        if (img.width > img.height) {
          sourceX = (img.width - img.height) / 2;
          sourceWidth = img.height;
        } else {
          sourceY = (img.height - img.width) / 2;
          sourceHeight = img.width;
        }

        // Definir tamanho do canvas
        canvas.width = maxSize;
        canvas.height = maxSize;

        // Desenhar imagem redimensionada e cortada
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          maxSize,
          maxSize
        );

        // Tentar WebP primeiro, fallback para JPEG
        const tryFormats = ['image/webp', 'image/jpeg'];
        let blob: Blob | null = null;
        let mimeType = 'image/jpeg';
        let extension = 'jpg';

        const tryConvert = (formatIndex: number) => {
          const format = tryFormats[formatIndex];

          canvas.toBlob(
            (resultBlob) => {
              if (resultBlob && resultBlob.size > 0) {
                blob = resultBlob;
                mimeType = format;
                extension = format === 'image/webp' ? 'webp' : 'jpg';

                // Criar novo File com o blob comprimido
                const compressedFile = new File([blob], `avatar.${extension}`, {
                  type: mimeType
                });

                resolve(compressedFile);
              } else if (formatIndex < tryFormats.length - 1) {
                // Tentar próximo formato
                tryConvert(formatIndex + 1);
              } else {
                reject(new Error('Não foi possível comprimir a imagem'));
              }
            },
            format,
            quality
          );
        };

        tryConvert(0);
      };

      img.onerror = () => {
        reject(new Error('Erro ao carregar a imagem'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo'));
    };

    reader.readAsDataURL(file);
  });
}
