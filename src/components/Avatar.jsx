export default function Avatar({ src, size = 128 }) {
  const defaultUrl = `${import.meta.env.BASE_URL}images/default-avatar.png`;

  // если src уже полный URL (http/https), используем его напрямую
  const finalSrc = src
    ? (src.startsWith("http") ? src : `${import.meta.env.BASE_URL}${src}`)
    : defaultUrl;

  return (
    <img
      src={finalSrc}
      alt="Аватар"
      className="rounded-full object-cover border"
      style={{ width: size, height: size }}
      onError={(e) => {
        console.error(`Ошибка загрузки аватара: ${src}`);
        e.currentTarget.src = defaultUrl;
      }}
    />
  );
}
