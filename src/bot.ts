import TelegramBot from "node-telegram-bot-api";
import { PrismaClient } from "@prisma/client";

const token = "6869351437:AAGqrlV4S12ahJhKrOEp46YwNHUx9mOwfxE";
const bot = new TelegramBot(token, { polling: true });
const prisma = new PrismaClient();

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Envie /sejaVIP para começar ");
});

bot.onText(/\/sejaVIP/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    "Envie o pagamento via PIX para o código fornecido. Envie o comprovante para que a compra seja validada."
  );

  bot.sendMessage(
    chatId,
    "00020126580014br.gov.bcb.pix01366d8b2748-4581-41f0-ad36-ffb80b8d039052040000530398654041.005802BR5918Victor Souza Rocha6008Brasilia62080504mpda63047CE4"
  );
});

bot.onText(/\/verStatus/, async (msg) => {
  const chatId = msg.chat.id;
  console.log(chatId);
  
  try {
    const pedido = await prisma.pedido.findFirst({
      where: {
        chatId: chatId,
        status: { not: "cancelado" }, 
      },
    });

    if (pedido) {
      bot.sendMessage(chatId, `O status do seu pedido é: ${pedido.status}`);
      if(pedido.status == 'aprovado'){
        const linkGrupo = 'https://t.me/+vuQw_WXQx-k4Zjg5';
        bot.sendMessage(chatId, `Seu pedido foi aprovado! Aqui está o link para o grupo: ${linkGrupo}`);
      }
      if(pedido.status == 'pendente'){
        bot.sendMessage(chatId, `Seu pedido ainda esta em analise aguarde um momento e envie  /verStatus novamente`);
      }

    } else {
      bot.sendMessage(chatId, `Erro ${pedido}`);
    }
  } catch (error) {
    console.error("Erro ao buscar status do pedido:", error);
    bot.sendMessage(chatId, "Erro ao buscar status do pedido.");''
  }
});



bot.on("callback_query", async (query) => {
  if (query.data === "status") {
    const chatId = query.message.chat.id;

    try {
      const pedido = await prisma.pedido.findFirst({
        where: {
          chatId: chatId,
          status: { not: "cancelado" }, // Evita mostrar status de pedidos cancelados
        },
      });

      if (pedido) {
        bot.sendMessage(chatId, `O status do seu pedido é: ${pedido.status}`);
      } else {
        bot.sendMessage(
          chatId,
          "Nenhum pedido encontrado ou pedido cancelado."
        );
      }
    } catch (error) {
      console.error("Erro ao buscar status do pedido:", error);
      bot.sendMessage(chatId, "Erro ao buscar status do pedido.");
    }
  }
});

// Captura todas as mensagens recebidas pelo bot para processamento
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  // Verifica se a mensagem recebida é uma foto ou um documento (arquivo)
  if (msg.photo || msg.document) {
    const fileId = msg.photo
      ? msg.photo[msg.photo.length - 1].file_id
      : msg.document.file_id;
    console.log(
      `Arquivo recebido no chat ID: ${chatId}. ID do arquivo: ${fileId}`
    );

    // Pode-se enviar uma resposta confirmando o recebimento do arquivo
    bot.sendMessage(
      chatId,
      `Obrigado por enviar o comprovante! Sua compra será validada em breve.  ${chatId}`
    );
    bot.sendMessage(
      chatId,
      "Envie /verStatus para verificar o status do pedido."
    );


    try {
      const pedido = await prisma.pedido.create({
        data: {
          status: "pendente",
          comprovante: fileId,
          chatId: chatId,
        },
      });

      console.log(
        `Pedido criado no banco de dados. ID do Pedido: ${pedido.id}`
      );
    } catch (error) {
      console.error("Erro ao salvar o pedido no banco de dados:", error);
    }
  }
});

// Caso ocorra um erro no polling do bot
bot.on("polling_error", (error) => {
  console.error(error); // Mostra erros no console
});

// Inicializa o bot
bot.on("polling_error", (error) => {
  console.error(error); // Mostra erros no console
});
