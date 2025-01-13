# **Proovacy**  
## **Overview**

Proovacy leverages zkTLS (Zero-Knowledge Transport Layer Security) to privately prove ownership of social media usernames, such as Twitter and Telegram, directly on-chain while ensuring user privacy. By integrating the Starknet Wallet SDK, Proovacy creates a unique wallet based on parameters derived from these platforms. Initially, the system supports verified humans onboarding through Twitter and Telegram, followed by a 2:1 referral model, where each user can invite two verified participants. This decentralized Proof-of-Personhood system not only enables secure verification but also supports generating session keys for privacy-preserving authentication across platforms.

## **Workflows**
### **Activity Diagram**
```mermaid
stateDiagram-v2
    [*] --> ConnectSocialAccounts
    ConnectSocialAccounts --> VerifyIdentity: User connects Twitter/Telegram
    VerifyIdentity --> GenerateProof: Reclaim Protocol
    GenerateProof --> CreateWallet: ZK Proof Generated
    CreateWallet --> [*]: Starknet Wallet Created
    
    state VerifyIdentity {
        [*] --> ValidateTwitter
        [*] --> ValidateTelegram
        ValidateTwitter --> ProofGeneration
        ValidateTelegram --> ProofGeneration
        ProofGeneration --> [*]
    }
```
### **Software Architecture Diagram**
```mermaid
graph TB
    subgraph Frontend
        UI[User Interface]
        SDK[Starknet SDK]
    end
    
    subgraph Core
        RP[Reclaim Protocol]
        ZK[ZK Proof Generator]
        WM[Wallet Manager]
    end
    
    subgraph External
        TW[Twitter API]
        TG[Telegram API]
        SC[Starknet Contract]
    end
    
    UI --> RP
    UI --> SDK
    RP --> ZK
    ZK --> WM
    WM --> SC
    RP --> TW
    RP --> TG
    SDK --> SC
```
### **Class Diagram**
```mermaid
classDiagram
    class Frontend {
        -walletManager: WalletManager
        -reclaimProtocol: ReclaimProtocol
        +initializeConnection()
        +handleVerification()
        +manageWallet()
        +displayUserInterface()
    }

    class ReclaimProtocol {
        -zktlsVerifier: ZKTLSVerifier
        -socialConnector: SocialConnector
        +verifySocialAccount()
        +generateProof()
    }
    
    class SocialConnector {
        -twitterAPI: TwitterAPI
        -telegramAPI: TelegramAPI
        +connectTwitter()
        +connectTelegram()
    }
    
    class WalletManager {
        -starknetSDK: StarknetSDK
        +createWallet()
        +generateSessionKey()
    }
    
    class ZKTLSVerifier {
        +verifyProof()
        +generateZKProof()
    }
    
    Frontend --> ReclaimProtocol
    Frontend --> WalletManager
    ReclaimProtocol --> SocialConnector
   ReclaimProtocol --> ZKTLSVerifier
    ReclaimProtocol --> WalletManager
```
### **Sequence Diagram**
```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant RP as Reclaim Protocol
    participant ZK as ZK Proof Generator
    participant W as Wallet Manager
    
    U->>FE: Connect Social Accounts
    FE->>RP: Request Verification
    RP->>RP: Validate Credentials
    RP->>ZK: Generate ZK Proof
    ZK-->>RP: Return Proof
    RP->>W: Create Wallet
    W-->>FE: Return Wallet Details
    FE-->>U: Complete Onboarding
```
