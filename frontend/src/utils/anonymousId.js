export function getAnonymousId() {
  let id = localStorage.getItem('anonymousId');
  if (!id) {
    id = crypto.randomUUID(); // Buat ID unik sekali seumur browser
    localStorage.setItem('anonymousId', id);
  }
  return id;
}
