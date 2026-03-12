/**
 * Central GSAP plugin registration.
 *
 * Import from this file everywhere instead of importing directly from "gsap"
 * so plugins are only registered once and are always in sync.
 *
 * All plugin registrations are guarded by typeof window !== 'undefined'
 * to prevent SSR errors in Next.js App Router.
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { TextPlugin } from "gsap/TextPlugin";
import { Observer } from "gsap/Observer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(
    ScrollTrigger,
    ScrollSmoother,
    SplitText,
    ScrambleTextPlugin,
    TextPlugin,
    Observer
  );
}

export {
  gsap,
  ScrollTrigger,
  ScrollSmoother,
  SplitText,
  ScrambleTextPlugin,
  TextPlugin,
  Observer,
};
