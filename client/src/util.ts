export default function panic(message: string) {
  document.body.childNodes.forEach((c) => document.body.removeChild(c));
  document.body.innerText = `FATAL ERROR: ${message}`;
}
