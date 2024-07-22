// src/modules/Transfer.js
const transferConversation = (userInput) => {
    // Aquí puedes implementar la lógica para determinar el área de transferencia
    const areas = ['ventas', 'soporte', 'contabilidad', 'central monitoreo'];
    let response = "Entiendo, te transfiero con uno de nuestros operadores. ¿A cuál área deseas ser transferido?\n";
    areas.forEach((area, index) => {
        response += `${index + 1}. ${area}\n`;
    });
    return response;
};

module.exports = { transferConversation };
