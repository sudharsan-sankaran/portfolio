"use client";

import { useEffect, useRef, type RefObject } from "react";

// The scene and DOM share one progress value; scrolling never re-renders React.
export function useStudioMotion(
  root: RefObject<HTMLDivElement | null>,
  track: RefObject<HTMLDivElement | null>,
  progress: RefObject<number>,
  paused: boolean,
  reduced: boolean,
) {
  const pausedRef = useRef(paused);
  const control = useRef<((pause: boolean) => void) | null>(null);
  useEffect(() => {
    pausedRef.current = paused;
    control.current?.(paused);
  }, [paused]);

  useEffect(() => {
    const el = root.current, runway = track.current;
    if (!el || !runway || reduced || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);
      let sequence: gsap.core.Timeline | undefined;
      let trigger: ReturnType<typeof ScrollTrigger.create> | undefined;
      const reveals: gsap.core.Timeline[] = [];
      const removeFocusListeners: (() => void)[] = [];
      const mm = gsap.matchMedia();
      const ctx = gsap.context(() => {
        mm.add("(min-width: 700px) and (min-height: 700px)", () => {
          runway.dataset.cinematic = "true";
          const image = el.querySelector("[data-portrait]");
          const copy = el.querySelector("[data-hero-copy]");
          const statement = el.querySelector("[data-statement]");
          const frame = el.querySelector("[data-frame]");
          const shade = el.querySelector("[data-scene-shade]");
          const proxy = { value: 0 };
          sequence = gsap.timeline({ paused: true, defaults: { ease: "none" } });
          sequence
            .to(proxy, { value: 1, duration: 1, onUpdate: () => { progress.current = proxy.value; } }, 0)
            .fromTo(image, { scale: 1.03, xPercent: 0, yPercent: 0, transformOrigin: "70% 0%" }, { scale: 1.32, xPercent: -8, duration: .64 }, 0)
            .to(copy, { y: -110, x: -75, autoAlpha: 0, duration: .27, ease: "power2.in" }, .07)
            .fromTo(frame, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(9% 5% 11% 43%)", duration: .42, ease: "power2.inOut" }, .35)
            .to(image, { yPercent: 8, duration: .42, ease: "power2.inOut" }, .35)
            .fromTo(shade, { opacity: 0 }, { opacity: .4, duration: .42 }, .30)
            .fromTo(statement, { y: 65, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .24, ease: "power3.out" }, .48)
            .to(image, { scale: 1.18, xPercent: -5, duration: .3, ease: "power2.out" }, .66)
            .to(el.querySelector("[data-scroll-line]"), { scaleX: 1, duration: 1 }, 0);
          const seek = (instant = false) => {
            if (pausedRef.current || !sequence || !trigger) return;
            gsap.to(sequence, { progress: trigger.progress, duration: instant ? 0 : .65, ease: "power2.out", overwrite: true });
          };
          trigger = ScrollTrigger.create({
            trigger: runway, start: "top top", end: "bottom bottom",
            onUpdate: () => seek(), onRefresh: () => seek(true),
          });
          seek(true);
          return () => {
            if (sequence) gsap.killTweensOf(sequence);
            delete runway.dataset.cinematic;
            progress.current = 0;
          };
        });

        // Section motion is independently triggered, so anchor navigation works.
        el.querySelectorAll<HTMLElement>("[data-reveal]").forEach(node => {
          const heading = node.matches("h2");
          const tl = gsap.timeline({ paused: true });
          if (heading) {
            tl.fromTo(node, { "--wipe": 1 }, { "--wipe": 0, duration: 1.05, ease: "power4.inOut" });
          } else {
            tl.fromTo(node, { y: 44, opacity: 0 }, { y: 0, opacity: 1, duration: .85, ease: "power3.out" });
          }
          reveals.push(tl);
          ScrollTrigger.create({ trigger: node, start: "top 94%", once: true,
            onEnter: () => { if (pausedRef.current) tl.progress(1); else tl.play(); },
          });
          // Tab navigation must never encounter visually hidden content.
          const showFocused = () => { tl.progress(1); };
          node.addEventListener("focusin", showFocused, { once: true });
          removeFocusListeners.push(() => node.removeEventListener("focusin", showFocused));
        });
      }, el);
      control.current = (pause) => {
        if (sequence) gsap.killTweensOf(sequence);
        if (pause) reveals.forEach(t => t.progress(1));
        else if (sequence && trigger) gsap.to(sequence, { progress: trigger.progress, duration: .65, ease: "power2.out" });
      };
      if (pausedRef.current) control.current(true);
      const refresh = () => { if (!disposed) ScrollTrigger.refresh(); };
      void document.fonts.ready.then(refresh);
      cleanup = () => { removeFocusListeners.forEach(remove => remove()); control.current = null; if (sequence) gsap.killTweensOf(sequence); mm.revert(); ctx.revert(); progress.current = 0; };
    }).catch(() => { /* Native, visible content remains usable without the motion library. */ });
    return () => { disposed = true; cleanup?.(); };
  }, [root, track, progress, reduced]);
}
