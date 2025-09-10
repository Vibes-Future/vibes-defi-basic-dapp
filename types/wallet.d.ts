/**
 * Wallet provider type declarations
 * Extends the global Window interface with wallet providers
 */

interface Window {
  // Phantom Wallet
  solana?: {
    isPhantom?: boolean;
    connect(): Promise<{ publicKey: string }>;
    disconnect(): Promise<void>;
    signTransaction(transaction: any): Promise<any>;
    signAllTransactions(transactions: any[]): Promise<any[]>;
    request(args: { method: string; params?: any }): Promise<any>;
  };

  // Trust Wallet
  trustwallet?: {
    isTrust?: boolean;
    solana?: {
      connect(): Promise<{ publicKey: string }>;
      disconnect(): Promise<void>;
      signTransaction(transaction: any): Promise<any>;
      signAllTransactions(transactions: any[]): Promise<any[]>;
      request(args: { method: string; params?: any }): Promise<any>;
    };
  };

  // Solflare (may also inject into solana)
  solflare?: {
    isSolflare?: boolean;
    connect(): Promise<{ publicKey: string }>;
    disconnect(): Promise<void>;
    signTransaction(transaction: any): Promise<any>;
    signAllTransactions(transactions: any[]): Promise<any[]>;
  };
}

// Export empty object to make this a module
export {};
