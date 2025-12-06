/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#135bec",
        "bg-light": "#f6f6f8",
        "bg-dark": "#101622",
      },
    },
  },
  plugins: [],
};
