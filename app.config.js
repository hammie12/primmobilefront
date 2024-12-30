export default {
  expo: {
    name: "PrimMobileFront",
    slug: "PrimMobileFront",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.primmobile.app",
      buildNumber: "1.0.0"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    updates: {
      url: "https://u.expo.dev/2c9b376a-1c45-4b96-940f-4fdf7b3e7778"
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    extra: {
      supabaseUrl: "https://hbxohxltckwzugtxsnxs.supabase.co",
      supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhieG9oeGx0Y2t3enVndHhzbnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0Njk1NDgsImV4cCI6MjA1MDA0NTU0OH0.yJ1Itocdt8oPiDqoGWNa7hI1tM7IgEqupsVoTcyLbbk",
      eas: {
        projectId: "2c9b376a-1c45-4b96-940f-4fdf7b3e7778"
      }
    }
  }
};
