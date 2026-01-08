import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/TypingMaster/", // রিপোজিটরি নাম অনুযায়ী বেস পাথ
})
