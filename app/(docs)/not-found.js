"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import explorerCat from "@/assets/explorer-cat.webp";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      style={{
        fontFamily:
          "PlayFair, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #ffffff, #f5f5f5)",
        padding: "1rem",
      }}
    >
      {/* 404 Heading */}
      <h1
        style={{
          fontSize: "5.5rem",
          fontWeight: "700",
          color: "#155e4d",
          margin: "0.5rem 0",
          marginBottom: "0",
        }}
      >
        404
      </h1>

      {/* Page Not Found */}
      <h2
        style={{
          fontSize: "1.875rem",
          fontWeight: "700",
          color: "#155e4d",
          margin: "0.5rem 0",
          textTransform: "uppercase",
          marginBottom: "1rem",
        }}
      >
        Page Not Found
      </h2>
      {/* Subtitle */}
      <p
        style={{
          fontSize: "1.125rem",
          color: "#676767",
          marginBottom: "1.5rem",
          textAlign: "center",
          maxWidth: "28rem",
          margin: "0 0 1.5rem 0",
        }}
      >
        Don't worry, our friendly feline explorer is on the case!
      </p>

      {/* Explorer Cat Image */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "300px",
          marginBottom: "1.5rem",
        }}
      >
        <Image
          src={explorerCat}
          alt="Friendly feline explorer"
          width={450}
          style={{
            objectFit: "contain",
            position: "absolute",
            top: "-50%",
            filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.01))",
            left: "50%",
            transform: "translateX(-50%)",
          }}
          priority
        />
      </div>

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        style={{
          paddingLeft: "2rem",
          paddingRight: "2rem",
          paddingTop: "0.75rem",
          paddingBottom: "0.75rem",
          backgroundColor: "#059669",
          color: "white",
          fontWeight: "600",
          borderRadius: "9999px",
          border: "none",
          cursor: "pointer",
          transition: "background-color 0.2s ease",
          fontSize: "1rem",
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#34d399")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#059669")}
      >
        Go Back
      </button>
    </div>
  );
}
