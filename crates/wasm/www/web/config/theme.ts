// Configuration file for Lasinfon Frontend Design Tokens.
// Aligns with the Virgil Pana visual aesthetic (clean light-themed SaaS dashboard).

export const THEME = {
  colors: {
    background: "#F6F8FA", // Clean light-themed background
    card: "#FFFFFF",       // Pristine white cards
    border: "#E2E8F0",     // Light slate border
    text: {
      main: "#0F172A",     // Slate-900 for primary text
      muted: "#475569",    // Slate-600 for secondary/muted text
      light: "#94A3B8",    // Slate-400 for captions and borders
    },
    brand: {
      primary: "#2459F1",  // Virgil Pana Royal Blue
      primaryHover: "#1A46C7",
      purple: "#7C3AED",   // Resonance purple
      pink: "#DB2777",     // Energy pink
      blue: "#3B82F6",     // Standard potential blue
      green: "#16A34A",    // Success green
      red: "#EF4444",      // Danger red
    }
  },
  animations: {
    transitionSpeed: "0.15s",
    transitionEase: "cubic-bezier(0.4, 0, 0.2, 1)",
  }
};
