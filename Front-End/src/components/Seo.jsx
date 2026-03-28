import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'Wemax';
const DEFAULT_TITLE = 'Wemax | Premium Electronics, Church & Event Gear in Kenya';
const DEFAULT_DESCRIPTION =
    'Shop Wemax for premium electronics, church sound systems, livestream gear, home entertainment and curated bundles with fast delivery across Kenya.';
const DEFAULT_IMAGE = '/wemax-logo.jpg';
// Prefer explicit env var, but default to planned production domain
const CANONICAL_BASE = import.meta.env.VITE_PUBLIC_SITE_URL || 'https://wemax.co.ke';

function buildTitle(title) {
    if (!title) return DEFAULT_TITLE;
    if (title.includes('Wemax')) return title;
    return `${title} | ${SITE_NAME}`;
}

function buildCanonical(pathname) {
    if (!CANONICAL_BASE) return undefined;
    const base = CANONICAL_BASE.replace(/\/+$/, '');
    const path = pathname || '/';
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function Seo({ title, description, image, type = 'website', children }) {
    const location = useLocation();
    const finalTitle = buildTitle(title);
    const finalDescription = description || DEFAULT_DESCRIPTION;
    const canonical = buildCanonical(location.pathname);
    const imageUrl = image || DEFAULT_IMAGE;

    return (
        <Helmet>
            <title>{finalTitle}</title>
            <meta name="description" content={finalDescription} />
            <meta property="og:type" content={type} />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={finalDescription} />
            {canonical && <meta property="og:url" content={canonical} />}
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:image" content={imageUrl} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={finalTitle} />
            <meta name="twitter:description" content={finalDescription} />
            <meta name="twitter:image" content={imageUrl} />
            {canonical && <link rel="canonical" href={canonical} />}
            {children}
        </Helmet>
    );
}

export function SeoProvider({ children }) {
    return <HelmetProvider>{children}</HelmetProvider>;
}

