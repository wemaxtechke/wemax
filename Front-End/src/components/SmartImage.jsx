import React from 'react';

/**
 * Reusable image component with built‑in lazy loading.
 * Browsers will cache images by URL automatically, so by
 * consistently reusing the same Cloudinary URLs we minimise
 * repeat Cloudinary requests and derived assets.
 */
export default function SmartImage({ src, alt = '', className = '', ...rest }) {
    if (!src) {
        return null;
    }

    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className={className}
            {...rest}
        />
    );
}

