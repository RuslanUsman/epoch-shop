import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Avatar from "../components/Avatar";

export default function ProfileAvatar({ user }) {
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e) {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      // 👇 путь в бакете (например avatars/users/{id}.png)
      const filePath = `users/${user.id}-${Date.now()}.png`;

      // Загружаем в Supabase Storage
      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadErr) {
        alert("Ошибка загрузки: " + uploadErr.message);
        return;
      }

      // Получаем публичный URL
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // Обновляем профиль
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateErr) {
        alert("Ошибка сохранения профиля: " + updateErr.message);
        return;
      }

      alert("Аватар обновлён!");
    } catch (err) {
      console.error("Ошибка:", err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <Avatar src={user?.avatar_url} size={128} />
      <div style={{ marginTop: "10px" }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>
    </div>
  );
}
