// src/modules/welcome.js
const welcomeMessage = (message) => {
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes('hola') || lowerCaseMessage.includes('buenas')) {
        return '¡Hola! ¿Cómo estás?';
    }
    return null; // Si no es un saludo, no responde
};

module.exports = { welcomeMessage };
