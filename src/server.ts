import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/pedidos-pendentes', async (req, res) => {
  try {
    const pedidosPendentes = await prisma.pedido.findMany({
      where: { status: 'pendente' },
    });

    res.json(pedidosPendentes);
  } catch (error) {
    console.error('Erro ao buscar pedidos pendentes:', error);
    res.status(500).send('Erro ao buscar pedidos pendentes');
  }
});

app.post('/atualizar-status/:pedidoId', async (req, res) => {
  const { pedidoId } = req.params;
  const { status } = req.body;

  try {
    const updatedPedido = await prisma.pedido.update({
      where: { id: parseInt(pedidoId) },
      data: { status },
    });

    res.status(200).send(`Status do pedido ${pedidoId} atualizado para "${status}"`);
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    res.status(500).send('Erro ao atualizar status do pedido');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
