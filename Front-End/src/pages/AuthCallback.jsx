import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMe } from '../redux/slices/authSlice.js';

export default function AuthCallback() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useSelector((state) => state?.ui || { theme: 'dark' });
    const [error, setError] = useState(null);

    const token = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('token');
    }, [location.search]);

    useEffect(() => {
        let cancelled = false;

        async function finishAuth() {
            try {
                if (!token) {
                    throw new Error('Missing token from Google sign-in.');
                }

                localStorage.setItem('token', token);

                // Remove token from URL ASAP
                window.history.replaceState({}, document.title, '/auth/callback');

                await dispatch(getMe()).unwrap();
                if (!cancelled) navigate('/', { replace: true });
            } catch (e) {
                if (!cancelled) setError(e?.message || 'Google sign-in failed.');
                // If token is invalid, ensure we don’t keep it
                localStorage.removeItem('token');
            }
        }

        finishAuth();
        return () => {
            cancelled = true;
        };
    }, [dispatch, navigate, token]);

    return (
        <div
            className={`w-full min-h-screen flex items-center justify-center px-4 ${
                theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'
            }`}
        >
            <div
                className={`w-full max-w-md rounded-lg p-6 sm:p-8 ${
                    theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
                } shadow-2xl`}
            >
                {!error ? (
                    <div className="text-center space-y-4">
                        <div className="mx-auto animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                            Finishing Google sign-in…
                        </p>
                    </div>
                ) : (
                    <div className="text-center space-y-4">
                        <p className="text-red-600 font-semibold">{error}</p>
                        <button
                            type="button"
                            onClick={() => navigate('/login', { replace: true })}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold transition-all duration-300"
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

