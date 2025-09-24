// src/components/SkeletonProfileRight.jsx
import "./Skeleton.css"

export default function SkeletonProfileRight() {
  return (
    <div className="profile-right skeleton-wrapper">
      <div className="skeleton skeleton-name" />
      <div className="skeleton skeleton-username" />
      <div className="skeleton skeleton-points" />
    </div>
  )
}
