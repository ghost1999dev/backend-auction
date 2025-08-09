import hre from "hardhat";

async function main() {
  
  try {
    // Verificar que ethers esté disponible
    if (!hre.ethers) {
      throw new Error(" ethers no está disponible en el runtime de Hardhat");
    }
    
    // Obtener información de la red
    const network = await hre.ethers.provider.getNetwork();    
    // Obtener el deployer
    const [deployer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    
    // Obtener la factory del contrato
    const BidRegistry = await hre.ethers.getContractFactory("BidRegistry");
    
    // Desplegar el contrato
    const bidRegistry = await BidRegistry.deploy();
    
    // Esperar a que se mine
    await bidRegistry.waitForDeployment();
    
    // Obtener dirección (compatible con versiones nuevas)
    const address = await bidRegistry.getAddress();
    
    // Verificar el código del contrato
    const code = await hre.ethers.provider.getCode(address);
    
    return address;
    
  } catch (error) {
    console.error(" Error:", error.message);
    if (error.message.includes("BidRegistry")) {
      console.log("Asegúrate de que el archivo BidRegistry.sol existe en src/contracts/");
      console.log("Y que el contrato se compiló correctamente con: npx hardhat compile");
    }
    throw error;
  }
}

main()
  .then((address) => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error en el despliegue:", error);
    process.exit(1);
  });