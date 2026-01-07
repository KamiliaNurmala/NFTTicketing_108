const { ethers } = require('ethers');
require('dotenv').config();

// PASTE YOUR CONTRACT ABI HERE (dari Remix)
const CONTRACT_ABI =
  [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "ERC721IncorrectOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "ERC721InsufficientApproval",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "approver",
          "type": "address"
        }
      ],
      "name": "ERC721InvalidApprover",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        }
      ],
      "name": "ERC721InvalidOperator",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "ERC721InvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        }
      ],
      "name": "ERC721InvalidReceiver",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "ERC721InvalidSender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "ERC721NonexistentToken",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "approved",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "ApprovalForAll",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "getApproved",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        }
      ],
      "name": "isApprovedForAll",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "eventName",
          "type": "string"
        }
      ],
      "name": "mintTicket",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "ownerOf",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "setApprovalForAll",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "ticketEventName",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "tokenURI",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

class Web3Service {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      CONTRACT_ABI,
      this.wallet
    );
  }

  async mintTicket(userAddress, eventName) {
    try {
      // Normalize address to proper checksum
      const normalizedAddress = ethers.getAddress(userAddress.toLowerCase());

      console.log(`🎫 Minting ticket for ${normalizedAddress}...`);
      const tx = await this.contract.mintTicket(normalizedAddress, eventName);
      console.log(`⏳ TX sent: ${tx.hash}`);

      const receipt = await tx.wait();
      console.log(`✅ Confirmed! Gas: ${receipt.gasUsed.toString()}`);

      // Get token ID from total supply
      const totalSupply = await this.contract.totalSupply();
      const tokenId = totalSupply - BigInt(1); // Last minted token

      return {
        success: true,
        txHash: tx.hash,
        tokenId: Number(tokenId),
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('❌ Mint error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getTicketOwner(tokenId) {
    try {
      const owner = await this.contract.ownerOf(tokenId);
      return { success: true, owner };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserTicketCount(userAddress) {
    try {
      const balance = await this.contract.balanceOf(userAddress);
      return { success: true, balance: balance.toString() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getTotalSupply() {
    try {
      const total = await this.contract.totalSupply();
      return { success: true, total: total.toString() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Transfer NFT ticket to another wallet
  async transferTicket(fromAddress, toAddress, tokenId) {
    try {
      console.log(`🔄 Transferring ticket #${tokenId} from ${fromAddress} to ${toAddress}...`);

      // Normalize addresses
      const normalizedFrom = ethers.getAddress(fromAddress.toLowerCase());
      const normalizedTo = ethers.getAddress(toAddress.toLowerCase());

      // Call transferFrom on the contract
      const tx = await this.contract.transferFrom(normalizedFrom, normalizedTo, tokenId);
      console.log(`⏳ TX sent: ${tx.hash}`);

      const receipt = await tx.wait();
      console.log(`✅ Transfer confirmed! Gas: ${receipt.gasUsed.toString()}`);

      return {
        success: true,
        txHash: tx.hash,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('❌ Transfer error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify ticket on blockchain
  async verifyTicket(tokenId) {
    try {
      console.log(`🔍 Verifying ticket #${tokenId} on blockchain...`);

      // Get owner of the token
      const owner = await this.contract.ownerOf(tokenId);

      // Get event name associated with the ticket
      const eventName = await this.contract.ticketEventName(tokenId);

      console.log(`✅ Ticket #${tokenId} verified! Owner: ${owner}`);

      return {
        isValid: true,
        owner: owner,
        eventName: eventName
      };
    } catch (error) {
      console.error('❌ Verify error:', error.message);

      // If token doesn't exist, it will throw an error
      if (error.message.includes('ERC721NonexistentToken') || error.message.includes('invalid token')) {
        return {
          isValid: false,
          owner: null,
          eventName: null,
          error: 'Token does not exist on blockchain'
        };
      }

      return {
        isValid: false,
        owner: null,
        eventName: null,
        error: error.message
      };
    }
  }

  // Get transaction status from blockchain
  async getTransactionStatus(txHash) {
    try {
      const tx = await this.provider.getTransaction(txHash);

      if (!tx) {
        return {
          success: false,
          error: 'Transaction not found'
        };
      }

      const receipt = await this.provider.getTransactionReceipt(txHash);

      // Try to get the actual recipient from Transfer event logs
      let recipient = null;
      let tokenId = null;

      if (receipt && receipt.logs) {
        // Transfer event signature: Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
        const transferTopic = ethers.id('Transfer(address,address,uint256)');

        for (const log of receipt.logs) {
          if (log.topics[0] === transferTopic && log.topics.length >= 4) {
            // Decode the 'to' address from topics[2]
            recipient = ethers.getAddress('0x' + log.topics[2].slice(-40));
            // Decode tokenId from topics[3]
            tokenId = parseInt(log.topics[3], 16);
            break;
          }
        }
      }

      return {
        success: true,
        transaction: {
          hash: tx.hash,
          from: tx.from,
          to: recipient || tx.to, // Use decoded recipient if available, otherwise contract
          tokenId: tokenId,
          value: tx.value.toString(),
          gasPrice: tx.gasPrice?.toString(),
          status: receipt ? (receipt.status === 1 ? 'confirmed' : 'failed') : 'pending',
          blockNumber: receipt?.blockNumber || null,
          confirmations: receipt ? await receipt.confirmations() : 0
        }
      };
    } catch (error) {
      console.error('❌ Get TX error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new Web3Service();