import { useCallback, useEffect, useState } from 'react';
import FloatingChatWidgetsHint, {
    markFloatingChatWidgetsHintDismissed,
    readDismissed,
} from './FloatingChatWidgetsHint.jsx';
import ShopAssistantWidget from './ShopAssistantWidget.jsx';
import SupportChatWidget from './SupportChatWidget.jsx';

/** Two independent floating widgets; opening one closes the other (mobile-friendly). */
export default function ChatWidget() {
    const [shopOpen, setShopOpen] = useState(false);
    const [supportOpen, setSupportOpen] = useState(false);
    const [hintVisible, setHintVisible] = useState(() => !readDismissed());

    const dismissHint = useCallback(() => setHintVisible(false), []);

    const setShopOpenExclusive = useCallback((v) => {
        setShopOpen(v);
        if (v) setSupportOpen(false);
    }, []);

    const setSupportOpenExclusive = useCallback((v) => {
        setSupportOpen(v);
        if (v) setShopOpen(false);
    }, []);

    useEffect(() => {
        if (shopOpen || supportOpen) {
            markFloatingChatWidgetsHintDismissed();
            setHintVisible(false);
        }
    }, [shopOpen, supportOpen]);

    return (
        <>
            <FloatingChatWidgetsHint visible={hintVisible} onDismiss={dismissHint} />
            <ShopAssistantWidget isOpen={shopOpen} setIsOpen={setShopOpenExclusive} />
            <SupportChatWidget isOpen={supportOpen} setIsOpen={setSupportOpenExclusive} />
        </>
    );
}
