# **Proovacy**  


![Untitled Project (2)](https://github.com/user-attachments/assets/4015dffa-9df2-4cb3-9217-83aa1966f94d)



## **Overview**

Proovacy leverages zkTLS (Zero-Knowledge Transport Layer Security) to privately prove ownership of social media usernames, such as Twitter and Telegram, directly on-chain while ensuring user privacy. By integrating the Starknet Wallet SDK, Proovacy creates a unique wallet based on parameters derived from these platforms. Initially, the system supports verified humans onboarding through Twitter and Telegram, followed by a 2:1 referral model, where each user can invite two verified participants. This decentralized Proof-of-Personhood system not only enables secure verification but also supports generating session keys for privacy-preserving authentication across platforms.

## Demo Video

Watch the demo of our project in action:  
[![Hackathon Demo](https://img.youtube.com/vi/tOfxNpT5iz4/0.jpg)](https://youtu.be/tOfxNpT5iz4?si=2Rx-LHSG4BGTlucP)


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

## **Features**

The Proovacy project is built using the following technologies and protocols:

- **Frontend**  
  Developed with **Next.js**, a React framework for building web applications.

- **Backend**  
  Implemented with **Node.js**, a JavaScript runtime environment for server-side applications.

- **Blockchain**  
  Integrated with **Starknet**, a layer-2 scalability solution for Ethereum. **Cairo**, the programming language specifically designed for Starknet smart contracts, is used to implement on-chain logic and interactions.


- **Reclaim Protocol**  
  Proovacy integrates **Reclaim Protocol**, a decentralized protocol that allows users to prove ownership of accounts, data, or assets from third-party platforms without sharing sensitive credentials.  
  This protocol enables:  
  - **Secure identity verification** using cryptographic proofs.  
  - **Privacy-preserving claims** leveraging ZKPs to ensure user data remains confidential.  
  - **Integration with multiple platforms** to streamline the process of proving account ownership.  

- **Scaffold-Stark Template**  
  Built upon **Scaffold-Stark**, a template designed to assist developers in creating decentralized applications (dApps) on Starknet efficiently.  
  Scaffold-Stark provides:  
  - Pre-built Starknet smart contract examples written in **Cairo**.  
  - An extensible frontend connected to Starknet wallets.  
  - Development tools for testing and deploying smart contracts.  

---

## **Additional Resources**

- [Reclaim Protocol Documentation](https://docs.reclaimprotocol.org/)  
  Learn more about how Reclaim Protocol enables secure and private identity verification.  

- [Scaffold Stark Repository](https://github.com/Scaffold-Stark/scaffold-stark-2)  
  Explore the template repository to build Starknet-based dApps with ease.  

- [Cairo Programming Language Documentation](https://www.cairo-lang.org/docs/)  
  Learn more about **Cairo**, the language for writing smart contracts on Starknet.
