export default function panic(message) {
  document.body.childNodes.forEach((c) => document.body.removeChild(c));
  document.body.innerText = `FATAL ERROR: ${message}`;
}
