// Petit helper pour uniformiser le format des réponses JSON de succès envoyées par l'API.
// Toutes les routes utilisent cette forme : { success: true, message, data }.

function sendSuccess(res, statusCode, message, data = null) {
  return res.status(statusCode).json({ success: true, message, data });
}

module.exports = { sendSuccess };
