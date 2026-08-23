// Classe d'erreur custom utilisée dans tout le backend pour renvoyer des erreurs
// avec un code HTTP précis et, si besoin, une liste de détails structurés
// (par exemple la liste des conflits détectés sur un créneau).

class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message, details = null) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Authentification requise.') {
    return new ApiError(401, message);
  }

  static forbidden(message = "Accès refusé, vous n'avez pas les droits nécessaires.") {
    return new ApiError(403, message);
  }

  static notFound(message = 'Ressource introuvable.') {
    return new ApiError(404, message);
  }

  static conflict(message, details = null) {
    return new ApiError(409, message, details);
  }
}

module.exports = ApiError;
