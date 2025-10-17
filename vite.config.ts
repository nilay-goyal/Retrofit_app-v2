import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Fallback to hardcoded value if env loading fails
  const teamName = env.VITE_TEAM_NAME || 'McMaster-Canada';
  const basePath = `/${teamName.toLowerCase().replace(/[^a-z0-9]/g, '-')}/`;
  
  return {
    base: basePath,
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            animation: ['framer-motion', 'aos'],
            ui: ['bootstrap', 'react-bootstrap'],
            icons: ['@fortawesome/fontawesome-svg-core', '@fortawesome/free-solid-svg-icons', '@fortawesome/react-fontawesome']
          }
        }
      },
      chunkSizeWarningLimit: 600
    },
    server: {
      hmr: {
        overlay: false
      }
    }
  };
});
