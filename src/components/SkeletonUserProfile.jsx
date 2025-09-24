// src/components/SkeletonUserProfile.jsx
import "./Skeleton.css"

export default function SkeletonUserProfile() {
  return (
    <div className="userprofile-card skeleton-wrapper">
      <div className="skeleton skeleton-avatar" />
      <div className="userprofile-info">
        <div className="skeleton skeleton-name" />
        <div className="skeleton skeleton-username" />
        <div className="skeleton skeleton-points" />
        <div className="skeleton skeleton-button" />
        <div className="skeleton skeleton-button" />
        <div className="skeleton skeleton-input" />
        <div className="skeleton skeleton-button" />
      </div>
    </div>
  )
}
