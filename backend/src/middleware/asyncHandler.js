// Express 4 no atrapa automáticamente los rechazos de promesas en los
// handlers async; sin esto, un error en el controller dejaría la petición
// colgada en vez de responder con un error claro.
export function gestionarAsincrono(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
