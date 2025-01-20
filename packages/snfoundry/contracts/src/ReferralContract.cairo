#[starknet::interface]
trait IReferralContract<TContractState> {
    fn generate_referral_code(ref self: TContractState) -> felt252;
}

#[starknet::contract]
mod ReferralContract {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use core::pedersen::pedersen;

    #[storage]
    struct Storage {
        user_nonce: LegacyMap::<ContractAddress, u64>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        ReferralCodeGenerated: ReferralCodeGenerated,
    }

    #[derive(Drop, starknet::Event)]
    struct ReferralCodeGenerated {
        referrer: ContractAddress,
        code: felt252,
        timestamp: u64
    }

    #[abi(embed_v0)]
    impl ReferralContractImpl of super::IReferralContract<ContractState> {
        fn generate_referral_code(ref self: ContractState) -> felt252 {
            let caller = get_caller_address();
            let current_time = get_block_timestamp();
            
            let nonce = self.user_nonce.read(caller);
            self.user_nonce.write(caller, nonce + 1_u64);

            let code = pedersen(caller.into(), nonce.into());

            self.emit(ReferralCodeGenerated { 
                referrer: caller, 
                code,
                timestamp: current_time 
            });
            
            code
        }
    }
}




