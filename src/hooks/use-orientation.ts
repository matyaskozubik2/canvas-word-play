import * as React from "react";

// Orientation detection hook: true when device is in portrait mode
export function useIsPortrait() {
  const [isPortrait, setIsPortrait] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(orientation: portrait)");
    const update = () => {
      try {
        const portrait = mql.matches || window.innerHeight >= window.innerWidth;
        setIsPortrait(portrait);
      } catch {
        // no-op
      }
    };

    mql.addEventListener?.("change", update);
    window.addEventListener("resize", update);
    update();

    return () => {
      mql.removeEventListener?.("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return isPortrait;
}
