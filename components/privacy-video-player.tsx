"use client";

export default function PrivacyVideoPlayer() {
  return (
    <div style={{ position: "relative", overflow: "hidden", width: "100%", paddingTop: "56.25%" }}>
      <iframe
        width="560"
        height="300"
        src="https://inliveserver.com:2000/VideoPlayer/12062"
        style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0, width: "100%", height: "100%" }}
        scrolling="no"
        frameBorder="0"
        allow="autoplay; fullscreen"
        allowFullScreen
        title="Live video"
      />
    </div>
  );
}
