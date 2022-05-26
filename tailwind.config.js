module.exports = {
  content: ["./public/**/*.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        "hover-hover": { raw: "(hover: hover)" },
      },
    },
    screens: {
      sm: "540px",
    },
  },
  plugins: [],
};
