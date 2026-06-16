export type HeroVideoAsset = {
  src: string;
  poster: string;
};

export const HERO_VIDEOS: readonly HeroVideoAsset[] = [
  { src: "/videos/hero1.mp4", poster: "/videos/hero1.webp" },
  { src: "/videos/hero2.mp4", poster: "/videos/hero2.webp" },
  { src: "/videos/hero3.mp4", poster: "/videos/hero3.webp" },
] as const;

const LOADER_MIN_MS = 600;
const LOADER_TIMEOUT_MS = 5000;

/** Waits for the hero poster so the loader can exit without blocking on full video downloads. */
export function preloadHeroContent(
  timeoutMs = LOADER_TIMEOUT_MS,
): Promise<void> {
  const minimumDisplay = new Promise<void>((resolve) => {
    window.setTimeout(resolve, LOADER_MIN_MS);
  });

  const posterLoad = new Promise<void>((resolve) => {
    const poster = HERO_VIDEOS[0]?.poster;
    if (!poster) {
      resolve();
      return;
    }

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const img = new Image();
    img.addEventListener("load", finish, { once: true });
    img.addEventListener("error", finish, { once: true });
    window.setTimeout(finish, timeoutMs);
    img.src = poster;
  });

  return Promise.all([minimumDisplay, posterLoad]).then(() => undefined);
}
