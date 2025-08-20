"use client";

import React from "react";

// Image utility functions for better image handling and error detection

export const getImagePath = (imagePath) => {
  // Handle different image path formats
  if (!imagePath) {
    console.warn("⚠️ No image path provided, using placeholder");
    return "/placeholder.svg?height=100&width=100&text=No+Image";
  }

  // If it's already a full URL or starts with http/https, return as is
  if (imagePath.startsWith("http") || imagePath.startsWith("https")) {
    return imagePath;
  }

  // If it's a placeholder SVG, return as is
  if (imagePath.includes("placeholder.svg")) {
    return imagePath;
  }

  // If it starts with /images/, return as is (correct path)
  if (imagePath.startsWith("/images/")) {
    return imagePath;
  }

  // If it starts with images/ (missing leading slash), add it
  if (imagePath.startsWith("images/")) {
    return `/${imagePath}`;
  }

  // If it's just a filename, assume it's in the public/images folder
  if (!imagePath.startsWith("/")) {
    // Check if it's already a relative path from public
    if (imagePath.includes("/")) {
      return `/${imagePath}`;
    }
    return `/images/${imagePath}`;
  }

  return imagePath;
};

export const createImageWithFallback = (src, fallbackSrc = null) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      console.log("✅ Image loaded successfully:", src);
      resolve(src);
    };

    img.onerror = () => {
      console.error("❌ Failed to load image:", src);

      if (fallbackSrc) {
        console.log("🔄 Trying fallback image:", fallbackSrc);
        const fallbackImg = new Image();
        fallbackImg.crossOrigin = "anonymous";

        fallbackImg.onload = () => {
          console.log("✅ Fallback image loaded:", fallbackSrc);
          resolve(fallbackSrc);
        };

        fallbackImg.onerror = () => {
          console.error("❌ Fallback image also failed:", fallbackSrc);
          const placeholder =
            "/placeholder.svg?height=100&width=100&text=Image+Error";
          console.log("🔄 Using placeholder:", placeholder);
          resolve(placeholder);
        };

        fallbackImg.src = getImagePath(fallbackSrc);
      } else {
        const placeholder =
          "/placeholder.svg?height=100&width=100&text=Image+Error";
        console.log("🔄 Using placeholder:", placeholder);
        resolve(placeholder);
      }
    };

    img.src = getImagePath(src);
  });
};

export const preloadImage = async (src) => {
  try {
    const imagePath = getImagePath(src);
    console.log("🔄 Preloading image:", imagePath);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        console.log("✅ Image preloaded successfully:", imagePath);
        resolve(imagePath);
      };

      img.onerror = () => {
        console.error("❌ Failed to preload image:", imagePath);
        reject(new Error(`Failed to load image: ${imagePath}`));
      };

      img.src = imagePath;
    });
  } catch (error) {
    console.error("❌ Error in preloadImage:", error);
    throw error;
  }
};

export const checkImageExists = async (src) => {
  try {
    await preloadImage(src);
    return true;
  } catch (error) {
    return false;
  }
};

// Component for smart image loading with error handling
export const SmartImage = ({
  src,
  alt,
  fallbackSrc = null,
  className = "",
  style = {},
  onLoad = null,
  onError = null,
  ...props
}) => {
  const [imageSrc, setImageSrc] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        const finalSrc = await createImageWithFallback(src, fallbackSrc);

        if (isMounted) {
          setImageSrc(finalSrc);
          setIsLoading(false);
          if (onLoad) onLoad();
        }
      } catch (error) {
        console.error("❌ SmartImage error:", error);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
          if (onError) onError(error);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [src, fallbackSrc, onLoad, onError]);

  if (isLoading) {
    return (
      <div
        className={`${className}`}
        style={{
          ...style,
          minHeight: "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-tertiary)",
          borderRadius: "var(--radius-lg)",
        }}
        {...props}
      >
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        className={`${className}`}
        style={{
          ...style,
          minHeight: "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-tertiary)",
          color: "var(--text-muted)",
          borderRadius: "var(--radius-lg)",
        }}
        {...props}
      >
        <span>❌ Image Error</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc || "/placeholder.svg"}
      alt={alt}
      className={className}
      style={style}
      {...props}
    />
  );
};
