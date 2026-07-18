export function createProductSchema(product, url, brand) {
  return {
    '@context': 'https://schema.org',
    '@type': product.kind === 'service' ? 'Service' : 'Product',
    name: product.name,
    description: product.summary,
    image: product.images,
    brand: { '@type': 'Brand', name: brand.englishName },
    ...(product.kind === 'service'
      ? { serviceType: '室內設計諮詢', url }
      : {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'TWD',
            price: product.price,
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url
          }
        })
  };
}
