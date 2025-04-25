import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


function addViteIgnore() {
  return {
    name: "add-vite-ignore",
    closeBundle() {
      const filePath = path.resolve(__dirname, "dist/assets/remoteEntry.js");
      let content = fs.readFileSync(filePath, "utf-8");
      content = content.replace(
        /import\(([^)]+)\)/g,
        "import(/* @vite-ignore */ $1)"
      );
      fs.writeFileSync(filePath, content);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), addViteIgnore()],
})
