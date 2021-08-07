import https from 'https';

export const getRequest = (url: string) => new Promise((resolve, reject) => {
  https.get(url, (response) => {
    const chunks: Uint8Array[] = [];

    response.on('data', (chunk) => {
      chunks.push(chunk);
    });

    response.on('end', () => {
      const contentType = response.headers['content-type'];
      const body = Buffer.concat(chunks);

      if (contentType === undefined) {
        resolve(body.toString());
      } else if (contentType.includes('json')) {
        resolve(JSON.parse(body.toString()));
      } else if (contentType.includes('image')) {
        resolve(Buffer.concat(chunks));
      }
    });
  }).on('error', (error) => {
    reject(error);
  });
});
