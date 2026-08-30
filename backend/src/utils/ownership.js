/**
 * Compara el dueno de un documento contra el usuario autenticado.
 * Centraliza el patron `String(doc.nutritionist) !== String(req.user.id)`
 * repetido en varios controladores; un documento sin owner (campo ausente)
 * siempre se trata como no autorizado, nunca como coincidencia.
 */
const isOwnedBy = (doc, userId, field = 'nutritionist') => {
    const ownerId = doc?.[field];
    if (!ownerId || !userId) return false;
    return String(ownerId) === String(userId);
};

export default isOwnedBy;
