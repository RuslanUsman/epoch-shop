import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";
import Avatar from "../components/Avatar";
import SkeletonProfileRight from "../components/SkeletonProfileRight";
import "./Profile.css";

export default function Profile() {
  const { profile, setProfile } = useUser();
  const [loadingProfile, setLoadingProfile] = useState(!profile);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    setLoadingProfile(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Не удалось получить user:", authError?.message);
      setLoadingProfile(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, telegram_name, avatar_url, points")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("fetchProfile error:", error.message);
    } else {
      setProfile(data);
    }

    setLoadingProfile(false);
  };

  useEffect(() => {
    if (!profile) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loadingProfile) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <div className="profile-left">
            <div className="skeleton skeleton-avatar" />
            <div className="skeleton skeleton-button" />
            <div className="skeleton skeleton-button" />
          </div>
          <SkeletonProfileRight />
        </div>
      </div>
    );
  }

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const ext = file.name.split(".").pop();
      const filePath = `${profile.id}/${Date.now()}.${ext}`;

      // Загружаем файл в Supabase Storage
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (upErr) {
        alert("Ошибка загрузки: " + upErr.message);
        setUploading(false);
        return;
      }

      // Получаем публичный URL
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // Обновляем профиль в БД
      const { error: dbErr } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", profile.id);

      if (dbErr) {
        console.error("update avatar error:", dbErr.message);
      } else {
        setProfile((p) => ({ ...p, avatar_url: publicUrl }));
      }
    } catch (err) {
      console.error("Ошибка при загрузке аватара:", err);
    } finally {
      setUploading(false);
    }
  };

  const deleteAvatar = async () => {
    if (!profile.avatar_url) return;

    try {
      const { error: dbErr } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", profile.id);

      if (dbErr) {
        console.error("delete avatar error:", dbErr.message);
      } else {
        setProfile((p) => ({ ...p, avatar_url: null }));
      }
    } catch (err) {
      console.error("Ошибка при удалении аватара:", err);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-left">
          {uploading ? (
            <div className="skeleton skeleton-avatar" />
          ) : (
            <Avatar src={profile.avatar_url} size={128} />
          )}
          <label className={`profile-upload-label ${uploading ? "loading" : ""}`}>
            {uploading ? "Загрузка..." : "Загрузить"}
            <input
              type="file"
              className="hidden"
              onChange={uploadAvatar}
              disabled={uploading}
            />
          </label>
          <button
            onClick={deleteAvatar}
            className={`profile-delete-btn ${uploading ? "loading" : ""}`}
            disabled={uploading}
          >
            Удалить
          </button>
        </div>

        <div className="profile-right">
          <h2 className="profile-name">{profile.name}</h2>
          <p className="profile-username">@{profile.telegram_name}</p>
          <p className="profile-points">
            Мои баллы: <span>{profile.points}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
