import { ethers } from "ethers";
import dotenv from "dotenv";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar artifact del contrato
const artifactPath = join(__dirname, "../artifacts/src/contracts/BidRegistry.sol/BidRegistry.json");
const BidRegistryArtifact = JSON.parse(await readFile(artifactPath, "utf8"));

// Variables de entorno
const { BLOCKCHAIN_RPC_URL, BLOCKCHAIN_PRIVATE_KEY, BID_REGISTRY_ADDRESS } = process.env;

if (!BLOCKCHAIN_RPC_URL || !BID_REGISTRY_ADDRESS) {
  throw new Error("Faltan variables de entorno para blockchain: BLOCKCHAIN_RPC_URL o BID_REGISTRY_ADDRESS");
}

// Crear provider (sintaxis ethers v6)
const provider = new ethers.JsonRpcProvider(BLOCKCHAIN_RPC_URL);

// Crear signer si hay private key
let signer = null;
if (BLOCKCHAIN_PRIVATE_KEY) {
  signer = new ethers.Wallet(BLOCKCHAIN_PRIVATE_KEY, provider);
}

// Crear instancia del contrato
const contract = new ethers.Contract(
  BID_REGISTRY_ADDRESS, 
  BidRegistryArtifact.abi, 
  signer || provider
);

const BlockchainService = {
  async createBidOnChain({ auction_id, developer_id, amount }) {
    if (!signer) {
      throw new Error("No hay signer configurado para enviar transacciones");
    }
    
    try {
      console.log(`📤 Enviando bid: auction=${auction_id}, developer=${developer_id}, amount=${amount}`);
      
      // Enviar transacción
      const tx = await contract.createBid(auction_id, developer_id, amount);
      console.log("Esperando confirmación de transacción:", tx.hash);
      
      // Esperar confirmación
      const receipt = await tx.wait();
      console.log("Transacción confirmada en bloque:", receipt.blockNumber);
      
      // Buscar evento BidCreated (sintaxis v6)
      const bidCreatedEvent = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed.name === "BidCreated";
        } catch {
          return false;
        }
      });
      
      if (!bidCreatedEvent) {
        throw new Error("Evento BidCreated no encontrado en el receipt");
      }
      
      // Parsear el evento
      const parsedEvent = contract.interface.parseLog(bidCreatedEvent);
      const [id, aucId, devId, amt, timestamp] = parsedEvent.args;
      
      return {
        id: id.toString(),
        auction_id: Number(aucId.toString()),
        developer_id: Number(devId.toString()),
        amount: Number(amt.toString()),
        createdAt: new Date(Number(timestamp.toString()) * 1000).toISOString(),
        txHash: receipt.hash
      };
    } catch (error) {
      console.error("Error creando bid en blockchain:", error.message);
      throw new Error(`Error en blockchain: ${error.message}`);
    }
  },

  async getBidsByAuction(auctionId) {
    try {
      console.log(`Obteniendo bids para auction ${auctionId}`);
      const bids = await contract.getBidsByAuction(auctionId);
      
      return bids.map(b => ({
        id: b.id.toString(),
        auction_id: Number(b.auctionId.toString()),
        developer_id: Number(b.developerId.toString()),
        amount: Number(b.amount.toString()),
        createdAt: new Date(Number(b.timestamp.toString()) * 1000).toISOString(),
        source: "blockchain"
      }));
    } catch (error) {
      console.error("Error obteniendo bids por auction:", error.message);
      return [];
    }
  },

  async getBidsByDeveloper(developerId) {
    try {
      console.log(`Obteniendo bids para developer ${developerId}`);
      const bids = await contract.getBidsByDeveloper(developerId);
      
      return bids.map(b => ({
        id: b.id.toString(),
        auction_id: Number(b.auctionId.toString()),
        developer_id: Number(b.developerId.toString()),
        amount: Number(b.amount.toString()),
        createdAt: new Date(Number(b.timestamp.toString()) * 1000).toISOString(),
        source: "blockchain"
      }));
    } catch (error) {
      console.error("Error obteniendo bids por developer:", error.message);
      return [];
    }
  },

  async getAllBids() {
    try {
      console.log("Obteniendo todos los bids del blockchain");
      
      // Crear filtro para el evento BidCreated
      const filter = contract.filters.BidCreated();
      
      // Obtener todos los logs desde el bloque 0
      const logs = await contract.queryFilter(filter, 0, "latest");
      
      return logs.map(log => {
        const parsedLog = contract.interface.parseLog(log);
        const args = parsedLog.args;
        
        return {
          id: args[0].toString(),
          auction_id: Number(args[1].toString()),
          developer_id: Number(args[2].toString()),
          amount: Number(args[3].toString()),
          createdAt: new Date(Number(args[4].toString()) * 1000).toISOString(),
          txHash: log.transactionHash,
          source: "blockchain"
        };
      });
    } catch (error) {
      console.error("Error obteniendo todos los bids:", error.message);
      return [];
    }
  },

  // Método auxiliar para verificar la conexión
  async checkConnection() {
    try {
      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();
      
      console.log("🌐 Conectado a red:", network.name);
      console.log("📦 Bloque actual:", blockNumber);
      console.log("📍 Dirección del contrato:", BID_REGISTRY_ADDRESS);
      
      return true;
    } catch (error) {
      console.error("❌ Error verificando conexión blockchain:", error.message);
      return false;
    }
  },

  // Método para obtener información del contrato
  async getContractInfo() {
    try {
      const code = await provider.getCode(BID_REGISTRY_ADDRESS);
      return {
        address: BID_REGISTRY_ADDRESS,
        hasCode: code.length > 2,
        provider: BLOCKCHAIN_RPC_URL
      };
    } catch (error) {
      console.error("❌ Error obteniendo info del contrato:", error.message);
      return null;
    }
  }
};

export default BlockchainService;