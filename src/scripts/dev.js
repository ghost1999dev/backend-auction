#!/usr/bin/env node

import { spawn } from 'child_process';
import { platform } from 'os';

console.log('🚀 Iniciando entorno de desarrollo...');
console.log(`💻 Sistema operativo detectado: ${platform()}`);

let hardhatProcess = null;
let deployProcess = null;
let backendProcess = null;

// Función para ejecutar comandos multiplataforma
function runCommand(command, args, options = {}) {
  const isWindows = platform() === 'win32';
  
  if (isWindows) {
    return spawn('cmd', ['/c', command, ...args], {
      stdio: options.stdio || ['pipe', 'pipe', 'pipe'],
      ...options
    });
  } else {
    return spawn(command, args, {
      stdio: options.stdio || ['pipe', 'pipe', 'pipe'],
      ...options
    });
  }
}

// Función para limpiar procesos
function cleanup() {  
  if (backendProcess) {
    backendProcess.kill();
  }
  
  if (deployProcess) {
    deployProcess.kill();
  }
  
  if (hardhatProcess) {
    hardhatProcess.kill();
  }
  
  setTimeout(() => {
    process.exit(0);
  }, 1000);
}

// Función para filtrar output de Hardhat
function filterHardhatOutput(data) {
  const lines = data.toString().split('\n');
  const filteredLines = [];
  
  for (const line of lines) {
    // Mostrar líneas importantes, ocultar cuentas
    if (line.includes('Started HTTP and WebSocket JSON-RPC server') ||
        line.includes('WARNING: These accounts') ||
        line.includes('Any funds sent to them') ||
        line.trim() === '') {
      filteredLines.push(line);
    }
    // Ocultar las líneas de cuentas individuales
    else if (line.includes('Account #') || 
             line.includes('Private Key:') ||
             line.includes('========') ||
             line.includes('0x') && line.includes('ETH')) {
      continue;
    } else if (line.trim()) {
      filteredLines.push(line);
    }
  }
  
  return filteredLines.join('\n');
}

// Función para esperar que el servidor esté listo
function waitForServer() {
  return new Promise((resolve) => {
    const checkServer = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8545', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 1
          })
        });
        
        if (response.ok) {
          resolve();
        } else {
          setTimeout(checkServer, 500);
        }
      } catch {
        setTimeout(checkServer, 500);
      }
    };
    
    checkServer();
  });
}

// Función principal
async function main() {
  try {
    // 1. Iniciar Hardhat node
    console.log('⛓️  Iniciando blockchain local...');
    
    hardhatProcess = runCommand('npx', ['hardhat', 'node']);
    
    let nodeReady = false;
    
    hardhatProcess.stdout.on('data', (data) => {
      const filteredOutput = filterHardhatOutput(data);
      if (filteredOutput.trim()) {
        //console.log('⛓️  [Blockchain]', filteredOutput.trim());
      }
      
      if (data.toString().includes('Started HTTP and WebSocket JSON-RPC server')) {
        nodeReady = true;
      }
    });
    
    hardhatProcess.stderr.on('data', (data) => {
      console.error('[Blockchain Error]', data.toString().trim());
    });
    
    hardhatProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Blockchain terminó con código ${code}`);
        cleanup();
      }
    });
    
    // 2. Esperar a que el nodo esté listo
    await waitForServer();    
    // 3. Desplegar contratos
    
    deployProcess = runCommand('npm', ['run', 'deploy'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    deployProcess.stdout.on('data', (data) => {
      console.log(' [Deploy]', data.toString().trim());
    });
    
    deployProcess.stderr.on('data', (data) => {
      console.error(' [Deploy Error]', data.toString().trim());
    });
    
    deployProcess.on('close', (code) => {
      if (code === 0) {
        console.log(' Contratos desplegados exitosamente!');
        startBackend();
      } else {
        console.error(`Error en despliegue (código ${code})`);
        cleanup();
      }
    });
    
  } catch (error) {
    console.error(' Error iniciando:', error.message);
    cleanup();
  }
}

// Función para iniciar el backend
function startBackend() {
  console.log(' Iniciando backend...');
  
  backendProcess = runCommand('npm', ['run', 'start-backend'], {
    stdio: 'inherit'
  });
  
  backendProcess.on('close', (code) => {
    console.log(`Backend terminó con código ${code}`);
    cleanup();
  });
  
}

// Manejar señales de cierre
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

// Windows specific
if (platform() === 'win32') {
  process.on('SIGHUP', cleanup);
}

// Iniciar todo
main();