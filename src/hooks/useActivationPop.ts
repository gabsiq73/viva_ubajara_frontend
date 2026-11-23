import { useState } from "react";

/** `popping` fica true só na transição inativo → ativo (nunca no mount nem ao desativar); `onAnimationEnd` encerra o pop. */
export function useActivationPop(active: boolean) {
    const [previous, setPrevious] = useState(active);
    const [popping, setPopping] = useState(false);
    if (active !== previous) {
        setPrevious(active);
        setPopping(active);
    }
    return { popping, onAnimationEnd: () => setPopping(false) };
}
