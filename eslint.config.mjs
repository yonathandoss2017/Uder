export default {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"], // Archivos que se analizarán
    languageOptions: {
        parserOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
        },
    },
    rules: {
        "no-unused-vars": "warn", // Solo advertencia
        "react/jsx-uses-react": "off", // No aplica en React 17+
        "react/react-in-jsx-scope": "off", // No aplica en Next.js
        "some-other-rule": "off" // Ejemplo
    },
};
