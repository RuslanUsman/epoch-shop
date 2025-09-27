// src/components/ProductImage.jsx
export default function ProductImage({ src, alt, size = 128 }) {
  const defaultUrl = `${import.meta.env.BASE_URL}images/default-product.png`;

  const finalSrc = src
    ? src.startsWith("http")
      ? src
      : `${import.meta.env.BASE_URL}${src.replace(/^\//, "")}`
    : defaultUrl;

  return (
    <img
      src={finalSrc}
      alt={alt || "Товар"}
      style={{ width: size, height: size, objectFit: "contain" }}
      onError={(e) => {
        console.error(`Ошибка загрузки изображения: ${src}`);
        e.currentTarget.src = defaultUrl;
      }}
    />
  );
}
