export default function Avatar({ src, size = 128 }) {
  return (
    <img
      src={src || "/default-avatar.png"}
      alt="Аватар"
      className="rounded-full object-cover border"
      style={{ width: size, height: size }}
    />
  );
}
