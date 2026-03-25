import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Proxy se backend connect kar hai
  // server: {
  //   proxy: {
  //     "/api": "http://localhost:3000"
  //   }
  // },
  plugins: [react()],
})
