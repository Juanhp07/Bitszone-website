const fs = require('fs');
let code = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');

const oldGif = "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExaTFrMXZ5YWcxdTVqNDIyZ3lhdjBheGlzc3c0eHczNncwNDVhZzQzbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3dfEA0VTslup2/giphy.gif";
const newGif = "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3hucnF0OHN3c29uaDM0dnQ0bmFmNWEwbTdub2JsYW05b2xoYzA2dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/DUu5TWUWVZBkI/giphy.gif";

code = code.split(oldGif).join(newGif);

fs.writeFileSync('src/components/player/MainApp.tsx', code);
console.log('GIF updated');
