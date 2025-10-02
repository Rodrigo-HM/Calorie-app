import app from "./app";

const port = process.env.PORT || 3000; //si existe la usa, si no 3000

app.listen(Number(port), () => { //arranca el servidor http en port, asegurando que es un numero
console.log(`API running on http://localhost:${port}`); //lo imprime en consola
});